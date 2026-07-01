import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase'; // Configuración intacta de Firebase
import { doc, onSnapshot, updateDoc, increment, setDoc } from 'firebase/firestore';
import { Trophy, X, BarChart2, Minus } from 'lucide-react';

export default function MatchPoll() {
    const [isOpen, setIsOpen] = useState(true);
    const [isMinimized, setIsMinimized] = useState(false); // NUEVO: Estado para minimizar
    const [hasVoted, setHasVoted] = useState(false);
    const [votes, setVotes] = useState({ mexico: 0, inglaterra: 0 });
    const [totalVotes, setTotalVotes] = useState(0);

    const pollDocRef = doc(db, "encuestas", "mexico_inglaterra");

    useEffect(() => {
        const votedBefore = localStorage.getItem('voted_mex_eng');
        if (votedBefore) setHasVoted(true);

        const unsubscribe = onSnapshot(pollDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                const mex = data.mexico || 0;
                const eng = data.inglaterra || 0;
                setVotes({ mexico: mex, inglaterra: eng });
                setTotalVotes(mex + eng);
            } else {
                setDoc(pollDocRef, { mexico: 0, inglaterra: 0 });
            }
        });

        return () => unsubscribe();
    }, []);

    const handleVote = async (team) => {
        try {
            await updateDoc(pollDocRef, {
                [team]: increment(1)
            });
            localStorage.setItem('voted_mex_eng', 'true');
            setHasVoted(true);
        } catch (error) {
            console.error("Error al registrar el voto:", error);
        }
    };

    const mexPercent = totalVotes > 0 ? Math.round((votes.mexico / totalVotes) * 100) : 0;
    const engPercent = totalVotes > 0 ? Math.round((votes.inglaterra / totalVotes) * 100) : 0;

    // Si el administrador o usuario decide cerrar por completo la encuesta
    if (!isOpen) return null;

    // VISTA ALTERNATIVA: Renderizado cuando la encuesta está minimizada
    if (isMinimized) {
        return (
            <button
                onClick={() => setIsMinimized(false)}
                className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 bg-slate-950 border border-slate-800 text-white px-4 py-3 rounded-full shadow-2xl hover:bg-slate-900 transition-all duration-300 animate-fade-in font-sans group border-emerald-500/20"
                title="Abrir encuesta de Octavos"
            >
                <BarChart2 size={16} className="text-emerald-400 animate-pulse" />
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-200 group-hover:text-emerald-400 transition-colors">
                    Ver Encuesta 🇲🇽 vs 🏴󠁧󠁢󠁥󠁮󠁧󠁿
                </span>
            </button>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 w-80 bg-slate-950 border border-slate-800 text-white p-5 rounded-[2rem] shadow-2xl animate-fade-in font-sans">
            {/* CABECERA */}
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900">
                <div className="flex items-center gap-2">
                    <Trophy size={16} className="text-amber-400 animate-bounce" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Encuesta En Vivo</span>
                </div>

                {/* BOTONES DE CONTROL (MINIMIZAR Y CERRAR) */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(true)}
                        className="text-slate-500 hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
                        title="Minimizar"
                    >
                        <Minus size={14} />
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded-full hover:bg-white/5 transition-colors"
                        title="Cerrar permanentemente"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>

            {/* PREGUNTA PRINCIPAL */}
            <h4 className="text-sm font-black uppercase tracking-tight leading-snug text-slate-100 mb-1">
                ¿Quién avanzará a Cuartos de Final del Mundial?
            </h4>

            {/* NUEVO: MENSAJE DE ENCUESTA ANÓNIMA */}
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-4 block select-none">
                🔒 Voto 100% anónimo y confidencial
            </p>

            {/* VISTA 1: FORMULARIO DE VOTACIÓN */}
            {!hasVoted ? (
                <div className="space-y-2.5">
                    <button
                        onClick={() => handleVote('mexico')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xl font-bold text-xs uppercase tracking-wider text-emerald-400 hover:bg-emerald-600 hover:text-white hover:border-emerald-500 shadow-md transition-all group active:scale-98"
                    >
                        <span>🇲🇽 México</span>
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] tracking-widest font-black transition-opacity">Votar</span>
                    </button>

                    <button
                        onClick={() => handleVote('inglaterra')}
                        className="w-full flex items-center justify-between px-4 py-3 bg-slate-900/50 border border-slate-800 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-300 hover:bg-white hover:text-slate-950 hover:border-white shadow-md transition-all group active:scale-98"
                    >
                        <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra</span>
                        <span className="opacity-0 group-hover:opacity-100 text-[10px] tracking-widest font-black transition-opacity">Votar</span>
                    </button>
                </div>
            ) : (
                /* VISTA 2: RESULTADOS EN TIEMPO REAL */
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-200">
                            <span>🇲🇽 México</span>
                            <span className="font-mono font-black text-emerald-400">{mexPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-500 ease-out"
                                style={{ width: `${mexPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-slate-200">
                            <span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 Inglaterra</span>
                            <span className="font-mono font-black text-indigo-400">{engPercent}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                            <div
                                className="h-full bg-indigo-500 transition-all duration-500 ease-out"
                                style={{ width: `${engPercent}%` }}
                            ></div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <div className="flex items-center gap-1.5">
                            <BarChart2 size={12} />
                            <span>{totalVotes.toLocaleString()} votos</span>
                        </div>
                        <button
                            onClick={() => setIsMinimized(true)}
                            className="hover:text-emerald-400 transition-colors underline cursor-pointer"
                        >
                            Ocultar resultados
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}