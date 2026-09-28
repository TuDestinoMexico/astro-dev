import React from 'react';
import { ArrowLeft, ArrowRight, MapPin } from 'lucide-react';
import type { Milestone } from './Timeline';

interface TimelineItemProps {
    item: Milestone;
    index: number;
    total: number;
    onPrevious: () => void;
    onNext: () => void;
}

function getLocation(title: string) {
    return title.replace(/^XOLO RUTA\s+/i, '');
}

export default function TimelineItem({ item, index, total, onPrevious, onNext }: TimelineItemProps) {
    return (
        <article className="h-full overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-5 shadow-[0_20px_45px_-25px_rgba(15,23,42,0.45)] sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-brand-primary">
                        <MapPin size={15} aria-hidden="true" />
                        <span>{getLocation(item.shortTitle)}</span>
                    </div>
                    <p className="text-sm font-semibold text-slate-400">{item.date}</p>
                </div>
                <div className="flex items-center gap-2" aria-label={`Hito ${index + 1} de ${total}`}>
                    <button type="button" onClick={onPrevious} disabled={index === 0} aria-label="Hito anterior" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-brand-primary hover:bg-brand-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-25">
                        <ArrowLeft size={18} aria-hidden="true" />
                    </button>
                    <button type="button" onClick={onNext} disabled={index === total - 1} aria-label="Hito siguiente" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-brand-primary hover:bg-brand-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:cursor-not-allowed disabled:opacity-25">
                        <ArrowRight size={18} aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Etapa {String(index + 1).padStart(2, '0')}</p>
                    <h1 className="max-w-xl text-3xl font-bold leading-tight tracking-tight text-slate-900 sm:text-4xl xl:text-[2.75rem]">{item.fullTitle}</h1>
                </div>
                <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{item.description}</p>
                <div className="relative overflow-hidden rounded-[1.5rem] border-4 border-white bg-slate-100 shadow-xl">
                    <img src={item.image} alt={`${item.shortTitle}: ${item.fullTitle}`} className="aspect-[16/9] w-full object-cover transition-transform duration-700 hover:scale-[1.03]" loading={index === 0 ? 'eager' : 'lazy'} />
                </div>
            </div>
        </article>
    );
}
