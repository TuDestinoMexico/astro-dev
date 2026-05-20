import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { Heart, Star, MessageCircle } from 'lucide-react';

// DATOS DEL COMUNICADO DE AGRADECIMIENTO
const THANK_YOU_DATA = {
    badge: "¡ÉXITO TOTAL!",
    title: "DOS GRANDES EVENTOS, UNA MISMA PASIÓN",
    description: "Agradecemos de corazón a los cientos de viajeros que nos visitaron en Ciudad de México y Chihuahua. Cerrar estos eventos con éxito nos motiva a seguir diseñando experiencias que superen tus expectativas.",

    // Aquí están los logos de ambos eventos
    logos: [
        {
            src: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-viaja-y-vuela.png",
            alt: "Outlet Viaja y Vuela"
        },
        {
            src: "https://storage.googleapis.com/tudestinomx_bucket/logos/logo-expo-viaja-2026.png",
            alt: "Expo Viaje 2026 Chihuahua"
        }
    ],

    stat1Label: "Aventura",
    stat1Text: "Comunidad Creciente",
    stat2Label: "Calidad",
    stat2Text: "Servicio Premium",

    // Imagen sugerida de celebración / viajeros al atardecer
    image: "https://images.unsplash.com/photo-1643177159923-94f0917f3dbd?auto=format&fit=crop&q=80&w=1600",
    accentColor: "text-indigo-400",
    btnColor: "bg-indigo-600 hover:bg-indigo-700",
    whatsappMsg: "Hola, vi que tuvieron éxito en sus recientes expos. Me gustaría información para planear mi próximo viaje con ustedes."
};

export default function AgencyHeroBanner() {
    const containerRef = useRef(null);
    const WHATSAPP_NUMBER = "529987141365";

    // ANIMACIONES GSAP
    useGSAP(() => {
        const tl = gsap.timeline();

        // Estado inicial
        gsap.set(".reveal-el", { y: 30, opacity: 0, skewY: 1 });
        gsap.set(".reveal-logo", { scale: 0.8, opacity: 0 });

        // Zoom in del fondo
        tl.fromTo(".bg-image",
            { scale: 1.05, opacity: 0, filter: "brightness(0.4)" },
            { scale: 1, opacity: 1, filter: "brightness(1)", duration: 1.5, ease: "power2.out" }
        );

        // Entrada de la etiqueta (Badge)
        tl.to(".reveal-el", {
            y: 0,
            opacity: 1,
            skewY: 0,
            stagger: 0.1,
            duration: 0.8,
            ease: "expo.out"
        }, "-=1");

        // Entrada con "Pop" de los logos
        tl.to(".reveal-logo", {
            scale: 1,
            opacity: 1,
            stagger: 0.15,
            duration: 0.6,
            ease: "back.out(1.7)"
        }, "-=0.6");

    }, { scope: containerRef });

    const handleWhatsAppClick = () => {
        const encodedMessage = encodeURIComponent(THANK_YOU_DATA.whatsappMsg);
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
    };

    return (
        <section ref={containerRef} className="w-full py-3 font-sans">
            <div className="px-4 md:px-0">

                <div className="relative w-full h-[700px] md:h-[750px] overflow-hidden shadow-2xl bg-slate-900 group">

                    {/* IMAGEN DE FONDO */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src={THANK_YOU_DATA.image}
                            alt="Gracias por asistir"
                            className="bg-image w-full h-full object-cover"
                        />
                        {/* Gradiente más pronunciado para que los logos blancos destaquen */}
                        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/70 to-transparent pointer-events-none"></div>
                    </div>

                    {/* CONTENIDO PRINCIPAL */}
                    <div className="relative z-20 w-full h-full flex flex-col justify-center px-8 md:px-16 lg:w-3/4 pt-8">

                        {/* Etiqueta Superior */}
                        <div className="overflow-hidden mb-6">
                            <div className="reveal-el inline-block">
                                <span className={`${THANK_YOU_DATA.accentColor.replace('text', 'bg')} bg-opacity-20 text-white text-[10px] md:text-xs font-black uppercase tracking-[0.3em] px-5 py-2 rounded-full border border-white/20 shadow-lg backdrop-blur-md`}>
                                    {THANK_YOU_DATA.badge}
                                </span>
                            </div>
                        </div>

                        {/* ZONA DE LOGOS DE LOS EVENTOS */}
                        <div className="flex flex-wrap items-center gap-4 md:gap-6 mb-8">
                            {THANK_YOU_DATA.logos.map((logo, index) => (
                                <React.Fragment key={index}>
                                    <div className="reveal-logo bg-white/10 backdrop-blur-md border border-white/20 p-4 md:p-5 rounded-2xl shadow-xl h-20 md:h-24 w-auto flex items-center justify-center">
                                        <img
                                            src={logo.src}
                                            alt={logo.alt}
                                            className="h-full w-auto object-contain drop-shadow-md"
                                        />
                                    </div>
                                    {/* Icono de '+' entre los logos */}
                                    {index === 0 && (
                                        <span className="reveal-logo text-white/40 text-xl font-light">+</span>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Título */}
                        <div className="overflow-hidden mb-6">
                            <h1 className="reveal-el text-4xl md:text-5xl lg:text-[4rem] font-black text-white leading-[1] tracking-tighter uppercase drop-shadow-md max-w-3xl">
                                {THANK_YOU_DATA.title}
                            </h1>
                        </div>

                        {/* Descripción */}
                        <div className="overflow-hidden mb-8">
                            <p className="reveal-el text-white/80 text-base md:text-xl max-w-2xl font-medium leading-relaxed drop-shadow-sm">
                                {THANK_YOU_DATA.description}
                            </p>
                        </div>

                        {/* Elementos de Confianza (Estrellas / Corazón) */}
                        <div className="overflow-hidden mb-10">
                            <div className="reveal-el flex flex-col sm:flex-row gap-6 sm:gap-12">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                        <Heart size={20} className="text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">{THANK_YOU_DATA.stat1Label}</p>
                                        <p className="font-bold text-white">{THANK_YOU_DATA.stat1Text}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white/10 rounded-full backdrop-blur-sm">
                                        <Star size={20} className="text-yellow-400 fill-yellow-400/20" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-black tracking-widest">{THANK_YOU_DATA.stat2Label}</p>
                                        <p className="font-bold text-white">{THANK_YOU_DATA.stat2Text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Botón WhatsApp */}
                        <div className="overflow-hidden">
                            <div className="reveal-el">
                                <button
                                    onClick={handleWhatsAppClick}
                                    className={`flex items-center gap-3 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl ${THANK_YOU_DATA.btnColor}`}
                                >
                                    <MessageCircle size={22} className="fill-current" />
                                    Planear Mi Próximo Viaje
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}