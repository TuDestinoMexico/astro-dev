import React, { useState, useMemo, useRef, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, eachDayOfInterval, isWithinInterval, isBefore, isAfter, differenceInDays, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar as CalendarIcon, User, Send, Users, ChevronDown } from 'lucide-react';
import { MinorAges } from './MinorAges';

interface Props {
    hotelName: string;
    isSingleDate?: boolean; // Opcional para no romper Hoteles
}


const getDayStatus = (day: Date) => {
    const today = startOfToday();
    const simulationEnd = addMonths(today, 3);
    if (isAfter(day, simulationEnd)) return null;
    const dayOfWeek = day.getDay();
    if (dayOfWeek === 2 || dayOfWeek === 3) return 'cheap';
    if (dayOfWeek === 5 || dayOfWeek === 6) return 'high-demand';
    return 'standard';
};

export default function BookingCalendar({ hotelName, isSingleDate = false }: Props) {
    // ESTADOS
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [checkIn, setCheckIn] = useState<Date | null>(null);
    const [checkOut, setCheckOut] = useState<Date | null>(null);
    const [formData, setFormData] = useState({ nombre: '', adultos: 2, menores: 0, edadesMenores: [] as string[] });

    // Actualizamos la referencia al nuevo contenedor relativo
    const calendarContainerRef = useRef<HTMLDivElement>(null);
    const today = startOfToday();

    const handleEdadChange = (index: number, edad: string) => {
        const nuevasEdades = [...formData.edadesMenores];
        nuevasEdades[index] = edad;
        setFormData({ ...formData, edadesMenores: nuevasEdades });
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

    // Cerrar al hacer clic fuera del widget
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarContainerRef.current && !calendarContainerRef.current.contains(event.target as Node)) {
                setIsCalendarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const days = useMemo(() => {
        const start = startOfWeek(startOfMonth(currentMonth), { locale: es });
        const end = endOfWeek(endOfMonth(currentMonth), { locale: es });
        return eachDayOfInterval({ start, end });
    }, [currentMonth]);

    const handleDateClick = (day: Date) => {
        if (isBefore(day, today)) return;

        // LÓGICA PARA TOURS (Fecha única)
        if (isSingleDate) {
            setCheckIn(day);
            setCheckOut(null);
            setTimeout(() => setIsCalendarOpen(false), 300);
            return;
        }

        // LÓGICA PARA HOTELES (Se queda igual)
        if (!checkIn || (checkIn && checkOut)) {
            setCheckIn(day);
            setCheckOut(null);
        } else if (isBefore(day, checkIn)) {
            setCheckIn(day);
        } else {
            setCheckOut(day);
            setTimeout(() => setIsCalendarOpen(false), 300);
        }
    };

    const sendWhatsApp = () => {
        // Validación ajustada
        const isDatesSelected = isSingleDate ? checkIn : (checkIn && checkOut);
        if (!isDatesSelected || !formData.nombre) return alert("⚠️ Completa tus datos y fecha.");

        const noches = checkOut ? differenceInDays(checkOut, checkIn!) : 0;

        // Mensaje dinámico según el tipo
        const infoFechas = isSingleDate
            ? `📅 *Fecha del Tour:* ${format(checkIn!, 'dd/MM/yyyy')}`
            : `📅 *Fechas:* ${format(checkIn!, 'dd/MM')} al ${format(checkOut!, 'dd/MM')}\n🌙 *Noches:* ${noches}`;

        const mensaje = encodeURIComponent(
            `¡Hola Tu Destino México! 👋\n\n` +
            `Me interesa el tour: *${hotelName}*\n` +
            `──────────────────────────\n` +
            `👤 *Nombre:* ${formData.nombre}\n` +
            `${infoFechas}\n` +
            `👥 *Pax:* ${formData.adultos} Adultos, ${formData.menores} Menores` +
            (formData.menores > 0 ? `\n👶 *Edades:* ${formData.edadesMenores.join(', ')}` : '')
        );

        window.open(`https://wa.me/5219981234567?text=${mensaje}`, '_blank');
    };

    return (
        <div className="w-full space-y-4">

            {/* 1. DISPARADOR DE FECHAS Y CALENDARIO FLOTANTE EN UN CONTENEDOR RELATIVO */}
            <div className="relative w-full" ref={calendarContainerRef}>
                <div
                    onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                    className="grid grid-cols-2 gap-px bg-slate-200 border-2 border-slate-100 rounded-2xl overflow-hidden cursor-pointer hover:border-indigo-300 transition-all shadow-sm"
                >
                    <div className="bg-white p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Check-in</p>
                        <p className="text-sm font-bold text-slate-700">
                            {checkIn ? format(checkIn, 'dd MMM', { locale: es }) : 'Seleccionar'}
                        </p>
                    </div>
                    {!isSingleDate && (
                        <div className="bg-white p-4 border-l border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">Check-out</p>
                            <p className="text-sm font-bold text-slate-700">
                                {checkOut ? format(checkOut, 'dd MMM', { locale: es }) : 'Seleccionar'}
                            </p>
                        </div>
                    )}
                </div>

                {/* 2. EL CALENDARIO FLOTANTE - Posicionado respecto al contenedor anterior */}
                {isCalendarOpen && (
                    <div
                        className="absolute top-full left-0 mt-2 w-full z-[100] bg-white rounded-3xl shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200"
                        onClick={(e) => e.stopPropagation()} // Detener propagación
                    >
                        <div className="bg-indigo-600 p-4 rounded-t-3xl flex justify-between items-center text-white">
                            <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(subMonths(currentMonth, 1)) }} className="p-1 hover:bg-white/20 rounded-full">{'<'}</button>
                            <h2 className="text-sm font-black capitalize">{format(currentMonth, 'MMMM yyyy', { locale: es })}</h2>
                            <button onClick={(e) => { e.stopPropagation(); setCurrentMonth(addMonths(currentMonth, 1)) }} className="p-1 hover:bg-white/20 rounded-full">{'>'}</button>
                        </div>

                        <div className="p-4">
                            <div className="grid grid-cols-7 mb-2">
                                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(d => (
                                    <span key={d} className="text-[9px] font-black text-slate-300 text-center">{d}</span>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-y-1">
                                {days.map((day) => {
                                    const status = getDayStatus(day);
                                    const isSelectedStart = checkIn && isSameDay(day, checkIn);
                                    const isSelectedEnd = checkOut && isSameDay(day, checkOut);
                                    const isInRange = checkIn && checkOut && isWithinInterval(day, { start: checkIn, end: checkOut });
                                    const disabled = isBefore(day, today);
                                    const isCurrentMonth = isSameMonth(day, currentMonth);

                                    let containerClass = "h-10 w-full flex items-center justify-center relative ";
                                    if (isInRange && !isSelectedStart && !isSelectedEnd) containerClass += "bg-indigo-50/50";
                                    if (isSelectedStart && checkOut) containerClass += "bg-gradient-to-r from-transparent to-indigo-50 rounded-l-full";
                                    if (isSelectedEnd && checkIn) containerClass += "bg-gradient-to-l from-transparent to-indigo-100 rounded-r-full";

                                    return (
                                        <div key={day.toString()} className={containerClass}>
                                            <button
                                                // Aseguramos detener propagación al hacer clic en los días
                                                onClick={(e) => { e.stopPropagation(); !disabled && handleDateClick(day) }}
                                                className={`h-8 w-8 text-[10px] font-black rounded-lg z-10 transition-all flex flex-col items-center justify-center
                                                    ${disabled ? 'text-slate-100' : isSelectedStart || isSelectedEnd ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-600 hover:bg-indigo-50'}
                                                    ${!isCurrentMonth ? 'opacity-0 pointer-events-none' : ''}
                                                `}
                                            >
                                                {format(day, 'd')}
                                                {!disabled && isCurrentMonth && !isSelectedStart && !isSelectedEnd && status && (
                                                    <div className={`w-0.5 h-0.5 rounded-full mt-0.5 ${status === 'cheap' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                                )}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 3. FORMULARIO PERMANENTE - Sigue debajo del contenedor anterior */}
            <div className="space-y-3">
                <div className="relative group">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                    <input
                        type="text" placeholder="Nombre completo"
                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-50 rounded-2xl text-sm font-bold focus:border-indigo-500 outline-none transition-all shadow-sm"
                        onChange={e => setFormData({...formData, nombre: e.target.value})}
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="relative bg-white border-2 border-slate-50 rounded-2xl p-3 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Adultos</p>
                        <input
                            type="number" min="1" value={formData.adultos}
                            onChange={e => setFormData({...formData, adultos: parseInt(e.target.value)})}
                            className="w-full text-sm font-bold outline-none bg-transparent"
                        />
                    </div>
                    <div className="relative bg-white border-2 border-slate-50 rounded-2xl p-3 shadow-sm">
                        <p className="text-[9px] font-black text-slate-400 uppercase">Menores</p>
                        <input
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

                <button
                    onClick={sendWhatsApp}
                    className="w-full bg-[#25D366] hover:bg-[#1ebd5b] text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 shadow-xl shadow-green-100 transition-all active:scale-95 group"
                >
                    <Send size={18} className="group-hover:translate-x-1" />
                    Reservar por WhatsApp
                </button>
            </div>
        </div>
    );
}