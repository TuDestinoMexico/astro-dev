import React from 'react';
import { LayoutDashboard, LogOut, X, User, Globe } from 'lucide-react';
import { auth } from '../../../lib/firebase';
import { signOut } from 'firebase/auth';

export default function ClientSidebar({ user, activeTab, setActiveTab, isOpen, setIsOpen }) {

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setIsOpen(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = '/';
  };

  return (
    <>
      {isOpen && (
        <div
          class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside class={`w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl lg:shadow-none`}>
        <div class="space-y-8">
          <div class="pt-2 flex items-center justify-between">
            <div>
              <span class="text-xl font-black tracking-tighter text-white uppercase block">
                Tu Destino <span class="text-orange-500">MX</span>
              </span>
              <span class="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Área de Clientes</span>
            </div>
            <button
              class="lg:hidden p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          {user && (
            <div class="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName} class="w-10 h-10 rounded-full border-2 border-purple-500 object-cover" />
              ) : (
                <div class="p-1.5 bg-purple-600 rounded-lg text-white">
                  <User size={16} />
                </div>
              )}
              <div class="overflow-hidden">
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Bienvenido</p>
                <p class="text-xs text-white font-medium truncate">{user.displayName || user.email}</p>
              </div>
            </div>
          )}

          <nav class="space-y-2">
            <a
              href="/"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all border border-dashed border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-orange-400 hover:border-orange-500/30 mb-4"
            >
              <Globe size={16} class="text-orange-500" /> Volver al Sitio
            </a>

            <button
              onClick={() => handleNavClick('reservas')}
              class={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === 'reservas' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutDashboard size={16} /> Mis Reservas
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          class="w-full flex items-center justify-center gap-2 border border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-colors"
        >
          <LogOut size={14} /> Cerrar Sesión
        </button>
      </aside>
    </>
  );
}
