import { useEffect, useId, useRef, useState } from 'react';
import gsap from 'gsap';
import { auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

const PaymentStatusModal = () => {
    const [paymentData, setPaymentData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const paymentId = params.get('id') || params.get('paymentId');
        if (!paymentId) return undefined;

        setLoading(true);
        setError('');
        setIsOpen(true);
        let requested = false;

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (requested) return;
            requested = true;

            try {
                if (!user) {
                    const returnTo = `/?id=${paymentId}`;
                    window.location.href = `/cliente/login?returnTo=${encodeURIComponent(returnTo)}`;
                    return;
                }

                const token = await user.getIdToken();
                const response = await fetch(`/api/openpay-check?paymentId=${encodeURIComponent(paymentId)}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await response.json();
                if (response.ok) {
                    setPaymentData(data);
                } else {
                    setError(data.message || 'No se pudo verificar la transacción.');
                }
            } catch (requestError) {
                console.error('Error consultando el pago:', requestError);
                setError('No se pudo verificar la transacción. Intenta nuevamente.');
            } finally {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    function close() {
        gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
        gsap.to(dialogRef.current, {
            y: 50,
            opacity: 0,
            scale: 0.94,
            duration: 0.3,
            onComplete: () => {
                setIsOpen(false);
                window.history.replaceState({}, document.title, window.location.pathname);
            },
        });
    }

    const { dialogRef } = useAccessibleDialog({ open: isOpen, onClose: close });

    useEffect(() => {
        if (!isOpen || !dialogRef.current) return undefined;

        gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35 });
        gsap.fromTo(
            dialogRef.current,
            { y: 50, opacity: 0, scale: 0.94 },
            { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out' },
        );

        return undefined;
    }, [isOpen, loading, dialogRef]);

    if (!isOpen) return null;

    const isCompleted = paymentData?.status === 'completed';

    return (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4 sm:p-6">
            <div
                ref={overlayRef}
                onClick={(event) => {
                    if (event.target === event.currentTarget) close();
                }}
                className="absolute inset-0 bg-brand-ink/80 backdrop-blur-md"
            ></div>

            <div
                ref={dialogRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] border border-white/70 bg-brand-surface font-sans shadow-card-hover"
            >
                <h2 id={titleId} className="sr-only">Estado del pago</h2>

                {loading ? (
                    <div role="status" aria-live="polite" aria-atomic="true" className="flex min-h-[28rem] flex-col items-center justify-center gap-6 bg-brand-ink p-10 text-center text-white">
                        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-brand-primary/30 bg-brand-primary/10">
                            <div className="absolute inset-2 animate-spin rounded-full border-2 border-brand-primary/20 border-t-brand-primary"></div>
                            <svg className="h-6 w-6 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m12 3 1.7 6.3L20 11l-6.3 1.7L12 19l-1.7-6.3L4 11l6.3-1.7L12 3Z" /></svg>
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-brand-primary">Tu viaje comienza aquí</p>
                            <p className="mt-3 text-xl font-black tracking-tight">Validando tu pago...</p>
                            <p className="mt-2 text-sm leading-6 text-white/60">Estamos confirmando cada detalle de tu transacción.</p>
                        </div>
                    </div>
                ) : paymentData ? (
                    <>
                        <div role="status" aria-live="polite" aria-atomic="true" className={`relative overflow-hidden px-7 pb-8 pt-7 text-white ${isCompleted ? 'bg-brand-ink' : 'bg-brand-accent'}`}>
                            <div className={`absolute -right-16 -top-20 h-52 w-52 rounded-full blur-3xl ${isCompleted ? 'bg-brand-primary/25' : 'bg-white/20'}`} aria-hidden="true"></div>
                            <div className="relative z-10 flex items-start justify-between gap-4">
                                <div>
                                    <p className={`text-[10px] font-black uppercase tracking-[0.24em] ${isCompleted ? 'text-brand-primary' : 'text-white/85'}`}>
                                        {isCompleted ? 'Pago confirmado' : 'Pago en validación'}
                                    </p>
                                    <h3 className="mt-4 max-w-[15rem] text-3xl font-black leading-[0.98] tracking-tight">
                                        {isCompleted ? 'Tu viaje ya está en ruta.' : 'Tu reserva sigue avanzando.'}
                                    </h3>
                                </div>
                                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${isCompleted ? 'border-brand-primary/30 bg-brand-primary/10 text-brand-primary' : 'border-white/30 bg-white/10 text-white'}`}>
                                    {isCompleted ? (
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="m5 12 4 4L19 6" /></svg>
                                    ) : (
                                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                    )}
                                </div>
                            </div>

                            <div className="relative z-10 mt-8 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.16em] text-white/70">
                                <span className={`flex h-7 w-7 items-center justify-center rounded-full ${isCompleted ? 'bg-brand-primary text-brand-ink' : 'bg-white text-brand-accent'}`}>01</span>
                                <span className={`h-px flex-1 ${isCompleted ? 'bg-brand-primary/60' : 'bg-white/50'}`}></span>
                                <span className={`flex h-7 w-7 items-center justify-center rounded-full border ${isCompleted ? 'border-brand-primary text-brand-primary' : 'border-white text-white'}`}>02</span>
                                <span className="ml-1">Pago <span className="mx-1 text-white/30">/</span> Viaje</span>
                            </div>
                        </div>

                        <div className="space-y-5 p-7 sm:p-8">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-border">
                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-muted">Importe total</p>
                                    <p className="mt-2 text-2xl font-black tracking-tight text-brand-ink">${paymentData.amount} <span className="text-xs font-bold text-brand-muted">{paymentData.currency}</span></p>
                                </div>
                                <div className="rounded-2xl bg-brand-primary/10 p-4">
                                    <p className="text-[9px] font-black uppercase tracking-[0.16em] text-brand-primary-hover">Autorización</p>
                                    <p className="mt-2 truncate font-mono text-sm font-bold text-brand-ink">{paymentData.authorization || '------'}</p>
                                </div>
                            </div>

                            <div className="relative overflow-hidden rounded-2xl border border-dashed border-brand-primary/40 bg-brand-primary/5 p-5">
                                <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full border-[12px] border-brand-primary/10" aria-hidden="true"></div>
                                <p className="relative text-[9px] font-black uppercase tracking-[0.18em] text-brand-primary-hover">Concepto de viaje</p>
                                <p className="relative mt-2 text-sm font-bold leading-5 text-brand-ink">{paymentData.description || 'Tu próxima experiencia con Tu Destino México'}</p>
                                <p className="relative mt-3 truncate font-mono text-[9px] font-bold uppercase tracking-wider text-brand-muted">ID {paymentData.id}</p>
                            </div>

                            {(paymentData.card || paymentData.method === 'card') && (
                                <div className="rounded-2xl bg-brand-ink p-5 text-white shadow-lg shadow-brand-ink/10">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-primary">Método utilizado</p>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">{paymentData?.card?.brand || 'Tarjeta'}</span>
                                    </div>
                                    <p className="mt-5 font-mono text-sm tracking-[0.18em] text-white/90">{paymentData?.card?.card_number || '**** **** **** ****'}</p>
                                </div>
                            )}

                            <div className="flex items-start gap-3 px-1 text-brand-muted">
                                <svg className="mt-0.5 h-4 w-4 shrink-0 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3 5 6v5c0 4.5 2.9 8.5 7 10 4.1-1.5 7-5.5 7-10V6l-7-3Z" /></svg>
                                <p className="text-[10px] leading-4">Procesado de forma segura por OpenPay México. No almacenamos los datos de tu tarjeta.</p>
                            </div>

                            <button type="button" onClick={close} className="w-full rounded-2xl bg-brand-primary px-5 py-4 text-sm font-black text-white shadow-lg shadow-brand-primary/15 transition duration-300 hover:-translate-y-0.5 hover:bg-brand-primary-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 focus:ring-offset-brand-surface active:translate-y-0">
                                {isCompleted ? 'Continuar explorando' : 'Entendido'}
                            </button>
                        </div>
                    </>
                ) : (
                    <div role="alert" aria-live="assertive" className="bg-brand-accent/5 p-8 text-center sm:p-10">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-accent/10 text-brand-accent">
                            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v4m0 4h.01M10.3 3.8 2.7 17a2 2 0 0 0 1.7 3h15.2a2 2 0 0 0 1.7-3L13.7 3.8a2 2 0 0 0-3.4 0Z" /></svg>
                        </div>
                        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.2em] text-brand-accent">No pudimos confirmarlo</p>
                        <h3 className="mt-3 text-2xl font-black tracking-tight text-brand-ink">Necesitamos revisar este pago.</h3>
                        <p className="mt-3 text-sm leading-6 text-brand-muted">{error || 'No vuelvas a pagar todavía. Contacta a nuestro equipo para revisar tu caso.'}</p>
                        <button type="button" onClick={close} className="mt-7 w-full rounded-2xl bg-brand-accent px-5 py-4 text-sm font-black text-white transition hover:bg-brand-accent/90 focus:outline-none focus:ring-2 focus:ring-brand-accent focus:ring-offset-2">Cerrar ventana</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentStatusModal;
