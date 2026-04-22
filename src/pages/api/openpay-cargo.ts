import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        const privateKey = import.meta.env.OPENPAY_PRIVATE_KEY;
        const merchantId = import.meta.env.OPENPAY_MERCHANT_ID;
        // const privateKey = import.meta.env.VITE_SX_OPENPAY_PRIVATE_KEY;

        // Producción o Sandbox (ajusta la URL según necesites)
        const url = `https://api.openpay.mx/v1/${merchantId}/charges`;
        // const url = `https://sandbox-api.openpay.mx/v1/${merchantId}/charges`;

        // En Node/Astro usamos Buffer para base64
        const authHeader = Buffer.from(`${privateKey}:`).toString('base64');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), { status: 500 });
    }
};