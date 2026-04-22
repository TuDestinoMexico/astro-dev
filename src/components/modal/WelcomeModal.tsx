import React, { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const PaymentStatusModal = () => {
    const [paymentData, setPaymentData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const overlayRef = useRef(null);
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchPaymentStatus = async () => {
            const params = new URLSearchParams(window.location.search);
            const transactionId = params.get('id');

            if (transactionId) {
                setLoading(true);
                setIsOpen(true);
                try {
                    const response = await fetch(`/api/openpay-check?id=${transactionId}`);
                    const data = await response.json();
                    if (response.ok) {
                        setPaymentData(data);
                    }
                } catch (error) {
                    console.error("Error de red", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPaymentStatus();
    }, []);

    useEffect(() => {
        if (isOpen && modalRef.current) {
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 });
            gsap.fromTo(modalRef.current,
                { y: 100, opacity: 0, scale: 0.8 },
                { y: 0, opacity: 1, scale: 1, duration: 0.7, ease: "elastic.out(1, 0.8)" }
            );
        }
    }, [isOpen, loading]);

    const close = () => {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
        gsap.to(modalRef.current, {
            y: 50, opacity: 0, scale: 0.9, duration: 0.3,
            onComplete: () => {
                setIsOpen(false);
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
            <div ref={overlayRef} onClick={close} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"></div>

            <div ref={modalRef} className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white font-sans">

                {loading ? (
                    <div className="p-20 flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <p className="text-slate-500 font-bold animate-pulse tracking-tight">Validando transacción...</p>
                    </div>
                ) : paymentData ? (
                    <>
                        {/* Cabecera dinámica */}
                        <div className={`p-8 text-center ${paymentData.status === 'completed' ? 'bg-green-50' : 'bg-amber-50'}`}>
                            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${paymentData.status === 'completed' ? 'bg-green-500 shadow-lg shadow-green-200' : 'bg-amber-500'}`}>
                                {paymentData.status === 'completed' ? (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                ) : (
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                )}
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 leading-none">
                                {paymentData.status === 'completed' ? '¡Pago Exitoso!' : 'Pago Pendiente'}
                            </h2>
                            <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest">ID: {paymentData.id}</p>
                        </div>

                        <div className="p-8 space-y-5">
                            {/* Monto y Autorización */}
                            <div className="flex justify-between items-end border-b border-slate-100 pb-4">
                                <div>
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Monto Total</p>
                                    <p className="text-3xl font-black text-slate-900">${paymentData.amount} <span className="text-sm font-medium text-slate-400">{paymentData.currency}</span></p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Autorización</p>
                                    <p className="text-lg font-mono font-bold text-indigo-600">{paymentData.authorization || '------'}</p>
                                </div>
                            </div>

                            {/* DETALLES DE TARJETA (Solo con texto) */}
                            {(paymentData.card || paymentData.method === 'card') && (
                                <div className="space-y-3">
                                    <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden">
                                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full"></div>
                                        <div className="relative z-10 space-y-4">
                                            <div className="flex justify-between items-center h-6">
                                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Detalles del método</p>
                                                {/* Nombre de la marca en texto */}
                                                <span className="text-xs font-bold italic uppercase tracking-widest text-white/90">
                                                    {paymentData?.card?.brand || 'Tarjeta'}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-lg font-mono tracking-[0.15em]">{paymentData?.card?.card_number || '**** **** **** ****'}</p>
                                                <div className="flex justify-between items-end">
                                                    <div>
                                                        <p className="text-[8px] uppercase text-white/40 font-bold">Titular</p>
                                                        <p className="text-xs font-bold uppercase truncate max-w-[140px]">{paymentData?.card?.holder_name}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-[8px] uppercase text-white/40 font-bold">Banco</p>
                                                        <p className="text-[10px] font-bold">{paymentData?.card?.bank_name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AVISO DE SEGURIDAD */}
                                    <div className="flex items-start gap-3 px-2 py-1">
                                        <div className="mt-1 text-green-500">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 4.946-2.597 9.29-6.518 11.771a1.304 1.304 0 01-1.482 0C6.097 16.29 3.5 11.947 3.5 7c0-.68.056-1.35.166-2.001a1 1 0 01.166-2.001zm7.834-1.123v1.123h1.123a1 1 0 110 2h-1.123v1.123a1 1 0 11-2 0V7H6.877a1 1 0 110-2h1.123V3.876a1 1 0 112 0z" clipRule="evenodd" /></svg>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className="text-[9px] font-bold text-slate-800 uppercase tracking-tight">Seguridad Garantizada</p>
                                            <p className="text-[9px] text-slate-500 leading-tight">
                                                En <span className="font-bold">Tu Destino México</span> no almacenamos los datos de tu tarjeta.
                                                Esta transacción es procesada por <span className="font-bold text-indigo-600">OpenPay México</span>.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Descripción */}
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Concepto de viaje</p>
                                <p className="text-xs text-slate-600 font-medium leading-snug">{paymentData.description}</p>
                            </div>

                            {/* Botón Final */}
                            <button
                                onClick={close}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-slate-900 transition-all active:scale-95 shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                            >
                                Listo, ¡a viajar! ✈️
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="p-12 text-center space-y-4">
                        <p className="text-red-500 font-bold italic">No se pudo verificar la transacción.</p>
                        <button onClick={close} className="text-indigo-600 font-bold border-b border-indigo-600 pb-1">Cerrar ventana</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatusModal;