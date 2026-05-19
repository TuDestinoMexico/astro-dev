import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

export default function FacebookReel({ reelId, title }) {
    const [isLoading, setIsLoading] = useState(true);

    // 1. Construimos la URL oficial del Reel
    const reelUrl = `https://www.facebook.com/reel/${reelId}`;

    // 2. Facebook requiere que la URL esté codificada (encodeURIComponent)
    const encodedUrl = encodeURIComponent(reelUrl);

    // 3. Generamos el enlace del plugin de Facebook (315x560 es el estándar vertical)
    const iframeSrc = `https://www.facebook.com/plugins/video.php?href=${encodedUrl}&show_text=false&width=315`;

    return (
        // Cambiamos a flex-col e items-center para apilar el reel y el título
        <div className="relative flex flex-col items-center w-full max-w-[315px] mx-auto group">

            {/* Contenedor estilo "Teléfono Móvil" */}
            <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] bg-slate-100 w-[315px] h-[560px] border-[6px] border-slate-900 transition-transform duration-500 group-hover:-translate-y-2 z-10">

                {/* Spinner de Carga (Se muestra mientras Facebook responde) */}
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 z-0">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-4" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cargando Reel...</span>
                    </div>
                )}

                {/* El Iframe de Facebook */}
                <iframe
                    src={iframeSrc}
                    width="315"
                    height="560"
                    style={{ border: 'none', overflow: 'hidden' }}
                    scrolling="no"
                    frameBorder="0"
                    allowFullScreen={true}
                    allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                    className="absolute inset-0 z-10 bg-transparent"
                    onLoad={() => setIsLoading(false)} // Quita el spinner cuando termina de cargar
                ></iframe>
            </div>

            {/* Efecto de brillo de fondo */}
            <div className="absolute top-0 left-0 w-full h-[560px] bg-indigo-500/20 blur-2xl rounded-[3rem] -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            {/* Título dinámico debajo del reel */}
            {title && (
                <div className="mt-6 px-4 text-center z-10 transition-transform duration-500 group-hover:-translate-y-1">
                    <h3 className="text-sm font-bold text-slate-800 tracking-widest uppercase">
                        {title}
                    </h3>
                </div>
            )}
        </div>
    );
}