// Parámetros que envía el buscador de la portada: /hoteles?destino=&entrada=&salida=
// o /tours?destino=&fecha=. Todo lo que llega por URL se valida antes de usarse.

export interface SearchQuery {
    destino: string;
    entrada: string;
    salida: string;
    fecha: string;
    adultos: number;
    menores: number;
    edades: string[];
}

const MAX_DESTINO = 80;
const MAX_ADULTOS = 10;
const MAX_MENORES = 6;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

const validDay = (value: string | null): string => {
    if (!value || !ISO_DAY.test(value)) return '';
    const date = new Date(`${value}T00:00:00-05:00`);
    return Number.isNaN(date.getTime()) ? '' : value;
};

const clampInt = (value: string | null, min: number, max: number, fallback: number): number => {
    const parsed = Number.parseInt(value ?? '', 10);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
};

export function parseSearchQuery(searchParams: URLSearchParams): SearchQuery {
    const menores = clampInt(searchParams.get('menores'), 0, MAX_MENORES, 0);
    const edades = (searchParams.get('edades') ?? '')
        .split(',')
        .map((edad) => edad.trim())
        .filter((edad) => /^\d{1,2}$/.test(edad) && Number(edad) <= 17)
        .slice(0, menores);

    return {
        destino: (searchParams.get('destino') ?? '').trim().slice(0, MAX_DESTINO),
        entrada: validDay(searchParams.get('entrada')),
        salida: validDay(searchParams.get('salida')),
        fecha: validDay(searchParams.get('fecha')),
        adultos: clampInt(searchParams.get('adultos'), 1, MAX_ADULTOS, 2),
        menores,
        edades: edades.length === menores ? edades : [],
    };
}

export function hasSearchFilters(query: SearchQuery): boolean {
    return Boolean(query.destino || query.entrada || query.salida || query.fecha);
}

// Quita acentos y mayúsculas para que "Cancun" encuentre "Cancún".
export const normalizeText = (value: unknown): string => (
    typeof value === 'string'
        ? value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
        : ''
);

// Busca el destino en nombre, destino, dirección y slug del producto.
export function matchesDestino(item: Record<string, unknown>, destino: string): boolean {
    const term = normalizeText(destino);
    if (!term) return true;

    const haystack = [item.name, item.title, item.destino, item.address, item.slug]
        .map((field) => normalizeText(typeof field === 'string' ? field.replace(/-/g, ' ') : field))
        .join(' ');

    return haystack.includes(term);
}

// Query que se propaga a la ficha del hotel o tour, sin datos personales.
export function toSearchString(query: SearchQuery): string {
    const params = new URLSearchParams();
    if (query.destino) params.set('destino', query.destino);
    if (query.entrada) params.set('entrada', query.entrada);
    if (query.salida) params.set('salida', query.salida);
    if (query.fecha) params.set('fecha', query.fecha);
    params.set('adultos', String(query.adultos));
    params.set('menores', String(query.menores));
    if (query.menores > 0 && query.edades.length) params.set('edades', query.edades.join(','));
    const text = params.toString();
    return text ? `?${text}` : '';
}
