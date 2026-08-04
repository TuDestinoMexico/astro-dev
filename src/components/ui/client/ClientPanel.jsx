import React, { useEffect, useState } from 'react';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import ClientReservas from './ClientReservas';
import ClientOfertas from './ClientOfertas';
import ClientFavoritos from './ClientFavoritos';
import ClientPagos from './ClientPagos';
import ClientTopbar from './ClientTopbar';

export default function ClientPanel() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('reservas');

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
      <main class="flex-1 flex flex-col min-h-screen transition-all duration-300">
        <ClientTopbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

        <div class="p-6 md:p-8 lg:p-12 max-w-6xl mx-auto w-full">
          {activeTab === 'reservas' && <ClientReservas user={user} />}
          {activeTab === 'ofertas' && <ClientOfertas user={user} />}
          {activeTab === 'pagos' && <ClientPagos user={user} />}
          {activeTab === 'favoritos' && <ClientFavoritos user={user} />}
        </div>
      </main>
    </div>
  );
}
