import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ url: astroUrl }) => {
    try {
        const transactionId = astroUrl.searchParams.get('id');

        if (!transactionId) {
            return new Response(JSON.stringify({ error: 'Falta el transactionId' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const merchantId = import.meta.env.OPENPAY_MERCHANT_ID;
        // const privateKey = import.meta.env.VITE_SX_OPENPAY_PRIVATE_KEY;
        const privateKey = import.meta.env.OPENPAY_PRIVATE_KEY;
        // const url = `https://sandbox-api.openpay.mx/v1/${merchantId}/charges/${transactionId}`;
        const url = `https://api.openpay.mx/v1/${merchantId}/charges/${transactionId}`;

        // Generamos el Header de Autorización
        const authHeader = Buffer.from(`${privateKey}:`).toString('base64');

        const response = await fetch(url, {
            method: 'GET', // Cambiamos a GET para consultar
            headers: {
                'Authorization': `Basic ${authHeader}`,
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Error en OpenPay Check:', error);
        return new Response(JSON.stringify({ error: 'Error interno del servidor' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};