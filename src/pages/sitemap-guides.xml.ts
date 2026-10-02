import type { APIRoute } from 'astro';
import { guides } from '../data/guides';

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

export const GET: APIRoute = () => {
    const entries = guides.map((guide) => `  <url><loc>${escapeXml(`${SITE_URL}/guias/${guide.slug}/`)}</loc><lastmod>${guide.updatedAt}</lastmod></url>`);
    const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>`;

    return new Response(body, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
        }
    });
};
