import React, { useState, useEffect } from 'react';
import { storage } from '../../../lib/firebase'; // Tu configuración de Firebase
import { ref, listAll, getDownloadURL, deleteObject, uploadBytesResumable } from 'firebase/storage';
import { Folder, FileImage, ArrowLeft, Trash2, Upload, FolderPlus, Home, Loader2, ChevronRight, Link2 } from 'lucide-react';

export default function MediaManager() {
    // Array de strings para rastrear la ruta actual. Ej: ['hoteles', 'cancun'] -> hoteles/cancun/
    const [currentPath, setCurrentPath] = useState([]);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Estados para subidas de archivos
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [newFolderName, setNewFolderName] = useState('');
    const [showFolderForm, setShowFolderForm] = useState(false);

    // Convertir el array de la ruta actual en un String válido para Firebase
    const getPathString = (pathArray) => {
        if (pathArray.length === 0) return "";
        return pathArray.join("/") + "/";
    };

    useEffect(() => {
        fetchStorageItems();
    }, [currentPath]);

    const fetchStorageItems = async () => {
        setIsLoading(true);
        try {
            const pathString = getPathString(currentPath);
            const storageRef = ref(storage, pathString);
            const res = await listAll(storageRef);

            // 1. Extraer nombres de las subcarpetas virtuales
            const folderList = res.prefixes.map(prefix => prefix.name);

            // 2. Extraer datos e URLs de los archivos simultáneamente
            const filePromises = res.items.map(async (item) => {
                const url = await getDownloadURL(item);
                return {
                    name: item.name,
                    fullPath: item.fullPath,
                    url: url
                };
            });

            const fileList = await Promise.all(filePromises);

            setFolders(folderList);
            setFiles(fileList);
        } catch (error) {
            console.error("Error listando archivos de Firebase Storage:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Navegar hacia adentro de una carpeta
    const handleFolderClick = (folderName) => {
        setCurrentPath([...currentPath, folderName]);
    };

    // Regresar un nivel atrás o ir a una carpeta específica desde el breadcrumb
    const handleBreadcrumbClick = (index) => {
        if (index === -1) {
            setCurrentPath([]); // Ir a la raíz
        } else {
            setCurrentPath(currentPath.slice(0, index + 1));
        }
    };

    // Crear una carpeta virtual subiendo un archivo fantasma o guardando el prefijo local
    const handleCreateFolder = (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        // Agregamos la carpeta visualmente al estado local inmediatamente
        const sanitizedFolderName = newFolderName.replace(/[^a-zA-Z0-9-_]/g, '');
        setFolders([...folders, sanitizedFolderName]);
        setNewFolderName('');
        setShowFolderForm(false);
    };

    // Subir archivo en la carpeta en la que estamos parados actualmente
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const pathString = getPathString(currentPath);
        const fileRef = ref(storage, `${pathString}${Date.now()}_${file.name}`);
        const uploadTask = uploadBytesResumable(fileRef, file);

        setIsUploading(true);

        uploadTask.on('state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (error) => {
                console.error("Error al subir:", error);
                setIsUploading(false);
            },
            async () => {
                setIsUploading(false);
                setUploadProgress(0);
                await fetchStorageItems(); // Recargar archivos del directorio
            }
        );
    };

    // Borrar archivo permanentemente
    const handleDeleteFile = async (fileObj) => {
        const confirmDelete = window.confirm(`¿Eliminar definitivamente el archivo: ${fileObj.name}?`);
        if (!confirmDelete) return;

        try {
            const fileRef = ref(storage, fileObj.fullPath);
            await deleteObject(fileRef);
            await fetchStorageItems(); // Recargar vista
        } catch (error) {
            console.error("Error borrando objeto:", error);
            alert("No se pudo borrar el archivo.");
        }
    };

    const handleCopyUrl = (url) => {
        navigator.clipboard.writeText(url);
        alert("¡Enlace de la imagen copiado al portapapeles!");
    };

    return (
        <div className="space-y-6 w-full font-sans">
            {/* COMPONENTE: ENCABEZADO */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Biblioteca de Medios</h1>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Controla las imágenes de tu servidor organizadas por carpetas dinámicas.</p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                        onClick={() => setShowFolderForm(!showFolderForm)}
                        className="flex-1 sm:flex-initial flex items-center justify-center gap-2 border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider px-4 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                        <FolderPlus size={14} /> Nueva Carpeta
                    </button>

                    <label className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/10 cursor-pointer disabled:opacity-50">
                        <Upload size={14} /> Subir Imagen
                        <input type="file" accept="image/*" onChange={handleFileUpload} disabled={isUploading} className="hidden" />
                    </label>
                </div>
            </div>

            {/* FORMULARIO FLOTANTE CREACIÓN CARPETA */}
            {showFolderForm && (
                <form onSubmit={handleCreateFolder} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-3 max-w-md animate-fade-in">
                    <input
                        type="text"
                        placeholder="Nombre de la carpeta (sin espacios)..."
                        value={newFolderName}
                        required
                        onChange={(e) => setNewFolderName(e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-slate-700"
                    />
                    <button type="submit" className="bg-slate-900 text-white font-bold text-xs uppercase px-4 py-2.5 rounded-xl hover:bg-slate-800">Crear</button>
                </form>
            )}

            {/* BARRA DE DIRECCIÓN / MIGA DE PAN (BREADCRUMBS) */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 flex items-center flex-wrap gap-2 text-xs font-bold text-slate-600 shadow-sm">
                <button onClick={() => handleBreadcrumbClick(-1)} className="flex items-center gap-1 text-indigo-600 hover:underline">
                    <Home size={14} /> Raíz
                </button>

                {currentPath.map((folder, index) => (
                    <React.Fragment key={index}>
                        <ChevronRight size={12} className="text-slate-300" />
                        <button
                            onClick={() => handleBreadcrumbClick(index)}
                            className={`hover:underline ${index === currentPath.length - 1 ? 'text-slate-900 font-black' : 'text-indigo-600'}`}
                        >
                            {folder}
                        </button>
                    </React.Fragment>
                ))}

                {currentPath.length > 0 && (
                    <button
                        onClick={() => handleBreadcrumbClick(currentPath.length - 2)}
                        className="ml-auto flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-400 hover:text-slate-600"
                    >
                        <ArrowLeft size={12} /> Volver
                    </button>
                )}
            </div>

            {/* PROGRESS BAR DE SUBIDAS */}
            {isUploading && (
                <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-inner">
                    <div className="flex justify-between text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1.5">
                        <span>Subiendo archivo al servidor...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 transition-all duration-150" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                </div>
            )}

            {/* GRILLA EXPLORADORA DE ARCHIVOS */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl p-6 md:p-8 min-h-[350px] relative">
                {isLoading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 rounded-[2rem] z-10">
                        <Loader2 size={32} className="text-indigo-600 animate-spin mb-2" />
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sincronizando la nube...</span>
                    </div>
                ) : null}

                {folders.length === 0 && files.length === 0 && !isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400 text-center">
                        <Folder size={48} className="text-slate-200 mb-2" />
                        <p className="text-sm font-medium">Esta carpeta está vacía.</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Sube una imagen o crea una subcarpeta arriba.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">

                        {/* RENDERIZAR CARPETAS */}
                        {folders.map((folderName, index) => (
                            <button
                                key={`folder-${index}`}
                                onClick={() => handleFolderClick(folderName)}
                                className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-indigo-50 border border-slate-200/60 rounded-2xl transition-all group text-center"
                            >
                                <Folder size={40} className="text-amber-500 fill-amber-400 group-hover:scale-110 transition-transform duration-200" />
                                <span className="text-xs font-bold text-slate-800 tracking-tight mt-2 line-clamp-1 w-full px-1">
                                    {folderName}
                                </span>
                            </button>
                        ))}

                        {/* RENDERIZAR IMÁGENES/ARCHIVOS */}
                        {files.map((file, index) => (
                            <div
                                key={`file-${index}`}
                                className="flex flex-col bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden group relative hover:shadow-md transition-shadow"
                            >
                                {/* Contenedor Preview Imagen */}
                                <div className="w-full aspect-square bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                                    <img src={file.url} alt={file.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />

                                    {/* Capa Flotante de Acciones Rápidas en Hover */}
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                                        <button
                                            onClick={() => handleCopyUrl(file.url)}
                                            className="p-2 bg-white text-slate-800 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors shadow-md"
                                            title="Copiar URL para tus Cards/Sliders"
                                        >
                                            <Link2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteFile(file)}
                                            className="p-2 bg-white text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-colors shadow-md"
                                            title="Eliminar permanentemente"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                {/* Pie de la tarjeta del archivo */}
                                <div className="p-2.5">
                                    <p className="text-[11px] font-bold text-slate-700 truncate" title={file.name}>
                                        {file.name.split('_').slice(1).join('_') || file.name} {/* Quita el timestamp visualmente */}
                                    </p>
                                </div>
                            </div>
                        ))}

                    </div>
                )}
            </div>
        </div>
    );
}