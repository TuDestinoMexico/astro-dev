import React, { useEffect, useState } from 'react';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2, Menu } from 'lucide-react';
import ClientSidebar from './ClientSidebar';
import ClientReservas from './ClientReservas';

export default function ClientPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservas');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        window.location.href = '/cliente/login';
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div class="w-full h-screen flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50">
        <Loader2 class="animate-spin w-8 h-8 text-purple-500" />
        <span class="text-xs font-bold uppercase tracking-widest">Cargando Panel...</span>
      </div>
    );
  }

  return (
    <div class="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">
      <ClientSidebar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        setIsOpen={setIsMobileMenuOpen}
      />

      <main class="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all duration-300">
        <header class="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <span class="text-lg font-black tracking-tighter text-slate-900 uppercase">
            Tu Destino <span class="text-orange-500">MX</span>
          </span>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            class="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <Menu size={20} />
          </button>
        </header>

        <div class="p-6 md:p-8 lg:p-12 max-w-6xl mx-auto w-full">
          {activeTab === 'reservas' && <ClientReservas user={user} />}
        </div>
      </main>
    </div>
  );
}
