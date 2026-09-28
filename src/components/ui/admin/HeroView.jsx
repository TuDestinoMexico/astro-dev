import { useEffect, useState } from 'react';
import { db, storage } from '../../../lib/firebase';
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    onSnapshot,
    serverTimestamp,
    setDoc,
    updateDoc,
    writeBatch,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import {
    ArrowDown,
    ArrowUp,
    Check,
    Eye,
    ImagePlus,
    LayoutTemplate,
    Loader2,
    Pause,
    Pencil,
    Plus,
    Save,
    Trash2,
    Upload,
    X,
} from 'lucide-react';

const EMPTY_FORM = {
    id: '',
    activo: true,
    eyebrow: '',
    titulo: '',
    descripcion: '',
    imagenUrl: '',
    imagenPath: '',
    alt: '',
    ubicacion: '',
    meta: '',
    ctaPrincipal: '',
    mensajeWhatsapp: '',
    ctaSecundario: '',
    ctaSecundarioUrl: '/destinos',
    posicion: 0,
};

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20';
const labelClass = 'text-[10px] font-black uppercase tracking-[0.14em] text-slate-500';

const normalizeSlide = (snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
});

const convertImageToWebp = (file) => new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDimension = 2400;
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d');

        if (!context) {
            reject(new Error('No se pudo preparar la imagen.'));
            return;
        }

        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('No se pudo convertir la imagen.'));
                return;
            }
            resolve(blob);
        }, 'image/webp', 0.82);
    };

    image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('El archivo seleccionado no es una imagen válida.'));
    };
    image.src = objectUrl;
});

