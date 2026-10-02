import type { APIRoute } from 'astro';
import { fetchHotelList, fetchTourList } from '../lib/catalog';

const SITE_URL = 'https://tudestinomx.com';
let cachedBody: string | null = null;

function escapeXml(value: string) {
    return value.replace(/[<>&'\"]/g, (character) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;'
    }[character] ?? character));
}

function urlEntry(path: string) {
    return `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`;
}

export const GET: APIRoute = async () => {
    const [hotelsResult, toursResult] = await Promise.all([
        fetchHotelList<{ slug?: string; active?: number | string }>(),
        fetchTourList<{ slug?: string; active?: number | string }>()
    ]);

    if (hotelsResult.status !== 'ok' || toursResult.status !== 'ok') {
        if (cachedBody) {
            return new Response(cachedBody, {
                headers: {
                    'Content-Type': 'application/xml; charset=utf-8',
                    'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=86400',
                    'Warning': '110 - "Response is stale"'
                }
            });
        }

        return new Response('Catálogo temporalmente no disponible.', {
            status: 503,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Retry-After': '3600',
                'Cache-Control': 'no-store'
            }
        });
    }

    const hotels = hotelsResult.data.filter((hotel) => hotel.slug && Number(hotel.active) === 1);
    const tours = toursResult.data.filter((tour) => tour.slug && Number(tour.active ?? 1) === 1);
    const urls = [
        ...hotels.map((hotel) => urlEntry(`/hotel/${encodeURIComponent(hotel.slug!)}`)),
        ...tours.map((tour) => urlEntry(`/tour/${encodeURIComponent(tour.slug!)}`))
    ];
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;
    cachedBody = body;

    return new Response(body, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
};
