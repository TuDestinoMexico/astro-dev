import React, { useState, useEffect } from 'react';
import { Calendar, MapPin } from 'lucide-react';

const EVENT_DATA = {
    badge: "¡TE ESPERAMOS!",
    title: "OUTLET VIAJA Y VUELA",
    description: "Encuentra las mejores ofertas para tus próximas vacaciones. Ven a descubrir destinos increíbles y planear tu aventura perfecta en nuestro gran evento.",
    date: "15 al 17 de mayo",
    location: "WTC, Ciudad de México",
    image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&q=80&w=1600",
    accentColor: "bg-pink-600",
    // Esta es la fecha objetivo para el contador (Año-Mes-DíaTHora:Minuto:Segundo)
    targetDate: "2026-05-15T00:00:00"
};

export default function EventHeroBanner() {
    // 1. ESTADOS DE REACT PARA EL CONTADOR
    const [timeLeft, setTimeLeft] = useState({
        días: 0,
        horas: 0,
        minutos: 0,
        segundos: 0
    });

    // 2. LÓGICA DEL CONTADOR (useEffect)
    useEffect(() => {
        const calculateTimeLeft = () => {
            // Obtenemos la diferencia en milisegundos
            const difference = +new Date(EVENT_DATA.targetDate) - +new Date();
            let newTimeLeft = { días: 0, horas: 0, minutos: 0, segundos: 0 };

            if (difference > 0) {
                newTimeLeft = {
                    días: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutos: Math.floor((difference / 1000 / 60) % 60),
                    segundos: Math.floor((difference / 1000) % 60)
                };
            }
            return newTimeLeft;
        };

        // Ejecutamos el cálculo inmediatamente para evitar que parpadee en 0
        setTimeLeft(calculateTimeLeft());

        // Actualizamos cada 1 segundo (1000 ms)
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        // Limpiamos el intervalo si el componente se desmonta (buenas prácticas)
        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full py-12 bg-white font-sans">
            <div className="container mx-auto px-4 md:px-0">

                <div className="relative w-full min-h-[600px] rounded-[2.5rem] overflow-hidden shadow-2xl flex items-center bg-slate-900 group">

                    <img
                        src={EVENT_DATA.image}
                        alt="Outlet Viaja y Vuela"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-40"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent pointer-events-none"></div>

                    <div className="relative z-10 w-full max-w-3xl mx-auto md:ml-16 p-8 md:p-12 mt-10 md:mt-0">

                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 md:p-10 rounded-[2rem] shadow-2xl">

                            {/* --- SECCIÓN DEL LOGO --- */}
                            <div className="mb-6">
                                {/* AQUÍ PUEDES AGREGAR TU LOGO.
                                    Solo cambia el 'src' por la ruta de tu imagen.
                                    Si no tienes logo aún, puedes borrar la etiqueta <img>. */}
                                <img
                                    src="https://storage.googleapis.com/tudestinomx_bucket/logos/logo-viaja-y-vuela.png"
                                    alt="Logo del Evento"
                                    className="h-30 w-auto object-contain bg-white/20 p-2 rounded-lg"
                                />
                            </div>

                            <span className={`${EVENT_DATA.accentColor} inline-block text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-4`}>
                                {EVENT_DATA.badge}
                            </span>

                            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tighter mb-6 uppercase">
                                {EVENT_DATA.title}
                            </h1>

                            <div className="flex flex-col md:flex-row gap-4 md:gap-8 mb-6 border-y border-white/10 py-6">
                                <div className="flex items-center gap-3 text-white/90">
                                    <div className="p-3 bg-white/10 rounded-full">
                                        <Calendar size={20} className="text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Cuándo</p>
                                        <p className="font-medium text-lg text-yellow-400">{EVENT_DATA.date}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 text-white/90">
                                    <div className="p-3 bg-white/10 rounded-full">
                                        <MapPin size={20} className="text-pink-400" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-white/50 uppercase font-bold tracking-widest">Dónde</p>
                                        <p className="font-medium">{EVENT_DATA.location}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="text-white/70 text-base md:text-lg mb-8 font-medium leading-relaxed">
                                {EVENT_DATA.description}
                            </p>

                            {/* --- SECCIÓN DEL CONTADOR --- */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <p className="text-sm font-bold text-white/80 uppercase tracking-[0.2em] mb-2 sm:mb-0 sm:mr-4">
                                    Inicia en:
                                </p>

                                <div className="flex gap-3">
                                    {/* Mapeamos las llaves del objeto timeLeft para crear las cajas del contador */}
                                    {Object.entries(timeLeft).map(([unit, value]) => (
                                        <div key={unit} className="flex flex-col items-center justify-center bg-slate-950/60 border border-white/10 rounded-xl w-16 h-16 shadow-inner">
                                            {/* Agregamos padStart para que siempre tenga 2 dígitos (ej: 09 en vez de 9) */}
                                            <span className="text-2xl font-black text-pink-400 font-mono">
                                                {String(value).padStart(2, '0')}
                                            </span>
                                            <span className="text-[9px] uppercase tracking-widest text-white/50 mt-1">
                                                {unit}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>

            </div>
        </section>
    );
}