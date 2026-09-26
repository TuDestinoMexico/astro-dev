import React, { useRef, useState } from 'react';
import { createIdempotencyKey, createOpenpayCharge } from '../../../lib/openpayClient';

// Listado de tiendas y comisiones
const stores = [
    { name: "7-Eleven", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/7eleven.jpg", fee: "$12.00 MXN" },
    { name: "Walmart", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/walmart.jpg", fee: "$10.00 MXN" },
    { name: "Walmart Express", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/walmart_express.png", fee: "$10.00 MXN" },
    { name: "Bodega Aurrera", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/bodegaAurrera.jpg", fee: "$10.00 MXN" },
    { name: "Sam's Club", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/Sam_s%20Club.png", fee: "$10.00 MXN" },
    { name: "Farmacia Guadalajara", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/farmaciaGuadalajara.jpg", fee: "$8.00 MXN" },
    { name: "Farmacia del Ahorro", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/farmaciaAhorro.jpg", fee: "$9.00 MXN" },
    { name: "Waldo's", img: "https://storage.googleapis.com/tudestinomx_bucket/logos/Comercios/waldos.jpg", fee: "$10.00 MXN" },
];

export default function StorePaymentForm() {
    const [form, setForm] = useState({
        method: 'store',
        amount: '',
        description: '',
        customer: { name: '', last_name: '', phone_number: '' }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState(null);
    const [showStoreInfo, setShowStoreInfo] = useState(false);
    const idempotencyKeyRef = useRef(null);

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (['name', 'last_name', 'phone_number'].includes(id)) {
            setForm(prev => ({ ...prev, customer: { ...prev.customer, [id]: value } }));
        } else {
            setForm(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            if (!idempotencyKeyRef.current) idempotencyKeyRef.current = createIdempotencyKey();
            const data = await createOpenpayCharge(form, idempotencyKeyRef.current);
            if (data.success) {
                setPaymentData({
                    id: data.id,
                    barcode_url: data.payment_method.barcode_url,
                    reference: data.payment_method.reference
                });
                idempotencyKeyRef.current = null;
            }
        } catch (err) {
            setError(err.message || 'Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    // Estilos compartidos con el componente de tarjeta
    const inputStyle = "w-full border border-gray-300 px-4 py-2.5 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#00c0a5] focus:border-transparent outline-none transition-all placeholder:text-gray-400";
    const labelStyle = "block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 ml-1";

    // Pantalla de éxito (Ficha generada)
    if (paymentData) {
        return (
            <div className="w-full max-w-lg mx-auto text-center animate-in fade-in zoom-in duration-300">
                <div className="bg-[#00c0a5]/10 border-2 border-[#00c0a5]/20 p-6 rounded-3xl mb-8">
                    <p className="text-[#00c0a5] font-bold text-xl mb-1">¡Ficha generada!</p>
                    <p className="text-gray-600 text-sm">Tómale una captura de pantalla o descarga el PDF.</p>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 border border-gray-100 rounded-3xl shadow-xl shadow-slate-200/50">
                        <p className={labelStyle + " text-center"}>Referencia de pago</p>
                        <p className="text-2xl font-mono font-bold tracking-[0.2em] text-slate-800 my-4 select-all">
                            {paymentData.reference}
                        </p>
                        <div className="flex justify-center p-4 bg-white border rounded-2xl">
                            <img src={paymentData.barcode_url} alt="Código de barras" className="h-20 w-auto" />
                        </div>
                    </div>

                    <a
                        href={`https://pagos.tudestinomx.com/confirmacion?id=${paymentData.id}`}
                        target="_blank"
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-black transition-all shadow-lg active:scale-95"
                    >
                        📥 Descargar Ficha PDF
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-white">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800">Tiendas de Conveniencia</h2>
                <button
                    type="button"
                    onClick={() => setShowStoreInfo(true)}
                    className="mt-2 text-[#00c0a5] font-bold text-sm hover:underline underline-offset-4"
                >
                    Consultar tiendas y comisiones
                </button>
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

                {/* Email y Teléfono */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                        <label className={labelStyle}>Teléfono</label>
                        <input id="phone_number" type="tel" placeholder="10 dígitos" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>

                {/* Referencia y Cantidad */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                    <div>
                        <label className={labelStyle}>Referencia / Concepto</label>
                        <input id="description" type="text" placeholder="Hotel o Tour" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Cantidad (MXN)</label>
                        <input id="amount" type="number" placeholder="0.00" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>

                {/* Botón de envío con Spinner */}
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
                            Generando ficha...
                        </span>
                    ) : 'Generar ficha de pago'}
                </button>
            </form>

            {/* Mensaje de Error */}
            {error && (
                <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-xl text-sm">
                    <strong>Error:</strong> {error}
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

            {/* Modal de Tiendas */}
            {showStoreInfo && (
                <div className="fixed inset-0 z-110 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-4xl p-8 max-w-md w-full shadow-2xl relative">
                        <button onClick={() => setShowStoreInfo(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black text-2xl">
                            &times;
                        </button>
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800">Tiendas Disponibles</h3>
                            <p className="text-sm text-gray-500 mt-1">Puedes pagar en cualquiera de estos puntos</p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 max-h-87.5 overflow-y-auto pr-2 custom-scrollbar">
                            {stores.map((store, i) => (
                                <div key={i} className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 transition-hover hover:border-[#00c0a5]/30">
                                    <img src={store.img} alt={store.name} className="h-8 w-auto mb-2 object-contain mix-blend-multiply" />
                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">Comisión aprox</p>
                                    <p className="text-xs font-bold text-slate-800">{store.fee}</p>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowStoreInfo(false)} className="w-full mt-6 py-4 bg-slate-900 text-white font-bold rounded-xl text-sm hover:bg-black transition-colors">
                            Cerrar
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
