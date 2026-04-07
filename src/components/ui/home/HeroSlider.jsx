import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const slides = [
    {
        id: 0,
        title: "CANCÚN TE ESPERA",
        subtitle: "Nuestras playas son el mejor alimento para tu alma. ¡Elige tu favorita!",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/cancun.png",
        bgColor: "bg-cyan-100",
        tag: "Playa",
        accent: "text-cyan-600"
    },
    {
        id: 1,
        title: "MAGIA EN RIVIERA",
        subtitle: "Cenotes cristalinos y selva milenaria. La aventura knocking at your door.",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/riviera-maya.png",
        bgColor: "bg-emerald-100",
        tag: "Naturaleza",
        accent: "text-emerald-600"
    },
    {
        id: 2,
        title: "LUJO EN LOS CABOS",
        subtitle: "Donde el desierto se une con el mar. Exclusividad en cada rincón.",
        image: "https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/los-cabos.png",
        bgColor: "bg-orange-100",
        tag: "Premium",
        accent: "text-orange-600"
    }
];

const DURATION = 8;

export default function OrganicSlider() {
    const [index, setIndex] = useState(0);
    const containerRef = useRef();
    const activeSlide = slides[index];

    useGSAP(() => {
        const tl = gsap.timeline();

        // 1. Animación de Textos (Entrada desde abajo con Fade)
        tl.fromTo(".main-title", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" });
        tl.fromTo(".main-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, "-=0.6");
        tl.fromTo(".main-btn", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5 }, "-=0.4");

        // 2. Animación de la Imagen Central (Flotante)
        gsap.fromTo(".hero-img",
            { y: 20, rotation: -2 },
            { y: -20, rotation: 2, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" }
        );

        // 3. Barra de progreso en los dots
        gsap.fromTo(".dot-progress",
            { width: "0%" },
            { width: "100%", duration: DURATION, ease: "none", onComplete: () => nextSlide() }
        );

    }, { dependencies: [index], scope: containerRef });

    const nextSlide = () => setIndex((prev) => (prev + 1) % slides.length);

    return (
        <section ref={containerRef} className="mt-10 px-4 md:px-0">
            <div className={`relative w-full container mx-auto min-h-137.5 md:h-150 rounded-[2.5rem] overflow-hidden transition-colors duration-1000 ${activeSlide.bgColor}`}>

                <div className="grid grid-cols-1 md:grid-cols-12 h-full items-center p-8 md:p-16">

                    {/* COLUMNA IZQUIERDA: TEXTO */}
                    <div className="md:col-span-5 z-20 space-y-6">
                        <span className={`font-bold uppercase tracking-widest text-sm ${activeSlide.accent}`}>
                            {activeSlide.tag}
                        </span>
                        <h1 className="main-title text-5xl md:text-7xl font-black text-slate-900 leading-[1.1]">
                            {activeSlide.title}
                        </h1>
                        <p className="main-desc text-lg text-slate-600 max-w-sm">
                            {activeSlide.subtitle}
                        </p>
                        <button className="main-btn bg-black text-white px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform active:scale-95">
                            VER DESTINOS
                        </button>
                    </div>

                    {/* COLUMNA CENTRAL: IMAGEN HERO */}
                    <div className="md:col-span-4 flex justify-center z-10 my-10 md:my-0">
                        <img
                            src={activeSlide.image}
                            alt={activeSlide.title}
                            className="hero-img w-full max-w-87.5 drop-shadow-[0_35px_35px_rgba(0,0,0,0.3)] object-contain"
                        />
                    </div>

                    {/* COLUMNA DERECHA: MINI CARDS (Navegación) */}
                    <div className="md:col-span-3 flex flex-col gap-4 z-20">
                        {slides.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => setIndex(i)}
                                className={`flex items-center gap-4 p-3 rounded-2xl transition-all border-2 ${i === index ? 'bg-white border-white shadow-lg scale-105' : 'bg-white/30 border-transparent hover:bg-white/50'}`}
                            >
                                <img src={s.image} className="w-16 h-16 rounded-xl object-cover bg-slate-200" alt="" />
                                <div className="text-left">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase">{s.tag}</p>
                                    <p className="font-bold text-slate-800 text-sm">{s.title.split(' ')[0]}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* DOTS DE PROGRESO INFERIORES */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
                    {slides.map((_, i) => (
                        <div key={i} className="h-1.5 w-12 bg-black/10 rounded-full overflow-hidden">
                            {i === index && (
                                <div className="dot-progress h-full bg-black rounded-full"></div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}