import React, { useState, useEffect } from 'react';
import { db, storage } from '../../../lib/firebase'; // Configuración intacta de Firebase
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
import { Settings, Upload, Save, Loader2, Globe, Image, ShieldAlert, Check, Eye } from 'lucide-react';

export default function ConfigView() {
    // Estado principal del formulario de configuraciones
    const [configData, setConfigData] = useState({
        sitioNombre: '',
        logoUrl: '',
        whatsappGlobal: '',
        modoMantenimiento: false
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // NUEVOS ESTADOS: Modal interno para reutilizar imágenes de la carpeta config/ o equipo/
    const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
    const [galleryImages, setGalleryImages] = useState([]);
    const [isLoadingGallery, setIsLoadingGallery] = useState(false);

    const configDocRef = doc(db, "config", "general");

    useEffect(() => {
        fetchConfig();
    }, []);

    // Leer las configuraciones actuales de Firestore
    const fetchConfig = async () => {
        try {
            const docSnap = await getDoc(configDocRef);
            if (docSnap.exists()) {
                setConfigData(docSnap.data());
            } else {
                // Valores por defecto si es la primera vez que se monta el sitio
                const defaultData = {
                    sitioNombre: 'Tu Destino MX',
                    logoUrl: 'https://placehold.co/200x60?text=Tu+Logo',
                    whatsappGlobal: '529987141365',
                    modoMantenimiento: false
                };
                await setDoc(configDocRef, defaultData);
                setConfigData(defaultData);
            }
        } catch (error) {
            console.error("Error cargando configuraciones:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Subir logo nuevo a Firebase Storage
    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Se guarda en una carpeta exclusiva de assets/logos
        const storageRef = ref(storage, `config/logo_${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        setIsUploading(true);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Error al subir el logo:", error);
                alert("Ocurrió un error al subir el archivo.");
                setIsUploading(false);
            },
            async () => {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                setConfigData({ ...configData, logoUrl: downloadURL });
                setIsUploading(false);
                setUploadProgress(0);
            }
        );
    };

    // Listar fotos existentes de la carpeta config/ por si quiere reusar un logo anterior
    const fetchConfigGallery = async () => {
        setIsLoadingGallery(true);
        try {
            const storageRef = ref(storage, 'config/');
            const res = await listAll(storageRef);
            const imagePromises = res.items.map(async (item) => {
                const url = await getDownloadURL(item);
                return { name: item.name, url };
            });
            const imagesList = await Promise.all(imagePromises);
            setGalleryImages(imagesList);
        } catch (error) {
            console.error("Error leyendo galería de logos:", error);
        } finally {
            setIsLoadingGallery(false);
        }
    };

    // Guardar los cambios finales en Firestore
    const handleSaveConfig = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await updateDoc(configDocRef, configData);
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000); // Desvanecer aviso de guardado
        } catch (error) {
            console.error("Error guardando ajustes en Firestore:", error);
            alert("No se pudieron guardar los cambios.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="w-full h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="animate-spin text-indigo-500 w-8 h-8" />
                <span className="text-xs font-bold uppercase tracking-widest">Sincronizando Ajustes...</span>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in w-full font-sans">
            {/* ENCABEZADO */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                        <Settings className="text-slate-700 w-6 h-6" /> Configuración General
                    </h1>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Controla la identidad de la marca, logos, variables globales del sistema y visualización pública.</p>
                </div>
            </div>

            {/* CUERPO CENTRAL DE CONFIGURACIONES */}
            <form onSubmit={handleSaveConfig} className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* COLUMNA IZQUIERDA: IDENTIDAD VISUAL (LOGO) */}
                <div className="lg:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 flex flex-col items-center justify-between min-h-[320px]">
                    <div className="w-full text-center space-y-4">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-50 pb-2">Logo Corporativo</h2>

                        {/* Previsualización Estilizada del Logo Actual */}
                        <div className="w-full h-32 bg-slate-950/5 border border-slate-200/60 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden group">
                            <img
                                src={configData.logoUrl}
                                alt="Logo del Sitio"
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        <div className="space-y-2 w-full pt-2">
                            <label className="flex items-center justify-center gap-2 w-full bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider py-3 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer">
                                <Upload size={14} /> Cambiar Archivo
                                <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            </label>

                            <button
                                type="button"
                                onClick={() => { setIsMediaModalOpen(true); fetchConfigGallery(); }}
                                className="w-full flex items-center justify-center gap-2 border border-dashed border-slate-200 text-slate-400 font-medium text-xs py-2 rounded-xl hover:text-indigo-600 hover:border-indigo-500/30 transition-colors"
                            >
                                <Image size={12} /> Seleccionar de Historial
                            </button>
                        </div>

                        {isUploading && (
                            <div className="w-full pt-2">
                                <div className="flex justify-between text-[10px] font-bold text-indigo-600 uppercase mb-1">
                                    <span>Subiendo Logo...</span>
                                    <span>{Math.round(uploadProgress)}%</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMNA DERECHA: PARAMETROS DEL SITIO */}
                <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-8 flex flex-col justify-between">
                    <div className="space-y-6">
                        <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">Parámetros Globales</h2>

                        {/* Fila 1: Nombre del Sitio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
                                    <Globe size={12} /> Nombre Comercial de la Empresa
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={configData.sitioNombre}
                                    onChange={(e) => setConfigData({ ...configData, sitioNombre: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                                />
                            </div>

                            {/* Fila 2: WhatsApp Corporativo */}
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">WhatsApp de Atención (Con Código de País)</label>
                                <input
                                    type="text"
                                    required
                                    value={configData.whatsappGlobal}
                                    placeholder="Ej: 529987141365"
                                    onChange={(e) => setConfigData({ ...configData, whatsappGlobal: e.target.value.replace(/\D/g, '') })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:border-indigo-500 text-slate-800 transition-colors"
                                />
                            </div>
                        </div>

                        {/* Fila 3: Switch Control de Mantenimiento */}
                        <div class="flex items-start gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                            <div className="pt-0.5">
                                <ShieldAlert className={configData.modoMantenimiento ? "text-amber-500 animate-pulse" : "text-slate-400"} size={20} />
                            </div>
                            <div className="flex-1">
                                <label className="text-xs font-black text-slate-800 uppercase tracking-wide block select-none">Modo Mantenimiento Activo</label>
                                <span className="text-[11px] text-slate-400 font-medium block mt-0.5">Al activarse, la web pública mostrará un aviso de actualización bloqueando los accesos comerciales temporalmente.</span>
                            </div>
                            <input
                                type="checkbox"
                                checked={configData.modoMantenimiento}
                                onChange={(e) => setConfigData({ ...configData, modoMantenimiento: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 accent-indigo-600 cursor-pointer mt-1"
                            />
                        </div>
                    </div>

                    {/* BOTÓN GUARDAR GENERAL */}
                    <div className="pt-6 border-t border-slate-50 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            {saveSuccess && (
                                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider animate-fade-in">
                                    <Check size={14} className="bg-emerald-100 text-emerald-700 p-0.5 rounded-full" /> Cambios aplicados con éxito
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSaving || isUploading}
                            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest px-8 py-3.5 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/10 disabled:opacity-50 transition-colors"
                        >
                            {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {isSaving ? "Guardando..." : "Guardar Ajustes"}
                        </button>
                    </div>
                </div>
            </form>

            {/* ======================================================= */}
            {/* MODAL: HISTORIAL DE LOGOS CARGADOS EN CONFIG/           */}
            {/* ======================================================= */}
            {isMediaModalOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] max-w-md w-full flex flex-col overflow-hidden shadow-2xl border border-slate-100">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Historial de Logos</h3>
                                <p className="text-[10px] text-slate-400 font-medium">Reutiliza una imagen de logotipo previamente cargada</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsMediaModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200/50 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto max-h-[40vh] min-h-[180px] relative bg-white">
                            {isLoadingGallery ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80">
                                    <Loader2 size={24} className="text-indigo-600 animate-spin mb-1" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Leyendo Storage...</span>
                                </div>
                            ) : galleryImages.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    <Image size={32} className="mx-auto text-slate-200 mb-1" />
                                    <p className="font-medium">No hay imágenes en 'config/'</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {galleryImages.map((img, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => { setConfigData({ ...configData, logoUrl: img.url }); setIsMediaModalOpen(false); }}
                                            className="group flex flex-col bg-slate-50 border border-slate-100 rounded-xl overflow-hidden hover:border-indigo-500 transition-all p-2 bg-slate-950/5 items-center justify-center h-20"
                                        >
                                            <img src={img.url} alt={img.name} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform" />
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