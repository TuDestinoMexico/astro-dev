import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../lib/firebase';
import { collection, getDocs, query, orderBy, addDoc, updateDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Plus, X, Save, Edit2, ArrowUp, Loader2, User, Trash2, Move, Eye, EyeOff } from 'lucide-react';

export default function TeamView() {
    const [team, setTeam] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState(null);
    // NUEVO: Agregamos 'activo' con valor inicial true al formData
    const [formData, setFormData] = useState({ nombre: '', puesto: '', foto: '', posicion: 1, activo: true });

    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [draggedIndex, setDraggedIndex] = useState(null);

    useEffect(() => {
        fetchTeam();
    }, []);

    const fetchTeam = async () => {
        try {
            const q = query(collection(db, "equipo"), orderBy("posicion", "asc"));
            const querySnapshot = await getDocs(q);
            const items = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Si el campo activo no existe en documentos viejos, lo tratamos como true por defecto
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
                activo: formData.activo // NUEVO: Guardamos el estado de visibilidad
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

    // NUEVA FUNCIÓN: Alternar el estado activo/inactivo rápidamente desde la tabla
    const handleToggleStatus = async (member) => {
        try {
            const memberRef = doc(db, "equipo", member.id);
            await updateDoc(memberRef, { activo: !member.activo });
            await fetchTeam(); // Sincronizar datos
        } catch (error) {
            console.error("Error al cambiar estado de visibilidad:", error);
            alert("No se pudo cambiar el estado del miembro.");
        }
    };

    const handleDeleteMember = async (id, nombre, fotoUrl) => {
        const confirmDelete = window.confirm(`¿Estás seguro de que deseas ELIMINAR DEFINITIVAMENTE a ${nombre} del equipo y borrar su foto de la nube?`);
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
            alert("No se pudo eliminar al miembro.");
        }
    };

    const handleEditClick = (member) => {
        setEditingId(member.id);
        setFormData({
            nombre: member.nombre,
            puesto: member.puesto,
            foto: member.foto,
            posicion: member.posicion,
            activo: member.activo !== false // NUEVO: Cargamos el estado al editar
        });
        setIsEditing(true);
    };

    const handleDragStart = (index) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;

        const newTeam = [...team];
        const draggedItem = newTeam[draggedIndex];

        newTeam.splice(draggedIndex, 1);
        newTeam.splice(index, 0, draggedItem);

        setDraggedIndex(index);
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

    return (
        <div className="space-y-6 animate-fade-in w-full">
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

                            <div className="flex-1 w-full">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Subir Fotografía</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-colors disabled:opacity-50 cursor-pointer" />
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

                        {/* NUEVO: Switch de Visibilidad en el Formulario */}
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

            {/* TABLA GENERAL */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-10">
                <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Estructura del Equipo</h2>
                {team.length === 0 ? (
                    <p className="text-slate-400 text-sm py-4 text-center">No hay miembros registrados todavía.</p>
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
                            {team.map((member, index) => (
                                <tr
                                    key={member.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragEnd={handleDragEnd}
                                    /* NUEVO: Si está inactivo, bajamos la opacidad de la fila entera */
                                    className={`group text-sm text-slate-700 transition-all duration-150 ${draggedIndex === index ? 'opacity-40 bg-slate-100 scale-[0.98]' : 'hover:bg-slate-50/80'} ${!member.activo ? 'opacity-50 bg-slate-50/50' : ''}`}
                                >
                                    <td className="py-4 text-center cursor-grab active:cursor-grabbing text-slate-300 group-hover:text-slate-400 transition-colors">
                                        <div className="flex justify-center"><Move size={16} /></div>
                                    </td>

                                    <td className="py-4">
                                        <img src={member.foto} alt={member.nombre} className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm" />
                                    </td>

                                    <td className="py-4 font-bold text-slate-900">{member.nombre}</td>
                                    <td className="py-4 font-medium text-slate-500">{member.puesto}</td>

                                    {/* NUEVO: Columna de Estado con Badge dinámico */}
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
                                            {/* NUEVO: Botón de Ojo para activar/desactivar rápido con un click */}
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
                    </div>
                )}
            </div>
        </div>
    );
}