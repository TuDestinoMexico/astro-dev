import { fetchHotelList, fetchTourList, type CatalogResult } from './catalog';
import { BUEN_FIN_TOPBAR, getBuenFinPhase } from './buenFin';

// Mensajes que muestra el ticker de la portada. Mientras esté en preparación, solo se muestra este texto.
export const TICKER_MESSAGES: string[] = ['Xolo News Próximamente'];

// Si el catálogo tarda más de este tiempo, el ticker se muestra sin conteos.
const REQUEST_TIMEOUT_MS = 1_500;
const DAY_MS = 86_400_000;

export type TickerCounts = { hotels: number; tours: number };

function withTimeout<T>(promise: Promise<T>, fallback: T): Promise<T> {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    return Promise.race([
        promise,
        new Promise<T>((resolve) => {
            timeoutId = setTimeout(() => resolve(fallback), REQUEST_TIMEOUT_MS);
        }),
    ]).finally(() => clearTimeout(timeoutId));
}

// Cuenta hoteles y tours publicados. Devuelve null si el catálogo no responde a tiempo o falla.
export async function fetchTickerCounts(): Promise<TickerCounts | null> {
    try {
        const result = await withTimeout<[CatalogResult<unknown[]>, CatalogResult<unknown[]>] | null>(
            Promise.all([fetchHotelList(), fetchTourList()]),
            null,
        );
        if (!result) return null;

        const [hotels, tours] = result;
        if (hotels.status !== 'ok' || tours.status !== 'ok') return null;

        return { hotels: hotels.data.length, tours: tours.data.length };
    } catch (error) {
        console.error('[newsTicker] Error contando catálogo', error);
        return null;
    }
}

function daysUntil(target: Date, now: Date): string {
    const days = Math.ceil((target.getTime() - now.getTime()) / DAY_MS);
    if (days <= 0) return 'hoy';
    if (days === 1) return 'en 1 día';
    return `en ${days} días`;
}

// Mensajes del ticker en orden. Los de Buen Fin dependen de la fase actual; los del catálogo, de los conteos.
export function buildTickerMessages(counts: TickerCounts | null, now: Date = new Date()): string[] {
    const messages: string[] = [];
    const phase = getBuenFinPhase(now);

    if (phase === 'before') {
        messages.push(`Buen Fin empieza ${daysUntil(BUEN_FIN_TOPBAR.start, now)}`);
    } else if (phase === 'active') {
        messages.push(`Buen Fin termina ${daysUntil(BUEN_FIN_TOPBAR.end, now)}`);
    }

    if (counts) {
        messages.push(`${counts.hotels} hoteles y ${counts.tours} tours disponibles`);
    }

    messages.push('Cotiza tu viaje por WhatsApp');

    return messages;
}
