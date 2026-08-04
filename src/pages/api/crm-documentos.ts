import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { tipo, codigo, email, documentoId } = await request.json();

        if (!tipo || !codigo || !email) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Faltan tipo, código o email'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const apiUrl = import.meta.env.API_CRM_URL;

        let url = '';
        if (documentoId) {
            const param = tipo === 'gb' ? 'gb' : 'ct';
            url = `${apiUrl}/api/documentos/${documentoId}/preview?${param}=${encodeURIComponent(codigo)}&email=${encodeURIComponent(email)}`;
        } else {
            const entity = tipo === 'gb' ? 'grupos' : 'reservas';
            url = `${apiUrl}/api/${entity}/${encodeURIComponent(codigo)}/documentos?email=${encodeURIComponent(email)}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Api-Token': import.meta.env.API_CRM_TOKEN,
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Error de conexión con el servidor de documentos'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
