import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { ct } = await request.json();

        if (!ct) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Falta el CT'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const apiUrl = import.meta.env.API_CRM_URL;

        const response = await fetch(`${apiUrl}/api/pago/${ct}`, {
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
            message: 'Error de conexión con el servidor de pagos'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
