import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface TeamMemberProps {
    name: string;
    role: string;
    imageSrc: string;
}

const TeamMember: React.FC<TeamMemberProps> = ({ name, role, imageSrc }) => {
    const container = useRef<HTMLDivElement>(null);
    const borderRef = useRef<HTMLDivElement>(null);

    const { contextSafe } = useGSAP({ scope: container });

    const onMouseEnter = contextSafe(() => {
        gsap.to(borderRef.current, {
            backgroundPosition: "100% 50%",
            duration: 1.5,
            ease: "power1.inOut",
            repeat: -1,
            yoyo: true,
        });
        gsap.to(borderRef.current, {
            boxShadow: "0px 0px 20px rgba(0, 192, 165, 0.5)",
            duration: 0.4,
            ease: "back.out"
        });
    });

    const onMouseLeave = contextSafe(() => {
        gsap.killTweensOf(borderRef.current);
        gsap.to(borderRef.current, {
            backgroundPosition: "0% 50%",
            boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)",
            duration: 0.6,
            ease: "power2.inOut"
        });
    });

    return (
        <div
            ref={container}
            className="flex flex-col items-center text-center group cursor-default"
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div
                ref={borderRef}
                style={{ backgroundSize: "200% 200%", backgroundPosition: "0% 50%" }}
                className="relative p-[3.5px] rounded-full bg-gradient-to-tr from-[#00c0a5] via-[#8b5cf6] to-[#fb923c] transition-shadow"
            >
                <div className="relative overflow-hidden rounded-full w-48 h-48 sm:w-64 sm:h-64 bg-slate-900 border-[6px] border-white">
                    <img src={imageSrc} alt={name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/5 pointer-events-none"></div>
                </div>
            </div>

            {/* BLOQUE DE TEXTO OPTIMIZADO */}
            <div className="mt-6 flex flex-col items-center">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                    {name}
                </h3>

                {/* Ajustamos el rol para que sea estético incluso si es largo */}
                <p className="mt-2 text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-widest leading-relaxed max-w-[180px] sm:max-w-[240px]">
                    {role}
                </p>
            </div>
        </div>
    );
};

export default TeamMember;