import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { getGeneralConfig } from './generalConfig';

const DEFAULT_AUTOPLAY_MS = 7000;
const HERO_REQUEST_TIMEOUT_MS = 1_500;

const text = (value, fallback = '') => (
    typeof value === 'string' && value.trim() ? value.trim() : fallback
);

const safeHref = (value) => {
    const href = text(value);
    return href.startsWith('/') || href.startsWith('https://') ? href : '';
};

const normalizeSlide = (data, id) => ({
    id: text(data.id, id),
    eyebrow: text(data.eyebrow),
    title: text(data.titulo || data.title),
    description: text(data.descripcion || data.description),
    image: text(data.imagenUrl || data.image),
    imageMobile: text(data.imagenMobileUrl || data.imageMobile),
    imageTablet: text(data.imagenTabletUrl || data.imageTablet),
    alt: text(data.alt, text(data.titulo || data.title)),
    whatsappMsg: text(data.mensajeWhatsapp || data.whatsappMsg),
    location: text(data.ubicacion || data.location),
    meta: text(data.meta),
    ctaLabel: text(data.ctaPrincipal || data.ctaLabel),
    secondaryLabel: text(data.ctaSecundario || data.secondaryLabel),
    secondaryHref: safeHref(data.ctaSecundarioUrl || data.secondaryHref),
});

const normalizeAutoplay = (value) => {
    const milliseconds = Number(value);
    if (!Number.isFinite(milliseconds)) return DEFAULT_AUTOPLAY_MS;
    return Math.min(15000, Math.max(4000, Math.round(milliseconds)));
};

function withTimeout(promise) {
    let timeoutId;

    return Promise.race([
        promise,
        new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error('Timeout loading home hero')), HERO_REQUEST_TIMEOUT_MS);
        }),
    ]).finally(() => clearTimeout(timeoutId));
}

export async function fetchHomeHero() {
    try {
        const [settingsSnapshot, slidesSnapshot, generalConfig] = await withTimeout(Promise.all([
            getDoc(doc(db, 'config', 'homeHero')),
            getDocs(collection(db, 'hero_slides')),
            getGeneralConfig(),
        ]));

        const settings = settingsSnapshot.exists() ? settingsSnapshot.data() : {};
        const slides = slidesSnapshot.docs
            .map((slideSnapshot) => ({ id: slideSnapshot.id, ...slideSnapshot.data() }))
            .filter((slide) => slide.activo !== false)
            .sort((first, second) => Number(first.posicion || 0) - Number(second.posicion || 0))
            .map((slide) => normalizeSlide(slide, slide.id))
            .filter((slide) => slide.title && slide.image);

        return {
            slides,
            whatsappNumber: text(generalConfig.whatsappGlobal),
            autoplayMs: normalizeAutoplay(settings.autoplayMs),
        };
    } catch (error) {
        console.warn('[homeHero] No se pudo cargar el hero dinámico.', error);
        return {
            slides: [],
            whatsappNumber: '',
            autoplayMs: DEFAULT_AUTOPLAY_MS,
        };
    }
}
