import type { APIRoute } from 'astro';
import { adminDb, FirebaseAuthError, requireFirebaseUser } from '../../lib/firebaseAdmin';

const jsonResponse = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
});

export const POST: APIRoute = async ({ request }) => {
    try {
        const user = await requireFirebaseUser(request, { requireVerifiedEmail: true });

        const config = await adminDb.doc('config/general').get();
        const configData = config.data();
        if (configData?.modoMantenimiento || configData?.pausarConsultasReservas) {
            return jsonResponse({
                success: false,
                message: 'Estamos haciendo unos ajustes en tus reservas. Vuelve a intentarlo más tarde.'
            }, 503);
        }

        const { ct, email, detail } = await request.json();

        if (!ct || (!email && !detail)) {
            return jsonResponse({
                success: false,
                message: 'Faltan CT o email'
            }, 400);
        }

        const code = String(ct).trim().toUpperCase();
        let crmEmail = email;

        if (detail) {
            const linked = await adminDb.doc(`users/${user.uid}/reservas/${code}`).get();
            crmEmail = linked.data()?.correo_reserva;

            if (!linked.exists || !crmEmail) {
                return jsonResponse({
                    success: false,
                    message: 'La reserva no está vinculada a tu cuenta.'
                }, 403);
            }
        }

        const apiUrl = import.meta.env.API_CRM_URL;

        const response = await fetch(`${apiUrl}/api/reservas/consultar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Token': import.meta.env.API_CRM_TOKEN,
            },
            body: JSON.stringify({ ct: code, email: crmEmail })
        });

        const data = await response.json();

        return jsonResponse(data, response.status);
    } catch (error) {
        if (error instanceof FirebaseAuthError) {
            return jsonResponse({
                success: false,
                message: error.message
            }, error.status);
        }

        return jsonResponse({
            success: false,
            message: 'Error de conexión con el servidor de reservas'
        }, 500);
    }
};
