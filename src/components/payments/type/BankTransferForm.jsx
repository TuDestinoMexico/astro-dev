import React, { useState } from 'react';

export default function BankTransferForm() {
    const [form, setForm] = useState({
        method: 'bank_account',
        amount: '',
        description: '',
        customer: {
            name: '',
            last_name: '',
            phone_number: '',
            email: ''
        }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState(null);

    // Función auxiliar para dar formato a la referencia
    const formatReference = (ref) => {
        // Esta regex toma grupos de 4 caracteres y les añade un espacio
        return ref ? ref.match(/.{1,4}/g).join(' ') : '';
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (['name', 'last_name', 'phone_number', 'email'].includes(id)) {
            setForm(prev => ({
                ...prev,
                customer: { ...prev.customer, [id]: value }
            }));
        } else {
            setForm(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/openpay-cargo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok) {
                setPaymentData(data.payment_method);
            } else {
                setError(data.description || 'Error al generar los datos de transferencia');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full border border-gray-300 px-4 py-2.5 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#00c0a5] focus:border-transparent outline-none transition-all placeholder:text-gray-400";
    const labelStyle = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

    // Vista de Éxito: Información de transferencia BBVA
    if (paymentData) {
        return (
            <div className="w-full max-w-lg mx-auto text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-[#00c0a5]/10 border-2 border-[#00c0a5]/20 p-6 rounded-3xl mb-8">
                    <p className="text-[#00c0a5] font-bold text-xl mb-1">¡Datos de transferencia listos!</p>
                    <p className="text-gray-600 text-sm">Realiza el pago desde tu banca móvil (BBVA).</p>
                </div>

                <div className="space-y-6">
                    {/* Tarjeta de detalles bancarios CORREGIDA */}
                    <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-xl shadow-slate-200/50 text-left w-full">
                        {/* Usamos space-y para crear filas verticales en lugar de una cuadrícula */}
                        <div className="space-y-5">
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Banco</p>
                                <p className="text-lg font-bold text-slate-800">{paymentData.bank || 'BBVA'}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Convenio</p>
                                <p className="text-lg font-mono font-bold text-slate-800">{paymentData.agreement}</p>
                            </div>
                            <div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Referencia</p>
                                {/* Contenedor para la referencia para evitar desbordamiento */}
                                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 mt-1 select-all overflow-x-auto">
                                    <p className="text-lg font-mono font-bold text-slate-800 whitespace-nowrap">
                                        {formatReference(paymentData.name)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <a
                        href={paymentData.url_spei}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        🔗 Ver instrucciones completas
                    </a>
                    <p className="text-xs text-gray-400 italic">📸 No olvides tomar captura de estos datos.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-white">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Transferencia BBVA</h2>
                <p className="text-gray-500 mt-2">Genera tus datos para pagar vía SPEI o practicaja.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                        <label className={labelStyle}>Nombres</label>
                        <input id="name" type="text" placeholder="Ej. Juan" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Apellidos</label>
                        <input id="last_name" type="text" placeholder="Ej. Pérez" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                        <label className={labelStyle}>Correo Electrónico</label>
                        <input id="email" type="email" placeholder="correo@ejemplo.com" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Teléfono</label>
                        <input id="phone_number" type="tel" placeholder="10 dígitos" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                        <label className={labelStyle}>Referencia / Concepto</label>
                        <input id="description" type="text" placeholder="Nombre del hotel" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Cantidad (MXN)</label>
                        <input id="amount" type="number" placeholder="0.00" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>

                <button
                    disabled={loading}
                    className={`w-full mt-4 py-4 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 ${loading ? 'bg-gray-400' : 'bg-[#00c0a5] hover:bg-black'}`}
                >
                    {loading ? (
                        <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generando datos...
                        </span>
                    ) : 'Generar datos de pago'}
                </button>
            </form>

            {error && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <div className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-2 gap-6 items-center justify-items-center opacity-80">
                <img
                    src="https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/12/16191431/LogotipoOpenpay-01-scaled.jpg"
                    alt="OpenPay"
                    className="h-10 object-contain"
                />
                <img
                    src="https://tudestinomx-bucket.storage.googleapis.com/wp-content/uploads/2024/12/16192507/SSL-Secured-Blue.png"
                    alt="SSL Secured"
                    className="h-12 object-contain"
                />
            </div>
        </div>
    );
}