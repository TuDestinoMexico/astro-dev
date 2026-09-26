const CATALOG_API_URL = 'https://api.tudestinomx.com/api';
const CATALOG_REQUEST_TIMEOUT_MS = 8_000;

type CatalogStatus = 'ok' | 'not-found' | 'unavailable';

export type CatalogResult<T> =
    | { status: 'ok'; data: T }
    | { status: 'not-found' }
    | { status: 'unavailable' };

type CatalogRequestContext = {
    resource: 'hotel' | 'tour';
    kind: 'list' | 'detail';
    slug?: string;
};

function logCatalogError(
    context: CatalogRequestContext,
    details: { status?: number; error?: unknown }
) {
    const errorMessage = details.error instanceof Error
        ? details.error.message
        : details.error;

    console.error('[catalog]', {
        ...context,
        ...(details.status ? { status: details.status } : {}),
        ...(errorMessage ? { error: errorMessage } : {})
    });
}

async function requestCatalog<T>(
    endpoint: string,
    context: CatalogRequestContext,
    normalize: (data: unknown) => T | null
): Promise<CatalogResult<T>> {
    const token = import.meta.env.VITE_API_TOKEN;

    try {
        const response = await fetch(endpoint, {
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${token}`
            },
            signal: AbortSignal.timeout(CATALOG_REQUEST_TIMEOUT_MS)
        });

        if (!response.ok) {
            if (response.status === 404) {
                return { status: 'not-found' };
            }

            logCatalogError(context, { status: response.status });
            return { status: 'unavailable' };
        }

        const rawData: unknown = await response.json();
        const data = normalize(rawData);

        if (data === null) {
            logCatalogError(context, { error: 'Unexpected catalog response shape' });
            return { status: 'unavailable' };
        }

        return { status: 'ok', data };
    } catch (error) {
        logCatalogError(context, { error });
        return { status: 'unavailable' };
    }
}

function normalizeList<T>(data: unknown): T[] | null {
    if (Array.isArray(data)) {
        return data as T[];
    }

    if (
        typeof data === 'object' &&
        data !== null &&
        'data' in data &&
        Array.isArray(data.data)
    ) {
        return data.data as T[];
    }

    return null;
}

function normalizeDetail<T>(data: unknown): T | null {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
        return null;
    }

    if ('data' in data) {
        return normalizeDetail<T>(data.data);
    }

    return data as T;
}

export function fetchHotelList<T = unknown>(): Promise<CatalogResult<T[]>> {
    return requestCatalog(
        `${CATALOG_API_URL}/hotel`,
        { resource: 'hotel', kind: 'list' },
        normalizeList<T>
    );
}

export function fetchTourList<T = unknown>(): Promise<CatalogResult<T[]>> {
    return requestCatalog(
        `${CATALOG_API_URL}/tour`,
        { resource: 'tour', kind: 'list' },
        normalizeList<T>
    );
}

export function fetchHotelDetail<T = unknown>(slug: string): Promise<CatalogResult<T>> {
    return requestCatalog(
        `${CATALOG_API_URL}/hotel/slug/${encodeURIComponent(slug)}`,
        { resource: 'hotel', kind: 'detail', slug },
        normalizeDetail<T>
    );
}

export function fetchTourDetail<T = unknown>(slug: string): Promise<CatalogResult<T>> {
    return requestCatalog(
        `${CATALOG_API_URL}/tour/slug/${encodeURIComponent(slug)}`,
        { resource: 'tour', kind: 'detail', slug },
        normalizeDetail<T>
    );
}

export type { CatalogStatus };
