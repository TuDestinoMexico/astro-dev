import type { APIRoute } from 'astro';
import { adminDb, FirebaseAuthError, FieldValue, requireFirebaseUser } from '../../lib/firebaseAdmin';
import {
    completeIdempotencyKey,
    enforceOpenpayRateLimit,
    getClientIp,
    OpenpayProtectionError,
    releaseIdempotencyKey,
    reserveIdempotencyKey,
} from '../../lib/openpayProtection';

const ALLOWED_METHODS = new Set(['card', 'store', 'bank_account']);
const MAX_BODY_BYTES = 16 * 1024;
const REQUEST_TIMEOUT_MS = 15_000;

type CustomerInput = {
    name?: unknown;
    last_name?: unknown;
    phone_number?: unknown;
    email?: unknown;
};

type ChargeInput = {
    method?: unknown;
    amount?: unknown;
    description?: unknown;
    customer?: CustomerInput;
};

function jsonResponse(body: Record<string, unknown>, status: number, extraHeaders: Record<string, string> = {}) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...extraHeaders,
        },
    });
}

function readAmount(value: unknown) {
    const text = typeof value === 'number' ? String(value) : typeof value === 'string' ? value.trim() : '';

    if (!/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(text)) return null;

    const amount = Number(text);
    if (!Number.isFinite(amount)) return null;

    const cents = Math.round(amount * 100);
    return Number.isSafeInteger(cents) ? cents : null;
}

function readConfiguredAmount(value: unknown) {
    const cents = readAmount(value);
    return cents !== null && cents > 0 ? cents : null;
}

function readText(value: unknown, maxLength: number) {
    if (typeof value !== 'string') return null;

    const text = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
    if (!text || text.length > maxLength) return null;

    return text;
}

function readPhone(value: unknown) {
    if (typeof value !== 'string') return null;

    const phone = value.replace(/[\s()-]/g, '');
    return /^\d{10,15}$/.test(phone) ? phone : null;
}

