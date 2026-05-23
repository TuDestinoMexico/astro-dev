import React, { useState, useEffect } from 'react';
import { db } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { User, Eye } from 'lucide-react';

export default function LeadsView() {
    const [leads, setLeads] = useState([]);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const q = query(collection(db, "cotizaciones"), orderBy("createdAt", "desc"), limit(5));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => items.push({ id: doc.id, ...doc.data() }));
            setLeads(items);
        } catch (error) {
            console.error("Error leyendo cotizaciones: ", error);
        }
    };

    return (
        <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10 animate-fade-in w-full">
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-black text-slate-900 uppercase tracking-tight">Resumen General</h1>
                <p className="text-sm text-slate-400 font-medium mt-1">Monitorea los leads más recientes del sitio web.</p>
            </div>

            <div>
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Últimas Solicitudes</h2>
                {leads.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4">No hay cotizaciones registradas en Firestore aún.</p>
                ) : (
                    <div className="space-y-3">
                        {leads.map((lead) => (
                            <div key={lead.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-4 hover:border-indigo-200 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><User size={18} /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{lead.nombre || "Cliente Anónimo"}</p>
                                        <p className="text-xs text-slate-500 font-medium">Interés: {lead.destino || "No especificado"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between sm:justify-end gap-6">
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-full">{lead.estatus || "Nuevo"}</span>
                                    <button className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 shadow-sm"><Eye size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}