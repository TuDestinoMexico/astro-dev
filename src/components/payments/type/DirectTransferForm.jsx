import React, { useState } from 'react';

const bancos = [
    {
        key: 'santander',
        clabe: '014691655104419693',
        logo: 'https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/12/17195044/santander.png',
        alt: 'Santander',
    },
    {
        key: 'banorte',
        clabe: '072691012738958697',
        logo: 'https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/12/17194951/banorte.png',
        alt: 'Banorte',
    },
    {
        key: 'bbva',
        clabe: '012691001234851887',
        logo: 'https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/12/17195008/BBVA.png',
        alt: 'BBVA',
    },
];

export default function DirectTransferForm() {
    const [copied, setCopied] = useState(null);

    // Función para dar formato a la CLABE (bloques de 4)
    const formatClabe = (clabe) => {
        return clabe.match(/.{1,4}/g).join(' ');
    };

    const copyToClipboard = async (clabe, key) => {
        try {
            await navigator.clipboard.writeText(clabe);
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
                <h2 className="text-3xl font-bold text-slate-800">Transferencia Directa</h2>
                <p className="text-gray-500 mt-2">Paga desde tu banca móvil a nuestras cuentas oficiales.</p>
            </div>

            {/* Listado de Bancos */}
            <div className="space-y-4">
                {bancos.map((banco) => (
                    <div
                        key={banco.key}
                        className="bg-gray-50 border border-gray-100 p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 transition-all hover:shadow-md"
                    >
                        {/* Logo y Info */}
                        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                            <img src={banco.logo} alt={banco.alt} className="h-6 object-contain mb-3 opacity-90" />
                            <p className={labelStyle}>CLABE Interbancaria</p>
                            <span className="font-mono font-bold text-slate-700 text-sm tracking-wider">
                                {formatClabe(banco.clabe)}
                            </span>
                        </div>

                        {/* Botón de copiar */}
                        <button
                            onClick={() => copyToClipboard(banco.clabe, banco.key)}
                            className={`whitespace-nowrap px-6 py-3 rounded-xl font-bold text-xs transition-all transform active:scale-95 ${
                                copied === banco.key
                                    ? 'bg-green-500 text-white'
                                    : 'bg-slate-900 text-white hover:bg-black shadow-lg shadow-slate-200'
                            }`}
                        >
                            {copied === banco.key ? (
                                <span className="flex items-center gap-1">
                                    ¡Copiado! ✓
                                </span>
                            ) : 'Copiar CLABE'}
                        </button>
                    </div>
                ))}
            </div>

            {/* Instrucción Adicional */}
            <div className="mt-8 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-center">
                <p className="text-xs text-indigo-900 leading-relaxed">
                    <strong>Nota importante:</strong> Una vez realizada la transferencia, favor de enviar tu comprobante de pago a nuestro WhatsApp de atención.
                </p>
            </div>

        </div>
    );
}