import React, { useEffect, useState } from 'react';
import { Hash, MapPin, FileText, CalendarDays, Plane, PlaneLanding, User, Mail, Phone, Cake, Building2, Users, DollarSign, BedDouble, Utensils } from 'lucide-react';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const formatFecha = (value) => {
  if (!value) return null;
  const str = String(value).trim();
  let d = null;
  let m = str.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) {
    d = new Date(+m[1], +m[2] - 1, +m[3]);
  } else {
    m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (m) {
      d = new Date(+m[3], +m[2] - 1, +m[1]);
    } else {
      d = new Date(str);
    }
  }
  if (isNaN(d.getTime())) return null;
  return `${d.getDate()} de ${MESES[d.getMonth()]} del ${d.getFullYear()}`;
};

const formatMonto = (value) => {
  const n = Number(value);
  if (isNaN(n)) return value;
  return `$${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN`;
};

const formatHabitacion = (habitacion) => {
  if (!habitacion) return null;
  if (Array.isArray(habitacion)) {
    const items = habitacion.map((h) => {
      if (typeof h === 'string') return h;
      const tipo = h.tipo_habitacion || h.tipo || h.nombre;
      const cantidad = h.cantidad_habitaciones || h.cantidad;
      if (tipo && cantidad) return `${tipo} x${cantidad}`;
      if (tipo) return tipo;
      return JSON.stringify(h);
    });
    return items.join(', ');
  }
  return String(habitacion);
};

const formatEdades = (edades) => {
  if (!Array.isArray(edades) || edades.length === 0) return null;
  return edades.map((e) => (e && typeof e === 'object' && 'edad' in e ? e.edad : e)).join(', ');
};

function StatTile({ icon: Icon, label, value }) {
  return (
    <div class="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-sm animate-in zoom-in-95 duration-500">
      <div class="w-8 h-8 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center mb-1.5">
        <Icon size={15} />
      </div>
      <p class="text-sm font-black text-slate-800 leading-tight">{value}</p>
      <p class="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-0.5">{label}</p>
    </div>
  );
}

function InfoChip({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div class="flex items-center gap-2.5 bg-white rounded-xl px-3 py-2.5 border border-slate-100 shadow-sm">
      <div class="w-7 h-7 rounded-lg bg-cyan-100 text-cyan-700 flex items-center justify-center shrink-0">
        <Icon size={14} />
      </div>
      <div class="min-w-0">
        <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
        <p class="text-xs font-bold text-slate-800 truncate">{value}</p>
      </div>
    </div>
  );
}

