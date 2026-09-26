import React, { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import TimelineItem from './TimelineItem';
import MexicoMap from './MexicoMap';
import RouteSummary from './RouteSummary';
import TimelineNavigation from './TimelineNavigation';

export interface Milestone {
    id: number;
    date: string;
    shortTitle: string;
    fullTitle: string;
    description: string;
    image: string;
    coords: { lat: number; lng: number };
}

const milestones: Milestone[] = [
    { id: 0, date: 'Marzo 20, 2024', shortTitle: 'XOLO RUTA MONTERREY', fullTitle: 'Lanzamiento y Conexión en la Sultana', description: 'Iniciamos nuestra presencia en las ferias turísticas más importantes del norte, compartiendo nuestra pasión por los viajes y conectando con la comunidad regia para llevar la magia de México a cada rincón.', image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-monterrey-2024.png', coords: { lat: 25.6866, lng: -100.3161 } },
    { id: 1, date: 'Octubre 2, 2025', shortTitle: 'XOLO RUTA MERIDA', fullTitle: 'Mérida: El Corazón del Mundo Maya', description: 'Nuestra agencia llega a la Blanca Mérida para participar en foros de turismo cultural, fortaleciendo alianzas con proveedores locales para ofrecerte experiencias exclusivas en el sureste mexicano.', image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-merida-2025.png', coords: { lat: 20.9674, lng: -89.5926 } },
    { id: 2, date: 'Diciembre 15, 2025', shortTitle: 'XOLO RUTA MONTERREY', fullTitle: 'Cumbre de Viajes: Edición Invierno', description: 'Cerramos el ciclo de exposiciones del año en Monterrey, presentando nuestros paquetes premium de temporada y asesorando a viajeros que buscan vivir experiencias inolvidables en sus próximas vacaciones.', image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-monterrey-2025.png', coords: { lat: 25.6714, lng: -100.3067 } },
    { id: 3, date: 'Enero 15, 2026', shortTitle: 'XOLO RUTA MONTERREY', fullTitle: 'Kick-off 2026: Nuevos Horizontes', description: 'Arrancamos el año en el centro de convenciones más importante de Nuevo León, lanzando oficialmente nuestro catálogo 2026 con destinos emergentes y rutas diseñadas para el viajero moderno.', image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-monterrey-2026.png', coords: { lat: 25.7, lng: -100.35 } },
    { id: 4, date: 'Marzo 21, 2026', shortTitle: 'XOLO RUTA CHIHUAHUA', fullTitle: 'Chihuahua: Aventura y Negocios Turísticos', description: 'Exploramos el estado más grande de México participando en foros de turismo de aventura, listos para posicionar la ruta de las Barrancas del Cobre como el destino imperdible de nuestra nueva temporada.', image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/web/xolo-ruta/xolo-ruta-chihuahua-2026.png', coords: { lat: 28.633, lng: -106.0691 } },
];

export default function TimelineWithMap() {
    const [activeIndex, setActiveIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: containerRef });
    const active = milestones[activeIndex];

    const changeTab = contextSafe((index: number) => {
        if (index === activeIndex || !milestones[index]) return;

        gsap.to(contentRef.current, {
            opacity: 0,
            y: 12,
            duration: 0.18,
            ease: 'power2.in',
            onComplete: () => {
                setActiveIndex(index);
                gsap.fromTo(contentRef.current, { opacity: 0, y: -12 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
            },
        });
    });

    const period = `${milestones[0].date.slice(-4)}–${milestones[milestones.length - 1].date.slice(-4)}`;

    return (
        <div ref={containerRef} className="space-y-6 py-8 md:py-12">
            <RouteSummary count={milestones.length} period={period} />

            <section aria-label="Hito seleccionado" className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-stretch">
                <div ref={contentRef} className="order-1 min-w-0">
                    <TimelineItem
                        item={active}
                        index={activeIndex}
                        total={milestones.length}
                        onPrevious={() => changeTab(Math.max(0, activeIndex - 1))}
                        onNext={() => changeTab(Math.min(milestones.length - 1, activeIndex + 1))}
                    />
                </div>
                <div className="order-2 min-w-0 lg:sticky lg:top-28 lg:self-start">
                    <MexicoMap activeIndex={activeIndex} onMarkerClick={changeTab} milestones={milestones} />
                </div>
            </section>

            <section aria-label="Explorar cronología" className="space-y-3">
                <div className="flex items-end justify-between gap-4 px-1">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-primary">La cronología</p>
                        <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Cada parada cuenta una historia</h2>
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-slate-400">{activeIndex + 1} de {milestones.length}</span>
                </div>
                <TimelineNavigation milestones={milestones} activeIndex={activeIndex} onSelect={changeTab} />
            </section>

            <div className="sr-only" aria-live="polite">Mostrando {active.shortTitle}, {active.date}.</div>
        </div>
    );
}
