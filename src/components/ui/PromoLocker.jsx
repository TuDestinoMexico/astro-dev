import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function PromoLocker({ children }) {
    const [isRevealed, setIsRevealed] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ dias: '00', horas: '00', min: '00', seg: '00' });
    const [isMounted, setIsMounted] = useState(false);

    // Fecha en la que se desbloquean las ofertas
    const TARGET_DATE = "2026-05-25T00:00:00";

    useEffect(() => {
        setIsMounted(true);

        const calculateTime = () => {
            const target = new Date(TARGET_DATE).getTime();
            const now = new Date().getTime();
            const diff = target - now;

            if (diff <= 0) {
                // Si la fecha ya pasó, quitamos el bloqueo
                setIsRevealed(true);
            } else {
                // Si falta tiempo, calculamos y mantenemos el bloqueo
                setIsRevealed(false);
                setTimeLeft({
                    dias: String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                    horas: String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
                    min: String(Math.floor((diff / 1000 / 60) % 60)).padStart(2, '0'),
                    seg: String(Math.floor((diff / 1000) % 60)).padStart(2, '0')
                });
            }
        };

        calculateTime();
        const timer = setInterval(calculateTime, 1000);

        return () => clearInterval(timer);
    }, []);

    // Evita parpadeos en el Server-Side Rendering de Astro
    if (!isMounted) return null;

    return (
        <div className="relative w-full rounded-2xl overflow-hidden">

            {/* CONTENIDO (Tus Banners) */}
            <div className={`transition-all duration-1000 ${!isRevealed ? 'blur-md brightness-50 pointer-events-none select-none' : 'blur-0 brightness-100'}`}>
                {children}
            </div>

            {/* OVERLAY DE BLOQUEO (Solo se muestra si NO se ha revelado) */}
            {!isRevealed && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-4">

                    {/* Caja Flotante Estilo Cristal */}
                    <div className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-[2rem] shadow-2xl flex flex-col items-center max-w-md w-full border border-white/50 transform transition-transform hover:scale-105">

                        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
                            <Lock className="text-white w-8 h-8" />
                        </div>

                        <h3 className="text-xl md:text-2xl font-black text-slate-900 mb-2 uppercase tracking-tight text-center">
                            Ofertas Bloqueadas
                        </h3>
                        <p className="text-slate-500 text-sm font-medium mb-6 text-center leading-snug">
                            Estas promociones relámpago del Hot Sale se revelarán en:
                        </p>

                        {/* Contador Compacto y Moderno */}
                        <div className="flex items-center justify-center gap-2 md:gap-3 w-full">
                            <div className="flex flex-col items-center w-14">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 text-slate-800 font-black text-xl md:text-2xl flex items-center justify-center rounded-xl shadow-inner border border-slate-200">
                                    {timeLeft.dias}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Días</span>
                            </div>
                            <span className="text-slate-300 font-black text-xl -translate-y-3">:</span>

                            <div className="flex flex-col items-center w-14">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 text-slate-800 font-black text-xl md:text-2xl flex items-center justify-center rounded-xl shadow-inner border border-slate-200">
                                    {timeLeft.horas}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Hrs</span>
                            </div>
                            <span className="text-slate-300 font-black text-xl -translate-y-3">:</span>

                            <div className="flex flex-col items-center w-14">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-100 text-slate-800 font-black text-xl md:text-2xl flex items-center justify-center rounded-xl shadow-inner border border-slate-200">
                                    {timeLeft.min}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Min</span>
                            </div>
                            <span className="text-slate-300 font-black text-xl -translate-y-3">:</span>

                            <div className="flex flex-col items-center w-14">
                                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-orange-500 to-red-600 text-white font-black text-xl md:text-2xl flex items-center justify-center rounded-xl shadow-md border border-red-500/20">
                                    {timeLeft.seg}
                                </div>
                                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-1.5">Seg</span>
                            </div>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}