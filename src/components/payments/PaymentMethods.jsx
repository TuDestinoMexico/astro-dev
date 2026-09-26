import React, { useId, useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import CreditCardDrawer from "./type/CreditCardDrawer.jsx";
import StorePaymentForm from "./type/StorePaymentForm.jsx";
import BankTransferForm from "./type/BankTransferForm.jsx";
import DirectTransferForm from "./type/DirectTransferForm.jsx";
import CounterPaymentForm from "./type/CounterPaymentForm.jsx";
import OxxoDepositForm from "./type/OxxoDepositForm.jsx";
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';
import { Building2, CreditCard, Landmark, ShoppingCart, Store, UserRound, X } from 'lucide-react';
const paymentData = [
    {
        id: 1,
        title: "Tarjeta de débito o crédito",
        Icon: CreditCard,
        category: "online",
        priority: "primary",
        badge: "Pago en línea",
        summary: "Usa tu tarjeta directamente desde el sitio.",
        requirement: "Requiere sesión y correo verificado.",
        info: "Completa el formulario seguro para procesar tu pago con tarjeta."
    },
    {
        id: 2,
        title: "Tiendas de conveniencia",
        Icon: ShoppingCart,
        category: "cash",
        summary: "Genera una ficha y paga en efectivo.",
        requirement: "Consulta las tiendas y comisiones disponibles.",
        info: "Genera tu ficha y paga en 7-Eleven, Walmart, Farmacias del Ahorro y más."
    },
    {
        id: 3,
        title: "Pagos de servicios (BBVA)",
        Icon: Landmark,
        category: "banking",
        summary: "Paga desde tu app BBVA o practicaja.",
        requirement: "Necesitas la referencia generada para tu pago.",
        info: "Ingresa a tu app BBVA, ve a 'Pago de Servicios' y usa nuestro convenio."
    },
    {
        id: 4,
        title: "Transferencias Interbancarias",
        Icon: Building2,
        category: "banking",
        summary: "Realiza una transferencia vía SPEI.",
        requirement: "Usa la referencia asociada a tu reserva.",
        info: "Realiza un SPEI a nuestra cuenta CLABE con tu número de reserva."
    },
    {
        id: 5,
        title: "Pagos en ventanilla",
        Icon: UserRound,
        category: "cash",
        summary: "Paga en ventanilla bancaria.",
        requirement: "Lleva la ficha técnica de tu pago.",
        info: "Acude a ventanilla bancaria con nuestra ficha técnica."
    },
    {
        id: 6,
        title: "Depósitos (Oxxo)",
        Icon: Store,
        category: "cash",
        summary: "Paga en efectivo en cualquier OXXO.",
        requirement: "Indica el número de tarjeta asignado.",
        info: "Paga en efectivo en cualquier OXXO indicando el número de tarjeta asignado."
    },
];

const paymentGroups = [
    { id: "online", title: "Pago en línea", description: "La opción digital para completar tu pago." },
    { id: "banking", title: "Transferencias y banca", description: "Alternativas para pagar desde tu banco." },
    { id: "cash", title: "Efectivo y establecimientos", description: "Genera una ficha y paga en un punto cercano." },
];

export default function PaymentMethods({ baseUrl }) {
    const [selectedId, setSelectedId] = useState(null);
    const [user, setUser] = useState(null);
    const [authMessage, setAuthMessage] = useState('');
    const containerRef = useRef(null);
    const titleId = useId();
    const { dialogRef } = useAccessibleDialog({
        open: Boolean(selectedId),
        onClose: () => setSelectedId(null),
    });

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
            <div className="space-y-10">
                {paymentGroups.map((group) => (
                    <section key={group.id} aria-labelledby={`payment-group-${group.id}`}>
                        <div className="mb-4">
                            <h2 id={`payment-group-${group.id}`} className="text-xl font-bold text-brand-ink">{group.title}</h2>
                            <p className="mt-1 text-sm text-brand-muted">{group.description}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {paymentData.filter((method) => method.category === group.id).map((method) => {
                                const MethodIcon = method.Icon;
                                const isPrimary = method.priority === "primary";

                                return (
                                    <button
                                        type="button"
                                        key={method.id}
                                        onClick={() => handleMethodSelect(method.id)}
                                        className={`payment-card group relative w-full cursor-pointer border-0 p-6 text-left text-inherit transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary ${isPrimary ? 'lg:col-span-2 min-h-[240px] bg-brand-primary hover:bg-brand-primary-hover' : 'min-h-[220px] bg-brand-surface hover:bg-white'} rounded-card shadow-card hover:shadow-card-hover`}
                                    >
                                        {method.badge && (
                                            <span className="absolute right-4 top-4 rounded-pill bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                                                {method.badge}
                                            </span>
                                        )}
                                        <MethodIcon aria-hidden="true" size={42} strokeWidth={1.8} className={isPrimary ? "mb-5 text-white" : "mb-5 text-brand-primary"} />
                                        <h3 className={`font-bold leading-tight ${isPrimary ? 'text-2xl text-white' : 'text-xl text-brand-ink'}`}>{method.title}</h3>
                                        <p className={`mt-3 text-sm ${isPrimary ? 'text-white/90' : 'text-slate-600'}`}>{method.summary}</p>
                                        <p className={`mt-2 text-xs font-semibold ${isPrimary ? 'text-white/80' : 'text-brand-muted'}`}>{method.requirement}</p>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>

             {(!user || authMessage) && (
                 <div className="mt-8 mx-auto max-w-xl rounded-card border border-purple-100 bg-purple-50 p-5 text-center">
                     <p className="font-bold text-purple-900">{authMessage || 'Inicia sesión para generar un voucher de pago.'}</p>
                     <p className="mt-1 text-sm text-purple-700">Tu sesión permite proteger el cargo y consultar su historial posteriormente.</p>
                 </div>
             )}

            {/* Modal Dinámico */}
            {selectedId && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) setSelectedId(null);
                    }}
                >
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        tabIndex={-1}
                        className={`bg-white rounded-card-lg p-8 w-full shadow-2xl overflow-y-auto max-h-[90vh] ${selectedId === 1 ? 'max-w-2xl' : 'max-w-md'}`}
                    >

                        <div className="text-center relative">
                            <h2 id={titleId} className="sr-only">Selecciona un método de pago</h2>
                            <button
                                type="button"
                                onClick={() => setSelectedId(null)}
                                aria-label="Cerrar método de pago"
                                className="absolute -top-4 -right-4 p-1 text-gray-400 hover:text-black"
                            >
                                <X aria-hidden="true" size={24} />
                            </button>

                            {selectedId === 1 && <CreditCardDrawer baseUrl={baseUrl} />}
                            {selectedId === 2 && <StorePaymentForm />}
                            {selectedId === 3 && <BankTransferForm />}
                            {selectedId === 4 && <DirectTransferForm/>}
                            {selectedId === 5 && <CounterPaymentForm/>}
                            {selectedId === 6 && <OxxoDepositForm/>}

                            {/* Información para otros métodos */}
                            {![1, 2, 3, 4, 5, 6].includes(selectedId) && activeMethod && (
                                <div className="py-4">
                                    <activeMethod.Icon aria-hidden="true" size={56} className="mx-auto mb-4 text-brand-primary" />
                                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{activeMethod.title}</h2>
                                    <p className="text-gray-600 mb-8 leading-relaxed">{activeMethod.info}</p>
                                    <button onClick={() => setSelectedId(null)} className="w-full bg-brand-primary text-white font-bold py-4 rounded-card hover:bg-brand-primary-hover transition-colors">Entendido</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
