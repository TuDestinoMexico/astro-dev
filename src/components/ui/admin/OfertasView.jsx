import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../../../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, deleteDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { Plus, X, Save, Edit2, Loader2, Trash2, Move, Eye, EyeOff, Search, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const COLORES = [
    { value: 'emerald', label: 'Verde' },
    { value: 'amber', label: 'Ámbar' },
    { value: 'violet', label: 'Violeta' },
    { value: 'cyan', label: 'Cyan' },
];

const EMPTY_FORM = { titulo: '', descripcion: '', descuento: '', codigo: '', color: 'emerald', vigencia: '', activo: true };

const inicioDeHoy = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
};

const esVencida = (oferta) => {
    if (!oferta.vigencia?.toDate) return false;
    const fecha = oferta.vigencia.toDate();
    if (isNaN(fecha.getTime())) return false;
    return fecha < inicioDeHoy();
};

const formatVigencia = (ts) => {
    const d = ts?.toDate?.();
    if (!d || isNaN(d.getTime())) return null;
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
};

const timestampToDateInput = (ts) => {
    const d = ts?.toDate?.();
    if (!d || isNaN(d.getTime())) return '';
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${mm}-${dd}`;
};

export default function OfertasView() {
    const [ofertas, setOfertas] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [guardando, setGuardando] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'ofertas'), orderBy('posicion', 'asc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
            setOfertas(items);
            setCargando(false);
        }, (error) => {
            console.error('Error leyendo ofertas:', error);
            setCargando(false);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredOfertas = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return ofertas.filter(o =>
            o.titulo?.toLowerCase().includes(q) ||
            o.codigo?.toLowerCase().includes(q) ||
            o.descuento?.toLowerCase().includes(q)
        );
    }, [ofertas, searchQuery]);

    const totalPages = Math.ceil(filteredOfertas.length / itemsPerPage);

    const { currentItems, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
        const lastItem = currentPage * itemsPerPage;
        const firstItem = lastItem - itemsPerPage;
        return {
            currentItems: filteredOfertas.slice(firstItem, lastItem),
            indexOfFirstItem: firstItem,
            indexOfLastItem: lastItem
        };
    }, [filteredOfertas, currentPage]);

    const resetForm = () => {
        setFormData(EMPTY_FORM);
        setIsEditing(false);
        setEditingId(null);
    };

    const handleSaveOferta = async (e) => {
        e.preventDefault();
        setGuardando(true);
        try {
            const data = {
                titulo: formData.titulo.trim(),
                descripcion: formData.descripcion.trim(),
                descuento: formData.descuento.trim(),
                codigo: formData.codigo.trim().toUpperCase(),
                color: formData.color,
                activo: formData.activo,
                ...(formData.vigencia && { vigencia: new Date(`${formData.vigencia}T00:00:00`) })
            };

            if (editingId) {
                if (!formData.vigencia) {
                    await updateDoc(doc(db, 'ofertas', editingId), { ...data, vigencia: null });
                } else {
                    await updateDoc(doc(db, 'ofertas', editingId), data);
                }
            } else {
                const posicionFinal = ofertas.length ? Math.max(...ofertas.map(o => o.posicion || 0)) + 1 : 1;
                await addDoc(collection(db, 'ofertas'), { ...data, posicion: posicionFinal, creadoEn: serverTimestamp() });
            }

            resetForm();
        } catch (error) {
            console.error('Error al guardar oferta:', error);
            alert('Ocurrió un error al guardar la oferta.');
        } finally {
            setGuardando(false);
        }
    };

    const handleToggleStatus = async (oferta) => {
        try {
            await updateDoc(doc(db, 'ofertas', oferta.id), { activo: !oferta.activo });
        } catch (error) {
            console.error('Error al cambiar estado de la oferta:', error);
        }
    };

    const handleEditClick = (oferta) => {
        setEditingId(oferta.id);
        setFormData({
            titulo: oferta.titulo || '',
            descripcion: oferta.descripcion || '',
            descuento: oferta.descuento || '',
            codigo: oferta.codigo || '',
            color: oferta.color || 'emerald',
            vigencia: timestampToDateInput(oferta.vigencia),
            activo: oferta.activo !== false
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDeleteOferta = async (oferta) => {
        if (!window.confirm(`¿Eliminar definitivamente la oferta "${oferta.titulo}"?`)) return;
        try {
            await deleteDoc(doc(db, 'ofertas', oferta.id));
            const restantes = ofertas.filter(o => o.id !== oferta.id);
            await saveNewOrder(restantes);
        } catch (error) {
            console.error('Error al eliminar oferta:', error);
        }
    };

    const handleDragStart = (localIndex) => {
        if (searchQuery) return;
        setDraggedIndex(localIndex);
    };

    const handleDragOver = (e, localIndex) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === localIndex || searchQuery) return;

        const globalDraggedIdx = indexOfFirstItem + draggedIndex;
        const globalTargetIdx = indexOfFirstItem + localIndex;

        const newList = [...ofertas];
        const draggedItem = newList[globalDraggedIdx];

        newList.splice(globalDraggedIdx, 1);
        newList.splice(globalTargetIdx, 0, draggedItem);

        setDraggedIndex(localIndex);
        setOfertas(newList);
    };

    const handleDragEnd = async () => {
        setDraggedIndex(null);
        await saveNewOrder(ofertas);
    };

    const saveNewOrder = async (lista) => {
        try {
            const batch = writeBatch(db);
            lista.forEach((oferta, index) => {
                batch.update(doc(db, 'ofertas', oferta.id), { posicion: index + 1 });
            });
            await batch.commit();
        } catch (error) {
            console.error('Error al guardar el nuevo orden de ofertas:', error);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* ENCABEZADO */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Ofertas</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">Crea promociones exclusivas; se publican en tiempo real en el panel de clientes.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => { setIsEditing(true); setEditingId(null); }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10"
                    >
                        <Plus size={14} /> Nueva Oferta
                    </button>
                )}
            </div>

            {/* FORMULARIO */}
            {isEditing && (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-6 md:p-8 border-t-4 border-t-emerald-600">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                            {editingId ? 'Actualizar Oferta' : 'Nueva Oferta'}
                        </h2>
                        <button onClick={resetForm} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveOferta} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Título</label>
                            <input type="text" required maxLength={80} value={formData.titulo} onChange={(e) => setFormData({ ...formData, titulo: e.target.value })} placeholder="Ej: 30% OFF en Riviera Maya" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descuento (etiqueta)</label>
                            <input type="text" required maxLength={12} value={formData.descuento} onChange={(e) => setFormData({ ...formData, descuento: e.target.value })} placeholder="Ej: 30%, 2x1, -1" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Descripción</label>
                            <textarea required rows={3} maxLength={280} value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} placeholder="Detalles de la promoción..." className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 resize-none" />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Código Promocional</label>
                            <input type="text" required maxLength={20} value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value.toUpperCase() })} placeholder="Ej: RIVIERA30" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono uppercase focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Color de Tarjeta</label>
                            <select value={formData.color} onChange={(e) => setFormData({ ...formData, color: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer">
                                {COLORES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Vigencia (opcional)</label>
                            <input type="date" value={formData.vigencia} onChange={(e) => setFormData({ ...formData, vigencia: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 cursor-pointer" />
                            <p className="text-[10px] text-slate-400 mt-1.5">Si se deja vacía, la oferta no expira. Al vencer se oculta automáticamente del cliente.</p>
                        </div>

                        <div className="flex items-end">
                            <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 w-full">
                                <input
                                    type="checkbox"
                                    id="oferta-activa"
                                    checked={formData.activo}
                                    onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                                />
                                <label htmlFor="oferta-activa" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer select-none">
                                    Mostrar oferta a clientes
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 pt-4 flex flex-col sm:flex-row justify-end gap-3">
                            <button type="button" onClick={resetForm} className="px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 border border-slate-200 hover:bg-slate-50 text-center">Cancelar</button>
                            <button type="submit" disabled={guardando} className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl hover:bg-emerald-700 shadow-lg disabled:opacity-50">
                                {guardando ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* LISTADO */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Ofertas Publicadas</h2>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por título, código o descuento..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 text-slate-700"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-200/60 px-1.5 py-0.5 rounded-md">Limpiar</button>
                        )}
                    </div>
                </div>

                {cargando ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                        <Loader2 size={32} className="animate-spin text-emerald-500 mb-3" />
                        <span className="text-xs font-bold uppercase tracking-widest">Cargando ofertas...</span>
                    </div>
                ) : filteredOfertas.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        <Tag size={40} className="mx-auto text-slate-200 mb-3" />
                        <p className="text-slate-400 text-sm font-medium">
                            {ofertas.length === 0 ? 'No hay ofertas registradas todavía.' : 'No se encontraron ofertas que coincidan con la búsqueda.'}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[650px]">
                            <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <th className="pb-4 w-12 text-center">Mover</th>
                                    <th className="pb-4">Descuento</th>
                                    <th className="pb-4">Título</th>
                                    <th className="pb-4">Código</th>
                                    <th className="pb-4">Vigencia</th>
                                    <th className="pb-4 text-center">Estado</th>
                                    <th className="pb-4 text-right pr-4">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {currentItems.map((oferta, index) => {
                                    const vencida = esVencida(oferta);
                                    return (
                                        <tr
                                            key={oferta.id}
                                            draggable={!searchQuery}
                                            onDragStart={() => handleDragStart(index)}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDragEnd={handleDragEnd}
                                            className={`group text-sm text-slate-700 transition-all duration-150 ${draggedIndex === index ? 'opacity-40 bg-slate-100 scale-[0.98]' : 'hover:bg-slate-50/80'} ${!oferta.activo ? 'opacity-50 bg-slate-50/50' : ''}`}
                                        >
                                            <td className={`py-4 text-center text-slate-300 transition-colors ${!searchQuery ? 'cursor-grab active:cursor-grabbing group-hover:text-slate-400' : 'opacity-20 cursor-not-allowed'}`} title={searchQuery ? 'Deshabilita la búsqueda para reordenar' : 'Arrastra para cambiar posición'}>
                                                <div className="flex justify-center"><Move size={16} /></div>
                                            </td>

                                            <td className="py-4">
                                                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wide">{oferta.descuento}</span>
                                            </td>

                                            <td className="py-4 max-w-[240px]">
                                                <p className="font-bold text-slate-900 truncate">{oferta.titulo}</p>
                                                <p className="text-xs text-slate-400 truncate">{oferta.descripcion}</p>
                                            </td>

                                            <td className="py-4">
                                                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">{oferta.codigo}</span>
                                            </td>

                                            <td className="py-4 whitespace-nowrap">
                                                {oferta.vigencia?.toDate ? (
                                                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${vencida ? 'text-red-500' : 'text-slate-500'}`}>
                                                        {formatVigencia(oferta.vigencia)}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-300 italic">Sin límite</span>
                                                )}
                                            </td>

                                            <td className="py-4 text-center">
                                                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                                                    !oferta.activo ? 'bg-slate-200 text-slate-600' : vencida ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {!oferta.activo ? 'Oculta' : vencida ? 'Vencida' : 'Visible'}
                                                </span>
                                            </td>

                                            <td className="py-4 text-right pr-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(oferta)}
                                                        className={`p-2 bg-white border rounded-xl transition-all shadow-sm ${oferta.activo ? 'border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100' : 'border-slate-200 text-amber-600 bg-amber-50'}`}
                                                        title={oferta.activo ? 'Ocultar a clientes' : 'Mostrar a clientes'}
                                                    >
                                                        {oferta.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditClick(oferta)}
                                                        className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                                                        title="Editar oferta"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteOferta(oferta)}
                                                        className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                                                        title="Eliminar permanentemente"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 mt-4 gap-4">
                                <p className="text-xs text-slate-400 font-medium">
                                    Mostrando <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> al <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredOfertas.length)}</span> de <span className="font-bold text-slate-700">{filteredOfertas.length}</span> ofertas
                                </p>
                                <div className="flex items-center gap-1.5">
                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                        <button
                                            key={page}
                                            type="button"
                                            onClick={() => setCurrentPage(page)}
                                            className={`w-9 h-9 text-xs font-black rounded-xl transition-all ${currentPage === page ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'border border-slate-200 hover:bg-slate-50 text-slate-600'}`}
                                        >
                                            {page}
                                        </button>
                                    ))}

                                    <button
                                        type="button"
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 disabled:hover:bg-transparent text-slate-600 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
