import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import TimelineItem from './TimelineItem';
import MexicoMap from './MexicoMap'; // Importamos el componente del mapa

interface Milestone {
    id: number;
    date: string;
    shortTitle: string;
    fullTitle: string;
    description: string;
    image: string;
    coords: { x: string; y: string };
}

const milestones: Milestone[] = [
    {
        id: 0,
        date: "Marzo 20, 2024",
        shortTitle: "XOLO RUTA MONTERREY",
        fullTitle: "Inicio de la Aventura",
        description: "Recorrido por las rutas emblemáticas de Monterrey, la ciudad de las montañas.",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-monterrey-2024.png",
        coords: { lat: 25.6866, lng: -100.3161 } // Monterrey Real
    },
    {
        id: 1,
        date: "Octubre 2, 2025",
        shortTitle: "XOLO RUTA MERIDA",
        fullTitle: "Cierre de Inscripciones",
        description: "Explorando la blanca Mérida y sus alrededores mayas.",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-merida-2025.png",
        coords: { lat: 20.9674, lng: -89.5926 } // Mérida Real
    },
    {
        id: 2,
        date: "Diciembre 15, 2025",
        shortTitle: "XOLO RUTA MONTERREY",
        fullTitle: "Ruta Final TDMX",
        description: "Regreso a la capital regia para el evento de cierre.",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-monterrey-2025.png",
        coords: { lat: 25.6714, lng: -100.3067 }
    },
    {
        id: 3,
        date: "Enero 15, 2026",
        shortTitle: "XOLO RUTA MONTERREY",
        fullTitle: "Especial de Invierno",
        description: "Ruta de invierno por los parajes de Nuevo León.",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-monterrey-2026.png",
        coords: { lat: 25.7000, lng: -100.3500 }
    },
    {
        id: 4,
        date: "MARZO 21, 2026",
        shortTitle: "XOLO RUTA CHIHUAHUA",
        fullTitle: "Desierto y Aventura",
        description: "Atravesando las majestuosas tierras de Chihuahua.",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-chihuahua-2026.png",
        coords: { lat: 28.6330, lng: -106.0691 } // Chihuahua Real
    }
];

export default function TimelineWithMap() {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const lineRef = useRef<HTMLDivElement>(null);
    const navRef = useRef<HTMLDivElement>(null);
    const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

    const { contextSafe } = useGSAP({ scope: containerRef });

    // Actualiza la línea elástica y el scroll del menú
    const updateNavigation = contextSafe((index: number) => {
        const targetBtn = buttonRefs.current[index];
        const line = lineRef.current;

        if (targetBtn && line) {
            gsap.to(line, {
                x: targetBtn.offsetLeft,
                width: targetBtn.offsetWidth,
                duration: 0.7,
                ease: "elastic.out(1, 0.8)"
            });

            if (navRef.current) {
                const containerWidth = navRef.current.offsetWidth;
                const scrollTarget = targetBtn.offsetLeft - (containerWidth / 2) + (targetBtn.offsetWidth / 2);
                navRef.current.scrollTo({ left: scrollTarget, behavior: 'smooth' });
            }
        }
    });

    const changeTab = (index: number) => {
        if (index === activeIndex) return;

        updateNavigation(index);

        // Animación de salida y entrada del contenido
        gsap.to(contentRef.current, {
            opacity: 0,
            y: 20,
            filter: "blur(10px)",
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                setActiveIndex(index);
                gsap.fromTo(contentRef.current,
                    { opacity: 0, y: -20, filter: "blur(10px)", scale: 0.95 },
                    { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, duration: 0.6, ease: "back.out(1.2)" }
                );
            }
        });
    };

    // Sincronizar posición inicial de la línea
    useEffect(() => {
        const initialBtn = buttonRefs.current[0];
        if (initialBtn && lineRef.current) {
            gsap.set(lineRef.current, { x: initialBtn.offsetLeft, width: initialBtn.offsetWidth });
        }
    }, []);

    return (
        <div ref={containerRef} className="space-y-4 py-10">

            {/* 1. MAPA INTERACTIVO (Llamada al componente hijo) */}
            <MexicoMap
                activeIndex={activeIndex}
                onMarkerClick={changeTab}
                milestones={milestones}
            />

            {/* 2. TIMELINE PADRE (Contenedor blanco) */}
            <div className="w-full container mx-auto bg-white rounded-4xl md:rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-50">

                {/* Menú de fechas scrollable */}
                <div className="relative bg-slate-50/50 pt-6 md:pt-10">
                    <div ref={navRef} className="flex flex-row overflow-x-auto no-scrollbar relative z-10 px-4 md:px-12 scroll-smooth">
                        {milestones.map((item, idx) => (
                            <button
                                key={item.id}
                                ref={(el) => (buttonRefs.current[idx] = el)}
                                onClick={() => changeTab(idx)}
                                className={`shrink-0 w-37.5 md:flex-1 py-6 md:py-8 transition-all duration-500 group ${idx === activeIndex ? 'scale-105' : 'opacity-40 hover:opacity-100'}`}
                            >
                                <p className={`text-xs md:text-lg font-black mb-1 transition-colors ${idx === activeIndex ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {item.date}
                                </p>
                                <p className="text-[8px] md:text-[10px] font-bold tracking-widest md:tracking-[0.2em] uppercase text-slate-500">
                                    {item.shortTitle}
                                </p>
                            </button>
                        ))}

                        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200/20 rounded-full">
                            <div ref={lineRef} className="absolute bottom-0 h-full bg-indigo-600 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]" style={{ width: 0 }}></div>
                        </div>
                    </div>
                </div>

                {/* Área de visualización del TimelineItem */}
                <div className="p-6 md:p-16 lg:p-24 relative">
                    <div ref={contentRef}>
                        <TimelineItem
                            title={milestones[activeIndex].fullTitle}
                            description={milestones[activeIndex].description}
                            image={milestones[activeIndex].image}
                            onButtonClick={() => window.open('/ruta-detalle', '_blank')}
                        />
                    </div>

                    {/* Controles de Flecha */}
                    <div className="flex gap-4 mt-12 lg:mt-0 lg:absolute lg:left-24 lg:bottom-16 justify-center md:justify-start">
                        <button
                            onClick={() => changeTab(Math.max(0, activeIndex - 1))}
                            disabled={activeIndex === 0}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white disabled:opacity-20 transition-all shadow-sm"
                        > ← </button>
                        <button
                            onClick={() => changeTab(Math.min(milestones.length - 1, activeIndex + 1))}
                            disabled={activeIndex === milestones.length - 1}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-slate-100 flex items-center justify-center hover:bg-indigo-600 hover:text-white disabled:opacity-20 transition-all shadow-sm"
                        > → </button>
                    </div>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}