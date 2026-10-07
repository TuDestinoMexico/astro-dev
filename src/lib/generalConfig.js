import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

const CACHE_TTL_MS = 60_000;
const REQUEST_TIMEOUT_MS = 1_500;

const fallbackConfig = Object.freeze({
    logoUrl: 'https://storage.googleapis.com/tudestinomx_bucket/assets/test/tdmx_logo_mundial.png',
    whatsappGlobal: '529987141365',
});

// The cache and pending request are scoped to the current serverless instance.
let cachedConfig = null;
let cacheExpiresAt = 0;
let pendingRequest = null;

function normalizeConfig(data) {
    return {
        logoUrl: typeof data.logoUrl === 'string' && data.logoUrl.trim()
            ? data.logoUrl
            : fallbackConfig.logoUrl,
        whatsappGlobal: typeof data.whatsappGlobal === 'string' && data.whatsappGlobal.trim()
            ? data.whatsappGlobal
            : fallbackConfig.whatsappGlobal,
    };
}

async function loadGeneralConfig() {
    let timeoutId;

    try {
        /** @type {Promise<never>} */
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Timeout loading general config')), REQUEST_TIMEOUT_MS);
        });
        const snapshot = await Promise.race([
            getDoc(doc(db, 'config', 'general')),
            timeoutPromise,
        ]);

        return snapshot.exists() ? normalizeConfig(snapshot.data()) : fallbackConfig;
    } finally {
        clearTimeout(timeoutId);
    }
}

export async function getGeneralConfig() {
    if (cachedConfig && Date.now() < cacheExpiresAt) {
        return cachedConfig;
    }

    if (!pendingRequest) {
        pendingRequest = loadGeneralConfig()
            .then((config) => {
                cachedConfig = config;
                cacheExpiresAt = Date.now() + CACHE_TTL_MS;
                return config;
            })
            .finally(() => {
                pendingRequest = null;
            });
    }

    try {
        return await pendingRequest;
    } catch (error) {
        console.warn('[generalConfig] No se pudo cargar la configuración general. Usando valores de respaldo.', error);
        return fallbackConfig;
    }
}