function PriceCounter({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value);
    if (isNaN(target)) {
      setDisplay(0);
      return;
    }
    let raf;
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return (
    <span>
      ${display.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MXN
    </span>
  );
}

export default function GrupoDetalle({ grupo }) {
  const hoteles = grupo.hoteles || [];
  const primerHotel = hoteles[0] || {};
  const paxTotal = hoteles.reduce((acc, h) => acc + (Number(h.pax) || 0), 0);
  const checkinMin = hoteles.reduce((acc, h) => (h.checkin && (!acc || h.checkin < acc) ? h.checkin : acc), null);
  const checkoutMax = hoteles.reduce((acc, h) => (h.checkout && (!acc || h.checkout > acc) ? h.checkout : acc), null);
  const cliente = grupo.cliente || {};

  return (
    <div class="space-y-4">
      {/* HERO */}
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-600 to-sky-900 p-6 text-white animate-in fade-in slide-in-from-top-2 duration-500">
        <div class="pointer-events-none absolute -top-12 -right-12 w-52 h-52 rounded-full bg-white/10 blur-2xl"></div>
        <div class="pointer-events-none absolute -bottom-16 -left-8 w-44 h-44 rounded-full bg-black/10 blur-2xl"></div>

        <div class="relative z-10 flex flex-col gap-4">
          <div class="flex items-start justify-between gap-4">
            <div class="min-w-0">
              <div class="flex flex-wrap items-center gap-2 mb-2.5">
                <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-full border border-white/20">
                  <Hash size={11} /> {grupo.gb}
                </span>
              </div>
              <h3 class="text-xl md:text-2xl font-black leading-tight drop-shadow-sm truncate">
                {primerHotel.hotel || 'Grupo'}
              </h3>
              {primerHotel.destino && (
                <p class="flex items-center gap-1.5 text-sm text-white/80 mt-1">
                  <MapPin size={14} class="shrink-0" /> <span class="truncate">{primerHotel.destino}</span>
                </p>
              )}
            </div>

            {grupo.pdf_url && (
              <a
                href={grupo.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                class="shrink-0 inline-flex items-center gap-2 bg-white text-slate-900 font-black text-xs uppercase tracking-widest px-4 py-3 rounded-xl shadow-lg hover:shadow-2xl hover:-translate-y-0.5 transition-all"
              >
                <FileText size={16} /> PDF
              </a>
            )}
          </div>
        </div>
      </div>

      {/* TIMELINE */}
      <div class="bg-white border border-slate-200 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-75">
        <div class="relative flex items-start">
          <div class="absolute top-4 left-[16.66%] right-[16.66%] h-0.5 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>
          {[
            { icon: CalendarDays, label: 'Reserva', value: formatFecha(grupo.fecha_reserva), color: 'bg-cyan-100 text-cyan-700', delay: 'delay-0' },
            { icon: Plane, label: 'Check-in', value: formatFecha(checkinMin), color: 'bg-emerald-100 text-emerald-700', delay: 'delay-100' },
            { icon: PlaneLanding, label: 'Check-out', value: formatFecha(checkoutMax), color: 'bg-amber-100 text-amber-700', delay: 'delay-200' },
          ].map((node, i) => (
            <div key={i} class="flex-1 flex flex-col items-center text-center gap-1.5 relative z-10">
              <div class={`w-8 h-8 rounded-full flex items-center justify-center ${node.color} shadow-sm animate-in zoom-in-95 duration-500 ${node.delay}`}>
                <node.icon size={15} />
              </div>
              <p class="text-[9px] font-black uppercase tracking-widest text-slate-400">{node.label}</p>
              <p class="text-xs font-bold text-slate-700 leading-tight">{node.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* STATS */}
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatTile icon={Building2} label="Hoteles" value={hoteles.length || '—'} />
        <StatTile icon={Users} label="PAX Total" value={paxTotal || '—'} />
        <StatTile icon={DollarSign} label="Precio Total" value={grupo.precio_total ? <PriceCounter value={grupo.precio_total} /> : '—'} />
      </div>

      {/* CLIENTE */}
      <div class="bg-slate-50 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center">
            <User size={15} />
          </div>
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Cliente Titular</h3>
        </div>
        <div class="space-y-2">
          <InfoChip icon={User} label="Nombre" value={cliente.client_name} />
          <InfoChip icon={Mail} label="Email" value={cliente.email} />
          <InfoChip icon={Phone} label="Teléfono" value={cliente.phone_number} />
          <InfoChip icon={Cake} label="Edad" value={cliente.edad} />
          <InfoChip icon={User} label="Ocupación" value={cliente.client_ocupacion} />
        </div>
      </div>

      {/* HOTELES */}
      <div class="bg-slate-50 rounded-2xl p-5 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-200">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
            <Building2 size={15} />
          </div>
          <h3 class="text-xs font-black uppercase tracking-widest text-slate-700">Hoteles</h3>
        </div>

        {hoteles.length === 0 ? (
          <div class="bg-white rounded-xl p-4 text-center text-sm text-slate-400">Sin hoteles registrados</div>
        ) : (
          <div class="space-y-3">
            {hoteles.map((h, i) => (
              <div key={i} class="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div class="px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center justify-between gap-2">
                  <p class="text-sm font-black text-white truncate">{h.hotel || `Hotel ${i + 1}`}</p>
                  <span class="text-[9px] font-black uppercase tracking-widest text-emerald-100 shrink-0">#{i + 1}</span>
                </div>
                <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  <InfoChip icon={MapPin} label="Destino" value={h.destino} />
                  <InfoChip icon={CalendarDays} label="Check-in" value={formatFecha(h.checkin)} />
                  <InfoChip icon={CalendarDays} label="Check-out" value={formatFecha(h.checkout)} />
                  <InfoChip icon={CalendarDays} label="Noches" value={h.cantidad_noches} />
                  <InfoChip icon={BedDouble} label="Habitación" value={formatHabitacion(h.habitacion)} />
                  <InfoChip icon={Utensils} label="Plan Alim." value={h.plan_alimentos} />
                  <InfoChip icon={Users} label="PAX" value={h.pax} />
                </div>
                <div class="px-4 pb-4 flex flex-wrap gap-3 text-xs">
                  <span class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold px-3 py-1.5 rounded-full">
                    <Users size={12} /> {h.cantidad_adultos || 0} Adultos
                  </span>
                  <span class="inline-flex items-center gap-1.5 bg-violet-50 text-violet-700 font-bold px-3 py-1.5 rounded-full">
                    <Users size={12} /> {h.cantidad_ninos || 0} Menores
                  </span>
                  {formatEdades(h.edades_adultos) && (
                    <span class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 font-semibold px-3 py-1.5 rounded-full">
                      Edades: {formatEdades(h.edades_adultos)}
                    </span>
                  )}
                  {formatEdades(h.edades_ninos) && (
                    <span class="inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 font-semibold px-3 py-1.5 rounded-full">
                      Menores: {formatEdades(h.edades_ninos)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
