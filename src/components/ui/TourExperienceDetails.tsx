import React from 'react';
import { Check, Clock3, Sparkles, Tag, X } from 'lucide-react';

interface Props {
    duration?: string;
    category?: string;
    highlights?: string[];
    includes?: string[];
    notIncludes?: string[];
}

const TourExperienceDetails: React.FC<Props> = ({
    duration = '',
    category = '',
    highlights = [],
    includes = [],
    notIncludes = [],
}) => {
    const sections = [
        { title: 'Lo más destacado', items: highlights, icon: Sparkles, tone: 'violet' as const },
        { title: 'Incluye', items: includes, icon: Check, tone: 'emerald' as const },
        { title: 'No incluye', items: notIncludes, icon: X, tone: 'amber' as const },
    ].filter((section) => section.items.length > 0);

    if (!duration && !category && sections.length === 0) return null;

    return (
        <section aria-labelledby="tour-experience-title" className="overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_18px_55px_-38px_rgba(15,23,42,0.35)]">
            <div className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-br from-violet-50 via-white to-cyan-50 px-5 py-6 sm:px-8 sm:py-8">
                <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-violet-200/30 blur-3xl" aria-hidden="true" />
                <div className="relative">
                    <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-violet-700">Tu experiencia, en breve</p>
                    <h2 id="tour-experience-title" className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">Detalles de la experiencia</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base">Todo lo que necesitas saber para disfrutar tu próxima aventura.</p>

                    {(duration || category) && (
                        <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {duration && <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-violet-100 text-violet-700"><Clock3 size={20} aria-hidden="true" /></span>
                                <span className="min-w-0"><span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Duración</span><span className="mt-0.5 block break-words font-bold text-slate-800">{duration}</span></span>
                            </div>}
                            {category && <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/90 bg-white/85 p-4 shadow-sm backdrop-blur-sm">
                                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-100 text-cyan-800"><Tag size={20} aria-hidden="true" /></span>
                                <span className="min-w-0"><span className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-400">Categoría</span><span className="mt-0.5 block break-words font-bold text-slate-800">{category}</span></span>
                            </div>}
                        </div>
                    )}
                </div>
            </div>

            {sections.length > 0 && <div className="grid gap-4 p-5 sm:p-7 lg:grid-cols-3">
                {sections.map(({ title, items, icon: Icon, tone }) => {
                    const styles = {
                        violet: 'bg-violet-100 text-violet-700 ring-violet-200',
                        emerald: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
                        amber: 'bg-amber-100 text-amber-700 ring-amber-200',
                    }[tone];
                    const bullet = {
                        violet: 'bg-violet-500',
                        emerald: 'bg-emerald-500',
                        amber: 'bg-amber-500',
                    }[tone];

                    return <section key={title} className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 sm:p-5">
                        <div className="flex items-center justify-between gap-3">
                            <h3 className="flex min-w-0 items-center gap-2.5 font-extrabold text-slate-800"><span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ring-1 ${styles}`}><Icon size={18} aria-hidden="true" /></span><span>{title}</span></h3>
                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-slate-500 ring-1 ring-slate-200">{items.length}</span>
                        </div>
                        <ul className="mt-4 space-y-3">
                            {items.map((item, index) => <li key={`${item}-${index}`} className="flex min-w-0 items-start gap-2.5 text-sm leading-relaxed text-slate-600"><span className={`mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full ${bullet}`} aria-hidden="true" /><span className="break-words">{item}</span></li>)}
                        </ul>
                    </section>;
                })}
            </div>}
        </section>
    );
};

export default TourExperienceDetails;
