import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { getFirebaseAdminApp } from './firebaseAdmin';

type CatalogType = 'hotel' | 'tour';
type CatalogStatus = 'ok' | 'not-found' | 'unavailable';

export type CatalogResult<T> =
    | { status: 'ok'; data: T }
    | { status: 'not-found' }
    | { status: 'unavailable' };

type CatalogItem = Record<string, any> & { slug: string; active: number };

const DATABASE_ID = import.meta.env.FIRESTORE_DATABASE || 'tdmx-db';
const STORAGE_BUCKET = import.meta.env.CATALOG_STORAGE_BUCKET || 'tudestinomx';
const SIGNED_URL_TTL_MS = 60 * 60 * 1000;
const AMENITY_ICONS = new Set([
    'list', 'smile', 'spa', 'kids', 'outdoor', 'food', 'mobility',
    'accessibility', 'laundry', 'common', 'reception', 'rules',
]);

function slugify(value: unknown): string {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function asArray(value: unknown): any[] {
    if (Array.isArray(value)) return value;
    return typeof value === 'string' && value.trim() ? [value] : [];
}

function stringList(value: unknown): string[] {
    return asArray(value)
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
}

function isActive(value: unknown): boolean {
    return value !== false && value !== 0 && value !== '0';
}

function galleryOf(item: Record<string, any>) {
    return asArray(item.gallery).filter((image) => image && typeof image.path === 'string' && image.path.trim());
}

async function signedImage(image: Record<string, any>, bucket: any) {
    try {
        const [url] = await bucket.file(image.path).getSignedUrl({
            action: 'read',
            expires: Date.now() + SIGNED_URL_TTL_MS,
        });
        return {
            url,
            alt: typeof image.alt === 'string' ? image.alt : '',
            category: image.category || 'uncategorized',
            is_exclusive: Boolean(image.is_exclusive),
        };
    } catch (error) {
        console.warn('[catalog] No se pudo generar URL de imagen', error);
        return null;
    }
}

async function normalizeItem(
    type: CatalogType,
    id: string,
    source: Record<string, any>,
    includeImages = true,
): Promise<CatalogItem> {
    const name = typeof source.name === 'string' ? source.name.trim() : '';
    const generatedSlug = slugify(name) || `${type}-${id}`;
    const slug = typeof source.slug === 'string' && source.slug.trim()
        ? slugify(source.slug) || generatedSlug
        : generatedSlug;
    const destination = typeof source.destination === 'string' ? source.destination : '';
    const gallery = galleryOf(source);
    const bucket = getStorage(getFirebaseAdminApp()).bucket(STORAGE_BUCKET);
    const imagesToSign = includeImages ? gallery : gallery.slice(0, 2);
    const resolvedImages = await Promise.all(imagesToSign.map((image) => signedImage(image, bucket)));
    const images = resolvedImages.filter((image): image is NonNullable<typeof image> => image !== null);
    const firstImage = images[0];
    const secondaryImages = images.slice(1);
    const amenityValues = asArray(source.amenities);
    const amenityGroups = amenityValues
        .filter((value) => value && typeof value === 'object' && Array.isArray(value.items))
        .map((group) => ({
            category: typeof group.category === 'string' && group.category.trim() ? group.category.trim() : 'Otros',
            icon: AMENITY_ICONS.has(group.icon) ? group.icon : 'list',
            items: group.items.filter((item: unknown) => typeof item === 'string' && item.trim()).map((item: string) => item.trim()),
        }))
        .filter((group) => group.items.length > 0);
    const legacyAmenities = amenityValues.flatMap((value) => {
        if (typeof value === 'string' && value.trim()) return [value.trim()];
        if (value && typeof value === 'object' && !Array.isArray(value) && typeof value.name === 'string' && value.name.trim()) return [value.name.trim()];
        return [];
    });
    if (legacyAmenities.length) amenityGroups.push({ category: 'Otros', icon: 'list', items: legacyAmenities });
    const amenitiesList = amenityGroups.flatMap((group) => group.items);
    const includesList = stringList(source.includes);

    return {
        ...source,
        id,
        name,
        title: name,
        slug,
        active: isActive(source.active) ? 1 : 0,
        destination,
        destino: destination,
        address: typeof source.address === 'string' && source.address.trim()
            ? source.address
            : (destination || 'Ubicación no disponible'),
        description: typeof source.description === 'string' ? source.description : '',
        duration: typeof source.duration === 'string' ? source.duration.trim() : '',
        category: typeof source.category === 'string' ? source.category.trim() : '',
        highlights: stringList(source.highlights),
        includes_list: includesList,
        not_includes: stringList(source.not_includes),
        price: source.price ?? null,
        reviews: source.reviews ?? null,
        reviews_count: source.reviews_count ?? null,
        amenities: amenityGroups,
        amenities_list: amenitiesList,
        google_maps: asArray(source.google_maps),
        includes: includesList.join(', '),
        images: {
            principal: firstImage ? [firstImage] : [],
            secundaria: secondaryImages.slice(0, 1),
            adicional: secondaryImages.slice(1),
        },
        gallery: images,
        imagenes: firstImage?.url ?? '',
    };
}

async function listCatalog<T>(type: CatalogType, includeImages = true): Promise<CatalogResult<T[]>> {
    try {
        const collection = type === 'hotel' ? 'hotels' : 'tours';
        const snapshot = await getFirestore(getFirebaseAdminApp(), DATABASE_ID).collection(collection).get();
        const documents = snapshot.docs.filter((document) => isActive(document.data().active));
        const items = await Promise.all(documents.map((document) => normalizeItem(type, document.id, document.data(), includeImages)));

        // Legacy documents without a slug get a stable slug from their name; disambiguate collisions with the document ID.
        const counts = new Map<string, number>();
        for (const item of items) counts.set(item.slug, (counts.get(item.slug) ?? 0) + 1);
        for (const item of items) {
            if ((counts.get(item.slug) ?? 0) > 1) item.slug = `${item.slug}-${slugify(item.id) || 'item'}`;
        }

        return { status: 'ok', data: items as T[] };
    } catch (error) {
        console.error('[catalog] Error leyendo Firestore', { type, error });
        return { status: 'unavailable' };
    }
}

async function detailCatalog<T>(type: CatalogType, slug: string): Promise<CatalogResult<T>> {
    const collectionName = type === 'hotel' ? 'hotels' : 'tours';
    const collection = getFirestore(getFirebaseAdminApp(), DATABASE_ID).collection(collectionName);

    try {
        const matchingSlug = await collection.where('slug', '==', slug).limit(1).get();
        const document = matchingSlug.docs.find((candidate) => isActive(candidate.data().active));
        if (document) return { status: 'ok', data: await normalizeItem(type, document.id, document.data()) as T };
    } catch (error) {
        console.error('[catalog] Error leyendo detalle Firestore', { type, error });
        return { status: 'unavailable' };
    }

    // Fallback for legacy records without a persisted slug; generate the slug in memory only.
    const result = await listCatalog<CatalogItem>(type, false);
    if (result.status !== 'ok') return result;
    const item = result.data.find((candidate) => (candidate as CatalogItem).slug === slug);
    if (!item) return { status: 'not-found' };

    try {
        const document = await collection.doc(item.id).get();
        if (!document.exists || !isActive(document.data()?.active)) return { status: 'not-found' };
        return { status: 'ok', data: await normalizeItem(type, document.id, document.data()!) as T };
    } catch (error) {
        console.error('[catalog] Error leyendo detalle Firestore', { type, error });
        return { status: 'unavailable' };
    }
}

export function fetchHotelList<T = unknown>(): Promise<CatalogResult<T[]>> {
    return listCatalog<T>('hotel');
}

export function fetchTourList<T = unknown>(): Promise<CatalogResult<T[]>> {
    return listCatalog<T>('tour');
}

export function fetchHotelDetail<T = unknown>(slug: string): Promise<CatalogResult<T>> {
    return detailCatalog<T>('hotel', slug);
}

export async function fetchHotelGalleryById(id: string): Promise<CatalogResult<Array<{ url: string; alt: string; category: string; is_exclusive: boolean }>>> {
    if (!/^[A-Za-z0-9_-]+$/.test(id)) return { status: 'not-found' };

    try {
        const document = await getFirestore(getFirebaseAdminApp(), DATABASE_ID).collection('hotels').doc(id).get();
        if (!document.exists || !isActive(document.data()?.active)) return { status: 'not-found' };

        const hotel = await normalizeItem('hotel', document.id, document.data()!);
        return { status: 'ok', data: hotel.gallery };
    } catch (error) {
        console.error('[catalog] Error leyendo galería de hotel', { error });
        return { status: 'unavailable' };
    }
}

export function fetchTourDetail<T = unknown>(slug: string): Promise<CatalogResult<T>> {
    return detailCatalog<T>('tour', slug);
}

export type { CatalogStatus };
