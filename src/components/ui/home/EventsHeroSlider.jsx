import React, { useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Trophy, Zap, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    {
        id: "01",
        badge: "¡PREVENTA MUNDIALISTA ACTIVA! 🏆",
        title: "MÉXICO VS SUDÁFRICA",
        description: "El pitazo inicial está cerca. Las ofertas mundialistas arrancan oficialmente con el partido inaugural este Jueves 11 de Junio. Asegura tus vuelos, hoteles de lujo y traslados VIP con tarifas de campeonato.",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&q=80&w=1600",
        accentColor: "text-emerald-400",
        btnColor: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30",
        whatsappMsg: "Hola! Quiero aprovechar las promociones mundialistas para el partido inaugural México vs Sudáfrica.",
        logos: [
            { src: "https://flagcdn.com/w160/mx.png", alt: "México" },
            { src: "https://flagcdn.com/w160/za.png", alt: "Sudáfrica" }
        ],
        stat1Label: "Fecha del Partido",
        stat1Text: "Jueves 11 de Junio",
        stat1Icon: Trophy,
        stat2Label: "Beneficio Exclusivo",
        stat2Text: "Tarifas de Inauguración",
        stat2Icon: Zap
    }
];

export default function WorldCupHeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const WHATSAPP_NUMBER = "529987141365";

    const activeSlide = SLIDES[currentIndex];

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    // ANIMACIONES GSAP CONTROLADAS (Se mantienen idénticas para asegurar su correcto funcionamiento)
    useGSAP(() => {
        const tl = gsap.timeline();

        gsap.set(".reveal-el", { y: 35, opacity: 0, skewY: 1 });
        gsap.set(".reveal-flag", { scale: 0.8, opacity: 0 });

        tl.fromTo(`.bg-image-${currentIndex}`,
            { scale: 1.05, opacity: 0, filter: "brightness(0.3)" },
            { scale: 1, opacity: 1, filter: "brightness(0.9)", duration: 1.6, ease: "power2.out" }
        );

        tl.to(".reveal-el", {
            y: 0,
            opacity: 1,
            skewY: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: "expo.out"
        }, "-=1.1");

        if (activeSlide.logos.length > 0) {
            tl.to(".reveal-flag", {
                scale: 1,
                opacity: 1,
                stagger: 0.12,
                duration: 0.6,
                ease: "back.out(1.5)"
            }, "-=0.7");
        }

    }, { dependencies: [currentIndex], scope: containerRef });

    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(activeSlide.whatsappMsg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    return (
        <section ref={containerRef} className="w-full font-sans overflow-hidden">

            {/* Contenedor principal recto de pantalla completa */}
            <div className="relative w-full h-[720px] md:h-[780px] bg-slate-900 group">

                {/* IMÁGENES DE FONDO */}
                {SLIDES.map((slide, index) => (
                    <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'z-10' : 'z-0 opacity-0'}`}>
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className={`bg-image-${index} w-full h-full object-cover`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent pointer-events-none"></div>
                    </div>
                ))}

                {/* BLOQUE DE TEXTOS E INTERFAZ */}
                <div className="relative z-20 w-full h-full flex flex-col justify-center px-6 md:px-16 lg:w-3/4 pt-4">

                    {/* BADGE INAUGURAL */}
                    <div className="overflow-hidden mb-6">
                        <div className="reveal-el inline-block">
                            <span className="bg-emerald-600 bg-opacity-20 text-emerald-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full border border-emerald-500/30 shadow-lg backdrop-blur-md">
                                {activeSlide.badge}
                            </span>
                        </div>
                    </div>

                    {/* MARCADOR PREVIO: BANDERAS EN VERSUS */}
                    {activeSlide.logos.length > 0 && (
                        <div className="flex items-center gap-4 md:gap-5 mb-8">
                            {activeSlide.logos.map((logo, index) => (
                                <React.Fragment key={index}>
                                    <div className="reveal-flag bg-white/5 backdrop-blur-md border border-white/10 p-2 rounded-2xl shadow-2xl h-14 md:h-16 aspect-[4/3] flex items-center justify-center overflow-hidden">
                                        <img src={logo.src} alt={logo.alt} className="h-full w-full object-cover rounded-lg drop-shadow-md" />
                                    </div>
                                    {index === 0 && (
                                        <span className="reveal-flag text-slate-400 font-mono text-xl md:text-2xl font-black italic tracking-tighter select-none px-1">
                                            VS
                                        </span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    )}

                    {/* TÍTULO ENORME DE CAMPEONATO */}
                    <div className="overflow-hidden mb-5">
                        <h1 className="reveal-el text-4xl md:text-6xl lg:text-[4.5rem] font-black text-white leading-[0.95] tracking-tighter uppercase drop-shadow-md max-w-4xl">
                            {activeSlide.title}
                        </h1>
                    </div>

                    {/* DESCRIPCIÓN COMERCIAL */}
                    <div className="overflow-hidden mb-8">
                        <p className="reveal-el text-white/80 text-base md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                            {activeSlide.description}
                        </p>
                    </div>

                    {/* MÉTRICAS DE VENTAS (STATS) */}
                    <div className="overflow-hidden mb-10">
                        <div className="reveal-el flex flex-col sm:flex-row gap-5 sm:gap-10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                                    <activeSlide.stat1Icon size={20} className={activeSlide.accentColor} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">{activeSlide.stat1Label}</p>
                                    <p className="font-bold text-white text-sm md:text-base">{activeSlide.stat1Text}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/5 border border-white/10 rounded-full backdrop-blur-sm">
                                    <activeSlide.stat2Icon size={20} className={activeSlide.accentColor} />
                                </div>
                                <div>
                                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest">{activeSlide.stat2Label}</p>
                                    <p className="font-bold text-white text-sm md:text-base text-emerald-400">{activeSlide.stat2Text}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTÓN WHATSAPP DE COTIZACIÓN */}
                    <div className="overflow-hidden mt-2">
                        <div className="reveal-el">
                            <button
                                onClick={handleWhatsAppClick}
                                className={`flex items-center gap-3 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl ${activeSlide.btnColor}`}
                            >
                                <MessageCircle size={22} className="fill-current" />
                                Cotizar Mi Viaje Mundialista
                            </button>
                        </div>
                    </div>

                </div>

                {/* BOTONES DE AVANCE DE DIAPOSITIVAS */}
                {SLIDES.length > 1 && (
                    <div className="absolute bottom-10 right-8 md:right-10 z-30 flex gap-3">
                        <button onClick={prevSlide} className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextSlide} className="w-12 h-12 bg-white/5 backdrop-blur-md border border-white/10 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}