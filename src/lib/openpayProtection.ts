import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export class OpenpayProtectionError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OpenpayProtectionError';
    }
}

type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    reset: number;
};

type ProtectionServices = {
    redis: Redis;
    userLimiter: Ratelimit;
    ipLimiter: Ratelimit;
    idempotencyTtl: number;
};

type IdempotencyRecord = {
    state: 'processing' | 'completed';
    response?: Record<string, unknown>;
};

let services: ProtectionServices | null = null;

function readPositiveInteger(name: string) {
    const value = Number(import.meta.env[name]);
    return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function getProtectionServices(): ProtectionServices {
    if (services) return services;

    const redisUrl = import.meta.env.UPSTASH_REDIS_REST_URL;
    const redisToken = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
    const userMax = readPositiveInteger('OPENPAY_RATE_LIMIT_USER_MAX');
    const userWindow = readPositiveInteger('OPENPAY_RATE_LIMIT_USER_WINDOW_SECONDS');
    const ipMax = readPositiveInteger('OPENPAY_RATE_LIMIT_IP_MAX');
    const ipWindow = readPositiveInteger('OPENPAY_RATE_LIMIT_IP_WINDOW_SECONDS');
    const idempotencyTtl = readPositiveInteger('OPENPAY_IDEMPOTENCY_TTL_SECONDS');

    if (!redisUrl || !redisToken || !userMax || !userWindow || !ipMax || !ipWindow || !idempotencyTtl) {
        throw new OpenpayProtectionError('La protección de Openpay no está configurada');
    }

    const redis = new Redis({ url: redisUrl, token: redisToken });

    services = {
        redis,
        userLimiter: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(userMax, `${userWindow} s`),
            analytics: false,
            prefix: 'openpay:charge:user',
        }),
        ipLimiter: new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(ipMax, `${ipWindow} s`),
            analytics: false,
            prefix: 'openpay:charge:ip',
        }),
        idempotencyTtl,
    };

    return services;
}

export function getClientIp(request: Request) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const firstForwardedIp = forwardedFor?.split(',')[0]?.trim();
    return firstForwardedIp || request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function enforceOpenpayRateLimit(uid: string, ip: string) {
    const { userLimiter, ipLimiter } = getProtectionServices();

    let userResult: RateLimitResult;
    let ipResult: RateLimitResult;

    try {
        [userResult, ipResult] = await Promise.all([
            userLimiter.limit(uid),
            ipLimiter.limit(ip),
        ]);
    } catch (error) {
        console.error('[Openpay protection] Rate limit unavailable:', error);
        throw new OpenpayProtectionError('La protección de Openpay no está disponible');
    }

    const limitedResult = [userResult, ipResult].find((result) => !result.success);
    const result = limitedResult || userResult;
    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));

    return {
        allowed: !limitedResult,
        retryAfter,
        headers: {
            'X-RateLimit-Limit': String(Math.min(userResult.limit, ipResult.limit)),
            'X-RateLimit-Remaining': String(Math.min(userResult.remaining, ipResult.remaining)),
            'X-RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        },
    };
}

function getIdempotencyKey(uid: string, idempotencyKey: string) {
    return `openpay:charge:idempotency:${uid}:${idempotencyKey}`;
}

export async function reserveIdempotencyKey(uid: string, idempotencyKey: string) {
    const { redis, idempotencyTtl } = getProtectionServices();
    const key = getIdempotencyKey(uid, idempotencyKey);

    try {
        const created = await redis.set(key, JSON.stringify({ state: 'processing' }), {
            nx: true,
            ex: idempotencyTtl,
        });

        if (created === 'OK') {
            return { acquired: true, response: null };
        }

        const existing = await redis.get<IdempotencyRecord>(key);
        return {
            acquired: false,
            response: existing?.state === 'completed' ? existing.response || null : null,
        };
    } catch (error) {
        console.error('[Openpay protection] Idempotency unavailable:', error);
        throw new OpenpayProtectionError('La protección de Openpay no está disponible');
    }
}

export async function completeIdempotencyKey(
    uid: string,
    idempotencyKey: string,
    response: Record<string, unknown>
) {
    const { redis, idempotencyTtl } = getProtectionServices();

    try {
        await redis.set(getIdempotencyKey(uid, idempotencyKey), JSON.stringify({
            state: 'completed',
            response,
        }), { ex: idempotencyTtl });
    } catch (error) {
        console.error('[Openpay protection] Could not persist idempotency result:', error);
        throw new OpenpayProtectionError('No se pudo confirmar la protección del cargo');
    }
}

export async function releaseIdempotencyKey(uid: string, idempotencyKey: string) {
    const { redis } = getProtectionServices();

    try {
        await redis.del(getIdempotencyKey(uid, idempotencyKey));
    } catch (error) {
        console.error('[Openpay protection] Could not release idempotency key:', error);
    }
}
