import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Star, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
    {
        id: "01",
        badge: "¡ÉXITO TOTAL!",
        title: "DOS EVENTOS, UNA PASIÓN",
        description: "Agradecemos de corazón a los cientos de viajeros que nos visitaron en Ciudad de México y Chihuahua. Seguiremos diseñando las mejores experiencias de viaje en todo el país.",
        image: "https://images.unsplash.com/photo-1643177159923-94f0917f3dbd?auto=format&fit=crop&q=80&w=1600",
        accentColor: "text-indigo-400",
        btnColor: "bg-indigo-600 hover:bg-indigo-700",
        whatsappMsg: "Hola, vi que tuvieron éxito en sus recientes expos. Me gustaría cotizar mi próximo viaje.",
        logos: [
            { src: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-viaja-y-vuela.png", alt: "Outlet Viaja y Vuela" },
            { src: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-expo-viaja-2026.png", alt: "Expo Viaja 2026" }
        ],
        stat1Label: "Aventura",
        stat1Text: "Comunidad Creciente",
        stat1Icon: Heart,
        stat2Label: "Calidad",
        stat2Text: "Servicio Premium",
        stat2Icon: Star
    }
];

export default function EventsHeroSlider() {
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

    useGSAP(() => {
        const tl = gsap.timeline();

        gsap.set(".reveal-el", { y: 30, opacity: 0, skewY: 1 });
        gsap.set(".reveal-logo", { scale: 0.8, opacity: 0 });

        tl.fromTo(`.bg-image-${currentIndex}`,
            { scale: 1.05, opacity: 0, filter: "brightness(0.4)" },
            { scale: 1, opacity: 1, filter: "brightness(1)", duration: 1.5, ease: "power2.out" }
        );

        tl.to(".reveal-el", {
            y: 0,
            opacity: 1,
            skewY: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "expo.out"
        }, "-=1");

        if (activeSlide.logos.length > 0) {
            tl.to(".reveal-logo", {
                scale: 1,
                opacity: 1,
                stagger: 0.15,
                duration: 0.6,
                ease: "back.out(1.7)"
            }, "-=0.6");
        }

    }, { dependencies: [currentIndex], scope: containerRef });

    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(activeSlide.whatsappMsg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    return (
        <section ref={containerRef} className="w-full py-3 font-sans">
            <div className="px-4 md:px-0">

                <div className="relative w-full h-[700px] md:h-[750px] overflow-hidden shadow-2xl bg-slate-900 group">

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

                    <div className="relative z-20 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:w-3/4 pt-8">

                        <div className="overflow-hidden mb-6">
                            <div className="reveal-el inline-block">
                                <span className="bg-indigo-600 bg-opacity-20 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border border-white/20 shadow-lg backdrop-blur-md">
                                    {activeSlide.badge}
                                </span>
                            </div>
                        </div>

                        {activeSlide.logos.length > 0 && (
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8">
                                {activeSlide.logos.map((logo, index) => (
                                    <React.Fragment key={index}>
                                        <div className="reveal-logo bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-xl shadow-xl h-16 md:h-20 w-auto flex items-center justify-center">
                                            <img src={logo.src} alt={logo.alt} className="h-full w-auto object-contain drop-shadow-md" />
                                        </div>
                                        {index === 0 && <span className="reveal-logo text-white/40 text-xl font-light select-none">+</span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}

                        <div className="overflow-hidden mb-6">
                            <h1 className="reveal-el text-4xl md:text-5xl lg:text-[4rem] font-black text-white leading-[1] tracking-tighter uppercase drop-shadow-md max-w-3xl">
                                {activeSlide.title}
                            </h1>
                        </div>

                        <div className="overflow-hidden mb-8">
                            <p className="reveal-el text-white/80 text-base md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                                {activeSlide.description}
                            </p>
                        </div>

                        <div className="overflow-hidden mb-10">
                            <div className="reveal-el flex flex-col sm:flex-row gap-6 sm:gap-12">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                        <activeSlide.stat1Icon size={20} className={activeSlide.accentColor} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">{activeSlide.stat1Label}</p>
                                        <p className="font-bold text-white text-sm md:text-base">{activeSlide.stat1Text}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                        <activeSlide.stat2Icon size={20} className={activeSlide.accentColor} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">{activeSlide.stat2Label}</p>
                                        <p className="font-bold text-white text-sm md:text-base">{activeSlide.stat2Text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden mt-4">
                            <div className="reveal-el">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className={`flex items-center gap-3 text-white px-8 py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl ${activeSlide.btnColor}`}
                                >
                                    <MessageCircle size={22} className="fill-current" />
                                    Planear Mi Viaje
                                </button>
                            </div>
                        </div>

                    </div>

                    {SLIDES.length > 1 && (
                        <div className="absolute bottom-10 right-8 md:right-10 z-30 flex gap-3">
                            <button onClick={prevSlide} className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                                <ChevronLeft size={24} />
                            </button>
                            <button onClick={nextSlide} className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                                <ChevronRight size={24} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}