import React, { useState, useRef, useEffect } from 'react';
import { User, Globe, LogOut, ChevronDown, LayoutDashboard, Tag, Heart, Wallet, Menu, X } from 'lucide-react';
import { auth, db } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const FALLBACK_LOGO = 'https://storage.googleapis.com/tudestinomx_bucket/assets/test/tdmx_logo_mundial.png';

const NAV_ITEMS = [
  { tab: 'reservas', Icon: LayoutDashboard, title: 'Mis Reservas', subtitle: 'Ver panel', color: 'bg-indigo-600' },
  { tab: 'ofertas', Icon: Tag, title: 'Mis Ofertas', subtitle: 'Ver promociones', color: 'bg-emerald-600' },
  { tab: 'pagos', Icon: Wallet, title: 'Mis Pagos', subtitle: 'Ver abonos', color: 'bg-amber-600' },
  { tab: 'favoritos', Icon: Heart, title: 'Mis Favoritos', subtitle: 'Guardados', color: 'bg-rose-600' },
];

export default function ClientTopbar({ user, activeTab, setActiveTab }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(FALLBACK_LOGO);
  const dropdownRef = useRef(null);
  const mobileDropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
      const outsideDropdowns =
        (dropdownRef.current && !dropdownRef.current.contains(e.target)) &&
        (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target));
      if (outsideDropdowns) {
        setDropdownOpen(false);
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target)) {
        setMobileMenuOpen(false);
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
    setMobileMenuOpen(false);
  };

  const renderAccount = (ref) => (
    <div class="relative flex flex-1 min-w-30 xl:min-w-32 shrink-0" ref={ref}>
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        class="bg-purple-800 text-white p-3 flex-col items-start justify-between space-y-1.5 flex-1 min-w-30 xl:min-w-32 shrink-0 transition-all duration-300 hover:brightness-105 cursor-pointer flex rounded-xl xl:rounded-none"
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
            <span class="text-[11px] xl:text-xs font-black uppercase tracking-wide whitespace-nowrap">Mi Cuenta</span>
            <span class="text-[10px] xl:text-[11px] font-medium text-white/90 whitespace-nowrap truncate mt-0.5">
              {user.displayName || user.email}
            </span>
          </p>
          <ChevronDown size={13} class={`text-white/70 transition-transform shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
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
  );

  return (
    <div>
      <div class="container mx-auto flex flex-col xl:flex-row justify-between items-center">
        <div class="h-full flex items-center xl:justify-start justify-center mt-5 xl:mt-0">
          <a href="/" class="block w-70 aspect-[4/1] shrink-0">
            <img
              class="w-full h-full object-contain"
              src={logoUrl}
              alt="Tu Destino Mexico"
              width="280"
              height="70"
              loading="eager"
              decoding="async"
            />
          </a>
        </div>

        <div class="hidden xl:flex xl:h-auto xl:flex-row font-bold xl:rounded-bl-xl justify-end items-stretch shadow-lg">
          {NAV_ITEMS.map(({ tab, Icon, title, subtitle, color }) => (
            <button
              key={tab}
              onClick={() => handleNavClick(tab)}
              aria-pressed={activeTab === tab}
              class={`${color} text-white p-3 flex-col items-start justify-between space-y-1.5 flex-1 min-w-30 xl:min-w-32 shrink-0 transition-all duration-300 hover:brightness-105 cursor-pointer hidden xl:flex ${activeTab === tab ? 'ring-2 ring-white ring-inset brightness-110' : ''}`}
            >
              <Icon size={16} class="shrink-0 text-white/90" />
              <p class="flex flex-col leading-tight tracking-tight">
                <span class="text-[11px] xl:text-xs font-black uppercase tracking-wide whitespace-nowrap">{title}</span>
                <span class="text-[10px] xl:text-[11px] font-medium text-white/90 whitespace-nowrap mt-0.5">{subtitle}</span>
              </p>
            </button>
          ))}

          {renderAccount(dropdownRef)}
        </div>

        <div class="xl:hidden w-full p-3 mt-3 shadow-lg" ref={mobileMenuRef}>
          <div class="flex items-stretch gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              class="bg-slate-800 text-white p-3 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 hover:brightness-110 cursor-pointer"
              aria-label="Menú"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {renderAccount(mobileDropdownRef)}
          </div>

          <div class={`grid grid-cols-2 gap-2 mt-3 overflow-hidden transition-all duration-300 ease-out ${mobileMenuOpen ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 pointer-events-none invisible h-0'}`}>
            {NAV_ITEMS.map(({ tab, Icon, title, subtitle, color }) => (
              <button
                key={tab}
                onClick={() => handleNavClick(tab)}
                aria-pressed={activeTab === tab}
                class={`${color} flex items-center gap-3 p-3 rounded-xl text-white text-left transition-all duration-300 hover:brightness-110 cursor-pointer ${activeTab === tab ? 'ring-2 ring-white ring-inset brightness-110' : ''}`}
              >
                <Icon size={18} class="shrink-0 text-white/90" />
                <p class="flex flex-col leading-tight tracking-tight min-w-0">
                  <span class="text-[11px] font-black uppercase tracking-wide truncate">{title}</span>
                  <span class="text-[10px] font-medium text-white/90 truncate mt-0.5">{subtitle}</span>
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
