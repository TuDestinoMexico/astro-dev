export interface DestinationContent {
    slug: string;
    name: string;
    country: string;
    image: string;
    alt: string;
    description: string;
    highlights: string[];
    bestTime: string;
    aliases: string[];
    promoUrl?: string;
}

export const destinations: DestinationContent[] = [
    {
        slug: 'cancun',
        name: 'Cancún',
        country: 'México',
        image: '/images/destinations/cancun.jpg',
        alt: 'Vacaciones en Cancún',
        description: 'Cancún combina playas del Caribe, hoteles para todo tipo de viajero y experiencias culturales y acuáticas. Diseñamos tu viaje con hospedaje, tours y acompañamiento personalizado.',
        highlights: ['Zona hotelera y playas del Caribe', 'Tours a cenotes, islas y sitios mayas', 'Opciones para familias, parejas y grupos'],
        bestTime: 'De noviembre a abril suele haber clima más seco y agradable; revisa disponibilidad y temporada antes de reservar.',
        aliases: ['cancun', 'cancún'],
        promoUrl: 'https://link.tudestinomx.com/PromoCancun'
    },
    {
        slug: 'huatulco',
        name: 'Huatulco',
        country: 'México',
        image: '/images/destinations/huatulco.jpg',
        alt: 'Vacaciones en Huatulco',
        description: 'Huatulco ofrece bahías, naturaleza y una alternativa tranquila para disfrutar la costa de Oaxaca. Te ayudamos a combinar hotel, traslados y actividades según tu viaje.',
        highlights: ['Bahías y playas del Pacífico', 'Naturaleza y recorridos en barco', 'Escapadas relajadas y familiares'],
        bestTime: 'Los meses de clima seco suelen ser una buena referencia para planear actividades de playa.',
        aliases: ['huatulco'],
        promoUrl: 'https://link.tudestinomx.com/PromoHuatulco'
    },
    {
        slug: 'riviera-maya',
        name: 'Riviera Maya',
        country: 'México',
        image: '/images/destinations/riviera-maya.jpg',
        alt: 'Vacaciones en Riviera Maya',
        description: 'La Riviera Maya reúne resorts, cenotes, parques y vestigios mayas en una de las zonas turísticas más completas de México. Planea una estancia con experiencias y asesoría de principio a fin.',
        highlights: ['Hoteles y resorts frente al mar', 'Cenotes, parques y sitios arqueológicos', 'Viajes familiares, románticos y de aventura'],
        bestTime: 'La temporada seca suele concentrarse entre noviembre y abril, aunque cada viajero debe considerar clima, presupuesto y ocupación.',
        aliases: ['riviera maya', 'playa del carmen', 'tulum'],
        promoUrl: 'https://link.tudestinomx.com/PromoRivieraMaya'
    },
    {
        slug: 'punta-cana',
        name: 'Punta Cana',
        country: 'República Dominicana',
        image: '/images/destinations/punta-cana.jpg',
        alt: 'Vacaciones en Punta Cana',
        description: 'Punta Cana es una opción de playa para quienes buscan resorts, descanso y actividades en el Caribe. Cotiza una experiencia adaptada a tu presupuesto y fechas.',
        highlights: ['Resorts y playas caribeñas', 'Actividades acuáticas y excursiones', 'Opciones para parejas y familias'],
        bestTime: 'La elección de fechas depende de clima, temporada y presupuesto; un asesor puede ayudarte a comparar opciones.',
        aliases: ['punta cana'],
        promoUrl: 'https://link.tudestinomx.com/PromoPuntaCana'
    },
];
