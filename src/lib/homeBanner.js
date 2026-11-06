import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Cancún usa UTC-5 todo el año. Las fechas de vigencia se guardan como YYYY-MM-DD.
const CANCUN_OFFSET = '-05:00';
const REQUEST_TIMEOUT_MS = 1_500;

const text = (value, fallback = '') => (
    typeof value === 'string' && value.trim() ? value.trim() : fallback
);

const safeHref = (value) => {
    const href = text(value);
    return href.startsWith('/') || href.startsWith('https://') ? href : '';
};

const parseDay = (value, endOfDay) => {
    if (typeof value !== 'string' || !value.trim()) return null;
    const date = new Date(`${value.trim()}T${endOfDay ? '23:59:59' : '00:00:00'}${CANCUN_OFFSET}`);
    return Number.isNaN(date.getTime()) ? null : date;
};

export function isBannerInRange(data, now = new Date()) {
    const start = parseDay(data.vigenciaInicio, false);
    const end = parseDay(data.vigenciaFin, true);
    if (start && now < start) return false;
    if (end && now > end) return false;
    return true;
}

function withTimeout(promise) {
    let timeoutId;

    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Timeout loading home banner')), REQUEST_TIMEOUT_MS);
        }),
    ]).finally(() => clearTimeout(timeoutId));
}

// Devuelve null si el banner está apagado, fuera de vigencia o si la lectura falla.
// En esos casos la sección de búsqueda se muestra igual, sin imagen de promoción.
export async function fetchHomeBanner(now = new Date()) {
    try {
        const snapshot = await withTimeout(getDoc(doc(db, 'config', 'homeBanner')));
        if (!snapshot.exists()) return null;

        const data = snapshot.data();
        if (data.activo !== true) return null;
        if (!isBannerInRange(data, now)) return null;

        return {
            titulo: text(data.titulo),
            ctaLabel: text(data.ctaLabel),
            ctaUrl: safeHref(data.ctaUrl),
            alt: text(data.alt),
            imageDesktop: text(data.imagenDesktopUrl),
            imageMobile: text(data.imagenMobileUrl),
        };
    } catch (error) {
        console.warn('[homeBanner] No se pudo cargar el banner.', error);
        return null;
    }
}
