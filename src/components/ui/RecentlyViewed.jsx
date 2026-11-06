import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, Bed, Map, ArrowUpRight, ImageOff, X } from 'lucide-react';

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

    // ANIMACIÓN SUTIL: solo entran las tarjetas, sin desplazar el encabezado
    useGSAP(() => {
        if (recentItems.length > 0) {
            gsap.fromTo(".reveal-card",
                { y: 14, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: "power2.out" }
            );
        }
    }, { dependencies: [recentItems], scope: containerRef });

    const handleClearHistory = () => {
        localStorage.removeItem('tdmx_recently_viewed');
        setRecentItems([]);
    };

    if (!isMounted || recentItems.length === 0) {
        return null;
    }

    return (
        <section ref={containerRef} className="w-full border-t border-slate-200 py-6 font-sans md:py-8" aria-labelledby="recently-viewed-heading">
            <div className="container mx-auto px-4 md:px-6">

                {/* ENCABEZADO EN UNA SOLA LÍNEA */}
                <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-baseline gap-3">
                        <h2 id="recently-viewed-heading" className="truncate text-base font-black tracking-tight text-slate-800 md:text-lg">
                            Vistos recientemente
                        </h2>
                        <span className="hidden text-[10px] font-bold uppercase tracking-widest text-slate-400 sm:inline">
                            {recentItems.length} {recentItems.length === 1 ? 'opción' : 'opciones'}
                        </span>
                    </div>

                    <button
                        type="button"
                        onClick={handleClearHistory}
                        className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                    >
                        <X size={12} aria-hidden="true" />
                        Limpiar
                    </button>
                </div>

                {/* FILA COMPACTA: deslizable en móvil, cuadrícula en escritorio */}
                <ul className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4">
                    {recentItems.map((item, index) => (
                        <li key={`${item.url}-${index}`} className="reveal-card min-w-[15.5rem] snap-start md:min-w-0">
                            <a
                                href={item.url}
                                className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 pr-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                            >
                                <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                                    {item.image ? (
                                        <img
                                            src={item.image}
                                            alt=""
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="flex h-full w-full items-center justify-center text-slate-300">
                                            <ImageOff size={18} aria-hidden="true" />
                                        </span>
                                    )}
                                </span>

                                <span className="min-w-0 flex-1">
                                    <span className="mb-0.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {item.type === 'hotel'
                                            ? <Bed size={10} className="text-indigo-500" aria-hidden="true" />
                                            : <Map size={10} className="text-emerald-500" aria-hidden="true" />}
                                        {item.type}
                                    </span>
                                    <span className="block truncate text-sm font-bold leading-tight text-slate-900 group-hover:text-indigo-600">
                                        {item.title}
                                    </span>
                                    {item.location && (
                                        <span className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-slate-500">
                                            <MapPin size={10} className="shrink-0" aria-hidden="true" />
                                            <span className="truncate">{item.location}</span>
                                        </span>
                                    )}
                                </span>

                                <ArrowUpRight size={14} className="shrink-0 text-slate-300 transition group-hover:text-indigo-600" aria-hidden="true" />
                            </a>
                        </li>
                    ))}
                </ul>

            </div>
        </section>
    );
}
