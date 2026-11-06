import { useEffect, useState } from 'react';
import { db, storage } from '../../../lib/firebase';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { ImagePlus, Loader2, Save, Trash2, Upload } from 'lucide-react';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

const EMPTY_FORM = {
    activo: false,
    titulo: '',
    ctaLabel: '',
    ctaUrl: '',
    alt: '',
    vigenciaInicio: '',
    vigenciaFin: '',
    imagenDesktopUrl: '',
    imagenDesktopPath: '',
    imagenMobileUrl: '',
    imagenMobilePath: '',
};

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30';
const labelClass = 'mb-1 block text-[10px] font-black uppercase tracking-widest text-slate-500';

const isSafeHref = (value) => !value || value.startsWith('/') || value.startsWith('https://');

const uploadImage = (file, path, onProgress) => new Promise((resolve, reject) => {
    const fileRef = ref(storage, path);
    const task = uploadBytesResumable(fileRef, file, { contentType: file.type });
    task.on(
        'state_changed',
        (snapshot) => onProgress(Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)),
        reject,
        async () => resolve(await getDownloadURL(task.snapshot.ref)),
    );
});

export default function HomeBannerView() {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState({ desktop: null, mobile: null });
    const [replacedPaths, setReplacedPaths] = useState([]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        let cancelled = false;

        const cargar = async () => {
            try {
                const snapshot = await getDoc(doc(db, 'config', 'homeBanner'));
                if (!cancelled && snapshot.exists()) {
                    setForm({ ...EMPTY_FORM, ...snapshot.data() });
                }
            } catch (loadError) {
                console.error('[HomeBannerView] No se pudo cargar el banner.', loadError);
                if (!cancelled) setError('No se pudo cargar la configuración del banner.');
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        cargar();
        return () => {
            cancelled = true;
        };
    }, []);

    const updateField = (name, value) => {
        setForm((previo) => ({ ...previo, [name]: value }));
    };

    const handleUpload = async (variant, event) => {
        const file = event.target.files?.[0];
        event.target.value = '';
        if (!file) return;

        if (!ALLOWED_TYPES[file.type]) {
            setError('Sube una imagen JPG, PNG o WebP.');
            return;
        }
        if (file.size > MAX_IMAGE_BYTES) {
            setError('La imagen supera los 5 MB. Reduce el tamaño antes de subirla.');
            return;
        }

        setError('');
        setMessage('');
        setUploading((previo) => ({ ...previo, [variant]: 0 }));

        try {
            const path = `home-banner/${variant}_${Date.now()}.${ALLOWED_TYPES[file.type]}`;
            const url = await uploadImage(file, path, (percent) => {
                setUploading((previo) => ({ ...previo, [variant]: percent }));
            });

            const pathAnterior = form[`imagen${variant === 'desktop' ? 'Desktop' : 'Mobile'}Path`];
            if (pathAnterior) setReplacedPaths((previas) => [...previas, pathAnterior]);

            setForm((previo) => ({
                ...previo,
                [`imagen${variant === 'desktop' ? 'Desktop' : 'Mobile'}Url`]: url,
                [`imagen${variant === 'desktop' ? 'Desktop' : 'Mobile'}Path`]: path,
            }));
        } catch (uploadError) {
            console.error('[HomeBannerView] Error al subir la imagen.', uploadError);
            setError('No se pudo subir la imagen. Intenta de nuevo.');
        } finally {
            setUploading((previo) => ({ ...previo, [variant]: null }));
        }
    };

    const removeImage = (variant) => {
        const key = variant === 'desktop' ? 'imagenDesktop' : 'imagenMobile';
        const pathActual = form[`${key}Path`];
        if (pathActual) setReplacedPaths((previas) => [...previas, pathActual]);
        setForm((previo) => ({ ...previo, [`${key}Url`]: '', [`${key}Path`]: '' }));
    };

    const validate = () => {
        if (form.activo && !form.imagenDesktopUrl) return 'Para activar el banner necesitas la imagen de escritorio.';
        if (form.activo && !form.titulo.trim()) return 'Para activar el banner necesitas un título.';
        if (!isSafeHref(form.ctaUrl)) return 'El enlace debe empezar con / (interno) o https:// (externo).';
        if (form.vigenciaInicio && form.vigenciaFin && form.vigenciaFin < form.vigenciaInicio) {
            return 'La fecha de fin debe ser igual o posterior a la de inicio.';
        }
        return '';
    };

    const handleSave = async (event) => {
        event.preventDefault();
        setError('');
        setMessage('');

        const problema = validate();
        if (problema) {
            setError(problema);
            return;
        }

        setSaving(true);
        try {
            const payload = {
                activo: form.activo === true,
                titulo: form.titulo.trim(),
                ctaLabel: form.ctaLabel.trim(),
                ctaUrl: form.ctaUrl.trim(),
                alt: form.alt.trim(),
                vigenciaInicio: form.vigenciaInicio,
                vigenciaFin: form.vigenciaFin,
                imagenDesktopUrl: form.imagenDesktopUrl,
                imagenDesktopPath: form.imagenDesktopPath,
                imagenMobileUrl: form.imagenMobileUrl,
                imagenMobilePath: form.imagenMobilePath,
                actualizadoEn: serverTimestamp(),
            };

            await setDoc(doc(db, 'config', 'homeBanner'), payload, { merge: true });

            // Las imágenes reemplazadas o quitadas se borran solo después de guardar con éxito.
            await Promise.all(replacedPaths.map((path) => deleteObject(ref(storage, path)).catch((deleteError) => {
                if (deleteError?.code !== 'storage/object-not-found') throw deleteError;
            })));
            setReplacedPaths([]);
            setMessage('Banner guardado.');
        } catch (saveError) {
            console.error('[HomeBannerView] No se pudo guardar el banner.', saveError);
            setError('No se pudo guardar el banner. Revisa tu conexión e intenta de nuevo.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16 text-slate-400">
                <Loader2 size={28} className="animate-spin" aria-hidden="true" />
            </div>
        );
    }

    const uploadBox = (variant, title, sizeHint, url) => {
        const percent = uploading[variant];
        const isUploading = percent !== null;
        return (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className={labelClass}>{title}</p>
                <p className="mb-3 text-xs leading-5 text-slate-500">{sizeHint}</p>
                <div className={`mb-3 overflow-hidden rounded-lg bg-slate-200 ${variant === 'desktop' ? 'aspect-[8/3]' : 'aspect-[4/5] max-w-[220px]'}`}>
                    {url ? (
                        <img src={url} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-1 text-slate-400">
                            <ImagePlus size={22} aria-hidden="true" />
                            <span className="text-[10px] font-bold uppercase">Sin imagen</span>
                        </div>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-indigo-600">
                        <Upload size={14} aria-hidden="true" />
                        {isUploading ? `Subiendo ${percent}%` : 'Subir imagen'}
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(event) => handleUpload(variant, event)}
                            disabled={isUploading}
                            className="sr-only"
                        />
                    </label>
                    {url && (
                        <button
                            type="button"
                            onClick={() => removeImage(variant)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:border-red-300 hover:text-red-600"
                        >
                            <Trash2 size={14} aria-hidden="true" /> Quitar
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <form onSubmit={handleSave} className="space-y-6">
            <header>
                <h2 className="text-xl font-black text-slate-900">Banner de inicio</h2>
                <p className="mt-1 text-sm text-slate-500">Imagen de promoción que se muestra encima del buscador en la página de inicio.</p>
            </header>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
                <input
                    type="checkbox"
                    checked={form.activo === true}
                    onChange={(event) => updateField('activo', event.target.checked)}
                    className="h-4 w-4 accent-indigo-600"
                />
                <span className="text-sm font-bold text-slate-800">Mostrar el banner en la página de inicio</span>
            </label>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {uploadBox('desktop', 'Imagen de escritorio', 'Medida recomendada 2400 × 900 px (8:3). JPG, PNG o WebP, máximo 5 MB.', form.imagenDesktopUrl)}
                {uploadBox('mobile', 'Imagen de móvil', 'Medida recomendada 1080 × 1350 px (4:5). Si no subes una, se usa la de escritorio.', form.imagenMobileUrl)}
            </div>

            <p className="text-xs leading-5 text-slate-500">
                El texto del banner va dentro de la imagen. El título solo se usa como encabezado para lectores de pantalla.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label htmlFor="banner-titulo" className={labelClass}>Título (accesibilidad)</label>
                    <input id="banner-titulo" className={inputClass} value={form.titulo} onChange={(event) => updateField('titulo', event.target.value)} maxLength={90} />
                </div>
                <div>
                    <label htmlFor="banner-cta-label" className={labelClass}>Texto del botón</label>
                    <input id="banner-cta-label" className={inputClass} value={form.ctaLabel} onChange={(event) => updateField('ctaLabel', event.target.value)} maxLength={40} />
                </div>
                <div>
                    <label htmlFor="banner-cta-url" className={labelClass}>Enlace del botón</label>
                    <input id="banner-cta-url" className={inputClass} value={form.ctaUrl} onChange={(event) => updateField('ctaUrl', event.target.value)} placeholder="/tours o https://..." />
                </div>
                <div className="md:col-span-2">
                    <label htmlFor="banner-alt" className={labelClass}>Texto alternativo de la imagen</label>
                    <input id="banner-alt" className={inputClass} value={form.alt} onChange={(event) => updateField('alt', event.target.value)} maxLength={140} />
                </div>
                <div>
                    <label htmlFor="banner-inicio" className={labelClass}>Vigencia: inicio</label>
                    <input id="banner-inicio" type="date" className={inputClass} value={form.vigenciaInicio} onChange={(event) => updateField('vigenciaInicio', event.target.value)} />
                </div>
                <div>
                    <label htmlFor="banner-fin" className={labelClass}>Vigencia: fin</label>
                    <input id="banner-fin" type="date" className={inputClass} value={form.vigenciaFin} onChange={(event) => updateField('vigenciaFin', event.target.value)} />
                </div>
            </div>

            <p className="text-xs leading-5 text-slate-500">
                El banner solo se muestra entre las fechas de vigencia (hora de Cancún). Fuera de ellas, la página muestra solo el buscador.
            </p>

            {error && <p role="alert" className="text-sm font-bold text-red-600">{error}</p>}
            {message && <p role="status" className="text-sm font-bold text-emerald-600">{message}</p>}

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={saving || uploading.desktop !== null || uploading.mobile !== null}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-indigo-700 disabled:opacity-50"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Save size={16} aria-hidden="true" />}
                    Guardar banner
                </button>
            </div>
        </form>
    );
}
