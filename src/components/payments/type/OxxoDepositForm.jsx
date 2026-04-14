import React, { useState } from 'react';

export default function OxxoDepositForm() {
    const [copied, setCopied] = useState(false);

    // Datos de la tarjeta para el depósito
    const cardInfo = {
        bank: 'Santander',
        number: '5579089005738425',
        logo: 'https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/12/17195044/santander.png'
    };

    // Formatear número de tarjeta (0000 0000 0000 0000)
    const formatCardNumber = (num) => {
        return num.match(/.{1,4}/g).join(' ');
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(cardInfo.number);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    const labelStyle = "block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1";

    return (
        <div className="w-full max-w-lg mx-auto bg-white">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Depósitos en Oxxo</h2>
                <p className="text-gray-500 mt-2">Paga en cualquier Oxxo dictando los siguientes datos.</p>
            </div>

            {/* Tarjeta de Depósito */}
            <div className="bg-gray-50 border border-gray-100 p-8 rounded-[2.5rem] flex flex-col items-center text-center transition-all hover:shadow-lg">
                <img
                    src={cardInfo.logo}
                    alt={cardInfo.bank}
                    className="h-10 object-contain mb-6 opacity-90"
                />

                <p className={labelStyle}>Número de Tarjeta</p>

                {/* Contenedor del número con formato */}
                <div className="bg-white px-4 py-3 rounded-2xl border border-gray-200 mb-6 w-full shadow-inner">
                    <span className="font-mono font-bold text-slate-700 text-xl sm:text-2xl tracking-tighter sm:tracking-normal whitespace-nowrap">
                        {formatCardNumber(cardInfo.number)}
                    </span>
                </div>

                <button
                    onClick={copyToClipboard}
                    className={`w-full py-4 rounded-xl font-bold text-sm transition-all transform active:scale-95 shadow-lg ${
                        copied
                            ? 'bg-green-500 text-white'
                            : 'bg-slate-900 text-white hover:bg-black'
                    }`}
                >
                    {copied ? '¡Número copiado! ✓' : 'Copiar número de tarjeta'}
                </button>
            </div>

            {/* Nota del Vacation Planner */}
            <div className="mt-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                <div className="flex gap-3 items-start">
                    <span className="text-lg">💬</span>
                    <p className="text-xs text-amber-900 leading-relaxed italic text-left">
                        *Recuerda consultar con tu <strong>Vacation Planner</strong> sobre los métodos alternativos para pagar y confirmar tu reservación.*
                    </p>
                </div>
            </div>

        </div>
    );
}