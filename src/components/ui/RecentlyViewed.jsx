import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, Bed, Map, ArrowUpRight } from 'lucide-react';

export default function RecentlyViewed() {
    const [recentItems, setRecentItems] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        setIsMounted(true);
        const storedItems = localStorage.getItem('tdmx_recently_viewed');

        if (storedItems) {
            try {
                setRecentItems(JSON.parse(storedItems));
            } catch (error) {
                console.error("Error al leer los vistos recientemente", error);
            }
        }
    }, []);

    // ANIMACIONES GSAP SUTILES
    useGSAP(() => {
        if (recentItems.length > 0) {
            const tl = gsap.timeline();

            gsap.set(".reveal-el", { y: 20, opacity: 0 });
            gsap.set(".reveal-card", { y: 30, opacity: 0 });

            tl.to(".reveal-el", {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.6,
                ease: "power2.out"
            });

            tl.to(".reveal-card", {
                y: 0,
                opacity: 1,
                stagger: 0.1,
                duration: 0.6,
                ease: "power2.out"
            }, "-=0.3");
        }
    }, { dependencies: [recentItems], scope: containerRef });

    if (!isMounted || recentItems.length === 0) {
        return null;
    }

    return (
        // Redujimos el padding de py-20 a py-12 para que ocupe menos espacio
        <section ref={containerRef} className="w-full py-12 bg-slate-50 font-sans border-t border-slate-200">
            <div className="container mx-auto px-4 md:px-6">

                {/* ENCABEZADO COMPACTO */}
                <div className="mb-8">
                    <div className="overflow-hidden mb-1">
                        <span className="reveal-el block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Tu Historial
                        </span>
                    </div>
                    <div className="overflow-hidden flex items-end justify-between gap-4">
                        <h2 className="reveal-el text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
                            Vistos recientemente
                        </h2>
                        {/* Enlace sutil opcional */}
                        <span className="reveal-el hidden sm:block text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer">
                            Limpiar historial
                        </span>
                    </div>
                </div>

                {/* GRID DE TARJETAS ESTILO BOOKING (Más pequeñas) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {recentItems.map((item, index) => (
                        <a
                            key={index}
                            href={item.url}
                            className="reveal-card group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:-translate-y-1 h-full"
                        >
                            {/* IMAGEN SUPERIOR (Aspect ratio 4:3 para control de tamaño) */}
                            <div className="relative w-full aspect-[4/3] overflow-hidden bg-slate-100">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />

                                {/* Insignia del tipo flotante */}
                                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                    {item.type === 'hotel' ? (
                                        <Bed size={12} className="text-indigo-600" />
                                    ) : (
                                        <Map size={12} className="text-emerald-600" />
                                    )}
                                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-700">
                                        {item.type}
                                    </span>
                                </div>
                            </div>

                            {/* CONTENIDO INFERIOR */}
                            <div className="flex flex-col flex-1 p-4 md:p-5">

                                {/* Ubicación */}
                                <div className="flex items-center gap-1 mb-1.5 text-slate-400">
                                    <MapPin size={12} className="shrink-0" />
                                    <span className="text-[10px] font-bold uppercase tracking-widest truncate">
                                        {item.location}
                                    </span>
                                </div>

                                {/* Título (Más pequeño y con límite de 2 líneas) */}
                                <h3 className="text-sm md:text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-4">
                                    {item.title}
                                </h3>

                                {/* Pie interactivo */}
                                <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-indigo-600 transition-colors">
                                        Ver detalles
                                    </span>
                                    <ArrowUpRight size={16} className="text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                </div>

                            </div>
                        </a>
                    ))}
                </div>

            </div>
        </section>
    );
}