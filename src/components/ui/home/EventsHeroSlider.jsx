import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const SLIDES = [
    {
        id: "01",
        badge: "CON LA FRENTE EN ALTO 🇲🇽 ♥️",
        title: "GRACIAS POR LA ILUSIÓN",
        description: "Gracias a nuestra selección por defender la camiseta con orgullo y hacernos vibrar en cada minuto del torneo. Lucharon hasta el final en la cancha y nos demostraron el verdadero espíritu de competencia. La historia se escribe paso a paso y el orgullo de ser mexicanos se mantiene intacto.",
        image: "https://images.unsplash.com/photo-1521216774850-01bc1c5fe0da?auto=format&fit=crop&q=80&w=1600",
        logos: [
            { src: "https://flagcdn.com/w160/mx.png", alt: "México" }
        ]
    }
];

export default function WorldCupHeroSlider() {
    const [currentIndex] = useState(0);
    const containerRef = useRef(null);
    const activeSlide = SLIDES[currentIndex];

    // ANIMACIONES GSAP CONTROLADAS (Adaptadas para un único protagonista)
    useGSAP(() => {
        const tl = gsap.timeline();

        gsap.set(".reveal-el", { y: 35, opacity: 0, skewY: 1 });
        gsap.set(".reveal-flag", { scale: 0.8, opacity: 0 });

        tl.fromTo(`.bg-image-${currentIndex}`,
            { scale: 1.05, opacity: 0, filter: "brightness(0.25)" },
            { scale: 1, opacity: 1, filter: "brightness(0.4)", duration: 1.6, ease: "power2.out" }
        );

        tl.to(".reveal-el", {
            y: 0,
            opacity: 1,
            skewY: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "expo.out"
        }, "-=1.1");

        if (activeSlide.logos.length > 0) {
            tl.to(".reveal-flag", {
                scale: 1,
                opacity: 1,
                duration: 0.6,
                ease: "back.out(1.5)"
            }, "-=0.7");
        }

    }, { dependencies: [currentIndex], scope: containerRef });

    return (
        <section ref={containerRef} className="w-full font-sans overflow-hidden">
            <div className="relative w-full h-[650px] md:h-[700px] bg-slate-950 group">

                {/* IMÁGENES DE FONDO */}
                {SLIDES.map((slide, index) => (
                    <div key={slide.id} className={`absolute inset-0 ${index === currentIndex ? 'z-10' : 'z-0 opacity-0'}`}>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className={`bg-image-${index} w-full h-full object-cover`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent pointer-events-none"></div>
                    </div>
                ))}

                {/* BLOQUE DE TEXTOS DE HOMENAJE */}
                <div className="relative z-20 w-full h-full flex flex-col justify-center px-6 md:px-16 lg:w-2/3 pt-4">

                    {/* BADGE DE AGRADECIMIENTO */}
                    <div className="overflow-hidden mb-6">
                        <div className="reveal-el inline-block">
                            <span className="bg-white/5 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full border border-white/10 shadow-lg backdrop-blur-md">
                                {activeSlide.badge}
                            </span>
                        </div>
                    </div>

                    {/* IDENTIDAD: SOLO LA BANDERA MEXICANA */}
                    {activeSlide.logos.length > 0 && (
                        <div className="flex items-center gap-4 mb-8">
                            <div className="reveal-flag bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-2xl h-14 md:h-16 aspect-[4/3] flex items-center justify-center overflow-hidden">
                                <img
                                    src={activeSlide.logos[0].src}
                                    alt={activeSlide.logos[0].alt}
                                    className="h-full w-full object-cover rounded-lg drop-shadow-md"
                                />
                            </div>
                        </div>
                    )}

                    {/* TÍTULO INFORMATIVO */}
                    <div className="overflow-hidden mb-5">
                        <h1 className="reveal-el text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter uppercase drop-shadow-md max-w-4xl">
                            {activeSlide.title}
                        </h1>
                    </div>

                    {/* MENSAJE DE RECONOCIMIENTO */}
                    <div className="overflow-hidden">
                        <p className="reveal-el text-white/70 text-base md:text-lg max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                            {activeSlide.description}
                        </p>
                    </div>

                </div>
            </div>
        </section>
    );
}