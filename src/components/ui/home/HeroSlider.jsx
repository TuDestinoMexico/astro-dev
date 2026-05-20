import React, { useState, useEffect, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Star, MessageCircle, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

// DATOS DE LOS SLIDERS
const SLIDES = [
    {
        id: "01",
        badge: "¡PREPÁRATE!",
        title: "HOT SALE 2026",
        description: "El evento de descuentos online más grande del año está por comenzar. Ahorra en hoteles de lujo, tours exclusivos y paquetes vacacionales en todo México.",
        image: "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&q=80&w=1600",
        accentColor: "text-red-500",
        btnColor: "bg-red-600 hover:bg-red-700",
        whatsappMsg: "Hola, me interesa recibir las promociones exclusivas del Hot Sale.",
        targetDate: "2026-05-25T00:00:00",
        hasCountdown: true,
        logos: [],
        stat1Label: "Descuentos",
        stat1Text: "Hasta 50% OFF",
        stat1Icon: Flame,
        stat2Label: "Válido en",
        stat2Text: "Todo el país",
        stat2Icon: Star
    },
    {
        id: "02",
        badge: "¡ÉXITO TOTAL!",
        title: "DOS EVENTOS, UNA PASIÓN",
        description: "Agradecemos de corazón a los cientos de viajeros que nos visitaron en Ciudad de México y Chihuahua. Seguiremos diseñando experiencias que superen tus expectativas.",
        image: "https://images.unsplash.com/photo-1643177159923-94f0917f3dbd?auto=format&fit=crop&q=80&w=1600",
        accentColor: "text-indigo-400",
        btnColor: "bg-indigo-600 hover:bg-indigo-700",
        whatsappMsg: "Hola, vi que tuvieron éxito en sus recientes expos. Me gustaría cotizar mi próximo viaje.",
        targetDate: null,
        hasCountdown: false,
        logos: [
            { src: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-viaja-y-vuela.png", alt: "Outlet" },
            { src: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-expo-viaja-2026.png", alt: "Expo" }
        ],
        stat1Label: "Aventura",
        stat1Text: "Comunidad Creciente",
        stat1Icon: Heart,
        stat2Label: "Calidad",
        stat2Text: "Servicio Premium",
        stat2Icon: Star
    }
];

export default function AgencyHeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState({ dias: 0, horas: 0, minutos: 0, segundos: 0 });
    const containerRef = useRef(null);
    const WHATSAPP_NUMBER = "529987141365";

    const activeSlide = SLIDES[currentIndex];

    // FUNCIONES DE NAVEGACIÓN (Envueltas en useCallback para optimización)
    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    // 1. LÓGICA DE REPRODUCCIÓN AUTOMÁTICA (AUTOPLAY)
    useEffect(() => {
        // Configuramos el temporizador para que ejecute nextSlide cada 8000ms (8 segundos)
        const slideTimer = setInterval(() => {
            nextSlide();
        }, 8000);

        // Limpiamos el intervalo si el componente se desmonta o si el currentIndex cambia manualmente
        return () => clearInterval(slideTimer);
    }, [currentIndex, nextSlide]); // Al depender de currentIndex, el reloj de 8 seg se reinicia si haces clic manual

    // 2. LÓGICA DEL CONTADOR DEL HOT SALE
    useEffect(() => {
        if (!activeSlide.hasCountdown || !activeSlide.targetDate) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(activeSlide.targetDate) - +new Date();
            if (difference > 0) {
                return {
                    dias: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutos: Math.floor((difference / 1000 / 60) % 60),
                    segundos: Math.floor((difference / 1000) % 60)
                };
            }
            return { dias: 0, horas: 0, minutos: 0, segundos: 0 };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    // 3. ANIMACIONES GSAP
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

                    {/* CAPAS DE IMÁGENES DE FONDO */}
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

                    {/* CONTENIDO PRINCIPAL */}
                    <div key={currentIndex} className="relative z-20 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:w-3/4 pt-8">

                        <div className="overflow-hidden mb-6">
                            <div className="reveal-el inline-block">
                                <span className={`${activeSlide.accentColor.replace('text', 'bg')} bg-opacity-20 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border border-white/20 shadow-lg backdrop-blur-md`}>
                                    {activeSlide.badge}
                                </span>
                            </div>
                        </div>

                        {activeSlide.logos.length > 0 && (
                            <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8">
                                {activeSlide.logos.map((logo, index) => (
                                    <React.Fragment key={index}>
                                        <div className="reveal-logo bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-2xl shadow-xl h-16 md:h-20 w-auto flex items-center justify-center">
                                            <img src={logo.src} alt={logo.alt} className="h-full w-auto object-contain drop-shadow-md" />
                                        </div>
                                        {index === 0 && <span className="reveal-logo text-white/40 text-xl font-light">+</span>}
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

                        {activeSlide.hasCountdown && (
                            <div className="overflow-hidden mb-8">
                                <div className="reveal-el flex items-center gap-4 border border-white/10 bg-black/40 backdrop-blur-xl p-4 md:p-5 rounded-2xl w-fit shadow-2xl">
                                    <div className="hidden sm:block mr-4">
                                        <p className="text-xs font-bold text-white/50 uppercase tracking-[0.2em] leading-tight">Inicia en</p>
                                    </div>
                                    <div className="flex gap-3 md:gap-4">
                                        {Object.entries(timeLeft).map(([unit, value]) => (
                                            <div key={unit} className="flex flex-col items-center justify-center w-14 h-14 md:w-16 md:h-16">
                                                <span className={`text-3xl font-black font-mono ${activeSlide.accentColor} tracking-tighter`}>
                                                    {String(value).padStart(2, '0')}
                                                </span>
                                                <span className="text-[9px] uppercase tracking-widest text-white/60 mt-1">{unit}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {!activeSlide.hasCountdown && (
                            <div className="overflow-hidden mb-10">
                                <div className="reveal-el flex flex-col sm:flex-row gap-6 sm:gap-12">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                            <activeSlide.stat1Icon size={20} className={activeSlide.accentColor} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">{activeSlide.stat1Label}</p>
                                            <p className="font-bold text-white">{activeSlide.stat1Text}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                            <activeSlide.stat2Icon size={20} className={activeSlide.accentColor} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">{activeSlide.stat2Label}</p>
                                            <p className="font-bold text-white">{activeSlide.stat2Text}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="overflow-hidden mt-4">
                            <div className="reveal-el">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className={`flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl ${activeSlide.btnColor}`}
                                >
                                    <MessageCircle size={22} className="fill-current" />
                                    {activeSlide.id === "01" ? "Recibir Alertas" : "Planear Mi Viaje"}
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* CONTROLES DEL SLIDER */}
                    <div className="absolute bottom-10 right-8 md:right-10 z-30 flex gap-3">
                        <button onClick={prevSlide} className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextSlide} className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    {/* INDICADOR NUMÉRICO (Línea de tiempo) */}
                    <div className="absolute top-10 right-10 z-30 text-right hidden md:block">
                        <span className="text-4xl font-black text-white/30">{activeSlide.id}</span>
                        <div className="w-16 h-1 bg-white/20 mt-2 ml-auto rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-[8000ms] ease-linear" style={{ width: `${((currentIndex + 1) / SLIDES.length) * 100}%` }}></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}