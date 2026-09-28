import React, { useEffect, useState } from 'react';
import { Tag, Clock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';

const WHATSAPP_FALLBACK = '529987141365';

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const colorMap = {
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-600', text: 'text-emerald-800', ring: 'ring-emerald-500' },
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-600', text: 'text-amber-800', ring: 'ring-amber-500' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-200', badge: 'bg-violet-600', text: 'text-violet-800', ring: 'ring-violet-500' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-200', badge: 'bg-cyan-600', text: 'text-cyan-800', ring: 'ring-cyan-500' },
};

const esVencida = (oferta) => {
  if (!oferta.vigencia?.toDate) return false;
  const fecha = oferta.vigencia.toDate();
  if (isNaN(fecha.getTime())) return false;
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return fecha < hoy;
};

const formatVigencia = (ts) => {
  const d = ts?.toDate?.();
  if (!d || isNaN(d.getTime())) return null;
  return `${d.getDate()} ${MESES[d.getMonth()]} ${d.getFullYear()}`;
};

export default function ClientOfertas({ user }) {
  const [ofertas, setOfertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [retryKey, setRetryKey] = useState(0);
  const [whatsapp, setWhatsapp] = useState(WHATSAPP_FALLBACK);

  useEffect(() => {
    let activo = true;
    const cargarConfig = async () => {
      try {
        const snap = await getDoc(doc(db, 'config', 'general'));
        if (activo && snap.exists() && snap.data().whatsappGlobal) {
          setWhatsapp(snap.data().whatsappGlobal);
        }
      } catch (err) {
        console.warn('[ClientOfertas] No se pudo leer config/general:', err);
      }
    };
    cargarConfig();
    return () => { activo = false; };
  }, []);

  useEffect(() => {
    setCargando(true);
    setError('');
    const q = query(collection(db, 'ofertas'), orderBy('posicion', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOfertas(lista.filter((o) => o.activo !== false && !esVencida(o)));
      setError('');
      setCargando(false);
    }, (error) => {
      console.error('Error leyendo ofertas:', error);
      setError('No se pudieron cargar las ofertas.');
      setCargando(false);
    });
    return () => unsubscribe();
  }, [retryKey]);

  const reclamar = (offer) => {
    const mensaje = `¡Hola! Me interesa reclamar la oferta "${offer.titulo}"${offer.codigo ? ` con el código ${offer.codigo}` : ''} que vi en Tu Destino México.`;
    window.open(`https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`, '_blank');
  };

  return (
    <div>
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Tag class="text-emerald-600" size={28} />
          Mis Ofertas
        </h2>
        <p class="text-sm text-slate-500 mt-1">Promociones y descuentos exclusivos para ti</p>
      </div>

      {cargando ? (
        <div role="status" aria-live="polite" aria-atomic="true" class="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} class="animate-spin text-emerald-500 mb-3" />
          <span class="text-xs font-bold uppercase tracking-widest">Cargando ofertas...</span>
        </div>
      ) : error ? (
        <div role="alert" aria-live="assertive" class="flex flex-col items-center justify-center py-16 text-center">
          <p class="text-sm font-medium text-red-600">{error}</p>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)} class="mt-4 text-xs font-bold text-slate-500 underline hover:text-slate-700">
            Reintentar
          </button>
        </div>
      ) : ofertas.length === 0 ? (
        <div role="status" aria-live="polite" class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Sparkles size={40} class="text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500 font-medium">No hay ofertas disponibles por el momento.</p>
          <p class="text-sm text-slate-400 mt-1">Vuelve pronto, estamos preparando promociones exclusivas para ti.</p>
        </div>
      ) : (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ofertas.map((offer) => {
            const c = colorMap[offer.color] || colorMap.emerald;
            return (
              <div key={offer.id} class={`${c.bg} border ${c.border} rounded-xl p-5 flex flex-col gap-3 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5`}>
                <div class="flex items-start justify-between gap-3">
                  <div class={`${c.badge} text-white text-xs font-black px-3 py-1 rounded-full tracking-wider uppercase shrink-0`}>
                    {offer.descuento}
                  </div>
                  {formatVigencia(offer.vigencia) && (
                    <div class="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium shrink-0">
                      <Clock size={13} />
                      <span>Vence: {formatVigencia(offer.vigencia)}</span>
                    </div>
                  )}
                </div>

                <h3 class="text-base font-bold text-slate-800 leading-snug">{offer.titulo}</h3>
                <p class="text-sm text-slate-600 leading-relaxed flex-1 whitespace-pre-line">{offer.descripcion}</p>

                <div class="flex items-center justify-between pt-2 border-t border-slate-200/60">
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] uppercase tracking-widest font-bold text-slate-400">Código:</span>
                    <span class={`text-xs font-mono font-black ${c.text} tracking-wider`}>{offer.codigo}</span>
                  </div>
                  <button
                    onClick={() => reclamar(offer)}
                    class="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-700 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    Reclamar <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
