import React, { useState, useRef, useCallback } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ChevronLeft, ChevronRight, MessageCircle, MapPin } from 'lucide-react';

// DIAPOSITIVAS CORPORATIVAS DE TU DESTINO MÉXICO
const SLIDES = [
    {
        id: "01",
        badge: "TU DESTINO MÉXICO 🏖️",
        title: "DISFRUTA TUS PRÓXIMAS VACACIONES",
        description: "Diseñamos viajes inolvidables a tu medida. Encuentra las mejores tarifas en hoteles de lujo, tours exclusivos y traslados VIP con el respaldo y atención de nuestro equipo.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1600",
        btnColor: "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30",
        whatsappMsg: "¡Hola! Quiero cotizar mis próximas vacaciones con Tu Destino México.",
        location: "Caribe Mexicano & Cancún"
    },
    {
        id: "02",
        badge: "EXPERIENCIAS EXCLUSIVAS 🌴",
        title: "HOTELES DE LUJO Y TOURS A TU MEDIDA",
        description: "Aprovecha nuestras tarifas exclusivas y paquetes creados para que solo te preocupes por disfrutar. Tu viaje de ensueño comienza con Tu Destino México.",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1600",
        btnColor: "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30",
        whatsappMsg: "¡Hola! Me interesa conocer los paquetes y ofertas en hoteles VIP que tienen disponibles en Tu Destino México.",
        location: "Riviera Maya & Playas de México"
    }
];

export default function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const WHATSAPP_NUMBER = "529989806611";

    const activeSlide = SLIDES[currentIndex];

    // Funciones de navegación entre diapositivas
    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, []);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    }, []);

    // ANIMACIONES GSAP AL CAMBIAR DE DIAPOSITIVA
    useGSAP(() => {
        const tl = gsap.timeline();

        // Estado inicial para revelar
        gsap.set(".reveal-el", { y: 35, opacity: 0, skewY: 1 });
        gsap.set(".reveal-tag", { scale: 0.8, opacity: 0 });

        // Animación de la imagen de fondo
        tl.fromTo(`.bg-image-${currentIndex}`,
            { scale: 1.05, opacity: 0, filter: "brightness(0.25)" },
            { scale: 1, opacity: 1, filter: "brightness(0.55)", duration: 1.4, ease: "power2.out" }
        );

        // Revelado escalonado de los textos
        tl.to(".reveal-el", {
            y: 0,
            opacity: 1,
            skewY: 0,
            stagger: 0.08,
            duration: 0.8,
            ease: "expo.out"
        }, "-=1.0");

        // Revelado de la etiqueta de ubicación
        tl.to(".reveal-tag", {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: "back.out(1.5)"
        }, "-=0.6");

    }, { dependencies: [currentIndex], scope: containerRef });

    // Redirección a WhatsApp con mensaje personalizado
    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(activeSlide.whatsappMsg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    return (
        <section ref={containerRef} className="w-full font-sans overflow-hidden">
            <div className="relative w-full h-[650px] md:h-[720px] bg-slate-950 group">

                {/* 1. IMÁGENES DE FONDO DE LOS DESTINOS */}
                {SLIDES.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'z-10' : 'z-0 opacity-0'}`}
                    >
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className={`bg-image-${index} w-full h-full object-cover`}
                        />
                        {/* Gradiente oscuro para asegurar la legibilidad del texto */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/75 to-transparent pointer-events-none"></div>
                    </div>
                ))}

                {/* 2. CONTENEDOR DE CONTENIDO PRINCIPAL */}
                <div className="relative z-20 w-full h-full flex flex-col justify-center px-6 md:px-16 lg:w-2/3 pt-4">

                    {/* BADGE INSTITUCIONAL */}
                    <div className="overflow-hidden mb-5">
                        <div className="reveal-el inline-block">
                            <span className="bg-orange-500/20 text-orange-400 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-full border border-orange-500/30 shadow-lg backdrop-blur-md">
                                {activeSlide.badge}
                            </span>
                        </div>
                    </div>

                    {/* UBICACIÓN O DESTINO DESTACADO */}
                    <div className="overflow-hidden mb-6">
                        <div className="reveal-tag inline-flex items-center gap-2 bg-white/10 text-white text-xs font-bold px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                            <MapPin size={16} className="text-orange-400" />
                            <span>{activeSlide.location}</span>
                        </div>
                    </div>

                    {/* TÍTULO PRINCIPAL */}
                    <div className="overflow-hidden mb-5">
                        <h1 className="reveal-el text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[0.95] tracking-tighter uppercase drop-shadow-md max-w-3xl">
                            {activeSlide.title}
                        </h1>
                    </div>

                    {/* DESCRIPCIÓN COMERCIAL */}
                    <div className="overflow-hidden mb-8">
                        <p className="reveal-el text-white/80 text-base md:text-lg max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                            {activeSlide.description}
                        </p>
                    </div>

                    {/* BOTÓN DE ACCIÓN (WHATSAPP) */}
                    <div className="overflow-hidden">
                        <div className="reveal-el">
                            <button
                                onClick={handleWhatsAppClick}
                                className={`flex items-center gap-3 text-white px-8 py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl ${activeSlide.btnColor}`}
                            >
                                <MessageCircle size={20} className="fill-current" />
                                Cotizar Mi Viaje Ahora
                            </button>
                        </div>
                    </div>

                </div>

                {/* 3. BOTONES DE NAVEGACIÓN Y FLECHAS */}
                {SLIDES.length > 1 && (
                    <div className="absolute bottom-10 right-6 md:right-12 z-30 flex items-center gap-4">
                        {/* Indicadores de diapositiva (Puntos) */}
                        <div className="flex gap-2 mr-2">
                            {SLIDES.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-orange-500' : 'w-2 bg-white/40'}`}
                                    aria-label={`Ir a la diapositiva ${index + 1}`}
                                />
                            ))}
                        </div>

                        {/* Flechas Anterior / Siguiente */}
                        <div className="flex gap-2">
                            <button
                                onClick={prevSlide}
                                className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-90 shadow-lg"
                                aria-label="Diapositiva anterior"
                            >
                                <ChevronLeft size={22} />
                            </button>
                            <button
                                onClick={nextSlide}
                                className="w-11 h-11 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-950 transition-all active:scale-90 shadow-lg"
                                aria-label="Siguiente diapositiva"
                            >
                                <ChevronRight size={22} />
                            </button>
                        </div>
                    </div>
                )}

            </div>
        </section>
    );
}