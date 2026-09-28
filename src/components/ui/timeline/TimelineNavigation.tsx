import React, { useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';

export interface TimelineNavigationMilestone {
    id: number;
    date: string;
    shortTitle: string;
}

interface TimelineNavigationProps {
    milestones: TimelineNavigationMilestone[];
    activeIndex: number;
    onSelect: (index: number) => void;
}

function getYear(date: string) {
    return date.match(/\d{4}/)?.[0] ?? date;
}

function getLocation(shortTitle: string) {
    return shortTitle.replace(/^XOLO RUTA\s+/i, '');
}

export default function TimelineNavigation({ milestones, activeIndex, onSelect }: TimelineNavigationProps) {
    const activeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, [activeIndex]);

    const grouped = milestones.reduce<Record<string, { item: TimelineNavigationMilestone; index: number }[]>>((groups, item, index) => {
        const year = getYear(item.date);
        (groups[year] ??= []).push({ item, index });
        return groups;
    }, {});

    return (
        <nav aria-label="Cronología de Xolo Ruta" className="relative overflow-hidden rounded-[1.75rem] bg-slate-50 p-5 sm:p-7">
            <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-slate-50 to-transparent sm:hidden" />
            <div className="flex gap-7 overflow-x-auto pb-1 pr-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:justify-center sm:gap-10 sm:pr-0">
                {Object.entries(grouped).map(([year, items]) => (
                    <div key={year} className="shrink-0">
                        <p className="mb-3 text-xs font-black tracking-[0.2em] text-slate-400">{year}</p>
                        <div className="flex gap-2 sm:gap-3">
                            {items.map(({ item, index }) => {
                                const selected = activeIndex === index;
                                return (
                                    <button
                                        key={item.id}
                                        ref={selected ? activeRef : undefined}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        tabIndex={selected ? 0 : -1}
                                        onClick={() => onSelect(index)}
                                        onKeyDown={(event) => {
                                            if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                                                event.preventDefault();
                                                onSelect(Math.min(milestones.length - 1, index + 1));
                                            }
                                            if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                                                event.preventDefault();
                                                onSelect(Math.max(0, index - 1));
                                            }
                                        }}
                                        className={`group min-w-35 rounded-2xl border px-3 py-3 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 sm:min-w-40 ${selected ? 'border-brand-primary bg-white shadow-md shadow-brand-primary/10' : 'border-transparent bg-white/60 hover:border-slate-200 hover:bg-white'}`}
                                    >
                                        <span className={`mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${selected ? 'text-brand-primary' : 'text-slate-400'}`}>
                                            <MapPin size={12} aria-hidden="true" />
                                            {getLocation(item.shortTitle)}
                                        </span>
                                        <span className={`text-xs font-semibold ${selected ? 'text-slate-900' : 'text-slate-500'}`}>{item.date.replace(/,?\s+\d{4}/, '')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </nav>
    );
}