function getSafePaymentMethod(paymentMethod: unknown) {
    if (!paymentMethod || typeof paymentMethod !== 'object') return null;

    const source = paymentMethod as Record<string, unknown>;
    const result: Record<string, string> = {};

    for (const key of ['type', 'url', 'barcode_url', 'reference', 'bank', 'agreement', 'name', 'url_spei']) {
        if (typeof source[key] === 'string' && source[key].length <= 2048) {
            result[key] = source[key];
        }
    }

    return Object.keys(result).length > 0 ? result : null;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const user = await requireFirebaseUser(request, { requireVerifiedEmail: true });

        if (!user.email) {
            return jsonResponse({ success: false, message: 'La cuenta no tiene un correo válido' }, 403);
        }

        const rateLimit = await enforceOpenpayRateLimit(user.uid, getClientIp(request));
        if (!rateLimit.allowed) {
            return jsonResponse({
                success: false,
                message: 'Demasiadas solicitudes. Intenta nuevamente más tarde.',
            }, 429, {
                ...rateLimit.headers,
                'Retry-After': String(rateLimit.retryAfter),
            });
        }

        const idempotencyKey = request.headers.get('idempotency-key')?.trim();
        if (!idempotencyKey || !/^[A-Za-z0-9._:-]{8,128}$/.test(idempotencyKey)) {
            return jsonResponse({
                success: false,
                message: 'Se requiere un Idempotency-Key válido',
            }, 400, rateLimit.headers);
        }

        const contentType = request.headers.get('content-type') || '';
        if (!contentType.toLowerCase().startsWith('application/json')) {
            return jsonResponse({ success: false, message: 'El body debe ser JSON' }, 415);
        }

        const contentLength = Number(request.headers.get('content-length') || 0);
        if (contentLength > MAX_BODY_BYTES) {
            return jsonResponse({ success: false, message: 'La solicitud es demasiado grande' }, 413);
        }

        let body: ChargeInput;
        try {
            const rawBody = await request.text();
            if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
                return jsonResponse({ success: false, message: 'La solicitud es demasiado grande' }, 413);
            }
            body = JSON.parse(rawBody) as ChargeInput;
        } catch {
            return jsonResponse({ success: false, message: 'El body no es JSON válido' }, 400);
        }

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return jsonResponse({ success: false, message: 'Payload inválido' }, 400);
        }

        const method = readText(body.method, 30);
        if (!method || !ALLOWED_METHODS.has(method)) {
            return jsonResponse({ success: false, message: 'Método de pago no permitido' }, 400);
        }

        const amountCents = readAmount(body.amount);
        const minAmountCents = readConfiguredAmount(import.meta.env.OPENPAY_MIN_AMOUNT);
        const maxAmountCents = readConfiguredAmount(import.meta.env.OPENPAY_MAX_AMOUNT);

        if (minAmountCents === null || maxAmountCents === null || minAmountCents > maxAmountCents) {
            console.error('Configuración de límites Openpay inválida');
            return jsonResponse({ success: false, message: 'Configuración de pagos no disponible' }, 500);
        }

        if (amountCents === null || amountCents < minAmountCents || amountCents > maxAmountCents) {
            return jsonResponse({
                success: false,
                message: `El importe debe estar entre ${(minAmountCents / 100).toFixed(2)} y ${(maxAmountCents / 100).toFixed(2)}`,
            }, 400);
        }

        const description = readText(body.description, 120);
        const customer = body.customer;
        const name = readText(customer?.name, 80);
        const lastName = readText(customer?.last_name, 80);
        const phoneNumber = readPhone(customer?.phone_number);

        if (!description || !name || !lastName || !phoneNumber) {
            return jsonResponse({ success: false, message: 'Los datos del cliente están incompletos' }, 400);
        }

        const merchantId = import.meta.env.OPENPAY_MERCHANT_ID;
        const privateKey = import.meta.env.OPENPAY_PRIVATE_KEY;
        const apiBaseUrl = import.meta.env.OPENPAY_API_BASE_URL;
        const siteUrl = import.meta.env.SITE_URL;

        if (!merchantId || !privateKey || !apiBaseUrl || !siteUrl) {
            console.error('Faltan variables privadas de Openpay o la URL del sitio');
            return jsonResponse({ success: false, message: 'Configuración de pagos no disponible' }, 500);
        }

        let chargeUrl: URL;
        let redirectUrl: URL;

        try {
            const parsedApiBaseUrl = new URL(apiBaseUrl);
            const parsedSiteUrl = new URL(siteUrl);

            if (!['https:', 'http:'].includes(parsedApiBaseUrl.protocol) || !['https:', 'http:'].includes(parsedSiteUrl.protocol)) {
                throw new Error('URL no segura');
            }

            chargeUrl = new URL(`/v1/${encodeURIComponent(merchantId)}/charges`, parsedApiBaseUrl);
            redirectUrl = parsedSiteUrl;
        } catch {
            console.error('Configuración de URLs Openpay inválida');
            return jsonResponse({ success: false, message: 'Configuración de pagos no disponible' }, 500);
        }

        const authHeader = Buffer.from(`${privateKey}:`).toString('base64');
        const openpayPayload = {
            method,
            amount: amountCents / 100,
            description,
            customer: {
                name,
                last_name: lastName,
                phone_number: phoneNumber,
                email: user.email,
            },
            confirm: false,
            send_email: true,
            redirect_url: redirectUrl.toString(),
        };

        const idempotency = await reserveIdempotencyKey(user.uid, idempotencyKey);
        if (!idempotency.acquired) {
            if (idempotency.response) {
                return jsonResponse(idempotency.response, 200, rateLimit.headers);
            }

            return jsonResponse({
                success: false,
                message: 'Este cargo ya está siendo procesado.',
            }, 409, rateLimit.headers);
        }

        const response = await fetch(chargeUrl, {
            method: 'POST',
            headers: {
                Authorization: `Basic ${authHeader}`,
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(openpayPayload),
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        const data = await response.json().catch(() => null) as Record<string, unknown> | null;

        if (!response.ok) {
            const description = typeof data?.description === 'string' ? data.description.slice(0, 300) : 'Openpay rechazó el cargo';
            if (response.status >= 400 && response.status < 500) {
                await releaseIdempotencyKey(user.uid, idempotencyKey);
            }
            return jsonResponse({ success: false, message: description }, response.status >= 400 && response.status < 500 ? response.status : 502);
        }

        const paymentMethod = getSafePaymentMethod(data?.payment_method);
        const chargeId = typeof data?.id === 'string' ? data.id : null;

        if (!chargeId || !paymentMethod) {
            console.error('Respuesta Openpay incompleta');
            return jsonResponse({ success: false, message: 'Openpay devolvió una respuesta incompleta' }, 502);
        }

        const status = typeof data?.status === 'string' ? data.status : 'pending';
        const paymentRecord = {
            openpayChargeId: chargeId,
            amount: amountCents / 100,
            currency: typeof data?.currency === 'string' ? data.currency : 'MXN',
            method,
            description,
            status,
            voucher: paymentMethod,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp(),
        };

        try {
            await adminDb
                .collection('users')
                .doc(user.uid)
                .collection('pagos')
                .doc(chargeId)
                .set(paymentRecord);
        } catch (error) {
            // Keep the idempotency key reserved: retrying must not create another charge.
            console.error('[Openpay] No se pudo guardar el historial del cargo:', error);
            return jsonResponse({
                success: false,
                message: 'El cargo fue creado, pero no se pudo guardar su historial. Contacta a soporte.',
            }, 503);
        }

        const successResponse = {
            success: true,
            paymentId: chargeId,
            id: chargeId,
            status,
            payment_method: paymentMethod,
        };

        await completeIdempotencyKey(user.uid, idempotencyKey, successResponse);

        return jsonResponse(successResponse, 200, rateLimit.headers);
    } catch (error) {
        if (error instanceof FirebaseAuthError) {
            return jsonResponse({ success: false, message: error.message }, error.status);
        }

        if (error instanceof OpenpayProtectionError) {
            return jsonResponse({ success: false, message: error.message }, 503);
        }

        console.error('Error creando cargo Openpay:', error);
        return jsonResponse({ success: false, message: 'Error interno del servidor' }, 500);
    }
};
