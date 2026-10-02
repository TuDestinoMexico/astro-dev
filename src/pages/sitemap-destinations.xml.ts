import type { APIRoute } from 'astro';
import { destinations } from '../data/destinations';
import { fetchDestinationCatalog } from '../lib/destinations';

const SITE_URL = 'https://tudestinomx.com';

function escapeXml(value: string) {
    return value.replace(/[<>&'\"]/g, (character) => ({
        '<': '&lt;',
        '>': '&gt;',
        '&': '&amp;',
        "'": '&apos;',
        '"': '&quot;'
    }[character] ?? character));
}

function entry(path: string) {
    return `  <url><loc>${escapeXml(`${SITE_URL}${path}`)}</loc></url>`;
}

export const GET: APIRoute = async () => {
    const catalogs = await Promise.all(destinations.map(async (destination) => ({
        destination,
        catalog: await fetchDestinationCatalog(destination)
    })));

    if (catalogs.some(({ catalog }) => catalog.unavailable)) {
        return new Response('Catálogo temporalmente no disponible.', {
            status: 503,
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Retry-After': '3600',
                'Cache-Control': 'no-store'
            }
        });
    }

    const urls = catalogs.flatMap(({ destination, catalog }) => [
        entry(`/destinos/${destination.slug}/`),
        ...(catalog.hotels.length > 0 ? [entry(`/destinos/${destination.slug}/hoteles/`)] : []),
        ...(catalog.tours.length > 0 ? [entry(`/destinos/${destination.slug}/tours/`)] : [])
    ]);
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`;

    return new Response(body, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
};
