import React from 'react';
import { CalendarDays, MapPinned, Route } from 'lucide-react';

interface RouteSummaryProps {
    count: number;
    period: string;
}

export default function RouteSummary({ count, period }: RouteSummaryProps) {
    return (
        <div className="flex flex-col gap-4 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_12px_30px_-20px_rgba(15,23,42,0.45)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary/10 text-brand-primary">
                    <Route size={22} aria-hidden="true" />
                </span>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Nuestra ruta</p>
                    <p className="font-bold text-slate-900">Explora las ciudades que nos conectan</p>
                </div>
            </div>
            <div className="flex items-center gap-5 border-t border-slate-100 pt-4 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0">
                <div className="flex items-center gap-2 text-slate-600">
                    <MapPinned size={18} className="text-brand-primary" aria-hidden="true" />
                    <span><strong className="text-slate-900">{count}</strong> paradas</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                    <CalendarDays size={18} className="text-brand-primary" aria-hidden="true" />
                    <span>{period}</span>
                </div>
            </div>
        </div>
    );
}
