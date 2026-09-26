import type { APIRoute } from 'astro';
import { adminDb, FieldValue, FirebaseAuthError, requireFirebaseUser } from '../../lib/firebaseAdmin';

const REQUEST_TIMEOUT_MS = 15_000;

function jsonResponse(body: Record<string, unknown>, status: number) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function safeString(value: unknown, maxLength = 2048) {
    return typeof value === 'string' && value.length <= maxLength ? value : undefined;
}

function normalizeCharge(data: Record<string, unknown>) {
    const result: Record<string, unknown> = {};
    const stringFields = ['id', 'status', 'currency', 'authorization', 'description', 'method'];

    for (const field of stringFields) {
        const value = safeString(data[field], 2048);
        if (value !== undefined) result[field] = value;
    }

    if (typeof data.amount === 'number' && Number.isFinite(data.amount)) {
        result.amount = data.amount;
    }

    if (data.card && typeof data.card === 'object') {
        const card = data.card as Record<string, unknown>;
        const safeCard: Record<string, string> = {};
        for (const field of ['brand', 'card_number', 'holder_name', 'bank_name']) {
            const value = safeString(card[field], 300);
            if (value !== undefined) safeCard[field] = value;
        }
        if (Object.keys(safeCard).length > 0) result.card = safeCard;
    }

    if (data.payment_method && typeof data.payment_method === 'object') {
        const paymentMethod = data.payment_method as Record<string, unknown>;
        const safePaymentMethod: Record<string, string> = {};
        for (const field of ['type', 'url', 'barcode_url', 'reference', 'bank', 'agreement', 'name', 'url_spei']) {
            const value = safeString(paymentMethod[field]);
            if (value !== undefined) safePaymentMethod[field] = value;
        }
        if (Object.keys(safePaymentMethod).length > 0) result.payment_method = safePaymentMethod;
    }

    return result;
}

export const GET: APIRoute = async ({ url: astroUrl, request }) => {
    try {
        const user = await requireFirebaseUser(request, { requireVerifiedEmail: true });
        const paymentId = astroUrl.searchParams.get('paymentId')?.trim();

        if (!paymentId || !/^[A-Za-z0-9._:-]{1,200}$/.test(paymentId)) {
            return jsonResponse({ success: false, message: 'Falta un paymentId válido' }, 400);
        }

        const paymentRef = adminDb
            .collection('users')
            .doc(user.uid)
            .collection('pagos')
            .doc(paymentId);
        const paymentSnapshot = await paymentRef.get();

        if (!paymentSnapshot.exists) {
            return jsonResponse({ success: false, message: 'Pago no encontrado' }, 404);
        }

        const payment = paymentSnapshot.data() || {};
        const chargeId = safeString(payment.openpayChargeId, 200);
        const merchantId = import.meta.env.OPENPAY_MERCHANT_ID;
        const privateKey = import.meta.env.OPENPAY_PRIVATE_KEY;
        const apiBaseUrl = import.meta.env.OPENPAY_API_BASE_URL;

        if (!chargeId || !merchantId || !privateKey || !apiBaseUrl) {
            console.error('Faltan variables para consultar Openpay');
            return jsonResponse({ success: false, message: 'Configuración de pagos no disponible' }, 500);
        }

        let chargeUrl: URL;
        try {
            const parsedApiBaseUrl = new URL(apiBaseUrl);
            if (!['https:', 'http:'].includes(parsedApiBaseUrl.protocol)) throw new Error('URL no segura');
            chargeUrl = new URL(`/v1/${encodeURIComponent(merchantId)}/charges/${encodeURIComponent(chargeId)}`, parsedApiBaseUrl);
        } catch {
            return jsonResponse({ success: false, message: 'Configuración de pagos no disponible' }, 500);
        }

        const authHeader = Buffer.from(`${privateKey}:`).toString('base64');
        const response = await fetch(chargeUrl, {
            method: 'GET',
            headers: {
                Authorization: `Basic ${authHeader}`,
                Accept: 'application/json',
            },
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        const data = await response.json().catch(() => null) as Record<string, unknown> | null;

        if (!response.ok || !data) {
            return jsonResponse({
                success: false,
                message: typeof data?.description === 'string' ? data.description.slice(0, 300) : 'No se pudo consultar el pago',
            }, response.status >= 400 && response.status < 500 ? response.status : 502);
        }

        const normalizedCharge = normalizeCharge(data);
        if (typeof normalizedCharge.status === 'string') {
            try {
                await paymentRef.update({
                    status: normalizedCharge.status,
                    updatedAt: FieldValue.serverTimestamp(),
                });
            } catch (error) {
                console.error('[Openpay] No se pudo actualizar el estado del historial:', error);
            }
        }

        return jsonResponse({ success: true, ...normalizedCharge }, 200);
    } catch (error) {
        if (error instanceof FirebaseAuthError) {
            return jsonResponse({ success: false, message: error.message }, error.status);
        }

        console.error('Error consultando Openpay:', error);
        return jsonResponse({ success: false, message: 'Error interno del servidor' }, 500);
    }
};
