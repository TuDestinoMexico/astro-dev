import { fetchHotelList, fetchTourList } from './catalog';
import type { DestinationContent } from '../data/destinations';

export function normalizeDestination(value: unknown) {
    return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim();
}

export function destinationMatches(value: unknown, destination: DestinationContent) {
    const normalized = normalizeDestination(value);
    return destination.aliases.some((alias) => {
        const normalizedAlias = normalizeDestination(alias);
        return normalized === normalizedAlias || normalized.includes(normalizedAlias);
    });
}

export async function fetchDestinationCatalog(destination: DestinationContent) {
    const [hotelsResult, toursResult] = await Promise.all([
        fetchHotelList<any>(),
        fetchTourList<any>()
    ]);

    const hotels = hotelsResult.status === 'ok'
        ? hotelsResult.data.filter((hotel: any) => Number(hotel.active) === 1 && destinationMatches(hotel.destino, destination))
        : [];
    const tours = toursResult.status === 'ok'
        ? toursResult.data.filter((tour: any) => Number(tour.active ?? 1) === 1 && destinationMatches(tour.destino, destination))
        : [];

    return {
        hotels,
        tours,
        unavailable: hotelsResult.status === 'unavailable' || toursResult.status === 'unavailable'
    };
}
