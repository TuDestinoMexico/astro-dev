import React, { useState } from 'react';
import {
    format,
    addMonths,
    subMonths,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth,
    isSameDay,
    eachDayOfInterval,
    isWithinInterval,
    isBefore,
    isAfter,
    differenceInDays,
    startOfToday
} from 'date-fns';
import { es } from 'date-fns/locale';

export default function BookingCalendar() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [hoverDate, setHoverDate] = useState<Date | null>(null);

    const today = startOfToday();
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];

    const handleDateClick = (day: Date) => {
        // Bloqueo: Si es antes de hoy, no hacer nada
        if (isBefore(day, today)) return;

        // Bloqueo dinámico: Si ya hay checkIn pero no checkOut,
        // y el usuario hace clic en una fecha anterior al checkIn
        if (checkIn && !checkOut && isBefore(day, checkIn)) {
            setCheckIn(day); // Reiniciamos el check-in a la nueva fecha seleccionada
            return;
        }

        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(day);
            setCheckOut(null);
            return;
        }

        setCheckOut(day);
        setHoverDate(null);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    return (
        <div className="bg-white p-4 rounded-lg shadow-lg mx-auto w-full max-w-md mt-10">
            {/* Header del Calendario */}
            <div className="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center mb-2">
                <button onClick={prevMonth} className="hover:bg-indigo-700 py-1 px-2 rounded-xl">{'<'}</button>
                <h2 className="text-xl font-bold capitalize">
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h2>
                <button onClick={nextMonth} className="hover:bg-indigo-700 py-1 px-2 rounded-xl">{'>'}</button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {weekDays.map(day => (
                    <div key={day} className="text-gray-500 font-bold text-xs py-2">{day}</div>
                ))}
            </div>

            {/* Cuadrícula de días */}
            <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoverDate(null)}>
                {days.map((day) => {
                    // LÓGICA CLAVE: Una fecha está deshabilitada si:
                    // 1. Es anterior a hoy.
                    // 2. O si existe checkIn (y no checkOut) y la fecha es anterior al checkIn.
                    const isBeforeToday = isBefore(day, today);
                    const isBeforeCheckIn = checkIn && !checkOut && isBefore(day, checkIn);
                    const isDisabled = isBeforeToday || isBeforeCheckIn;

                    const effectiveCheckOut = checkOut || (checkIn && hoverDate && isAfter(hoverDate, checkIn) ? hoverDate : null);
                    const isSelectedStart = checkIn && isSameDay(day, checkIn);
                    const isSelectedEnd = effectiveCheckOut && isSameDay(day, effectiveCheckOut);
                    const isInRangeDay = checkIn && effectiveCheckOut && isWithinInterval(day, { start: checkIn, end: effectiveCheckOut });
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isHovering = hoverDate && isSameDay(day, hoverDate);

                    let nightCount = 0;
                    if (checkIn && isHovering && isAfter(day, checkIn) && !checkOut) {
                        nightCount = differenceInDays(day, checkIn);
                    }

                    // Clases dinámicas
                    let classes = "h-10 w-10 flex items-center justify-center rounded-xl text-sm transition-colors mx-auto relative z-10 ";
                    let wrapperClasses = "relative ";

                    if (isDisabled) {
                        classes += "text-gray-300 cursor-not-allowed";
                        wrapperClasses += "opacity-50 pointer-events-none"; // Bloquea interacción
                    } else {
                        classes += "cursor-pointer ";
                        if (isSelectedStart || isSelectedEnd) {
                            classes += "bg-indigo-600 text-white font-bold shadow-md";
                        } else if (isInRangeDay) {
                            classes += "bg-indigo-100 text-indigo-700 rounded-none";
                        } else if (!isCurrentMonth) {
                            classes += "text-gray-400";
                        } else {
                            classes += "text-gray-700 hover:bg-indigo-50 rounded-xl";
                        }
                    }

                    if (!isDisabled) {
                        if (isInRangeDay && !isSelectedStart && !isSelectedEnd) wrapperClasses += "bg-indigo-100 ";
                        if (isSelectedStart && effectiveCheckOut) wrapperClasses += "bg-gradient-to-r from-transparent to-indigo-100 ";
                        if (isSelectedEnd && checkIn) wrapperClasses += "bg-gradient-to-l from-transparent to-indigo-100 rounded-r-full ";
                    }

                    return (
                        <div
                            key={day.toString()}
                            onClick={() => !isDisabled && handleDateClick(day)}
                            onMouseEnter={() => !isDisabled && setHoverDate(day)}
                            className={wrapperClasses}
                        >
                            {/* Tooltip de noches */}
                            {!isDisabled && nightCount > 0 && !checkOut && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                                    <div className="bg-gray-800 text-white text-xs py-1 px-2 rounded shadow-lg whitespace-nowrap">
                                        {nightCount} {nightCount === 1 ? 'noche' : 'noches'}
                                    </div>
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-gray-800 mx-auto"></div>
                                </div>
                            )}

                            <button className={classes} type="button" disabled={isDisabled}>
                                {format(day, 'd')}
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Resumen de fechas */}
            <div className="mt-4 text-xs text-gray-500 text-center space-y-1">
                <p>Check-in: <span className="font-bold">{checkIn ? format(checkIn, 'dd MMM yyyy', { locale: es }) : '-'}</span></p>
                <p>Check-out: <span className="font-bold">{checkOut ? format(checkOut, 'dd MMM yyyy', { locale: es }) : (
                    checkIn && hoverDate && isAfter(hoverDate, checkIn)
                        ? <span className="text-gray-400 italic">{format(hoverDate, 'dd MMM yyyy', { locale: es })} </span>
                        : '-'
                )}</span></p>
                <p>Estadía: <span className="font-bold">
                    {checkIn && (checkOut || (hoverDate && isAfter(hoverDate, checkIn)))
                        ? (checkOut ? differenceInDays(checkOut, checkIn) : differenceInDays(hoverDate, checkIn))
                        : '0'}
                </span> noches</p>
            </div>
        </div>
    );
}