import React, { useState, useEffect } from 'react';
import { Tag } from 'lucide-react';

export default function WorldCupPromoRibbon() {
    const [timeLeft, setTimeLeft] = useState({ dias: '00', horas: '00', min: '00', seg: '00' });
    const [isMounted, setIsMounted] = useState(false);

    // Fecha oficial del partido inaugural del Mundial 2026: México vs Sudáfrica
    const TARGET_DATE = "2026-06-11T18:00:00-05:00";

    useEffect(() => {
        setIsMounted(true);

        const calculateTimeLeft = () => {
            const difference = +new Date(TARGET_DATE) - +new Date();
            if (difference > 0) {
                return {
                    dias: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                    horas: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
                    min: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0'),
                    seg: String(Math.floor((difference / 1000) % 60)).padStart(2, '0')
                };
            }
            return { dias: '00', horas: '00', min: '00', seg: '00' };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

        return () => clearInterval(timer);
    }, []);

    // Evitamos problemas de renderizado en Astro hasta que el cliente cargue
    if (!isMounted) return null;

    // Si el contador llega a cero, podrías ocultar la cinta o mostrar un botón de "¡Ofertas Activas!"
    if (timeLeft.dias === '00' && timeLeft.horas === '00' && timeLeft.min === '00' && timeLeft.seg === '00') {
        return null;
    }

    return (
        <div className="w-full bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 text-white overflow-hidden relative border-b border-green-700 shadow-md">

            {/* Brillo de fondo para darle toque premium */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>

            <div className="container mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-xs md:text-sm relative z-10">

                {/* LADO IZQUIERDO: Banderas y Texto */}
                <div className="flex items-center gap-3 md:gap-4 font-medium">

                    {/* Banderas (México vs Sudáfrica) */}
                    <div className="flex items-center gap-1.5 shrink-0 bg-black/20 px-2.5 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-inner">
                        <img src="https://flagcdn.com/w40/mx.png" alt="México" className="w-5 h-3.5 rounded-[2px] object-cover" />
                        <span className="font-black text-white/80 text-[10px] mx-0.5">VS</span>
                        <img src="https://flagcdn.com/w40/za.png" alt="Sudáfrica" className="w-5 h-3.5 rounded-[2px] object-cover" />
                    </div>

                    {/* Textos Promocionales */}
                    <div className="flex items-center gap-2">
                        <Tag size={16} className="text-yellow-400 hidden lg:block" />
                        <p className="hidden lg:block text-slate-100">
                            <span className="font-black text-yellow-400 mr-1.5 uppercase tracking-wide">¡Goleada de Ofertas!</span>
                            En el partido inaugural liberaremos descuentos exclusivos en Hoteles y Tours.
                        </p>
                        {/* Texto corto para móviles/tablets */}
                        <p className="block lg:hidden text-center sm:text-left text-slate-100">
                            <span className="font-black text-yellow-400 mr-1">¡Ofertas Mundialistas!</span>
                            Hoteles y Tours.
                        </p>
                    </div>
                </div>

                {/* LADO DERECHO: Contador Animado */}
                <div className="flex items-center gap-2.5 shrink-0 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                    <span className="hidden md:inline uppercase tracking-[0.2em] text-[9px] font-black text-green-300">
                        Faltan:
                    </span>

                    <div className="flex items-center gap-1 font-mono font-bold text-sm md:text-base text-white">
                        <div className="flex items-center justify-center bg-white/10 rounded px-1.5 min-w-[28px]">{timeLeft.dias}</div>
                        <span className="text-green-400/50 -translate-y-0.5">:</span>
                        <div className="flex items-center justify-center bg-white/10 rounded px-1.5 min-w-[28px]">{timeLeft.horas}</div>
                        <span className="text-green-400/50 -translate-y-0.5">:</span>
                        <div className="flex items-center justify-center bg-white/10 rounded px-1.5 min-w-[28px]">{timeLeft.min}</div>
                        <span className="text-green-400/50 -translate-y-0.5">:</span>
                        <div className="flex items-center justify-center bg-white/10 rounded px-1.5 min-w-[28px] text-yellow-400">{timeLeft.seg}</div>
                    </div>
                </div>

            </div>
        </div>
    );
}