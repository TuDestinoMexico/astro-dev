import React, { useState, useEffect, useMemo } from 'react';
import { db, storage } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
// Importamos listAll para poder listar los archivos existentes en el Storage
import { ref, uploadBytesResumable, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
// Añadimos el ícono Image de lucide-react
import { Plus, X, Save, Edit2, ArrowUp, Loader2, User, Trash2, Move, Eye, EyeOff, Search, ChevronLeft, ChevronRight, Image } from 'lucide-react';

export default function TeamView() {
    const [team, setTeam] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({ nombre: '', puesto: '', foto: '', posicion: 1, activo: true });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    // NUEVOS ESTADOS: Control de la Galería Interna
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);

    useEffect(() => {
        fetchTeam();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const fetchTeam = async () => {
        try {
            const q = query(collection(db, "equipo"), orderBy("posicion", "asc"));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                items.push({
                    id: doc.id,
                    ...data,
                    activo: data.activo !== false
                });
            });
            setTeam(items);
        } catch (error) {
            console.error("Error leyendo equipo: ", error);
        }
    };

    // LÓGICA PARA LEER LAS FOTOS EXISTENTES DEL STORAGE
    const fetchGalleryImages = async () => {
        setIsLoadingGallery(true);
        try {
            const storageRef = ref(storage, 'equipo/');
            const res = await listAll(storageRef);

            const imagePromises = res.items.map(async (item) => {
                const url = await getDownloadURL(item);
                return { name: item.name, url };
            });

            const imagesList = await Promise.all(imagePromises);
            setGalleryImages(imagesList);
        } catch (error) {
            console.error("Error listando imágenes de la galería:", error);
        } finally {
            setIsLoadingGallery(false);
        }
    };

    const filteredTeam = useMemo(() => {
        return team.filter(member =>
            member.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.puesto.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [team, searchQuery]);

    const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);

    const { currentItems, indexOfFirstItem, indexOfLastItem } = useMemo(() => {
        const lastItem = currentPage * itemsPerPage;
        const firstItem = lastItem - itemsPerPage;
        return {
            currentItems: filteredTeam.slice(firstItem, lastItem),
            indexOfFirstItem: firstItem,
            indexOfLastItem: lastItem
        };
    }, [filteredTeam, currentPage]);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const storageRef = ref(storage, `equipo/${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        setIsUploading(true);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Error al subir imagen:", error);
                alert("Error al subir la imagen.");
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setFormData({ ...formData, foto: downloadURL });
                setIsUploading(false);
                setUploadProgress(0);
            }
        );
    };

    const handleSaveTeamMember = async (e) => {
        e.preventDefault();
        try {
            const posicionFinal = editingId ? Number(formData.posicion) : team.length + 1;

            const memberData = {
                nombre: formData.nombre,
                puesto: formData.puesto,
                foto: formData.foto || "https://placehold.co/400x400?text=Perfil",
                posicion: posicionFinal,
                activo: formData.activo
            };

            if (editingId) {
                await updateDoc(doc(db, "equipo", editingId), memberData);
            } else {
                await addDoc(collection(db, "equipo"), memberData);
            }

            setIsEditing(false);
            setEditingId(null);
            setFormData({ nombre: '', puesto: '', foto: '', posicion: 1, activo: true });
            await fetchTeam();
        } catch (error) {
            console.error("Error al guardar miembro: ", error);
            alert("Ocurrió un error al guardar los datos.");
        }
    };

    const handleToggleStatus = async (member) => {
        try {
            const memberRef = doc(db, "equipo", member.id);
            await updateDoc(memberRef, { activo: !member.activo });
            await fetchTeam();
        } catch (error) {
            console.error("Error al cambiar estado de visibilidad:", error);
        }
    };

    const handleDeleteMember = async (id, nombre, fotoUrl) => {
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas ELIMINAR DEFINITIVAMENTE a ${nombre}?`);
        if (!confirmDelete) return;

        try {
            if (fotoUrl && !fotoUrl.includes('placehold.co')) {
                try {
                    const imageRef = ref(storage, fotoUrl);
                    await deleteObject(imageRef);
                } catch (storageError) {
                    console.error("Error al intentar borrar la foto de Storage:", storageError);
                }
            }

            await deleteDoc(doc(db, "equipo", id));
            const updatedTeam = team.filter(member => member.id !== id);
            await saveNewOrder(updatedTeam);
            alert(`${nombre} ha sido eliminado permanentemente.`);
        } catch (error) {
            console.error("Error al eliminar miembro:", error);
        }
    };

    const handleEditClick = (member) => {
        setEditingId(member.id);
        setFormData({
            nombre: member.nombre,
            puesto: member.puesto,
            foto: member.foto,
            posicion: member.posicion,
            activo: member.activo !== false
        });
        setIsEditing(true);
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

        const newTeam = [...team];
        const draggedItem = newTeam[globalDraggedIdx];

        newTeam.splice(globalDraggedIdx, 1);
        newTeam.splice(globalTargetIdx, 0, draggedItem);

        setDraggedIndex(localIndex);
        setTeam(newTeam);
    };

    const handleDragEnd = async () => {
        setDraggedIndex(null);
        await saveNewOrder(team);
    };

    const saveNewOrder = async (currentTeamList) => {
        try {
            const batch = writeBatch(db);
            currentTeamList.forEach((member, index) => {
                const memberRef = doc(db, "equipo", member.id);
                batch.update(memberRef, { posicion: index + 1 });
            });
            await batch.commit();
            await fetchTeam();
        } catch (error) {
            console.error("Error al guardar el nuevo orden de posiciones:", error);
        }
    };

    const handleSelectFromGallery = (url) => {
        setFormData({ ...formData, foto: url });
        setIsMediaModalOpen(false);
    };

    return (
        <div className="space-y-6 animate-fade-in w-full">
            {/* ENCABEZADO */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Nuestro Equipo</h1>
                    <p className="text-sm text-slate-400 font-medium mt-1">Administra, desactiva o reordena los miembros arrastrando las filas.</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => { setIsEditing(true); setEditingId(null); }}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-5 py-3.5 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10"
                    >
                        <Plus size={14} /> Add Miembro
                    </button>
                )}
            </div>

            {/* FORMULARIO */}
            {isEditing && (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl p-6 md:p-8 border-t-4 border-t-indigo-600">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                            {editingId ? "Actualizar Miembro" : "Nuevo Miembro"}
                        </h2>
                        <button onClick={() => { setIsEditing(false); setEditingId(null); setFormData({ nombre: '', puesto: '', foto: '', posicion: 1, activo: true }); }} className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100">
                            <X size={18} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveTeamMember} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 flex flex-col sm:flex-row items-center gap-6 p-4 border border-dashed border-slate-300 rounded-2xl bg-slate-50">
                            <div className="w-24 h-24 shrink-0 rounded-full bg-slate-200 border-4 border-white shadow-md overflow-hidden flex items-center justify-center relative">
                                {formData.foto ? (
                                    <img src={formData.foto} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} className="text-slate-400" />
                                )}
                                {isUploading && (
                                    <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                                        <Loader2 size={24} className="text-white animate-spin" />
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 w-full space-y-3">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Fotografía del Perfil</label>

                                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-colors disabled:opacity-50 cursor-pointer" />

                                    {/* BOTÓN: ABRIR GALERÍA EXISTENTE */}
                                    <button
                                        type="button"
                                        onClick={() => { setIsMediaModalOpen(true); fetchGalleryImages(); }}
                                        className="flex items-center justify-center gap-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
                                    >
                                        <Image size={14} /> Elegir Existente
                                    </button>
                                </div>

                                {isUploading && (
                                    <div className="w-full mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-600 transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Nombre Completo</label>
                            <input type="text" required value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Puesto / Rol</label>
                            <input type="text" required value={formData.puesto} onChange={(e) => setFormData({...formData, puesto: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <input
                                type="checkbox"
                                id="activo"
                                checked={formData.activo}
                                onChange={(e) => setFormData({...formData, activo: e.target.checked})}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer"
                            />
                            <label htmlFor="activo" className="text-xs font-bold text-slate-700 uppercase tracking-wider cursor-pointer selects-none">
                                Mostrar miembro en el sitio web público
                            </label>
                        </div>

                        {editingId && (
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Posición Manual (Orden)</label>
                                <input type="number" min="1" required value={formData.posicion} onChange={(e) => setFormData({...formData, posicion: e.target.value})} className="w-full md:w-1/2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500" />
                            </div>
                        )}

                        <div className="md:col-span-2 pt-4 flex flex-col sm:flex-row justify-end gap-3">
                            <button type="button" onClick={() => { setIsEditing(false); setEditingId(null); setFormData({ nombre: '', puesto: '', foto: '', posicion: 1, activo: true }); }} className="px-5 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider text-slate-500 border border-slate-200 hover:bg-slate-50 text-center">Cancelar</button>
                            <button type="submit" disabled={isUploading} className="flex items-center justify-center gap-2 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl hover:bg-emerald-700 shadow-lg disabled:opacity-50">
                                <Save size={14} /> Guardar
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* TABLA PRINCIPAL Y CONTROLES */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">Estructura del Equipo</h2>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar miembro por nombre o rol..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-400 text-slate-700"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold bg-slate-200/60 px-1.5 py-0.5 rounded-md">Limpiar</button>
                        )}
                    </div>
                </div>

                {filteredTeam.length === 0 ? (
                    <p className="text-slate-400 text-sm py-8 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                        {team.length === 0 ? "No hay miembros registrados todavía." : "No se encontraron miembros que coincidan con la búsqueda."}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                <th className="pb-4 w-12 text-center">Mover</th>
                                <th className="pb-4">Foto</th>
                                <th className="pb-4">Nombre</th>
                                <th className="pb-4">Puesto</th>
                                <th className="pb-4 text-center">Estado</th>
                                <th className="pb-4 text-center">Posición</th>
                                <th className="pb-4 text-right pr-4">Acciones</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                            {currentItems.map((member, index) => (
                                <tr
                                    key={member.id}
                                    draggable={!searchQuery}
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    className={`group text-sm text-slate-700 transition-all duration-150 ${draggedIndex === index ? 'opacity-40 bg-slate-100 scale-[0.98]' : 'hover:bg-slate-50/80'} ${!member.activo ? 'opacity-50 bg-slate-50/50' : ''}`}
                                >
                                    <td className={`py-4 text-center text-slate-300 transition-colors ${!searchQuery ? 'cursor-grab active:cursor-grabbing group-hover:text-slate-400' : 'opacity-20 cursor-not-allowed'}`} title={searchQuery ? "Deshabilita la búsqueda para reordenar perfiles" : "Arrastra para cambiar posición"}>
                                        <div className="flex justify-center"><Move size={16} /></div>
                                    </td>

                                    <td className="py-4">
                                        <img src={member.foto} alt={member.nombre} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                                    </td>

                                    <td className="py-4 font-bold text-slate-900">{member.nombre}</td>
                                    <td className="py-4 font-medium text-slate-500">{member.puesto}</td>

                                    <td className="py-4 text-center">
                                        <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${member.activo ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                            {member.activo ? "Visible" : "Oculto"}
                                        </span>
                                    </td>

                                    <td className="py-4 text-center">
                                            <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-mono font-bold px-2.5 py-0.5 rounded-md">
                                                <ArrowUp size={10} className="text-slate-400" /> #{member.posicion}
                                            </span>
                                    </td>

                                    <td className="py-4 text-right pr-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => handleToggleStatus(member)}
                                                className={`p-2 bg-white border rounded-xl transition-all shadow-sm ${member.activo ? 'border-slate-200 text-slate-400 hover:text-amber-600 hover:bg-amber-50 hover:border-amber-100' : 'border-slate-200 text-amber-600 bg-amber-50'}`}
                                                title={member.activo ? "Ocultar en web" : "Mostrar en web"}
                                            >
                                                {member.activo ? <Eye size={14} /> : <EyeOff size={14} />}
                                            </button>

                                            <button
                                                onClick={() => handleEditClick(member)}
                                                className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
                                                title="Editar miembro"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteMember(member.id, member.nombre, member.foto)}
                                                className="p-2 bg-white border border-slate-200 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
                                                title="Eliminar permanentemente"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>

                        {totalPages > 1 && (
                            <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 pt-6 mt-4 gap-4">
                                <p className="text-xs text-slate-400 font-medium">
                                    Mostrando <span className="font-bold text-slate-700">{indexOfFirstItem + 1}</span> al <span className="font-bold text-slate-700">{Math.min(indexOfLastItem, filteredTeam.length)}</span> de <span className="font-bold text-slate-700">{filteredTeam.length}</span> miembros
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

            {/* ======================================================= */}
            {/* COMPONENTE MODAL INTERNO: SELECTOR DE IMÁGENES STORAGE   */}
            {/* ======================================================= */}
            {isMediaModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-2xl w-full max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-scale-up">

                        {/* Cabecera del modal */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Seleccionar de la Galería</h3>
                                <p className="text-[11px] text-slate-400 font-medium">Elige una fotografía existente de la carpeta 'equipo'</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMediaModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/50 transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Contenido/Grilla de imágenes */}
                        <div className="p-6 overflow-y-auto flex-1 min-h-[250px] relative bg-white">
                            {isLoadingGallery ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                                    <Loader2 size={32} className="text-indigo-600 animate-spin mb-2" />
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Leyendo Storage...</span>
                                </div>
                            ) : galleryImages.length === 0 ? (
                                <div className="text-center py-12 text-slate-400">
                                    <Image size={40} className="mx-auto text-slate-200 mb-2" />
                                    <p className="text-sm font-medium">No se encontraron imágenes en 'equipo/'</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSelectFromGallery(img.url)}
                                            className="group flex flex-col bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:border-indigo-500 hover:shadow-md transition-all text-left"
                                        >
                                            <div className="w-full aspect-square bg-slate-200 relative overflow-hidden flex items-center justify-center">
                                                <img src={img.url} alt={img.name} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200" />
                                            </div>
                                            <div className="p-2 truncate w-full text-[10px] font-bold text-slate-600 group-hover:text-indigo-600 transition-colors">
                                                {img.name.split('_').slice(1).join('_') || img.name}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}