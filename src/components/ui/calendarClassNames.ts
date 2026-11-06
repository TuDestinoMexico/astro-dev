// Estilos del calendario de react-day-picker, compartidos entre la reserva de la ficha
// (BookingCalendar) y el buscador de la portada (SearchDatePicker).
export const calendarClassNames = {
    months: 'flex flex-col md:flex-row gap-6 justify-center',
    month: 'space-y-4 rounded-2xl border border-slate-100 bg-white p-2 sm:p-3',
    month_caption: 'hidden',
    caption_label: 'text-sm font-black capitalize text-slate-800',
    nav: 'hidden',
    month_grid: 'border-collapse',
    weekdays: 'grid grid-cols-7',
    weekday: 'w-10 text-center text-[10px] font-black uppercase text-slate-400',
    week: 'grid grid-cols-7 mt-1',
    day: 'relative flex h-10 w-10 items-center justify-center p-0 text-center text-sm',
    day_button: 'h-10 w-10 rounded-xl font-bold text-slate-700 transition-all hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer',
    selected: '[&>button]:!bg-indigo-600 [&>button]:!text-white [&>button]:shadow-md',
    range_start: '[&>button]:!bg-indigo-600 [&>button]:!text-white [&>button]:rounded-l-xl [&>button]:rounded-r-none [&>button]:shadow-md',
    range_end: '[&>button]:!bg-indigo-600 [&>button]:!text-white [&>button]:rounded-r-xl [&>button]:rounded-l-none [&>button]:shadow-md',
    range_middle: '[&>button]:!bg-indigo-50 [&>button]:!text-indigo-800 [&>button]:rounded-none',
    today: 'font-black text-indigo-600',
    outside: 'text-slate-200',
    disabled: '[&>button]:!bg-slate-50 [&>button]:!text-slate-300 [&>button]:!opacity-70 [&>button]:cursor-not-allowed',
    hidden: 'invisible'
};
