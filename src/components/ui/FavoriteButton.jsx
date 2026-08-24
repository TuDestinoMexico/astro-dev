import React, { useSyncExternalStore, useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { favoritosStore } from '../../lib/favoritosStore';

export default function FavoriteButton({ tipo, slug, nombre, imagen, destino, className = '' }) {
  const claves = useSyncExternalStore(
    favoritosStore.subscribe,
    favoritosStore.getClaves,
    () => new Set()
  );
  const [procesando, setProcesando] = useState(false);

  if (!slug || slug === '#') return null;

  const esFavorito = claves.has(`${tipo}-${slug}`);

  const handleClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const user = favoritosStore.getUser();
    if (!user) {
      window.location.href = '/cliente/login';
      return;
    }

    setProcesando(true);
    if (esFavorito) {
      await favoritosStore.quitar(tipo, slug);
    } else {
      await favoritosStore.guardar({ tipo, slug, nombre, imagen, destino });
    }
    setProcesando(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      aria-label={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
      className={`group/heart flex items-center justify-center w-9 h-9 rounded-full bg-white/95 backdrop-blur-md shadow-sm border border-slate-100 cursor-pointer transition-all duration-300 hover:scale-110 active:scale-95 ${className}`}
    >
      {procesando ? (
        <Loader2 size={16} className="text-rose-500 animate-spin" />
      ) : (
        <Heart
          size={16}
          className={`transition-all duration-300 ${
            esFavorito
              ? 'text-rose-500 fill-rose-500 scale-110'
              : 'text-slate-400 group-hover/heart:text-rose-400'
          }`}
        />
      )}
    </button>
  );
}