export default function HeroView() {
    const [slides, setSlides] = useState([]);
    const [form, setForm] = useState(EMPTY_FORM);
    const [previousImagePath, setPreviousImagePath] = useState('');
    const [autoplayMs, setAutoplayMs] = useState(7000);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isSavingSettings, setIsSavingSettings] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'hero_slides'),
            (snapshot) => {
                const nextSlides = snapshot.docs
                    .map(normalizeSlide)
                    .sort((first, second) => Number(first.posicion || 0) - Number(second.posicion || 0));
                setSlides(nextSlides);
                setIsLoading(false);
            },
            (snapshotError) => {
                console.error('Error cargando slides del hero:', snapshotError);
                setError('No se pudieron cargar las diapositivas.');
                setIsLoading(false);
            },
        );

        getDoc(doc(db, 'config', 'homeHero'))
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const value = Number(snapshot.data().autoplayMs);
                    if (Number.isFinite(value)) setAutoplayMs(Math.min(15000, Math.max(4000, value)));
                }
            })
            .catch((settingsError) => console.error('Error cargando configuración del hero:', settingsError));

        return () => unsubscribe();
    }, []);

    const showSuccess = (message) => {
        setSuccess(message);
        window.setTimeout(() => setSuccess(''), 3500);
    };

    const startNewSlide = () => {
        setError('');
        setForm({ ...EMPTY_FORM, posicion: slides.length });
        setPreviousImagePath('');
    };

    const selectSlide = (slide) => {
        setError('');
        setForm({ ...EMPTY_FORM, ...slide });
        setPreviousImagePath(slide.imagenPath || '');
    };

    const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }));

    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;
        if (file.size > MAX_FILE_SIZE) {
            setError('La imagen original no puede superar 10 MB.');
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(0);

        try {
            const optimizedBlob = await convertImageToWebp(file);
            const draftId = form.id || `draft-${Date.now()}`;
            const fileRef = ref(storage, `hero/${draftId}/hero_${Date.now()}.webp`);
            const uploadTask = uploadBytesResumable(fileRef, optimizedBlob, {
                contentType: 'image/webp',
                cacheControl: 'public,max-age=31536000,immutable',
            });

            await new Promise((resolve, reject) => {
                uploadTask.on(
                    'state_changed',
                    (snapshot) => setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100),
                    reject,
                    resolve,
                );
            });

            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setForm((current) => ({ ...current, imagenUrl: imageUrl, imagenPath: fileRef.fullPath }));
        } catch (uploadError) {
            console.error('Error subiendo imagen del hero:', uploadError);
            setError('No se pudo optimizar o subir la imagen.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const validateForm = () => {
        if (!form.titulo.trim()) return 'El título es obligatorio.';
        if (!form.descripcion.trim()) return 'La descripción es obligatoria.';
        if (!form.imagenUrl.trim()) return 'Debes agregar una imagen antes de guardar.';
        if (!form.alt.trim()) return 'El texto alternativo de la imagen es obligatorio.';
        if (!form.ctaPrincipal.trim() || !form.mensajeWhatsapp.trim()) return 'Completa el CTA principal y su mensaje de WhatsApp.';
        if (form.ctaSecundarioUrl && !form.ctaSecundarioUrl.startsWith('/') && !form.ctaSecundarioUrl.startsWith('https://')) {
            return 'La URL secundaria debe ser una ruta interna o comenzar con https://.';
        }
        return '';
    };

    const handleSave = async (event) => {
        event.preventDefault();
        const validationError = validateForm();
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsSaving(true);
        const slideRef = form.id ? doc(db, 'hero_slides', form.id) : doc(collection(db, 'hero_slides'));
        const payload = {
            activo: Boolean(form.activo),
            eyebrow: form.eyebrow.trim(),
            titulo: form.titulo.trim(),
            descripcion: form.descripcion.trim(),
            imagenUrl: form.imagenUrl.trim(),
            imagenPath: form.imagenPath.trim(),
            alt: form.alt.trim(),
            ubicacion: form.ubicacion.trim(),
            meta: form.meta.trim(),
            ctaPrincipal: form.ctaPrincipal.trim(),
            mensajeWhatsapp: form.mensajeWhatsapp.trim(),
            ctaSecundario: form.ctaSecundario.trim(),
            ctaSecundarioUrl: form.ctaSecundarioUrl.trim() || '/destinos',
            posicion: Number(form.posicion) || 0,
            actualizadoEn: serverTimestamp(),
        };

        try {
            if (form.id) {
                await updateDoc(slideRef, payload);
            } else {
                await setDoc(slideRef, { ...payload, creadoEn: serverTimestamp() });
            }

            if (previousImagePath && previousImagePath !== payload.imagenPath) {
                try {
                    await deleteObject(ref(storage, previousImagePath));
                } catch (storageError) {
                    if (storageError?.code !== 'storage/object-not-found') throw storageError;
                }
            }

            setForm((current) => ({ ...current, id: slideRef.id }));
            setPreviousImagePath(payload.imagenPath);
            showSuccess('Diapositiva guardada correctamente.');
        } catch (saveError) {
            console.error('Error guardando slide del hero:', saveError);
            setError('No se pudo guardar la diapositiva.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!form.id || !window.confirm('¿Eliminar esta diapositiva definitivamente?')) return;
        setError('');
        setIsSaving(true);
        try {
            await deleteDoc(doc(db, 'hero_slides', form.id));
            if (form.imagenPath) {
                try {
                    await deleteObject(ref(storage, form.imagenPath));
                } catch (storageError) {
                    if (storageError?.code !== 'storage/object-not-found') throw storageError;
                }
            }
            startNewSlide();
            showSuccess('Diapositiva eliminada.');
        } catch (deleteError) {
            console.error('Error eliminando slide del hero:', deleteError);
            setError('No se pudo eliminar la diapositiva.');
        } finally {
            setIsSaving(false);
        }
    };

    const moveSlide = async (index, direction) => {
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= slides.length) return;
        const current = slides[index];
        const target = slides[targetIndex];
        setError('');
        try {
            const batch = writeBatch(db);
            batch.update(doc(db, 'hero_slides', current.id), { posicion: Number(target.posicion || targetIndex) });
            batch.update(doc(db, 'hero_slides', target.id), { posicion: Number(current.posicion || index) });
            await batch.commit();
        } catch (moveError) {
            console.error('Error reordenando slides:', moveError);
            setError('No se pudo actualizar el orden.');
        }
    };

    const toggleActive = async (slide) => {
        try {
            await updateDoc(doc(db, 'hero_slides', slide.id), { activo: slide.activo === false, actualizadoEn: serverTimestamp() });
        } catch (toggleError) {
            console.error('Error cambiando visibilidad del slide:', toggleError);
            setError('No se pudo cambiar la visibilidad.');
        }
    };

    const saveSettings = async (event) => {
        event.preventDefault();
        setIsSavingSettings(true);
        try {
            await setDoc(doc(db, 'config', 'homeHero'), {
                autoplayMs: Math.min(15000, Math.max(4000, Number(autoplayMs) || 7000)),
                actualizadoEn: serverTimestamp(),
            }, { merge: true });
            showSuccess('Configuración del hero guardada.');
        } catch (settingsError) {
            console.error('Error guardando configuración del hero:', settingsError);
            setError('No se pudo guardar la configuración.');
        } finally {
            setIsSavingSettings(false);
        }
    };

    if (isLoading) {
        return <div className="flex min-h-[20rem] items-center justify-center gap-3 text-sm font-bold text-slate-500"><Loader2 className="animate-spin text-brand-primary" size={22} /> Cargando editor del hero...</div>;
    }

    return (
        <div className="space-y-6">
            <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-brand-primary"><LayoutTemplate size={18} /><span className={labelClass}>Experiencia pública</span></div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900">Hero principal</h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Administra las historias, imágenes y llamadas a la acción que aparecen en la portada.</p>
                </div>
                <button type="button" onClick={startNewSlide} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-brand-primary/20 transition hover:bg-brand-primary-hover"><Plus size={17} /> Nueva diapositiva</button>
            </header>

            {error && <div role="alert" className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Cerrar error"><X size={16} /></button></div>}
            {success && <div role="status" className="flex items-center gap-2 rounded-xl border border-brand-primary/20 bg-brand-primary/10 px-4 py-3 text-sm font-semibold text-brand-primary-hover"><Check size={17} /> {success}</div>}

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className={labelClass}>Comportamiento</p>
                        <h2 className="mt-1 text-lg font-black text-slate-900">Rotación automática</h2>
                        <p className="mt-1 text-xs text-slate-500">El usuario puede pausarla y se respeta la preferencia de movimiento reducido.</p>
                    </div>
                    <form onSubmit={saveSettings} className="flex items-end gap-3">
                        <label className="block"><span className={labelClass}>Intervalo (ms)</span><input type="number" min="4000" max="15000" step="1000" value={autoplayMs} onChange={(event) => setAutoplayMs(event.target.value)} className="mt-2 w-32 rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-bold text-slate-800 outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20" /></label>
                        <button type="submit" disabled={isSavingSettings} className="inline-flex h-11 items-center gap-2 rounded-xl bg-slate-900 px-4 text-xs font-black uppercase tracking-wider text-white transition hover:bg-brand-primary disabled:opacity-50"><Pause size={15} /> {isSavingSettings ? 'Guardando' : 'Guardar'}</button>
                    </form>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(18rem,0.7fr)_minmax(0,1.3fr)]">
                <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
                    <div className="mb-4 flex items-center justify-between"><div><p className={labelClass}>Orden de publicación</p><h2 className="mt-1 text-lg font-black text-slate-900">Diapositivas <span className="text-sm font-bold text-slate-400">{slides.length}</span></h2></div><Eye size={18} className="text-slate-400" /></div>
                    {slides.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500"><p>No hay diapositivas publicadas.</p><p className="mt-2 text-xs text-slate-400">Crea la primera para mostrar el hero en la portada.</p></div> : <div className="space-y-3">
                        {slides.map((slide, index) => (
                            <div key={slide.id} className={`rounded-xl border p-3 transition ${form.id === slide.id ? 'border-brand-primary bg-brand-primary/5' : 'border-slate-200 bg-slate-50'}`}>
                                <button type="button" onClick={() => selectSlide(slide)} className="flex w-full gap-3 text-left">
                                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-200">{slide.imagenUrl ? <img src={slide.imagenUrl} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="m-auto mt-5 text-slate-400" size={20} />}</div>
                                    <div className="min-w-0 flex-1"><div className="flex items-center gap-2"><span className="text-[10px] font-black uppercase tracking-widest text-brand-primary">{String(index + 1).padStart(2, '0')}</span><span className={`h-1.5 w-1.5 rounded-full ${slide.activo === false ? 'bg-slate-300' : 'bg-brand-primary'}`}></span></div><p className="mt-1 truncate text-sm font-black text-slate-800">{slide.titulo || 'Sin título'}</p><p className="truncate text-xs text-slate-500">{slide.ubicacion || 'Sin destino'}</p></div>
                                </button>
                                <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-2"><button type="button" onClick={() => toggleActive(slide)} className={`text-[10px] font-black uppercase tracking-wider ${slide.activo === false ? 'text-slate-400' : 'text-brand-primary-hover'}`}>{slide.activo === false ? 'Oculta' : 'Activa'}</button><div className="flex gap-1"><button type="button" onClick={() => moveSlide(index, -1)} disabled={index === 0} aria-label="Subir diapositiva" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-brand-primary disabled:opacity-30"><ArrowUp size={15} /></button><button type="button" onClick={() => moveSlide(index, 1)} disabled={index === slides.length - 1} aria-label="Bajar diapositiva" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-brand-primary disabled:opacity-30"><ArrowDown size={15} /></button><button type="button" onClick={() => selectSlide(slide)} aria-label="Editar diapositiva" className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-brand-primary"><Pencil size={15} /></button></div></div>
                            </div>
                        ))}
                    </div>}
                </section>

                <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
                    <div className="mb-5 flex items-start justify-between gap-4"><div><p className={labelClass}>{form.id ? 'Editar diapositiva' : 'Nueva diapositiva'}</p><h2 className="mt-1 text-xl font-black text-slate-900">Contenido del hero</h2></div>{form.id && <button type="button" onClick={startNewSlide} className="text-xs font-black uppercase tracking-wider text-slate-400 hover:text-brand-primary">Limpiar</button>}</div>
                    <form onSubmit={handleSave} className="space-y-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block sm:col-span-2"><span className={labelClass}>Eyebrow</span><input value={form.eyebrow} onChange={(event) => updateField('eyebrow', event.target.value)} maxLength={50} placeholder="TRAVEL STUDIO · CANCÚN" className={inputClass} /></label>
                            <label className="block sm:col-span-2"><span className={labelClass}>Título principal *</span><input value={form.titulo} onChange={(event) => updateField('titulo', event.target.value)} maxLength={70} required className={inputClass} /><span className="mt-1 block text-right text-[10px] text-slate-400">{form.titulo.length}/70</span></label>
                            <label className="block sm:col-span-2"><span className={labelClass}>Descripción *</span><textarea value={form.descripcion} onChange={(event) => updateField('descripcion', event.target.value)} maxLength={220} required rows={3} className={inputClass} /><span className="mt-1 block text-right text-[10px] text-slate-400">{form.descripcion.length}/220</span></label>
                            <label className="block"><span className={labelClass}>Destino</span><input value={form.ubicacion} onChange={(event) => updateField('ubicacion', event.target.value)} maxLength={70} placeholder="Caribe Mexicano" className={inputClass} /></label>
                            <label className="block"><span className={labelClass}>Metadata</span><input value={form.meta} onChange={(event) => updateField('meta', event.target.value)} maxLength={55} placeholder="MAR · CULTURA · DESCANSO" className={inputClass} /></label>
                        </div>

                        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center"><div className="h-24 w-36 shrink-0 overflow-hidden rounded-lg bg-slate-200">{form.imagenUrl ? <img src={form.imagenUrl} alt={form.alt || ''} className="h-full w-full object-cover" /> : <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400"><ImagePlus size={22} /><span className="text-[9px] font-bold uppercase">Sin imagen</span></div>}</div><div><p className={labelClass}>Imagen principal *</p><p className="mt-1 text-xs leading-5 text-slate-500">WebP optimizado, máximo 10 MB originales. Ideal: imagen horizontal con sujeto o destino reconocible.</p><label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-brand-primary"><Upload size={14} /> {isUploading ? `Subiendo ${Math.round(uploadProgress)}%` : 'Subir imagen'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={isUploading} className="sr-only" /></label></div></div>
                            <label className="mt-4 block"><span className={labelClass}>Texto alternativo *</span><input value={form.alt} onChange={(event) => updateField('alt', event.target.value)} maxLength={140} placeholder="Bahía tropical vista desde el aire" className={inputClass} /></label>
                        </div>

                        <div>
                            <p className={labelClass}>Vista previa</p>
                            <div className="relative mt-2 min-h-48 overflow-hidden rounded-xl bg-brand-ink p-5 text-white">
                                {form.imagenUrl && <img src={form.imagenUrl} alt="" className="absolute inset-0 h-full w-full object-cover opacity-45" />}
                                <div className="absolute inset-0 bg-gradient-to-r from-brand-ink via-brand-ink/80 to-transparent"></div>
                                <div className="relative z-10 max-w-[75%]">
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-brand-primary">{form.eyebrow || 'TRAVEL STUDIO · CANCÚN'}</p>
                                    <p className="mt-3 text-xl font-black uppercase leading-none tracking-tight">{form.titulo || 'Tu próximo capítulo comienza aquí'}</p>
                                    <p className="mt-3 line-clamp-2 text-[10px] leading-4 text-white/70">{form.descripcion || 'La descripción de tu experiencia aparecerá aquí.'}</p>
                                    <span className="mt-4 inline-flex rounded-lg bg-brand-primary px-3 py-2 text-[8px] font-black uppercase tracking-wider">{form.ctaPrincipal || 'Diseñar mi viaje'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block"><span className={labelClass}>CTA principal *</span><input value={form.ctaPrincipal} onChange={(event) => updateField('ctaPrincipal', event.target.value)} maxLength={35} placeholder="Diseñar mi viaje" className={inputClass} /></label>
                            <label className="block"><span className={labelClass}>CTA secundario</span><input value={form.ctaSecundario} onChange={(event) => updateField('ctaSecundario', event.target.value)} maxLength={35} placeholder="Explorar destinos" className={inputClass} /></label>
                            <label className="block sm:col-span-2"><span className={labelClass}>Mensaje de WhatsApp *</span><textarea value={form.mensajeWhatsapp} onChange={(event) => updateField('mensajeWhatsapp', event.target.value)} maxLength={220} rows={2} placeholder="¡Hola! Quiero diseñar mi próximo viaje..." className={inputClass} /></label>
                            <label className="block"><span className={labelClass}>URL CTA secundario</span><input value={form.ctaSecundarioUrl} onChange={(event) => updateField('ctaSecundarioUrl', event.target.value)} maxLength={180} className={inputClass} /></label>
                            <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 px-3.5 py-3"><input type="checkbox" checked={form.activo !== false} onChange={(event) => updateField('activo', event.target.checked)} className="h-4 w-4 accent-[#00c0a5]" /><span><span className={labelClass}>Publicar slide</span><span className="mt-1 block text-xs text-slate-500">Visible en el sitio público</span></span></label>
                        </div>

                        <div className="flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center"><div>{form.id && <button type="button" onClick={handleDelete} disabled={isSaving} className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-red-500 hover:text-red-700 disabled:opacity-50"><Trash2 size={15} /> Eliminar</button>}</div><button type="submit" disabled={isSaving || isUploading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-primary px-5 py-3 text-xs font-black uppercase tracking-wider text-white shadow-lg shadow-brand-primary/20 transition hover:bg-brand-primary-hover disabled:opacity-50"><Save size={16} /> {isSaving ? 'Guardando...' : 'Guardar diapositiva'}</button></div>
                    </form>
                </section>
            </div>
        </div>
    );
}
