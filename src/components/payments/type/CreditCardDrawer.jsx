import React, { useState } from 'react';

export default function CreditCardDrawer({ baseUrl }) {
    const [form, setForm] = useState({
        method: 'card',
        amount: '',
        description: '',
        customer: {
            name: '',
            last_name: '',
            phone_number: '',
            email: ''
        },
        confirm: 'false',
        send_email: 'true',
        redirect_url: `${baseUrl}`,
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [paymentUrl, setPaymentUrl] = useState('');

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
        setSuccess('');

        try {
            const res = await fetch('/api/openpay-cargo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess('¡Cargo generado con éxito!');
                setPaymentUrl(data.payment_method.url);
            } else {
                setError(data.description || 'Error al procesar el pago');
            }
        } catch (err) {
            setError('Error de conexión con el servidor');
        } finally {
            setLoading(false);
        }
    };

    // Estilo común para los inputs
    const inputStyle = "w-full border border-gray-300 px-4 py-2.5 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#00c0a5] focus:border-transparent outline-none transition-all placeholder:text-gray-400";
    const labelStyle = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

    return (
        <div className="w-full max-w-lg mx-auto bg-white">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Pago con Tarjeta</h2>
                <p className="text-gray-500 mt-2">Completa los datos para generar tu liga segura.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Nombres y Apellidos */}
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

                {/* Email */}
                <div className="text-left">
                    <label className={labelStyle}>Correo Electrónico</label>
                    <input id="email" type="email" placeholder="correo@ejemplo.com" className={inputStyle} onChange={handleChange} required />
                </div>

                {/* Teléfono */}
                <div className="text-left">
                    <label className={labelStyle}>Teléfono de contacto</label>
                    <input id="phone_number" type="tel" placeholder="10 dígitos" className={inputStyle} onChange={handleChange} required />
                </div>

                {/* Referencia y Cantidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                        <label className={labelStyle}>Referencia / Concepto</label>
                        <input id="description" type="text" placeholder="Nombre del hotel/tour" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Cantidad (MXN)</label>
                        <input id="amount" type="number" placeholder="0.00" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>

                {/* Botón de envío */}
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
                            Procesando...
                        </span>
                    ) : 'Crear liga de pago'}
                </button>
            </form>

            {/* Mensajes de feedback */}
            {error && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {paymentUrl && (
                <div className="mt-6 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                    <p className="text-indigo-900 font-bold mb-3">¡Liga de pago lista!</p>
                    <a
                        href={paymentUrl}
                        target="_blank"
                        className="inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                        Pagar ahora con Tarjeta
                    </a>
                    <p className="mt-3 text-[10px] text-gray-400 break-all">{paymentUrl}</p>
                </div>
            )}

            {/* Logos de Confianza */}
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