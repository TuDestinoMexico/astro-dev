import React, { useState, useEffect } from 'react';
import { Flame, MessageCircle } from 'lucide-react';

export default function HotSalePromoRibbon() {
    const [isHotSaleActive, setIsHotSaleActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState({ dias: '00', horas: '00', min: '00' });
    const [isMounted, setIsMounted] = useState(false);

    // 1. CONFIGURACIÓN DEL CASO DE USO
    const START_DATE = "2026-05-25T00:00:00"; // Fecha oficial de inicio del Hot Sale 2026
    const WHATSAPP_NUMBER = "529987141365"; // <-- Reemplaza con el número de tu agencia (código de país al inicio)
    const WHATSAPP_MESSAGE = "¡Hola! Vi la promoción del Hot Sale en su página y me interesa cotizar un hotel o tour para mis próximas vacaciones.";

    useEffect(() => {
        setIsMounted(true);

        const checkPromoStatus = () => {
            const now = new Date();
            const target = new Date(START_DATE);
            const difference = +target - +now;

            if (difference <= 0) {
                // Si la fecha actual ya es 25 de mayo o posterior, activamos el Hot Sale
                setIsHotSaleActive(true);
            } else {
                // Si aún falta tiempo, calculamos los valores del contador
                setIsHotSaleActive(false);
                setTimeLeft({
                    dias: String(Math.floor(difference / (1000 * 60 * 60 * 24))).padStart(2, '0'),
                    horas: String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0'),
                    min: String(Math.floor((difference / 1000 / 60) % 60)).padStart(2, '0')
                });
            }
        };

        // Ejecutar inmediatamente y luego revisar cada segundo
        checkPromoStatus();
        const interval = setInterval(checkPromoStatus, 1000);

        return () => clearInterval(interval);
    }, []);

    // Función para procesar y abrir el enlace de WhatsApp
    const handleWhatsAppClick = () => {
        const encodedText = encodeURIComponent(WHATSAPP_MESSAGE);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`, '_blank');
    };

    // Evita problemas de Hydration en Astro (Server-Side Rendering)
    if (!isMounted) return null;

    return (
        <div className="w-full bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white overflow-hidden relative border-b border-orange-500 shadow-md">

            {/* Efecto visual de fondo sutil */}
            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:20px_20px] pointer-events-none"></div>

            <div className="container mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-3 text-xs md:text-sm relative z-10">

                {/* LADO IZQUIERDO: Icono de fuego y Texto de la campaña */}
                <div className="flex items-center gap-2 text-center sm:text-left">
                    <Flame size={18} className="text-yellow-300 animate-pulse shrink-0" />
                    <p className="font-medium text-slate-50">
                        <span className="font-black text-yellow-300 mr-2 uppercase tracking-wider">HOT SALE 2026 🔥</span>
                        {isHotSaleActive
                            ? "¡Las ofertas ya están aquí! Descuentos ardientes en los mejores Hoteles y Tours de México."
                            : "¡Prepárate! El evento de descuentos más grande del año está por comenzar en Hoteles y Tours."
                        }
                    </p>
                </div>

                {/* LADO DERECHO DINÁMICO (Contador VS Botón de WhatsApp) */}
                <div className="shrink-0">
                    {isHotSaleActive ? (

                        // --- ESTADO 1: BOTÓN DE WHATSAPP ACTIVO ---
                        <button
                            onClick={handleWhatsAppClick}
                            className="flex items-center gap-2 bg-white text-red-600 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-full shadow-lg hover:bg-yellow-300 hover:text-slate-900 active:scale-95 transition-all duration-300 animate-bounce"
                        >
                            <MessageCircle size={14} className="fill-current" />
                            Cotizar por WhatsApp
                        </button>

                    ) : (

                        // --- ESTADO 2: CONTADOR REGRESIVO (Se muestra antes del 25 de mayo) ---
                        <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                            <span className="hidden md:inline uppercase tracking-[0.2em] text-[9px] font-black text-orange-200">
                                Lanzamiento en:
                            </span>
                            <div className="flex items-center gap-1 font-mono font-bold text-sm md:text-base text-white">
                                <div className="flex items-center justify-center bg-white/10 rounded px-1.5 min-w-[28px]">{timeLeft.dias}d</div>
                                <span className="text-orange-300/40 -translate-y-0.5">:</span>
                                <div className="flex items-center justify-center bg-white/10 rounded px-1.5 min-w-[28px]">{timeLeft.horas}h</div>
                                <span className="text-orange-300/40 -translate-y-0.5">:</span>
                                <div className="flex items-center justify-center bg-white/10 rounded px-1.5 min-w-[28px] text-yellow-300">{timeLeft.min}m</div>
                            </div>
                        </div>

                    )}
                </div>

            </div>
        </div>
    );
}