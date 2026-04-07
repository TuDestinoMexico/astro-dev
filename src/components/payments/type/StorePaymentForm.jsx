import React, { useState, useRef } from 'react';
import gsap from 'gsap';

// Listado de tiendas y comisiones (Tomado de tu ejemplo de Vue)
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
        customer: { name: '', last_name: '', phone_number: '', email: '' }
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [paymentData, setPaymentData] = useState(null);
    const [showStoreInfo, setShowStoreInfo] = useState(false); // Estado para el modal de tiendas

    const handleChange = (e) => {
        const { id, value } = e.target;
        if (['name', 'last_name', 'phone_number', 'email'].includes(id)) {
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
            const res = await fetch('/api/openpay-cargo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (res.ok) {
                setPaymentData({
                    id: data.id,
                    barcode_url: data.payment_method.barcode_url,
                    reference: data.payment_method.reference
                });
            } else {
                setError(data.description || 'Error al generar la ficha');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = "w-full border border-gray-300 px-4 py-2.5 rounded-xl text-gray-700 focus:ring-2 focus:ring-[#00c0a5] outline-none transition-all";
    const labelStyle = "block text-xs font-bold text-gray-500 uppercase mb-1 ml-1";

    if (paymentData) {
        return (
            <div className="text-center">
                <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-2xl mb-6">
                    <p className="text-yellow-800 font-bold text-lg mb-2">📸 ¡Tómale un screenshot!</p>
                </div>
                <div className="space-y-4 flex flex-col items-center">
                    <div className="bg-white p-4 border rounded-xl shadow-sm w-full">
                        <p className="text-xs text-gray-400 uppercase font-bold mb-2">Referencia de pago</p>
                        <p className="text-xl font-mono font-bold tracking-widest text-slate-800">{paymentData.reference}</p>
                    </div>
                    <img src={paymentData.barcode_url} alt="Código" className="max-w-full h-24 object-contain" />
                    <a href={`https://pagos.tudestinomx.com/confirmacion?id=${paymentData.id}`} target="_blank" className="w-full flex items-center justify-center gap-2 border-2 border-slate-800 py-3 rounded-xl font-bold hover:bg-slate-800 hover:text-white transition-all">
                        📥 Descargar PDF
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-white relative">
            <div className="text-center mb-6">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Tiendas de Conveniencia</h2>
                <button
                    type="button"
                    onClick={() => setShowStoreInfo(true)}
                    className="mt-2 text-indigo-600 font-bold text-sm hover:underline underline-offset-4"
                >
                    Consultar tiendas y comisiones
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Nombres</label>
                        <input id="name" type="text" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Apellidos</label>
                        <input id="last_name" type="text" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Email</label>
                        <input id="email" type="email" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Teléfono</label>
                        <input id="phone_number" type="tel" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className={labelStyle}>Referencia</label>
                        <input id="description" type="text" className={inputStyle} onChange={handleChange} required />
                    </div>
                    <div>
                        <label className={labelStyle}>Cantidad (MXN)</label>
                        <input id="amount" type="number" className={inputStyle} onChange={handleChange} required />
                    </div>
                </div>

                <button
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg transition-all ${loading ? 'bg-gray-400' : 'bg-[#00c0a5] hover:bg-black'}`}
                >
                    {loading ? 'Generando ficha...' : 'Generar ficha de pago'}
                </button>
            </form>

            {/* MODAL INTERNO DE TIENDAS (Equivalente al TiendasOpenpay.vue) */}
            {showStoreInfo && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
                        <button
                            onClick={() => setShowStoreInfo(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black text-2xl"
                        >
                            &times;
                        </button>

                        <div className="text-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Tiendas Disponibles</h3>
                            <p className="text-xs text-gray-500 mt-1">¿Dónde puedo pagar mi reserva?</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {stores.map((store, i) => (
                                <div key={i} className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <img src={store.img} alt={store.name} className="h-10 w-auto mb-2 object-contain mix-blend-multiply" />
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Comisión</p>
                                    <p className="text-xs font-bold text-slate-800">{store.fee}</p>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setShowStoreInfo(false)}
                            className="w-full mt-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-sm"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            )}

            {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        </div>
    );
}