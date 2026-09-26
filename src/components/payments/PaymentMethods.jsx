import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CreditCardDrawer from "./type/CreditCardDrawer.jsx";
import StorePaymentForm from "./type/StorePaymentForm.jsx";
import BankTransferForm from "./type/BankTransferForm.jsx";
import DirectTransferForm from "./type/DirectTransferForm.jsx";
import CounterPaymentForm from "./type/CounterPaymentForm.jsx";
import OxxoDepositForm from "./type/OxxoDepositForm.jsx";
const paymentData = [
    { id: 1, title: "Tarjeta de débito o crédito", icon: "💳", info: "" },
    { id: 2, title: "Tiendas de conveniencia", icon: "🛒", info: "Genera tu ficha y paga en 7-Eleven, Walmart, Farmacias del Ahorro y más." },
    { id: 3, title: "Pagos de servicios (BBVA)", icon: "🏦", info: "Ingresa a tu app BBVA, ve a 'Pago de Servicios' y usa nuestro convenio." },
    { id: 4, title: "Transferencias Interbancarias", icon: "🏛️", info: "Realiza un SPEI a nuestra cuenta CLABE con tu número de reserva." },
    { id: 5, title: "Pagos en ventanilla", icon: "👤", info: "Acude a ventanilla bancaria con nuestra ficha técnica." },
    { id: 6, title: "Depósitos (Oxxo)", icon: "🏪", info: "Paga en efectivo en cualquier OXXO indicando el número de tarjeta asignado." },
];

export default function PaymentMethods({ baseUrl }) {
    const [selectedId, setSelectedId] = useState(null);
    const [user, setUser] = useState(null);
    const [authMessage, setAuthMessage] = useState('');
    const containerRef = useRef(null);

    useEffect(() => onAuthStateChanged(auth, setUser), []);

    useEffect(() => {
        let ctx = gsap.context(() => {
            gsap.set(".payment-card", { opacity: 0, y: 20 });
            gsap.to(".payment-card", {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: "power2.out",
                delay: 0.2
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    const activeMethod = paymentData.find(m => m.id === selectedId);

    const handleMethodSelect = (methodId) => {
        if (!user) {
            window.location.href = '/cliente/login?returnTo=/pagos';
            return;
        }

        if (!user.emailVerified) {
            setAuthMessage('Verifica tu correo electrónico antes de generar un voucher de pago.');
            return;
        }

        setSelectedId(methodId);
    };

    return (
        <div ref={containerRef} className="py-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {paymentData.map((method) => (
                    <div
                        key={method.id}
                        onClick={() => handleMethodSelect(method.id)}
                        className="payment-card cursor-pointer bg-[#00c0a5] hover:bg-[#00a891] p-10 rounded-2xl flex flex-col items-center justify-center text-center transition-all shadow-md hover:shadow-xl group min-h-[220px]"
                    >
                        <span className="text-5xl mb-4 group-hover:scale-110 transition-transform">{method.icon}</span>
                        <h3 className="text-white font-bold text-xl leading-tight">{method.title}</h3>
                    </div>
                ))}
            </div>

             {(!user || authMessage) && (
                 <div className="mt-8 mx-auto max-w-xl rounded-2xl border border-purple-100 bg-purple-50 p-5 text-center">
                     <p className="font-bold text-purple-900">{authMessage || 'Inicia sesión para generar un voucher de pago.'}</p>
                     <p className="mt-1 text-sm text-purple-700">Tu sesión permite proteger el cargo y consultar su historial posteriormente.</p>
                 </div>
             )}

             {/* Modal Dinámico */}
            {selectedId && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className={`bg-white rounded-3xl p-8 w-full shadow-2xl overflow-y-auto max-h-[90vh] ${selectedId === 1 ? 'max-w-2xl' : 'max-w-md'}`}>

                        <div className="text-center relative">
                            <button
                                onClick={() => setSelectedId(null)}
                                className="absolute -top-4 -right-4 text-gray-400 hover:text-black text-3xl"
                            >
                                &times;
                            </button>

                            {selectedId === 1 && <CreditCardDrawer baseUrl={baseUrl} />}
                            {selectedId === 2 && <StorePaymentForm />}
                            {selectedId === 3 && <BankTransferForm />}
                            {selectedId === 4 && <DirectTransferForm/>}
                            {selectedId === 5 && <CounterPaymentForm/>}
                            {selectedId === 6 && <OxxoDepositForm/>}

                            {/* Información para otros métodos */}
                            {![1, 2, 3, 4, 5, 6].includes(selectedId) && (
                                <div className="py-4">
                                    <span className="text-6xl block mb-4">{activeMethod.icon}</span>
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{activeMethod.title}</h2>
                                    <p className="text-gray-600 mb-8 leading-relaxed">{activeMethod.info}</p>
                                    <button onClick={() => setSelectedId(null)} className="w-full bg-[#00c0a5] text-white font-bold py-4 rounded-xl hover:bg-black transition-colors">Entendido</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
