import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { MapPin, Bed, Map as MapIcon, ArrowUpRight, X } from 'lucide-react';

const STORAGE_KEY = 'tdmx_recently_viewed';
const MAX_ITEMS = 4;
const ROUTE_PATTERN = /^\/(hotel|tour)\/([^/?#]+)$/;

// Solo guardamos tipo, título y ruta. Las imágenes se piden al servidor en cada visita.
function readStored() {
    try {
        const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        if (!Array.isArray(parsed)) return [];
        return parsed
            .filter((entry) => entry && typeof entry.url === 'string' && ROUTE_PATTERN.test(entry.url))
            .slice(0, MAX_ITEMS)
            .map((entry) => ({
                type: entry.type === 'tour' ? 'tour' : 'hotel',
                url: entry.url,
                title: typeof entry.title === 'string' ? entry.title : '',
            }));
    } catch (error) {
        console.error('Error al leer los vistos recientemente', error);
        return [];
    }
}

function writeStored(items) {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items.map(({ type, url, title }) => ({ type, url, title })))
        );
    } catch (error) {
        console.error('Error al guardar los vistos recientemente', error);
    }
}

export default function RecentlyViewed() {
    const [recentItems, setRecentItems] = useState([]);
    const [brokenImages, setBrokenImages] = useState(() => new Set());
    const containerRef = useRef(null);

    useEffect(() => {
        const stored = readStored();
        if (stored.length === 0) return undefined;

        setRecentItems(stored);

        // Datos y imágenes vigentes desde el servidor. Si la petición falla, se muestra lo guardado.
        const controller = new AbortController();
        const items = stored
            .map(({ url }) => {
                const match = ROUTE_PATTERN.exec(url);
                return match ? `${match[1]}:${match[2]}` : null;
            })
            .filter(Boolean)
            .join(',');

        fetch(`/api/recientes?items=${encodeURIComponent(items)}`, {
            signal: controller.signal,
            headers: { Accept: 'application/json' },
        })
            .then((response) => (response.ok ? response.json() : null))
            .then((data) => {
                if (!data || !Array.isArray(data.items)) return;

                const byUrl = new Map(data.items.map((item) => [item.url, item]));
                const next = stored
                    .filter((entry) => byUrl.get(entry.url)?.status !== 'not-found')
                    .map((entry) => {
                        const fresh = byUrl.get(entry.url);
                        return fresh?.status === 'ok'
                            ? { ...entry, title: fresh.title || entry.title, location: fresh.location, image: fresh.image }
                            : entry;
                    });

                writeStored(next);
                setRecentItems(next);
            })
            .catch((error) => {
                if (error.name !== 'AbortError') console.error('No se pudieron cargar los vistos recientemente', error);
            });

        return () => controller.abort();
    }, []);

    // ANIMACIÓN SUTIL: solo entran las tarjetas, sin desplazar el encabezado
    useGSAP(() => {
        if (recentItems.length > 0) {
            gsap.fromTo(".reveal-card",
                { y: 14, opacity: 0 },
                { y: 0, opacity: 1, stagger: 0.06, duration: 0.45, ease: "power2.out" }
            );
        }
    }, { dependencies: [recentItems.length], scope: containerRef });

    const handleClearHistory = () => {
        localStorage.removeItem(STORAGE_KEY);
        setRecentItems([]);
    };

    const markImageBroken = (url) => {
        setBrokenImages((previous) => new Set(previous).add(url));
    };

    if (recentItems.length === 0) {
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
                    {recentItems.map((item, index) => {
                        const showImage = Boolean(item.image) && !brokenImages.has(item.image);
                        return (
                            <li key={`${item.url}-${index}`} className="reveal-card min-w-[15.5rem] snap-start md:min-w-0">
                                <a
                                    href={item.url}
                                    className="group flex h-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-2.5 pr-3 transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                >
                                    <span
                                        className={`relative flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl ${item.type === 'hotel' ? 'bg-indigo-50' : 'bg-emerald-50'}`}
                                    >
                                        {showImage ? (
                                            <img
                                                src={item.image}
                                                alt=""
                                                loading="lazy"
                                                decoding="async"
                                                onError={() => markImageBroken(item.image)}
                                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                        ) : item.type === 'hotel' ? (
                                            <Bed size={20} className="text-indigo-400" aria-hidden="true" />
                                        ) : (
                                            <MapIcon size={20} className="text-emerald-500" aria-hidden="true" />
                                        )}
                                    </span>

                                    <span className="min-w-0 flex-1">
                                        <span className="mb-0.5 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-slate-400">
                                            {item.type}
                                        </span>
                                        <span className="block truncate text-sm font-bold leading-tight text-slate-900 group-hover:text-indigo-600">
                                            {item.title || 'Ver detalles'}
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
                        );
                    })}
                </ul>

            </div>
        </section>
    );
}
