import React, { useId, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { format, addMonths, differenceInDays, isAfter, isBefore, isSameDay, startOfMonth, startOfToday, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker, type DateRange } from 'react-day-picker';
import 'react-day-picker/style.css';
import { CalendarDays, Info, User, Send, X } from 'lucide-react';
import { MinorAges } from './MinorAges';
import { useAccessibleDialog } from '../../hooks/useAccessibleDialog';

// Datos del buscador de la portada que llegan por URL. Son opcionales y solo precargan el formulario.
export interface BookingInitialSearch {
    entrada?: string;
    salida?: string;
    fecha?: string;
    adultos?: number;
    menores?: number;
    edades?: string[];
}

interface Props {
    hotelName: string;
    isSingleDate?: boolean; // Opcional para no romper Hoteles
    initialSearch?: BookingInitialSearch;
}

// Convierte YYYY-MM-DD a fecha local. Las fechas pasadas se ignoran.
const parseLocalDay = (value?: string): Date | undefined => {
    if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return isBefore(date, startOfToday()) ? undefined : date;
};

type BookingFormData = {
    nombre: string;
    adultos: number | '';
    menores: number;
    edadesMenores: string[];
};

import { calendarClassNames } from './calendarClassNames';


export default function BookingCalendar({ hotelName, isSingleDate = false, initialSearch }: Props) {
    // PRECARGA DESDE EL BUSCADOR (solo se usa en el primer render)
    const prefillCheckIn = parseLocalDay(isSingleDate ? initialSearch?.fecha : initialSearch?.entrada);
    const prefillCheckOut = isSingleDate ? undefined : parseLocalDay(initialSearch?.salida);
    const prefillRangeEnd = prefillCheckIn && prefillCheckOut && isAfter(prefillCheckOut, prefillCheckIn) ? prefillCheckOut : undefined;
    const hasPrefill = Boolean(prefillCheckIn);
    const prefillMenores = Math.min(6, Math.max(0, initialSearch?.menores ?? 0));

    // ESTADOS
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(prefillCheckIn ?? new Date()));
    const [checkIn, setCheckIn] = useState<Date | null>(prefillCheckIn ?? null);
    const [checkOut, setCheckOut] = useState<Date | null>(prefillRangeEnd ?? null);
    const [range, setRange] = useState<DateRange | undefined>(prefillCheckIn ? { from: prefillCheckIn, to: prefillRangeEnd } : undefined);
    const [isClosing, setIsClosing] = useState(false);
    const [formData, setFormData] = useState<BookingFormData>({
        nombre: '',
        adultos: initialSearch?.adultos ?? 2,
        menores: prefillMenores,
        edadesMenores: (initialSearch?.edades ?? []).slice(0, prefillMenores),
    });
    const [validationMessage, setValidationMessage] = useState('');
    // Día sobre el que está el cursor mientras se elige la salida (solo escritorio).
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    // Vista previa: solo cuando ya hay entrada y falta la salida, y el cursor está después de la entrada.
    const isChoosingCheckOut = !isSingleDate && Boolean(checkIn && !checkOut);
    const previewEnd = isChoosingCheckOut && hoverDate && checkIn && isAfter(hoverDate, checkIn) ? hoverDate : null;
    const selectedNights = !isSingleDate && checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
    const previewNights = previewEnd && checkIn ? differenceInDays(previewEnd, checkIn) : 0;
    const previewModifiers = {
        previewRange: (day: Date) => Boolean(previewEnd && checkIn && isAfter(day, checkIn) && isBefore(day, previewEnd)),
        previewEnd: (day: Date) => Boolean(previewEnd && isSameDay(day, previewEnd)),
    };
    const previewClassNames = {
        previewRange: '[&>button]:!bg-indigo-50 [&>button]:!text-indigo-700 [&>button]:rounded-none',
        previewEnd: '[&>button]:!bg-indigo-100 [&>button]:!text-indigo-800 [&>button]:ring-2 [&>button]:ring-indigo-400',
    };
    const formatNoches = (noches: number) => `${noches} ${noches === 1 ? 'noche' : 'noches'} · ${noches + 1} ${noches + 1 === 1 ? 'día' : 'días'}`;
    const handleDayHover = (day: Date) => {
        if (isChoosingCheckOut) setHoverDate(day);
    };
    const clearHover = () => setHoverDate(null);

    const titleId = useId();
    const fieldPrefix = useId();
    const overlayRef = useRef<HTMLDivElement>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const calendarViewportRef = useRef<HTMLDivElement>(null);
    const footerRef = useRef<HTMLDivElement>(null);
    const monthDirectionRef = useRef<'next' | 'previous'>('next');
    const today = startOfToday();
    const firstMonth = startOfMonth(today);
    const lastMonth = startOfMonth(addMonths(today, 24));
    const lastVisibleMonth = startOfMonth(subMonths(lastMonth, 1));
    const lastAllowedMonth = isSingleDate ? lastMonth : lastVisibleMonth;

    const handleEdadChange = (index: number, edad: string) => {
        const nuevasEdades = [...formData.edadesMenores];
        nuevasEdades[index] = edad;
        setFormData({ ...formData, edadesMenores: nuevasEdades });
    };

    const isValidMinorAge = (edad: string) => {
        if (edad.trim() === '') return false;

        const parsed = Number(edad);
        return Number.isInteger(parsed) && parsed >= 0 && parsed <= 17;
    };

    const handleMenoresChange = (cantidad: number) => {
        const num = Math.max(0, cantidad);
        // Ajustamos el arreglo de edades para que coincida con la cantidad
        const nuevasEdades = [...formData.edadesMenores];
        if (num > nuevasEdades.length) {
            // Si aumenta, añadimos espacios vacíos
            for (let i = nuevasEdades.length; i < num; i++) nuevasEdades.push("");
        } else {
            // Si disminuye, recortamos
            nuevasEdades.splice(num);
        }
        setFormData({ ...formData, menores: num, edadesMenores: nuevasEdades });
    };

    const normalizeAdultos = (value: string): number | '' => {
        if (value.trim() === '') return '';

        const parsed = Number(value);
        return Number.isInteger(parsed) && parsed >= 1 ? parsed : '';
    };

    const closeCalendar = () => {
        if (!isCalendarOpen || isClosing) return;
        setIsClosing(true);

        const isMobile = window.matchMedia('(max-width: 639px)').matches;
        const timeline = gsap.timeline({
            defaults: { ease: 'power2.in' },
            onComplete: () => {
                setIsCalendarOpen(false);
                setIsClosing(false);
            }
        });

        timeline.to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0);
        timeline.to(dialogRef.current, {
            y: isMobile ? '100%' : 18,
            scale: isMobile ? 1 : 0.98,
            opacity: 0,
            duration: 0.24
        }, 0);
    };

    const { dialogRef } = useAccessibleDialog({ open: isCalendarOpen, onClose: closeCalendar });

    useGSAP(() => {
        if (!isCalendarOpen || !dialogRef.current) return;

        const media = gsap.matchMedia();
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        gsap.set(overlayRef.current, { opacity: 0 });
        gsap.set(dialogRef.current, { opacity: 0 });

        if (reducedMotion) {
            gsap.set([overlayRef.current, dialogRef.current], { clearProps: 'all', opacity: 1, y: 0, scale: 1 });
        } else {
            gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' });
            media.add('(max-width: 639px)', () => {
                gsap.fromTo(dialogRef.current, { y: '100%', opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
            });
            media.add('(min-width: 640px)', () => {
                gsap.fromTo(dialogRef.current, { y: 24, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: 'power3.out' });
            });
            gsap.fromTo(
                [summaryRef.current, calendarViewportRef.current, footerRef.current],
                { y: 8, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: 'power2.out', delay: 0.12 }
            );
        }

        return () => media.revert();
    }, { dependencies: [isCalendarOpen], scope: dialogRef });

    useGSAP(() => {
        if (!isCalendarOpen || !calendarViewportRef.current) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const direction = monthDirectionRef.current === 'next' ? 14 : -14;

        if (reducedMotion) {
            gsap.set(calendarViewportRef.current, { clearProps: 'all' });
            return;
        }

        gsap.fromTo(calendarViewportRef.current,
            { x: direction, opacity: 0.55 },
            { x: 0, opacity: 1, duration: 0.24, ease: 'power2.out' }
        );
    }, { dependencies: [currentMonth], scope: calendarViewportRef });

    useGSAP(() => {
        if (!isCalendarOpen || !summaryRef.current) return;
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reducedMotion) return;

        gsap.fromTo(summaryRef.current,
            { y: 5, opacity: 0.7 },
            { y: 0, opacity: 1, duration: 0.24, ease: 'power2.out' }
        );
    }, { dependencies: [checkIn, checkOut], scope: summaryRef });

    const handleRangeSelect = (nextRange: DateRange | undefined) => {
        setRange(nextRange);
        setCheckIn(nextRange?.from || null);
        setCheckOut(nextRange?.to || null);
    };

    const handleSingleDateSelect = (date: Date | undefined) => {
        setCheckIn(date || null);
        setCheckOut(null);
    };

    const clearDates = () => {
        setRange(undefined);
        setCheckIn(null);
        setCheckOut(null);
    };

    const goToPreviousMonth = () => {
        monthDirectionRef.current = 'previous';
        setCurrentMonth((month) => isAfter(month, firstMonth) ? subMonths(month, 1) : month);
    };

    const goToNextMonth = () => {
        monthDirectionRef.current = 'next';
        setCurrentMonth((month) => isBefore(month, lastAllowedMonth) ? addMonths(month, 1) : month);
    };

    const canGoPrevious = isAfter(currentMonth, firstMonth);
    const canGoNext = isBefore(currentMonth, lastAllowedMonth);
    const canApplyDates = isSingleDate ? Boolean(checkIn) : Boolean(checkIn && checkOut);
    const hasValidAdults = typeof formData.adultos === 'number' && Number.isInteger(formData.adultos) && formData.adultos >= 1;
    const hasValidChildren = Number.isInteger(formData.menores) && formData.menores >= 0;
    const hasValidChildrenAges = formData.menores === 0 || (
        formData.edadesMenores.length === formData.menores &&
        formData.edadesMenores.every(isValidMinorAge)
    );
    const hasOutOfRangeMinorAge = formData.edadesMenores.some((edad) => {
        if (edad.trim() === '') return false;

        const parsed = Number(edad);
        return !Number.isInteger(parsed) || parsed < 0 || parsed > 17;
    });
    const canSendWhatsApp = Boolean(
        formData.nombre.trim() &&
        canApplyDates &&
        hasValidAdults &&
        hasValidChildren &&
        hasValidChildrenAges
    );

    const openCalendar = () => {
        if (checkIn) setCurrentMonth(startOfMonth(checkIn));
        setIsClosing(false);
        setIsCalendarOpen(true);
    };

    const applyDates = () => {
        if (canApplyDates) closeCalendar();
    };

    const sendWhatsApp = () => {
        if (!canSendWhatsApp) {
            setValidationMessage('Completa tu nombre, las fechas, el número de adultos y las edades de los menores antes de continuar.');
            return;
        }

        setValidationMessage('');

        const noches = checkOut ? differenceInDays(checkOut, checkIn!) : 0;

        // Mensaje dinámico según el tipo
        const infoFechas = isSingleDate
            ? `📅 *Fecha del Tour:* ${format(checkIn!, 'dd/MM/yyyy')}`
            : `📅 *Fechas:* ${format(checkIn!, 'dd/MM')} al ${format(checkOut!, 'dd/MM')}\n🌙 *Noches:* ${noches}`;

        const mensaje = encodeURIComponent(
            `¡Hola Tu Destino México! 👋\n\n` +
            `${isSingleDate ? 'Me interesa el tour' : 'Me interesa reservar el hotel'}: *${hotelName}*\n` +
            `──────────────────────────\n` +
            `👤 *Nombre:* ${formData.nombre}\n` +
            `${infoFechas}\n` +
            `👥 *Pax:* ${Number(formData.adultos)} Adultos, ${formData.menores} Menores` +
            (formData.menores > 0 ? `\n👶 *Edades:* ${formData.edadesMenores.join(', ')}` : '')
        );

        window.open(`https://wa.me/529987141365?text=${mensaje}`, '_blank');
    };

    return (
        <div className="w-full space-y-4">
            {hasPrefill && (
                <p className="rounded-xl bg-indigo-50 px-4 py-3 text-xs font-semibold leading-5 text-indigo-900">
                    Cargamos los datos de tu búsqueda. Revisa fechas y viajeros antes de enviar tu solicitud.
                </p>
            )}

            {/* 1. Resumen de fechas */}
            <div className="w-full">
                <div className={`grid ${isSingleDate ? 'grid-cols-1' : 'grid-cols-2'} gap-px overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-200 shadow-sm`}>
                    <button type="button" onClick={openCalendar} className="cursor-pointer bg-white p-4 text-left transition-colors hover:bg-indigo-50/40" aria-label="Seleccionar fecha de entrada">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{isSingleDate ? 'Fecha del tour' : 'Check-in'}</p>
                        <p className={`mt-1 text-sm font-black ${checkIn ? 'text-slate-800' : 'text-slate-400'}`}>
                            {checkIn ? format(checkIn, 'dd MMM yyyy', { locale: es }) : 'Seleccionar'}
                        </p>
                    </button>
                    {!isSingleDate && (
                        <button type="button" onClick={openCalendar} className="cursor-pointer border-l border-slate-100 bg-white p-4 text-left transition-colors hover:bg-indigo-50/40" aria-label="Seleccionar fecha de salida">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Check-out</p>
                            <p className={`mt-1 text-sm font-black ${checkOut ? 'text-slate-800' : 'text-slate-400'}`}>
                                {checkOut ? format(checkOut, 'dd MMM yyyy', { locale: es }) : 'Seleccionar'}
                            </p>
                        </button>
                    )}
                </div>
            </div>

            {/* 2. Modal independiente del contenedor */}
            {isCalendarOpen && typeof document !== 'undefined' && createPortal(
                <div
                    ref={overlayRef}
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:p-6"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) closeCalendar();
                    }}
                >
                    <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-2xl sm:max-h-[min(860px,92vh)] sm:rounded-[2.25rem]">
                        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50/90 px-5 py-5 sm:px-8 sm:py-6">
                            <div className="flex items-start gap-3">
                                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                                    <CalendarDays size={19} />
                                </div>
                                <div>
                                    <h2 id={titleId} className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                                        {isSingleDate ? 'Selecciona la fecha' : 'Selecciona tu estancia'}
                                    </h2>
                                    <p className="mt-1 text-xs font-medium text-slate-500 sm:text-sm">
                                        {isSingleDate ? 'Elige la fecha de tu tour' : checkIn && !checkOut ? 'Ahora selecciona la fecha de salida' : 'Elige entrada y salida para continuar'}
                                    </p>
                                </div>
                            </div>
                            <button type="button" onClick={closeCalendar} aria-label="Cerrar calendario" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="min-h-0 flex-1 overflow-y-auto bg-white px-4 py-4 sm:px-8 sm:py-6">
                            {/* Instrucciones compactas: cómo elegir fechas según el tipo de reserva */}
                            <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                <p className="flex items-start gap-2 text-xs font-semibold leading-5 text-slate-600">
                                    <Info size={14} className="mt-0.5 shrink-0 text-indigo-500" aria-hidden="true" />
                                    {isSingleDate ? (
                                        <span>Toca el día de tu tour. Solo necesitas una fecha.</span>
                                    ) : (
                                        <span>
                                            <span className="sm:hidden">Toca entrada y salida. Verás las noches al elegir.</span>
                                            <span className="hidden sm:inline">Toca tu día de entrada y luego el de salida. Al pasar el cursor verás las noches.</span>
                                        </span>
                                    )}
                                </p>
                                {!isSingleDate && (
                                    <ol className="flex shrink-0 items-center gap-2 text-[10px] font-black uppercase tracking-widest" aria-label="Pasos para reservar">
                                        <li className={`rounded-full px-2.5 py-1 ${!checkIn ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-600 ring-1 ring-indigo-200'}`}>1 Entrada</li>
                                        <li className={`rounded-full px-2.5 py-1 ${checkIn && !checkOut ? 'bg-indigo-600 text-white' : 'bg-white text-slate-400 ring-1 ring-slate-200'}`}>2 Salida</li>
                                    </ol>
                                )}
                            </div>

                            <div ref={summaryRef} className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-indigo-100 bg-indigo-50/70 px-4 py-3 sm:px-5">
                                <div className="min-w-0">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500">{isSingleDate ? 'Fecha seleccionada' : 'Fechas seleccionadas'}</p>
                                    <p className="mt-1 truncate text-sm font-black text-indigo-950 sm:text-base">
                                        {isSingleDate && checkIn
                                            ? format(checkIn, 'dd MMMM yyyy', { locale: es })
                                            : !isSingleDate && checkIn && (checkOut || previewEnd)
                                                ? `${format(checkIn, 'dd MMM', { locale: es })} → ${format((checkOut || previewEnd)!, 'dd MMM yyyy', { locale: es })}`
                                                : !isSingleDate && checkIn
                                                    ? `${format(checkIn, 'dd MMM yyyy', { locale: es })} → Elige tu salida`
                                                    : 'Aún no has seleccionado fechas'}
                                    </p>
                                </div>
                                {!isSingleDate && (checkOut || previewEnd) && (
                                    <span
                                        className={`shrink-0 rounded-xl px-3 py-2 text-xs font-black tabular-nums shadow-sm ${previewEnd ? 'border border-dashed border-indigo-400 bg-white text-indigo-500' : 'bg-white text-indigo-700'}`}
                                        aria-live="polite"
                                    >
                                        {formatNoches(previewEnd ? previewNights : selectedNights)}
                                    </span>
                                )}
                            </div>

                            <div ref={calendarViewportRef} className="space-y-4">
                            <div className="flex items-center justify-between gap-3 px-1">
                                <button type="button" onClick={goToPreviousMonth} disabled={!canGoPrevious} aria-label="Mes anterior" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-2xl font-black text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-25">‹</button>
                                <div className="flex flex-1 items-center justify-center gap-3 text-center sm:gap-10">
                                    <span className="text-base font-black capitalize text-slate-900 sm:text-lg">{format(currentMonth, 'MMMM yyyy', { locale: es })}</span>
                                    {!isSingleDate && <span className="hidden text-base font-black capitalize text-slate-400 sm:inline sm:text-lg">{format(addMonths(currentMonth, 1), 'MMMM yyyy', { locale: es })}</span>}
                                </div>
                                <button type="button" onClick={goToNextMonth} disabled={!canGoNext} aria-label="Mes siguiente" className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 text-2xl font-black text-indigo-600 transition-all hover:border-indigo-200 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-25">›</button>
                            </div>

                            {isSingleDate ? (
                                <DayPicker mode="single" locale={es} month={currentMonth} onMonthChange={setCurrentMonth} selected={checkIn || undefined} onSelect={handleSingleDateSelect} disabled={{ before: today }} startMonth={firstMonth} endMonth={addMonths(today, 24)} fixedWeeks showOutsideDays={false} classNames={calendarClassNames} />
                            ) : (
                                <>
                                    <div className="hidden md:block">
                                        <DayPicker mode="range" locale={es} numberOfMonths={2} month={currentMonth} onMonthChange={setCurrentMonth} selected={range} onSelect={handleRangeSelect} onDayMouseEnter={handleDayHover} onDayMouseLeave={clearHover} modifiers={previewModifiers} modifiersClassNames={previewClassNames} min={1} disabled={{ before: today }} startMonth={firstMonth} endMonth={addMonths(today, 24)} fixedWeeks showOutsideDays={false} classNames={calendarClassNames} />
                                    </div>
                                    <div className="md:hidden">
                                        <DayPicker mode="range" locale={es} month={currentMonth} onMonthChange={setCurrentMonth} selected={range} onSelect={handleRangeSelect} onDayMouseEnter={handleDayHover} onDayMouseLeave={clearHover} modifiers={previewModifiers} modifiersClassNames={previewClassNames} min={1} disabled={{ before: today }} startMonth={firstMonth} endMonth={addMonths(today, 24)} fixedWeeks showOutsideDays={false} classNames={calendarClassNames} />
                                    </div>
                                </>
                            )}
                            </div>
                        </div>

                        <div ref={footerRef} className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/90 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
                            <button type="button" onClick={clearDates} disabled={!checkIn && !checkOut} className="cursor-pointer py-2 text-sm font-bold text-slate-500 transition-colors hover:text-slate-800 disabled:cursor-not-allowed disabled:opacity-35 sm:px-3">Limpiar fechas</button>
                            <button type="button" onClick={applyDates} disabled={!canApplyDates} className="w-full cursor-pointer rounded-xl bg-indigo-600 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-indigo-600/20 transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">Aplicar fechas</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 3. FORMULARIO PERMANENTE - Sigue debajo del contenedor anterior */}
            <div className="space-y-3">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <label htmlFor={`${fieldPrefix}-name`} className="sr-only">Nombre completo</label>
                    <input
                        id={`${fieldPrefix}-name`}
                        type="text" placeholder="Nombre completo"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-sm"
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative bg-white border-2 border-slate-50 rounded-2xl p-3 shadow-sm">
                        <label htmlFor={`${fieldPrefix}-adults`} className="block text-[9px] font-black text-slate-400 uppercase">Adultos</label>
                        <input
                            id={`${fieldPrefix}-adults`}
                            type="number" min="1" step="1" inputMode="numeric" value={formData.adultos}
                            onChange={e => setFormData({...formData, adultos: normalizeAdultos(e.target.value)})}
                            className="w-full text-sm font-bold outline-none bg-transparent"
                        />
                    </div>
                    <div className="relative bg-white border-2 border-slate-50 rounded-2xl p-3 shadow-sm">
                        <label htmlFor={`${fieldPrefix}-children`} className="block text-[9px] font-black text-slate-400 uppercase">Menores</label>
                        <input
                            id={`${fieldPrefix}-children`}
                            type="number" min="0" value={formData.menores}
                            onChange={e => handleMenoresChange(parseInt(e.target.value) || 0)}
                            className="w-full text-sm font-bold outline-none bg-transparent"
                        />
                    </div>
                    <MinorAges
                        count={formData.menores}
                        ages={formData.edadesMenores}
                        onChange={handleEdadChange}
                    />
                </div>

                {hasOutOfRangeMinorAge && (
                    <p role="alert" aria-live="assertive" className="text-sm font-semibold text-red-600">
                        Las edades de los menores deben estar entre 0 y 17 años.
                    </p>
                )}

                {validationMessage && (
                    <p role="alert" aria-live="assertive" className="text-sm font-semibold text-red-600">
                        {validationMessage}
                    </p>
                )}

                <button
                    type="button"
                    onClick={sendWhatsApp}
                    disabled={!canSendWhatsApp}
                    aria-disabled={!canSendWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-green-100 transition-all active:scale-95 group disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <Send size={18} className="group-hover:translate-x-1" />
                    Reservar por WhatsApp
                </button>
            </div>
        </div>
    );
}
