import type { APIRoute } from 'astro';
import { fetchHotelList, fetchTourList } from '../../lib/catalog';
import { matchesDestino } from '../../lib/searchParams';

// Sugerencias del buscador de la portada. Solo lectura del catálogo público.
const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 80;
const MAX_RESULTS = 8;
const CACHE_TTL_MS = 60_000;

type Tipo = 'hotel' | 'tour';

// La lista completa se guarda en memoria por instancia para no leer Firestore en cada tecla.
const listCache = new Map<Tipo, { expiresAt: number; items: Record<string, any>[] }>();

async function loadCatalog(tipo: Tipo): Promise<{ ok: true; items: Record<string, any>[] } | { ok: false }> {
    const cached = listCache.get(tipo);
    if (cached && cached.expiresAt > Date.now()) return { ok: true, items: cached.items };

    const result = tipo === 'hotel' ? await fetchHotelList<any>() : await fetchTourList<any>();
    if (result.status !== 'ok') return { ok: false };

    const items = tipo === 'hotel'
        ? result.data.filter((hotel: any) => Number(hotel.active) === 1)
        : result.data;

    listCache.set(tipo, { expiresAt: Date.now() + CACHE_TTL_MS, items });
    return { ok: true, items };
}

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=30',
    },
});

export const GET: APIRoute = async ({ url }) => {
    const tipoParam = url.searchParams.get('tipo');
    if (tipoParam !== 'hotel' && tipoParam !== 'tour') {
        return json({ success: false, message: 'Tipo de búsqueda no válido.' }, 400);
    }

    const q = (url.searchParams.get('q') ?? '').trim().slice(0, MAX_QUERY_LENGTH);
    if (q.length < MIN_QUERY_LENGTH) {
        return json({ success: true, items: [] });
    }

    const catalog = await loadCatalog(tipoParam);
    if (!catalog.ok) {
        return json({ success: false, message: 'El catálogo no está disponible.', items: [] }, 503);
    }

    const items = catalog.items
        .filter((item) => matchesDestino(item, q))
        .slice(0, MAX_RESULTS)
        .map((item) => ({
            name: String(item.name || item.title || ''),
            slug: String(item.slug || ''),
            destino: String(item.destino || ''),
            image: item.images?.principal?.[0]?.url || item.imagenes?.principal?.[0]?.url || '',
        }))
        .filter((item) => item.name && item.slug);

    return json({ success: true, items });
};
