import React from 'react';
import { LayoutDashboard, Users, LogOut, X, User } from 'lucide-react'; // Agregamos User a la importación

export default function Sidebar({ user, activeTab, setActiveTab, handleLogout, isOpen, setIsOpen }) {

    const handleNavClick = (tab) => {
        setActiveTab(tab);
        setIsOpen(false);
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <aside className={`w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-6 fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 shadow-2xl lg:shadow-none`}>

                <div className="space-y-8">
                    {/* Logo y Botón de Cerrar */}
                    <div className="pt-2 flex items-center justify-between">
                        <div>
                            <span className="text-xl font-black tracking-tighter text-white uppercase block">
                                Tu Destino <span className="text-orange-500">MX</span>
                            </span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Panel de Control</span>
                        </div>
                        <button
                            className="lg:hidden p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* NUEVO: Ficha de Usuario Logueado */}
                    {user && (
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 flex items-center gap-3">
                            <div className="p-1.5 bg-indigo-600 rounded-lg text-white">
                                <User size={16} />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate">Administrador</p>
                                <p className="text-xs text-white font-medium truncate">{user.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Navegación */}
                    <nav className="space-y-2">
                        <button
                            onClick={() => handleNavClick('inicio')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === 'inicio' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                            <LayoutDashboard size={16} /> Inicio
                        </button>
                        <button
                            onClick={() => handleNavClick('equipo')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all ${activeTab === 'equipo' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'}`}
                        >
                            <Users size={16} /> Mi Equipo
                        </button>
                    </nav>
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 border border-slate-800 text-slate-400 font-bold text-xs uppercase tracking-widest py-3 rounded-xl hover:bg-red-950/30 hover:text-red-400 hover:border-red-900/50 transition-colors"
                >
                    <LogOut size={14} /> Cerrar Sesión
                </button>
            </aside>
        </>
    );
}