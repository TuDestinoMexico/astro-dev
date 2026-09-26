import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import { adminDb, FieldValue } from '../../lib/firebaseAdmin';

const MAX_BODY_BYTES = 64 * 1024;
const CHARGE_ID_PATTERN = /^[A-Za-z0-9._:-]{1,200}$/;
const ALLOWED_STATUSES = new Set([
    'created',
    'pending',
    'in_progress',
    'succeeded',
    'paid',
    'completed',
    'failed',
    'rejected',
    'cancelled',
    'canceled',
    'expired',
    'refunded',
    'chargeback',
]);

type WebhookPayload = Record<string, unknown>;

function jsonResponse(body: Record<string, unknown>, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

function readObject(value: unknown) {
    return value && typeof value === 'object' && !Array.isArray(value)
        ? value as Record<string, unknown>
        : null;
}

function readText(value: unknown, maxLength = 200) {
    return typeof value === 'string' && value.length > 0 && value.length <= maxLength ? value : null;
}

function isValidWebhookToken(providedToken: string | null, configuredToken: string | undefined) {
    if (!providedToken || !configuredToken) return false;

    const provided = Buffer.from(providedToken);
    const configured = Buffer.from(configuredToken);
    return provided.length === configured.length && timingSafeEqual(provided, configured);
}

function getChargeId(payload: WebhookPayload, transaction: Record<string, unknown> | null) {
    const candidates = [
        transaction?.id,
        transaction?.charge_id,
        readObject(payload.data)?.id,
    ];

    for (const candidate of candidates) {
        const chargeId = readText(candidate);
        if (chargeId && CHARGE_ID_PATTERN.test(chargeId)) return chargeId;
    }

    return null;
}

function getStatus(eventType: string | null, transaction: Record<string, unknown> | null) {
    const transactionStatus = readText(transaction?.status, 50);
    if (transactionStatus && ALLOWED_STATUSES.has(transactionStatus)) return transactionStatus;

    const eventStatuses: Record<string, string> = {
        'charge.created': 'created',
        'charge.succeeded': 'completed',
        'charge.completed': 'completed',
        'charge.failed': 'failed',
        'charge.rejected': 'rejected',
        'charge.cancelled': 'cancelled',
        'charge.canceled': 'cancelled',
        'charge.expired': 'expired',
        'charge.refunded': 'refunded',
        'refund.succeeded': 'refunded',
    };

    return eventType ? eventStatuses[eventType] || null : null;
}

export const POST: APIRoute = async ({ request, url }) => {
    const configuredToken = import.meta.env.OPENPAY_WEBHOOK_TOKEN;
    const providedToken = request.headers.get('x-openpay-webhook-token') || url.searchParams.get('token');

    if (!isValidWebhookToken(providedToken, configuredToken)) {
        return jsonResponse({ success: false, message: 'Webhook no autorizado' }, 401);
    }

    const contentType = request.headers.get('content-type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
        return jsonResponse({ success: false, message: 'El webhook debe ser JSON' }, 415);
    }

    const contentLength = Number(request.headers.get('content-length') || 0);
    if (contentLength > MAX_BODY_BYTES) {
        return jsonResponse({ success: false, message: 'El webhook es demasiado grande' }, 413);
    }

    try {
        const rawBody = await request.text();
        if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
            return jsonResponse({ success: false, message: 'El webhook es demasiado grande' }, 413);
        }

        const payload = JSON.parse(rawBody) as WebhookPayload;
        const transaction = readObject(payload.transaction) || readObject(payload.charge) || readObject(payload.data);
        const eventType = readText(payload.type) || readText(payload.event_type);
        const chargeId = getChargeId(payload, transaction);
        const status = getStatus(eventType, transaction);

        if (!chargeId) {
            return jsonResponse({ success: false, message: 'El webhook no contiene un cargo válido' }, 400);
        }

        if (!status) {
            console.warn('[Openpay] Evento webhook no manejado:', eventType || 'sin tipo');
            return jsonResponse({ success: true, received: true, handled: false });
        }

        const payments = await adminDb
            .collectionGroup('pagos')
            .where('openpayChargeId', '==', chargeId)
            .limit(1)
            .get();

        if (payments.empty) {
            // Acknowledge unknown charges so Openpay does not retry indefinitely.
            return jsonResponse({ success: true, received: true, matched: false });
        }

        const paymentRef = payments.docs[0].ref;
        const eventId = readText(payload.id, 200);
        await paymentRef.update({
            status,
            ...(eventType ? { lastWebhookEventType: eventType } : {}),
            ...(eventId ? { lastWebhookEventId: eventId } : {}),
            updatedAt: FieldValue.serverTimestamp(),
        });

        return jsonResponse({
            success: true,
            received: true,
            matched: true,
            paymentId: paymentRef.id,
            status,
        });
    } catch (error) {
        if (error instanceof SyntaxError) {
            return jsonResponse({ success: false, message: 'El webhook no es JSON válido' }, 400);
        }

        console.error('[Openpay] Error procesando webhook:', error);
        return jsonResponse({ success: false, message: 'Error interno procesando webhook' }, 500);
    }
};
