import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const formData = await request.formData();

        const tipo = formData.get('tipo');
        const codigo = formData.get('codigo');

        if (!tipo || !codigo) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Faltan tipo o código'
            }), { status: 400, headers: { 'Content-Type': 'application/json' } });
        }

        const apiUrl = import.meta.env.API_CRM_URL;
        const entity = tipo === 'gb' ? 'grupos' : 'reservas';

        const response = await fetch(`${apiUrl}/api/${entity}/${encodeURIComponent(String(codigo))}/documentos`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'X-Api-Token': import.meta.env.API_CRM_TOKEN,
            },
            body: formData
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
