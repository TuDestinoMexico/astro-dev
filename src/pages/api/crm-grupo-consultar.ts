import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { gb, email } = await request.json();

        if (!gb || !email) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Faltan GB o email'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const apiUrl = import.meta.env.API_CRM_URL;

        const response = await fetch(`${apiUrl}/api/grupos/consultar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Token': import.meta.env.API_CRM_TOKEN,
            },
            body: JSON.stringify({ gb, email })
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: 'Error de conexión con el servidor de grupos'
        }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
};
