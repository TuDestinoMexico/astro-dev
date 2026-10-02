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
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/cancun.png',
        alt: 'Vacaciones en Cancún',
        description: 'Cancún combina playas del Caribe, hoteles para todo tipo de viajero y experiencias culturales y acuáticas. Diseñamos tu viaje con hospedaje, tours y acompañamiento personalizado.',
        highlights: ['Zona hotelera y playas del Caribe', 'Tours a cenotes, islas y sitios mayas', 'Opciones para familias, parejas y grupos'],
        bestTime: 'De noviembre a abril suele haber clima más seco y agradable; revisa disponibilidad y temporada antes de reservar.',
        aliases: ['cancun', 'cancún'],
        promoUrl: 'https://link.tudestinomx.com/PromoCancun'
    },
    {
        slug: 'cozumel',
        name: 'Cozumel',
        country: 'México',
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/cozumel.png',
        alt: 'Experiencias de viaje en Cozumel',
        description: 'Cozumel es una isla del Caribe mexicano reconocida por sus arrecifes, playas y actividades acuáticas. Encuentra hospedaje y experiencias para construir una escapada a tu ritmo.',
        highlights: ['Buceo y snorkel en arrecifes', 'Playas y recorridos por la isla', 'Experiencias para parejas y familias'],
        bestTime: 'La temporada seca suele ofrecer buenas condiciones para actividades al aire libre y en el mar.',
        aliases: ['cozumel'],
        promoUrl: 'https://link.tudestinomx.com/PromoCozumel'
    },
    {
        slug: 'huatulco',
        name: 'Huatulco',
        country: 'México',
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/huatulco.png',
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
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/riviera-maya.png',
        alt: 'Vacaciones en Riviera Maya',
        description: 'La Riviera Maya reúne resorts, cenotes, parques y vestigios mayas en una de las zonas turísticas más completas de México. Planea una estancia con experiencias y asesoría de principio a fin.',
        highlights: ['Hoteles y resorts frente al mar', 'Cenotes, parques y sitios arqueológicos', 'Viajes familiares, románticos y de aventura'],
        bestTime: 'La temporada seca suele concentrarse entre noviembre y abril, aunque cada viajero debe considerar clima, presupuesto y ocupación.',
        aliases: ['riviera maya', 'playa del carmen', 'tulum'],
        promoUrl: 'https://link.tudestinomx.com/PromoRivieraMaya'
    },
    {
        slug: 'puerto-vallarta',
        name: 'Puerto Vallarta',
        country: 'México',
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/puerto-vallarta.png',
        alt: 'Viajes a Puerto Vallarta',
        description: 'Puerto Vallarta combina playa, gastronomía, naturaleza y vida urbana en la costa del Pacífico. Te ayudamos a elegir hotel y actividades de acuerdo con el estilo de tu viaje.',
        highlights: ['Playas y recorridos por la bahía', 'Gastronomía y vida nocturna', 'Actividades de naturaleza y aventura'],
        bestTime: 'El clima y la actividad turística cambian durante el año; solicita asesoría para elegir fechas.',
        aliases: ['puerto vallarta'],
        promoUrl: 'https://link.tudestinomx.com/PromoPuertoVallarta'
    },
    {
        slug: 'punta-cana',
        name: 'Punta Cana',
        country: 'República Dominicana',
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/punta-cana.png',
        alt: 'Vacaciones en Punta Cana',
        description: 'Punta Cana es una opción de playa para quienes buscan resorts, descanso y actividades en el Caribe. Cotiza una experiencia adaptada a tu presupuesto y fechas.',
        highlights: ['Resorts y playas caribeñas', 'Actividades acuáticas y excursiones', 'Opciones para parejas y familias'],
        bestTime: 'La elección de fechas depende de clima, temporada y presupuesto; un asesor puede ayudarte a comparar opciones.',
        aliases: ['punta cana'],
        promoUrl: 'https://link.tudestinomx.com/PromoPuntaCana'
    },
    {
        slug: 'colombia',
        name: 'Colombia',
        country: 'Colombia',
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/colombia.png',
        alt: 'Viajes a Colombia',
        description: 'Colombia ofrece ciudades, cultura, gastronomía y destinos de playa para viajes nacionales e internacionales. Diseñamos una ruta de acuerdo con el tiempo que tengas disponible.',
        highlights: ['Ciudades históricas y cultura', 'Gastronomía y experiencias locales', 'Rutas urbanas, naturaleza y playa'],
        bestTime: 'Las condiciones cambian según la región; define primero tu ruta para elegir las mejores fechas.',
        aliases: ['colombia'],
        promoUrl: 'https://link.tudestinomx.com/PromoColombia'
    },
    {
        slug: 'los-cabos',
        name: 'Los Cabos',
        country: 'México',
        image: 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/los-cabos.png',
        alt: 'Vacaciones en Los Cabos',
        description: 'Los Cabos reúne resorts, paisajes desérticos, mar y experiencias de aventura en Baja California Sur. Encuentra una opción para descansar, celebrar o explorar.',
        highlights: ['Resorts y playas del Mar de Cortés', 'Paisajes, navegación y aventura', 'Escapadas románticas y celebraciones'],
        bestTime: 'La temporada ideal depende de la actividad y del tipo de clima que prefieras; solicita una recomendación personalizada.',
        aliases: ['los cabos', 'cabo san lucas', 'san jose del cabo'],
        promoUrl: 'https://link.tudestinomx.com/PromoLosCabos'
    }
];
