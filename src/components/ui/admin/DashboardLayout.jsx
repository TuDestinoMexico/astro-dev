import React, { useEffect, useState } from 'react';
import { auth } from '../../../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { Loader2, Menu } from 'lucide-react';

// Importamos nuestros sub-componentes (Incluyendo el nuevo ConfigView)
import Sidebar from './Sidebar';
import LeadsView from './LeadsView';
import TeamView from './TeamView';
import MediaManager from './MediaManager';
import ConfigView from './ConfigView';

export default function DashboardLayout() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('inicio');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (!currentUser) {
                window.location.href = '/admin/login';
            } else {
                setUser(currentUser);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/admin/login';
    };

    if (loading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center text-slate-400 gap-3 bg-slate-50">
                <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Cargando Panel...</span>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50 font-sans antialiased text-slate-800">

            {/* COMPONENTE SIDEBAR */}
            <Sidebar
                user={user}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleLogout}
                isOpen={isMobileMenuOpen}
                setIsOpen={setIsMobileMenuOpen}
            />

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 lg:pl-64 flex flex-col min-h-screen transition-all duration-300">

                {/* Header Móvil (Solo visible en pantallas pequeñas) */}
                <header className="lg:hidden bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                    <span className="text-lg font-black tracking-tighter text-slate-900 uppercase">
                        Tu Destino <span className="text-orange-500">MX</span>
                    </span>
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                    >
                        <Menu size={20} />
                    </button>
                </header>

                {/* Inyección dinámica de las pantallas según la pestaña activa */}
                <div className="p-6 md:p-8 lg:p-12 max-w-6xl mx-auto w-full">
                    {activeTab === 'inicio' && <LeadsView />}
                    {activeTab === 'equipo' && <TeamView />}
                    {activeTab === 'medios' && <MediaManager />}
                    {activeTab === 'config' && <ConfigView />}
                </div>
            </main>

        </div>
    );
}