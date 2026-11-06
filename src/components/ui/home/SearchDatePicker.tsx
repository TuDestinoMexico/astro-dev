import { useEffect, useRef, useState } from 'react';
import type { MouseEvent } from 'react';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { addMonths, format, isAfter, isBefore, startOfMonth, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { calendarClassNames } from '../calendarClassNames';

interface Props {
    // "range" para hotel (entrada y salida) o "single" para tour (una fecha).
    mode: 'range' | 'single';
    // Fechas en formato YYYY-MM-DD, igual que el resto del buscador.
    from: string;
    to: string;
    onChange: (from: string, to: string) => void;
}

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const toIso = (date?: Date) => (date ? format(date, 'yyyy-MM-dd') : '');

const fromIso = (value: string) => {
    if (!ISO_DAY.test(value)) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

const shortDate = (date?: Date) => (date ? format(date, "d MMM yyyy", { locale: es }) : '');

// Calendario del buscador: mismo estilo que la reserva de la ficha, en un modal con "Aplicar fechas".
export default function SearchDatePicker({ mode, from, to, onChange }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const today = startOfToday();
    const firstMonth = startOfMonth(today);
    const lastAllowedMonth = addMonths(firstMonth, 23);

    const [draftRange, setDraftRange] = useState<DateRange | undefined>(undefined);
    const [draftDate, setDraftDate] = useState<Date | undefined>(undefined);
    const [currentMonth, setCurrentMonth] = useState(firstMonth);
    const [isDesktop, setIsDesktop] = useState(false);

    // Dos meses en escritorio para rangos, uno en móvil.
    useEffect(() => {
        const media = window.matchMedia('(min-width: 768px)');
        const update = () => setIsDesktop(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    const openCalendar = () => {
        const start = fromIso(from);
        const end = fromIso(to);
        setDraftRange(start ? { from: start, to: end } : undefined);
        setDraftDate(start);
        setCurrentMonth(startOfMonth(start ?? today));
        dialogRef.current?.showModal();
    };

    const closeCalendar = () => dialogRef.current?.close();

    // Un clic sobre el fondo del modal (fuera de su caja) lo cierra.
    const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
        if (event.target === dialogRef.current) closeCalendar();
    };

    const canGoPrevious = isAfter(currentMonth, firstMonth);
    const canGoNext = isBefore(currentMonth, lastAllowedMonth);
    const canApply = mode === 'single' ? Boolean(draftDate) : Boolean(draftRange?.from && draftRange?.to);

    const applyDates = () => {
        if (!canApply) return;
        if (mode === 'single') {
            onChange(toIso(draftDate), '');
        } else {
            onChange(toIso(draftRange?.from), toIso(draftRange?.to));
        }
        closeCalendar();
    };

    const clearDates = () => {
        setDraftRange(undefined);
        setDraftDate(undefined);
    };

    const startDate = fromIso(from);
    const endDate = fromIso(to);

    const triggerClass = 'flex h-full cursor-pointer flex-col justify-center bg-white px-4 py-1.5 text-left transition-colors hover:bg-indigo-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-purple-800/60';

    return (
        <>
            {mode === 'range' ? (
                <div className="grid h-14 grid-cols-2 gap-px overflow-hidden rounded-card border border-brand-border bg-brand-border">
                    <button type="button" onClick={openCalendar} className={triggerClass} aria-label="Elegir fecha de entrada">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-brand-muted">Entrada</span>
                        <span className={`mt-1 block truncate text-sm font-bold ${startDate ? 'text-brand-ink' : 'text-slate-400'}`}>
                            {startDate ? shortDate(startDate) : 'Seleccionar'}
                        </span>
                    </button>
                    <button type="button" onClick={openCalendar} className={triggerClass} aria-label="Elegir fecha de salida">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-brand-muted">Salida</span>
                        <span className={`mt-1 block truncate text-sm font-bold ${endDate ? 'text-brand-ink' : 'text-slate-400'}`}>
                            {endDate ? shortDate(endDate) : 'Seleccionar'}
                        </span>
                    </button>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={openCalendar}
                    className="flex h-14 w-full cursor-pointer items-center justify-between gap-3 rounded-card border border-brand-border bg-white px-4 py-3 text-left text-base font-semibold md:text-sm transition hover:border-brand-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                    aria-label="Elegir fecha del tour"
                >
                    <span className={startDate ? 'text-brand-ink' : 'text-slate-400'}>
                        {startDate ? shortDate(startDate) : 'Seleccionar fecha'}
                    </span>
                    <CalendarDays size={16} aria-hidden="true" className="shrink-0 text-brand-muted" />
                </button>
            )}

            <dialog
                ref={dialogRef}
                aria-label={mode === 'range' ? 'Elige tus fechas de estancia' : 'Elige la fecha del tour'}
                onClick={handleBackdropClick}
                onClose={() => setDraftRange(undefined)}
                className="m-auto w-[calc(100%-2rem)] max-w-3xl rounded-panel border border-brand-border bg-white p-0 text-brand-ink shadow-card-hover backdrop:bg-brand-ink/60"
            >
                <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5 sm:px-8">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-muted">
                            {mode === 'range' ? 'Estancia' : 'Fecha del tour'}
                        </p>
                        <p className="text-lg font-black capitalize tracking-tight">
                            {mode === 'range' ? 'Elige tus fechas' : 'Elige el día'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={closeCalendar}
                        className="rounded-full px-3 py-1.5 text-xs font-bold text-brand-muted transition hover:bg-brand-surface hover:text-brand-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/40"
                    >
                        Cerrar
                    </button>
                </div>

                <div className="space-y-4 px-5 pb-4 sm:px-8">
                    <div className="flex items-center justify-between gap-3 px-1">
                        <button
                            type="button"
                            onClick={() => canGoPrevious && setCurrentMonth((month) => addMonths(month, -1))}
                            disabled={!canGoPrevious}
                            aria-label="Mes anterior"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-brand-border text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-25"
                        >
                            <ChevronLeft size={18} aria-hidden="true" />
                        </button>
                        <span className="text-base font-black capitalize text-brand-ink sm:text-lg">
                            {format(currentMonth, 'MMMM yyyy', { locale: es })}
                        </span>
                        <button
                            type="button"
                            onClick={() => canGoNext && setCurrentMonth((month) => addMonths(month, 1))}
                            disabled={!canGoNext}
                            aria-label="Mes siguiente"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-brand-border text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-25"
                        >
                            <ChevronRight size={18} aria-hidden="true" />
                        </button>
                    </div>

                    <div className="flex justify-center">
                        {mode === 'range' ? (
                            <DayPicker
                                mode="range"
                                locale={es}
                                numberOfMonths={isDesktop ? 2 : 1}
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                selected={draftRange}
                                onSelect={setDraftRange}
                                min={1}
                                disabled={{ before: today }}
                                startMonth={firstMonth}
                                endMonth={lastAllowedMonth}
                                fixedWeeks
                                showOutsideDays={false}
                                classNames={calendarClassNames}
                            />
                        ) : (
                            <DayPicker
                                mode="single"
                                locale={es}
                                month={currentMonth}
                                onMonthChange={setCurrentMonth}
                                selected={draftDate}
                                onSelect={setDraftDate}
                                disabled={{ before: today }}
                                startMonth={firstMonth}
                                endMonth={lastAllowedMonth}
                                fixedWeeks
                                showOutsideDays={false}
                                classNames={calendarClassNames}
                            />
                        )}
                    </div>
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-brand-border bg-brand-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                    <button
                        type="button"
                        onClick={clearDates}
                        className="cursor-pointer py-2 text-sm font-bold text-brand-muted transition-colors hover:text-brand-ink sm:px-3"
                    >
                        Limpiar fechas
                    </button>
                    <button
                        type="button"
                        onClick={applyDates}
                        disabled={!canApply}
                        className="w-full cursor-pointer rounded-card bg-indigo-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                    >
                        Aplicar fechas
                    </button>
                </div>
            </dialog>
        </>
    );
}
