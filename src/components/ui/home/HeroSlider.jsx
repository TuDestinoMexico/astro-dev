import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Calendar, MapPin, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';

const SLIDES = [
    {
        id: "01",
        badge: "¡TE ESPERAMOS!",
        title: "OUTLET VIAJA Y VUELA",
        description: "Encuentra las mejores ofertas para tus próximas vacaciones. Ven a descubrir destinos increíbles y planear tu aventura perfecta en nuestro gran evento.",
        date: "15 al 17 de mayo",
        location: "WTC, Ciudad de México",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1600",
        logo: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-viaja-y-vuela.png",
        accentColor: "text-pink-400",
        btnColor: "bg-pink-600 hover:bg-pink-700",
        whatsappMsg: "Hola, quiero más información sobre el Outlet Viaja y Vuela."
    },
    {
        id: "02",
        badge: "PRÓXIMA AVENTURA",
        title: "EXPO VIAJE 2026 Chihuahua",
        description: "Únete a nuestra expedición exclusiva por las playas más hermosas de México. Cupos limitados para viajeros premium que buscan el paraíso.",
        date: "16 al 17 de Mayo",
        location: "Centro de convenciones Injectronic",
        image: "https://images.unsplash.com/photo-1518638150340-f706b867a052?auto=format&fit=crop&q=80&w=1600",
        logo: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-expo-viaja-2026.png",
        accentColor: "text-indigo-400",
        btnColor: "bg-emerald-500 hover:bg-emerald-600",
        whatsappMsg: "Hola, me interesa reservar un cupo para la Xolo Ruta Expo Viaje 2026 Chihuahua.",
    }
];

export default function AgencyHeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef(null);
    const activeSlide = SLIDES[currentIndex];

    const WHATSAPP_NUMBER = "529987141365";

    useGSAP(() => {
        const tl = gsap.timeline();

        // Limpiamos el estado inicial
        gsap.set(".reveal-el", { y: 40, opacity: 0, skewY: 2 });

        // Animación sutil de la imagen
        tl.fromTo(`.bg-image-${currentIndex}`,
            { scale: 1.05, opacity: 0, filter: "brightness(0.7)" },
            { scale: 1, opacity: 1, filter: "brightness(1)", duration: 1.5, ease: "power2.out" }
        );

        // Entrada en cascada de los textos
        tl.to(".reveal-el", {
            y: 0,
            opacity: 1,
            skewY: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "expo.out"
        }, "-=1");

    }, { dependencies: [currentIndex], scope: containerRef });

    // 3. FUNCIONES
    const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);

    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(activeSlide.whatsappMsg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    return (
        <section ref={containerRef} className="w-full py-8 font-sans">
            <div className="container mx-auto px-4 md:px-6">

                <div className="relative w-full h-162.5 md:h-175 rounded-[2.5rem] overflow-hidden shadow-2xl bg-slate-900 group">

                    {SLIDES.map((slide, index) => (
                        <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'z-10' : 'z-0 opacity-0'}`}>
                            <img
                                src={slide.image}
                                alt={slide.title}
                                className={`bg-image-${index} w-full h-full object-cover`}
                            />
                            <div className="absolute inset-0 bg-linear-to-r from-slate-950/90 via-slate-900/60 to-transparent pointer-events-none"></div>
                        </div>
                    ))}

                    <div key={currentIndex} className="relative z-20 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:w-3/4 pt-4">

                        <div className="overflow-hidden mb-6">
                            <div className="reveal-el flex items-center gap-4">
                                {activeSlide.logo ? (
                                    <img src={activeSlide.logo} alt="Logo" className="h-30 w-auto object-contain bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shadow-lg" />
                                ) : (
                                    <span className={`${activeSlide.accentColor.replace('text', 'bg')} bg-opacity-20 text-white text-xs font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border border-white/20`}>
                                        {activeSlide.badge}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="overflow-hidden mb-6">
                            <h1 className="reveal-el text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1] tracking-tighter uppercase drop-shadow-md">
                                {activeSlide.title}
                            </h1>
                        </div>

                        <div className="overflow-hidden mb-8">
                            <div className="reveal-el flex flex-col sm:flex-row gap-6 sm:gap-12">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                        <Calendar size={20} className={activeSlide.accentColor} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Cuándo</p>
                                        <p className="font-bold text-white">{activeSlide.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                        <MapPin size={20} className={activeSlide.accentColor} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">Dónde</p>
                                        <p className="font-bold text-white">{activeSlide.location}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="overflow-hidden mb-10">
                            <p className="reveal-el text-white/80 text-lg md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                                {activeSlide.description}
                            </p>
                        </div>

                        <div className="overflow-hidden">
                            <div className="reveal-el">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className={`flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl ${activeSlide.btnColor}`}
                                >
                                    <MessageCircle size={22} className="fill-current" />
                                    ¡Pedir Información!
                                </button>
                            </div>
                        </div>

                    </div>

                    <div className="absolute bottom-10 right-8 md:right-10 z-30 flex gap-3">
                        <button onClick={prevSlide} className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                            <ChevronLeft size={24} />
                        </button>
                        <button onClick={nextSlide} className="w-12 h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-white flex items-center justify-center hover:bg-white hover:text-slate-900 transition-colors active:scale-90 shadow-lg">
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div className="absolute top-10 right-10 z-30 text-right hidden md:block">
                        <span className="text-4xl font-black text-white/30">{activeSlide.id}</span>
                        <div className="w-16 h-1 bg-white/20 mt-2 ml-auto rounded-full overflow-hidden">
                            <div className="h-full bg-white transition-all duration-700" style={{ width: `${((currentIndex + 1) / SLIDES.length) * 100}%` }}></div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}