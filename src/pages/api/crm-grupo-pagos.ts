import type { APIRoute } from 'astro';
import { adminDb } from '../../lib/firebaseAdmin';

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const config = await adminDb.doc('config/general').get();
        const configData = config.data();
        if (configData?.modoMantenimiento || configData?.pausarConsultasReservas) {
            return jsonResponse({
                success: false,
                message: 'Estamos haciendo unos ajustes en tus pagos. Vuelve a intentarlo más tarde.'
            }, 503);
        }

        const { gb } = await request.json();

        if (!gb) {
            return jsonResponse({
                success: false,
                message: 'Falta el GB'
            }, 400);
        }

        const apiUrl = import.meta.env.API_CRM_URL;

        const response = await fetch(`${apiUrl}/api/gb/${gb}/pagos`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'X-Api-Token': import.meta.env.API_CRM_TOKEN,
            }
        });

        const data = await response.json();

        return jsonResponse(data, response.status);
    } catch (error) {
        return jsonResponse({
            success: false,
            message: 'Error de conexión con el servidor de pagos de grupo'
        }, 500);
    }
};
