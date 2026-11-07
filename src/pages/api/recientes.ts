import type { APIRoute } from 'astro';
import { fetchHotelDetail, fetchTourDetail } from '../../lib/catalog';

// Datos actuales de hoteles y tours vistos recientemente. Solo lectura del catálogo público.
// Recibe ?items=hotel:slug,tour:slug y responde con título, ubicación e imagen vigentes,
// para que la imagen firmada siempre sea reciente (no se guarda en el navegador).
const MAX_ITEMS = 4;
const ITEM_PATTERN = /^(hotel|tour):([a-z0-9-]{1,120})$/;

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60',
    },
});

export const GET: APIRoute = async ({ url }) => {
    const requested = (url.searchParams.get('items') ?? '')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .slice(0, MAX_ITEMS);

    const parsed = requested
        .map((value) => ITEM_PATTERN.exec(value))
        .filter((match): match is RegExpExecArray => match !== null);

    if (parsed.length === 0) {
        return json({ success: true, items: [] });
    }

    const results = await Promise.all(
        parsed.map(async ([, type, slug]) => {
            const result = type === 'hotel'
                ? await fetchHotelDetail<any>(slug)
                : await fetchTourDetail<any>(slug);

            const url = `/${type}/${slug}`;

            // "not-found": ya no existe o está inactivo. "unavailable": falla temporal del catálogo.
            if (result.status !== 'ok') return { url, status: result.status };

            const item = result.data;
            const images = item.images || {};
            const allImages = [
                ...(images.principal || []),
                ...(images.secundaria || []),
                ...(images.adicional || []),
            ];

            return {
                url,
                status: 'ok' as const,
                type,
                title: item.name || '',
                location: item.address || item.destino || '',
                image: allImages[0]?.url || '',
            };
        })
    );

    return json({ success: true, items: results });
};
