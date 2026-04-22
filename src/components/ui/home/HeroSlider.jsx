import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, ArrowUpRight } from 'lucide-react';

// Datos de ejemplo con imágenes aleatorias profesionales
const INITIAL_PROMOS = [
    {
        id: 1,
        badge: "Exclusivo",
        title: "LUJO EN EL CARIBE",
        subtitle: "Resorts de clase mundial con acceso privado a playas de agua cristalina.",
        image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=1600",
        price: "Desde $12,500 MXN",
        limitDate: "Temporada 2026",
        accentColor: "bg-indigo-600"
    },
    {
        id: 2,
        badge: "Aventura",
        title: "RUTAS DE MONTAÑA",
        subtitle: "Desconéctate de la ciudad y vive la experiencia del campismo premium.",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600",
        price: "Desde $5,800 MXN",
        limitDate: "Cupos Limitados",
        accentColor: "bg-emerald-600"
    },
    {
        id: 3,
        badge: "Cultura",
        title: "TESOROS COLONIALES",
        subtitle: "Un viaje a través del tiempo por las ciudades más emblemáticas de México.",
        image: "https://images.unsplash.com/photo-1518105779142-d975f22f1b0a?auto=format&fit=crop&q=80&w=1600",
        price: "2x1 en Experiencias",
        limitDate: "Solo este mes",
        accentColor: "bg-amber-500"
    }
];

export default function DynamicPromoSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev === INITIAL_PROMOS.length - 1 ? 0 : prev + 1));
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev === 0 ? INITIAL_PROMOS.length - 1 : prev - 1));
    };

    useEffect(() => {
        const timer = setInterval(nextSlide, 6000);
        return () => clearInterval(timer);
    }, [currentIndex]);

    return (
        <section className="w-full py-12 bg-white">
            <div className="container mx-auto px-4 md:px-0">

                <div className="relative group w-full h-125 md:h-150 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900">

                    {/* MAPEO DE SLIDES */}
                    {INITIAL_PROMOS.map((slide, index) => (
                        <div
                            key={slide.id}
                            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                                index === currentIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105 pointer-events-none'
                            }`}
                        >
                            {/* Imagen y Overlay */}
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/30 to-transparent"></div>

                            {/* Contenido de Texto */}
                            <div className="absolute inset-0 flex flex-col justify-center px-8 md:px-20 lg:w-3/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className={`${slide.accentColor} text-white text-[10px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-full shadow-lg`}>
                                        {slide.badge}
                                    </span>
                                    <div className="flex items-center gap-2 text-white/50 text-xs font-bold uppercase tracking-widest">
                                        <Clock size={14} />
                                        {slide.limitDate}
                                    </div>
                                </div>

                                <h2 className="text-4xl md:text-6xl font-black text-white leading-[1] tracking-tighter mb-6">
                                    {slide.title}
                                </h2>

                                <p className="text-base md:text-lg text-white/60 max-w-md mb-8 leading-relaxed font-medium">
                                    {slide.subtitle}
                                </p>

                                <div className="flex flex-wrap items-center gap-6">
                                    <button className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 group">
                                        Explorar Destino
                                        <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                                    </button>

                                    <div className="flex flex-col">
                                        <span className="text-white/30 text-[10px] font-black uppercase tracking-widest">Desde</span>
                                        <span className="text-xl font-black text-white">{slide.price}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* BOTONES DE NAVEGACIÓN */}
                    <div className="absolute bottom-10 right-10 flex gap-4 z-30">
                        <button
                            onClick={prevSlide}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={nextSlide}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-all"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* INDICADORES INFERIORES */}
                    <div className="absolute bottom-10 left-8 md:left-20 flex gap-2 z-30">
                        {INITIAL_PROMOS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentIndex(i)}
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                    i === currentIndex ? 'w-12 bg-white' : 'w-4 bg-white/20 hover:bg-white/40'
                                }`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}