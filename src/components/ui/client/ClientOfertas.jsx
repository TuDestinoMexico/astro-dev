import { Tag, Clock, ArrowRight } from 'lucide-react';

const DUMMY_OFFERS = [
  {
    id: 1,
    title: '30% OFF en Riviera Maya',
    description: 'Hospedaje 4 noches en hotel 5 estrellas con desayuno incluido. Válido en Hyatt Ziva, Secrets Maroma y más.',
    discount: '30%',
    validUntil: '30 Sep 2026',
    code: 'RIVIERA30',
    color: 'emerald',
  },
  {
    id: 2,
    title: '2x1 en Tours a Chichén Itzá',
    description: 'Recorrido guiado con transporte, comida y entrada incluida. Aplica comprando 2 adultos.',
    discount: '2x1',
    validUntil: '31 Dic 2026',
    code: 'CHICHEN2X1',
    color: 'amber',
  },
  {
    id: 3,
    title: 'Noche Gratis en Hoteles Seleccionados',
    description: 'Reserva 3 noches y paga solo 2. Participan: Fiesta Americana, Royalton, Iberostar.',
    discount: '-1',
    validUntil: '15 Oct 2026',
    code: 'FREE3X2',
    color: 'violet',
  },
  {
    id: 4,
    title: 'Traslados Aeropuerto 25% OFF',
    description: 'Traslado privado Cancún-Riviera Maya. Código exclusivo para clientes registrados.',
    discount: '25%',
    validUntil: '30 Nov 2026',
    code: 'TRASLADO25',
    color: 'cyan',
  },
];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600', text: 'text-emerald-800', ring: 'ring-emerald-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600', text: 'text-amber-800', ring: 'ring-amber-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-600', text: 'text-violet-800', ring: 'ring-violet-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-600', text: 'text-cyan-800', ring: 'ring-cyan-500' },
};

export default function ClientOfertas({ user }) {
  return (
    <div>
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Tag class="text-emerald-600" size={28} />
          Mis Ofertas
        </h2>
        <p class="text-sm text-slate-500 mt-1">Promociones y descuentos exclusivos para ti</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        {DUMMY_OFFERS.map((offer) => {
          const c = colorMap[offer.color];
          return (
            <div key={offer.id} class={`${c.bg} border ${c.border} rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
              <div class="flex items-start justify-between gap-3">
                <div class={`${c.badge} text-white text-xs font-black px-3 py-1 rounded-full tracking-wider uppercase shrink-0`}>
                  {offer.discount}
                </div>
                <div class="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
                  <Clock size={13} />
                  <span>Vence: {offer.validUntil}</span>
                </div>
              </div>

              <h3 class="text-base font-bold text-slate-800 leading-snug">{offer.title}</h3>
              <p class="text-sm text-slate-600 leading-relaxed flex-1">{offer.description}</p>

              <div class="flex items-center justify-between pt-2 border-t border-slate-200/60">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400">Código:</span>
                  <span class={`text-xs font-mono font-black ${c.text} tracking-wider`}>{offer.code}</span>
                </div>
                <button class="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer">
                  Reclamar <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
