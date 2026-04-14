import React, { useState } from 'react';

const bancosVentanilla = [
    {
        key: 'banorte',
        cuenta: '1273895869',
        logo: 'https://storage.googleapis.com/tudestinomx_bucket/logos/bancos/banorte.png',
        alt: 'Banorte',
    },
    {
        key: 'bbva',
        cuenta: '0123485188',
        logo: 'https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/12/17195008/BBVA.png',
        alt: 'BBVA',
    },
];

export default function CounterPaymentForm() {
    const [copied, setCopied] = useState(null);

    // Formatear en bloques de 5 para que ocupe menos espacio horizontal
    const formatAccount = (num) => {
        return num.match(/.{1,5}/g).join(' ');
    };

    const copyToClipboard = async (text, key) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(key);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const labelStyle = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1";

    return (
        <div className="w-full max-w-lg mx-auto bg-white">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Pago en Ventanilla</h2>
                <p className="text-gray-500 mt-2">Acude a tu banco más cercano con estos datos.</p>
            </div>

            {/* Listado de Cuentas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {bancosVentanilla.map((banco) => (
                    <div
                        key={banco.key}
                        className="bg-gray-50 border border-gray-100 p-6 rounded-3xl flex flex-col items-center text-center transition-all hover:shadow-md"
                    >
                        <div className="h-12 flex items-center justify-center mb-4">
                            <img src={banco.logo} alt={banco.alt} className="max-h-full object-contain opacity-90" />
                        </div>

                        <p className={labelStyle}>Número de Cuenta</p>

                        {/* Contenedor del número con fix de ancho */}
                        <div className="bg-white px-2 py-2 rounded-xl border border-gray-100 mb-4 w-full">
                            <span className="font-mono font-bold text-slate-700 text-base tracking-tight whitespace-nowrap">
                                {formatAccount(banco.cuenta)}
                            </span>
                        </div>

                        <button
                            onClick={() => copyToClipboard(banco.cuenta, banco.key)}
                            className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all transform active:scale-95 ${
                                copied === banco.key
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-900 text-white hover:bg-black shadow-md'
                            }`}
                        >
                            {copied === banco.key ? '¡Copiado! ✓' : 'Copiar cuenta'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Nota Informativa */}
            <div className="mt-8 p-5 bg-[#00c0a5]/5 border border-[#00c0a5]/20 rounded-2xl">
                <div className="flex gap-3 items-start">
                    <span className="text-lg">💡</span>
                    <p className="text-[11px] text-slate-600 leading-relaxed text-left">
                        Al realizar tu pago en ventanilla o practicaja, asegúrate de que el cajero imprima tu comprobante. <strong>Tómale una foto clara</strong> y envíala a nuestro equipo de reservaciones.
                    </p>
                </div>
            </div>
        </div>
    );
}