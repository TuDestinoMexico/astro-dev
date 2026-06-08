import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Zap, Trophy } from 'lucide-react';

const DEFAULT_BALL_COUNT = 40;

const MATCH_DATA = {
    title: "Partido Inaugural - Copa del Mundo 2026",
    local: { name: "México", flag: "https://flagcdn.com/w160/mx.png" },
    visitante: { name: "Sudáfrica", flag: "https://flagcdn.com/w160/za.png" },
    // Jueves 11 de Junio, 2026
    targetDate: "2026-06-11T18:00:00-05:00"
};

export default function WorldCupCelebration({ ballCount = DEFAULT_BALL_COUNT }) {
    const containerRef = useRef(null);
    const matchCardRef = useRef(null);
    const [isVisible, setIsVisible] = useState(true);
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

    const ballAssetUrl = "https://mexicofanshop.com/cdn/shop/files/JD8031_1_HARDWARE_Photography_Front-Center-View_transparent.png?v=1759434220&width=200";

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = +new Date(MATCH_DATA.targetDate) - +new Date();
            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            } else {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(timer);
    }, []);

    useGSAP(() => {
        const balls = containerRef.current.querySelectorAll('.celebration-ball');

        const tl = gsap.timeline({
            onComplete: () => {
                setIsVisible(false);
            }
        });

        gsap.set(matchCardRef.current, { opacity: 0, scale: 0.8, y: 50 });

        tl.fromTo(containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out' }
        );

        tl.to(balls, {
            y: '120vh',
            x: () => `${gsap.utils.random(-25, 25)}vw`,
            rotation: () => gsap.utils.random(360, 1080),
            opacity: 1,
            duration: () => gsap.utils.random(2, 3.5),
            ease: 'power1.in',
            stagger: {
                amount: 2.5,
                from: "random"
            },
        }, "-=0.2");

        tl.to(matchCardRef.current, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.8,
            ease: 'back.out(1.7)',
        }, "-=1");

        tl.to({}, { duration: 5.5 }); // Tiempo para lectura en pantalla

        tl.to(matchCardRef.current, {
            opacity: 0,
            scale: 1.1,
            y: -30,
            duration: 0.6,
            ease: 'power2.in'
        });

        tl.to(containerRef.current, {
            opacity: 0,
            duration: 0.8,
            ease: 'power2.in',
        }, "-=0.2");

    }, { scope: containerRef });

    if (!isVisible) return null;

    const renderTimeBox = (value, label) => (
        <div className="flex flex-col items-center">
            <div className="bg-slate-950 text-white w-14 h-16 rounded-lg flex items-center justify-center border border-slate-700 shadow-inner relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-500 to-transparent opacity-50"></div>
                <span className="text-3xl font-black font-mono tracking-tight tabular-nums">
                    {String(value).padStart(2, '0')}
                </span>
            </div>
            <span className="text-[9px] uppercase font-bold text-slate-400 mt-1 tracking-widest">{label}</span>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 w-screen h-screen bg-slate-950/40 backdrop-blur-md z-[10000] pointer-events-none overflow-hidden flex items-center justify-center p-6"
        >
            {/* Lluvia de Balones */}
            {[...Array(ballCount)].map((_, i) => (
                <img
                    key={i}
                    src={ballAssetUrl}
                    alt="Balón de Fútbol Mundial"
                    className="celebration-ball absolute -top-24 opacity-0 w-16 h-16 md:w-20 md:h-20 z-[10001] object-contain select-none will-change-transform"
                    style={{ left: `${Math.random() * 100}vw` }}
                />
            ))}

            {/* Tarjeta del Partido / Lanzamiento de Promos */}
            <div
                ref={matchCardRef}
                className="relative z-[10010] bg-white rounded-[2.5rem] shadow-2xl border-4 border-white p-6 md:p-8 w-full max-w-xl flex flex-col items-center pointer-events-auto font-sans"
            >
                {/* Badge Superior */}
                <div className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full mb-6 shadow-md flex items-center gap-1.5">
                    <Trophy size={12} />
                    {MATCH_DATA.title}
                </div>

                {/* Marcador / Versus */}
                <div className="flex items-center gap-4 md:gap-8 mb-6 w-full justify-center">
                    <div className="flex flex-col items-center flex-1 text-center">
                        <img src={MATCH_DATA.local.flag} alt={MATCH_DATA.local.name} className="w-14 h-10 md:w-16 md:h-12 object-cover rounded-lg shadow-md mb-2 border border-slate-100" />
                        <span className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter">{MATCH_DATA.local.name}</span>
                    </div>

                    <div className="text-3xl md:text-4xl font-black text-slate-300 uppercase tracking-tighter select-none">VS</div>

                    <div className="flex flex-col items-center flex-1 text-center">
                        <img src={MATCH_DATA.visitante.flag} alt={MATCH_DATA.visitante.name} className="w-14 h-10 md:w-16 md:h-12 object-cover rounded-lg shadow-md mb-2 border border-slate-100" />
                        <span className="text-lg md:text-xl font-black text-slate-900 uppercase tracking-tighter">{MATCH_DATA.visitante.name}</span>
                    </div>
                </div>

                {/* LEYENDA PRINCIPAL SOLICITADA */}
                <div className="w-full text-center bg-indigo-50 border border-indigo-100/70 p-3.5 rounded-xl mb-6">
                    <p className="text-xs md:text-sm font-black text-indigo-700 uppercase tracking-wider leading-snug">
                        🚀 A partir de esta fecha inician las ofertas mundialistas
                    </p>
                </div>

                {/* Bloque del Reloj Estilo Temu */}
                <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl w-full flex flex-col items-center shadow-inner">
                    <div className="flex items-center gap-1.5 mb-3 text-orange-600">
                        <Zap className="w-4 h-4 fill-current animate-pulse" />
                        <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">
                            El cronómetro de viaje inició:
                        </p>
                    </div>

                    <div className="flex items-center gap-2 md:gap-3">
                        {renderTimeBox(timeLeft.days, "Días")}
                        <span className="text-3xl font-black text-slate-300 -mt-5">:</span>
                        {renderTimeBox(timeLeft.hours, "Horas")}
                        <span className="text-3xl font-black text-slate-300 -mt-5">:</span>
                        {renderTimeBox(timeLeft.minutes, "Min")}
                        <span className="text-3xl font-black text-slate-300 -mt-5">:</span>
                        {renderTimeBox(timeLeft.seconds, "Seg")}
                    </div>
                </div>
            </div>
        </div>
    );
}