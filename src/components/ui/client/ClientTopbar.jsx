import React, { useState, useRef, useEffect } from 'react';
import { User, Globe, LogOut, ChevronDown, LayoutDashboard, Tag, Heart } from 'lucide-react';
import { auth, db } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const FALLBACK_LOGO = 'https://storage.googleapis.com/tudestinomx_bucket/assets/test/tdmx_logo_mundial.png';

export default function ClientTopbar({ user, activeTab, setActiveTab }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const configDocRef = doc(db, 'config', 'general');
        const docSnap = await getDoc(configDocRef);
        if (docSnap.exists() && docSnap.data().logoUrl) {
          setLogoUrl(docSnap.data().logoUrl);
        }
      } catch (e) {
        console.warn('[ClientTopbar] Error al obtener logo, usando fallback');
      }
    };
    fetchLogo();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setDropdownOpen(false);
  };

  return (
    <div>
      <div class="container mx-auto xl:flex justify-between items-center">
        <div class="h-full flex items-center xl:justify-start justify-center mt-5 xl:mt-0">
          <a href="/">
            <img class="w-70" src={logoUrl} alt="Tu Destino Mexico" />
          </a>
        </div>

        <div class="flex h-auto flex-row font-bold rounded-bl-xl justify-end items-stretch shadow-lg">
          <button
            onClick={() => handleNavClick('reservas')}
            class="bg-indigo-600 text-white p-3.5 flex-col items-start justify-between space-y-1.5 flex-1 min-w-35 xl:min-w-40 shrink-0 transition-all duration-300 hover:brightness-105 cursor-pointer hidden xl:flex"
          >
            <LayoutDashboard size={18} class="shrink-0 text-white/90" />
            <p class="flex flex-col leading-tight tracking-tight">
              <span class="text-xs xl:text-sm font-black uppercase tracking-wide whitespace-nowrap">Mis Reservas</span>
              <span class="text-[11px] xl:text-xs font-medium text-white/90 whitespace-nowrap mt-0.5">Ver panel</span>
            </p>
          </button>

          <button
            onClick={() => handleNavClick('ofertas')}
            class="bg-emerald-600 text-white p-3.5 flex-col items-start justify-between space-y-1.5 flex-1 min-w-35 xl:min-w-40 shrink-0 transition-all duration-300 hover:brightness-105 cursor-pointer hidden xl:flex"
          >
            <Tag size={18} class="shrink-0 text-white/90" />
            <p class="flex flex-col leading-tight tracking-tight">
              <span class="text-xs xl:text-sm font-black uppercase tracking-wide whitespace-nowrap">Mis Ofertas</span>
              <span class="text-[11px] xl:text-xs font-medium text-white/90 whitespace-nowrap mt-0.5">Ver promociones</span>
            </p>
          </button>

          <button
            onClick={() => handleNavClick('favoritos')}
            class="bg-rose-600 text-white p-3.5 flex-col items-start justify-between space-y-1.5 flex-1 min-w-35 xl:min-w-40 shrink-0 transition-all duration-300 hover:brightness-105 cursor-pointer hidden xl:flex"
          >
            <Heart size={18} class="shrink-0 text-white/90" />
            <p class="flex flex-col leading-tight tracking-tight">
              <span class="text-xs xl:text-sm font-black uppercase tracking-wide whitespace-nowrap">Mis Favoritos</span>
              <span class="text-[11px] xl:text-xs font-medium text-white/90 whitespace-nowrap mt-0.5">Guardados</span>
            </p>
          </button>

          <div class="relative flex flex-1" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              class="bg-purple-800 text-white p-3.5 flex-col items-start justify-between space-y-1.5 flex-1 min-w-35 xl:min-w-40 shrink-0 transition-all duration-300 hover:brightness-105 cursor-pointer"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Usuario'}
                  class="w-8 h-8 rounded-full border-2 border-white/30 object-cover shrink-0"
                />
              ) : (
                <div class="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                  <User size={16} class="text-white" />
                </div>
              )}
              <div class="flex items-center justify-between gap-1">
                <p class="flex flex-col leading-tight tracking-tight min-w-0">
                  <span class="text-xs xl:text-sm font-black uppercase tracking-wide whitespace-nowrap">Mi Cuenta</span>
                  <span class="text-[11px] xl:text-xs font-medium text-white/90 whitespace-nowrap truncate mt-0.5">
                    {user.displayName || user.email}
                  </span>
                </p>
                <ChevronDown size={14} class={`text-white/70 transition-transform shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            <div
              class={`absolute right-0 top-full mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-2 transition-all duration-200 ease-out transform origin-top-right ${
                dropdownOpen
                  ? 'opacity-100 scale-100 pointer-events-auto visible'
                  : 'opacity-0 scale-95 pointer-events-none invisible'
              }`}
            >
              <div class="px-4 py-3 border-b border-slate-100">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" class="w-10 h-10 rounded-full border-2 border-purple-200 object-cover mb-2" />
                ) : (
                  <div class="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mb-2">
                    <User size={18} class="text-purple-800" />
                  </div>
                )}
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Bienvenido</p>
                <p class="text-sm font-semibold text-slate-800 truncate">{user.displayName || user.email}</p>
              </div>

              <div class="py-1">
                <a
                  href="/"
                  class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-all"
                >
                  <Globe size={16} /> Volver al Sitio
                </a>
              </div>

              <div class="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50 transition-all cursor-pointer"
                >
                  <LogOut size={16} /> Cerrar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
