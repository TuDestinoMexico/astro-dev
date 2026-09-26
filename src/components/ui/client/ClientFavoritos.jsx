import React, { useEffect, useState } from 'react';
import { Heart, MapPin, Trash2, Loader2 } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function ClientFavoritos({ user }) {
  const [favoritos, setFavoritos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [retryKey, setRetryKey] = useState(0);

  useEffect(() => {
    if (!user) return;
    setCargando(true);
    setError('');
    const q = query(
      collection(db, 'users', user.uid, 'favoritos'),
      orderBy('fechaGuardado', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFavoritos(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
      setError('');
      setCargando(false);
    }, (error) => {
      console.error('Error leyendo favoritos:', error);
      setError('No se pudieron cargar tus favoritos.');
      setCargando(false);
    });
    return () => unsubscribe();
  }, [user, retryKey]);

  const handleEliminar = async (fav) => {
    if (!window.confirm(`¿Quitar "${fav.nombre}" de tus favoritos?`)) return;
    setActionError('');
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'favoritos', fav.id));
    } catch (err) {
      console.error('Error al eliminar favorito:', err);
      setActionError('No se pudo quitar el favorito. Intenta nuevamente.');
    }
  };

  return (
    <div>
      <div class="mb-8">
        <h2 class="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <Heart class="text-rose-600" size={28} />
          Mis Favoritos
        </h2>
        <p class="text-sm text-slate-500 mt-1">Tus hoteles y tours guardados</p>
      </div>

      {cargando ? (
        <div role="status" aria-live="polite" aria-atomic="true" class="flex flex-col items-center justify-center py-20 text-slate-400">
          <Loader2 size={32} class="animate-spin text-rose-500 mb-3" />
          <span class="text-xs font-bold uppercase tracking-widest">Cargando favoritos...</span>
        </div>
      ) : error ? (
        <div role="alert" aria-live="assertive" class="flex flex-col items-center justify-center py-16 text-center">
          <p class="text-sm font-medium text-red-600">{error}</p>
          <button type="button" onClick={() => setRetryKey((key) => key + 1)} class="mt-4 text-xs font-bold text-slate-500 underline hover:text-slate-700">
            Reintentar
          </button>
        </div>
      ) : favoritos.length === 0 ? (
        <div role="status" aria-live="polite" class="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Heart size={40} class="text-slate-300 mx-auto mb-3" />
          <p class="text-slate-500 font-medium">No tienes favoritos guardados.</p>
          <p class="text-sm text-slate-400 mt-1">Toca el corazón en cualquier hotel o tour del sitio para guardarlos aquí.</p>
        </div>
      ) : (
        <>
        {actionError && <p role="alert" aria-live="assertive" class="mb-4 text-sm text-red-600">{actionError}</p>}
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          {favoritos.map((fav) => {
            const esHotel = fav.tipo === 'hotel';
            const urlDetalle = `/${esHotel ? 'hotel' : 'tour'}/${fav.slug}`;
            return (
              <div key={fav.id} class="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex flex-col md:flex-row">
                <a href={urlDetalle} class="w-full md:w-40 h-40 md:h-auto bg-slate-100 shrink-0 block relative">
                  {fav.imagen ? (
                    <img
                      src={fav.imagen}
                      alt={fav.nombre}
                      class="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.classList.add('flex', 'items-center', 'justify-center');
                        e.target.parentElement.innerHTML = '<span class="text-slate-300 text-xs font-medium">Sin imagen</span>';
                      }}
                    />
                  ) : (
                    <div class="w-full h-full flex items-center justify-center">
                      <span class="text-slate-300 text-xs font-medium">Sin imagen</span>
                    </div>
                  )}
                </a>

                <div class="flex-1 p-4 flex flex-col gap-2 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <a href={urlDetalle}>
                        <h3 class="text-base font-bold text-slate-800 truncate hover:text-rose-600 transition-colors">{fav.nombre}</h3>
                      </a>
                      {fav.destino && (
                        <div class="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                          <MapPin size={12} />
                          <span class="truncate">{fav.destino}</span>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => handleEliminar(fav)}
                      class="text-slate-300 hover:text-red-500 transition-colors cursor-pointer shrink-0 p-1"
                      title="Quitar de favoritos"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div class="flex items-center justify-between pt-1 mt-auto">
                    <span class={`font-bold px-2 py-0.5 rounded tracking-wider uppercase text-[10px] ${
                      esHotel ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {esHotel ? 'Hotel' : 'Tour'}
                    </span>
                    <a
                      href={urlDetalle}
                      class="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-rose-600 transition-colors"
                    >
                      Ver detalle
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        </>
      )}
    </div>
  );
}
