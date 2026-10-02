export interface GuideSection {
    heading: string;
    paragraphs: string[];
}

export interface GuideLink {
    label: string;
    href: string;
}

export interface GuideContent {
    slug: string;
    title: string;
    metaTitle: string;
    description: string;
    excerpt: string;
    image: string;
    imageAlt: string;
    category: string;
    destinationSlug?: string;
    publishedAt: string;
    updatedAt: string;
    sections: GuideSection[];
    relatedLinks: GuideLink[];
}

const cancunImage = 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/cancun.png';
const rivieraImage = 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/riviera-maya.png';
const losCabosImage = 'https://storage.googleapis.com/tudestinomx_bucket/assets/promos/destinos/los-cabos.png';

export const guides: GuideContent[] = [
    {
        slug: 'mejor-epoca-para-viajar-a-cancun',
        title: '¿Cuál es la mejor época para viajar a Cancún?',
        metaTitle: 'Mejor Época para Viajar a Cancún | Guía Tu Destino MX',
        description: 'Conoce qué considerar al elegir fechas para viajar a Cancún: clima, temporada, actividades y tipo de vacaciones.',
        excerpt: 'La mejor fecha depende de tu presupuesto, actividades y tolerancia a la ocupación. Te ayudamos a comparar temporadas antes de reservar.',
        image: cancunImage,
        imageAlt: 'Playa y vacaciones en Cancún',
        category: 'Cancún',
        destinationSlug: 'cancun',
        publishedAt: '2026-10-02',
        updatedAt: '2026-10-02',
        sections: [
            {
                heading: 'Elige primero el tipo de viaje',
                paragraphs: [
                    'Una escapada de playa, un viaje familiar y una luna de miel pueden requerir fechas distintas. Antes de buscar precio, define si priorizas clima, tranquilidad, actividades o presupuesto.',
                    'También conviene revisar la duración de tu estancia y la distancia entre el hotel y las experiencias que quieres realizar.'
                ]
            },
            {
                heading: 'Temporada seca y temporada de lluvias',
                paragraphs: [
                    'Los meses con menor probabilidad de lluvia suelen ser atractivos para quienes quieren pasar más tiempo al aire libre. La temporada de lluvias no significa que todos los días sean iguales, pero sí requiere flexibilidad para excursiones.',
                    'Si tu prioridad son cenotes, navegación o actividades acuáticas, pregunta por las condiciones esperadas y por las políticas de cambio de cada servicio.'
                ]
            },
            {
                heading: 'Cómo elegir hotel y actividades',
                paragraphs: [
                    'La zona hotelera facilita el acceso a playas y servicios, mientras que otras ubicaciones pueden acercarte a experiencias culturales o darte otra relación entre precio y traslado.',
                    'Compara hoteles en Cancún y revisa los tours disponibles antes de cerrar tu itinerario.'
                ]
            }
        ],
        relatedLinks: [
            { label: 'Guía de viajes a Cancún', href: '/destinos/cancun/' },
            { label: 'Hoteles en Cancún', href: '/destinos/cancun/hoteles/' },
            { label: 'Tours en Cancún', href: '/destinos/cancun/tours/' }
        ]
    },
    {
        slug: 'que-hacer-en-cancun',
        title: 'Qué hacer en Cancún: ideas para organizar tu viaje',
        metaTitle: 'Qué Hacer en Cancún: Hoteles y Tours | Tu Destino MX',
        description: 'Ideas para organizar unas vacaciones en Cancún con playas, actividades acuáticas, cultura, descanso y tours.',
        excerpt: 'Combina días de descanso con actividades que realmente encajen con tu ritmo de viaje, presupuesto y acompañantes.',
        image: cancunImage,
        imageAlt: 'Actividades y vacaciones en Cancún',
        category: 'Cancún',
        destinationSlug: 'cancun',
        publishedAt: '2026-10-02',
        updatedAt: '2026-10-02',
        sections: [
            {
                heading: 'Organiza el viaje por tipo de día',
                paragraphs: [
                    'Una agenda equilibrada puede incluir días de playa, una excursión y tiempo libre. Intentar cubrir demasiadas actividades en una sola jornada suele reducir la experiencia y aumentar traslados.',
                    'Considera la edad de los viajeros, el tiempo de traslado y si prefieren actividades tranquilas, aventura o cultura.'
                ]
            },
            {
                heading: 'Experiencias para distintos viajeros',
                paragraphs: [
                    'Las familias suelen valorar horarios cómodos y actividades con servicios incluidos. Las parejas pueden priorizar cenas, navegación o espacios de descanso. Los grupos necesitan revisar capacidad, transporte y coordinación.',
                    'No existe un itinerario universal: una recomendación útil comienza con preguntas sobre tus fechas y expectativas.'
                ]
            },
            {
                heading: 'Reserva con margen',
                paragraphs: [
                    'Para fechas de alta demanda, conviene revisar con anticipación el hospedaje y las experiencias principales. Así puedes elegir horarios y evitar construir el viaje alrededor de la última opción disponible.',
                    'Consulta nuestra selección de hoteles y tours para solicitar una propuesta completa.'
                ]
            }
        ],
        relatedLinks: [
            { label: 'Viajes a Cancún', href: '/destinos/cancun/' },
            { label: 'Hoteles en Cancún', href: '/destinos/cancun/hoteles/' },
            { label: 'Tours en Cancún', href: '/destinos/cancun/tours/' }
        ]
    },
    {
        slug: 'que-hacer-en-riviera-maya',
        title: 'Qué hacer en Riviera Maya: playas, cenotes y experiencias',
        metaTitle: 'Qué Hacer en Riviera Maya: Guía de Viaje | Tu Destino MX',
        description: 'Planifica qué hacer en Riviera Maya combinando playas, cenotes, parques, cultura y hospedaje según tu estilo de viaje.',
        excerpt: 'La Riviera Maya tiene experiencias muy diferentes entre sí. Esta guía te ayuda a elegir una combinación realista para tus vacaciones.',
        image: rivieraImage,
        imageAlt: 'Paisaje de vacaciones en Riviera Maya',
        category: 'Riviera Maya',
        destinationSlug: 'riviera-maya',
        publishedAt: '2026-10-02',
        updatedAt: '2026-10-02',
        sections: [
            {
                heading: 'Combina playa y exploración',
                paragraphs: [
                    'La Riviera Maya permite alternar descanso frente al mar con cenotes, parques y recorridos culturales. El número de actividades debe considerar distancias y tiempo de recuperación.',
                    'Si viajas con niños o adultos mayores, prioriza experiencias con logística clara, horarios cómodos y transporte adecuado.'
                ]
            },
            {
                heading: 'Elige la zona de hospedaje',
                paragraphs: [
                    'La ubicación del hotel influye en el acceso a playas, restaurantes y excursiones. Una tarifa menor puede implicar más tiempo de traslado, mientras que una zona cercana a la actividad puede simplificar el itinerario.',
                    'Revisa hoteles en Riviera Maya junto con las experiencias que quieres realizar para comparar el viaje completo.'
                ]
            },
            {
                heading: 'Pregunta qué incluye cada experiencia',
                paragraphs: [
                    'Antes de reservar, confirma transporte, alimentos, equipo, horarios y restricciones. Dos tours con nombres parecidos pueden ofrecer niveles de servicio distintos.',
                    'Una asesoría previa evita contratar actividades incompatibles con tus fechas o con el ritmo del grupo.'
                ]
            }
        ],
        relatedLinks: [
            { label: 'Viajes a Riviera Maya', href: '/destinos/riviera-maya/' },
            { label: 'Hoteles en Riviera Maya', href: '/destinos/riviera-maya/hoteles/' },
            { label: 'Tours en Riviera Maya', href: '/destinos/riviera-maya/tours/' }
        ]
    },
    {
        slug: 'mejores-destinos-para-viajar-en-familia',
        title: 'Cómo elegir un destino para viajar en familia',
        metaTitle: 'Mejores Destinos para Viajar en Familia | Tu Destino MX',
        description: 'Qué revisar al elegir hoteles, actividades y destinos para unas vacaciones familiares cómodas y bien organizadas.',
        excerpt: 'La mejor opción familiar depende de edades, ritmo, servicios y traslados. Usa estos criterios para comparar antes de reservar.',
        image: rivieraImage,
        imageAlt: 'Familias disfrutando vacaciones en la playa',
        category: 'Viajes familiares',
        publishedAt: '2026-10-02',
        updatedAt: '2026-10-02',
        sections: [
            {
                heading: 'Empieza por las necesidades del grupo',
                paragraphs: [
                    'La edad de los niños, los horarios de comida, la movilidad y el tiempo disponible cambian la elección del hotel y las actividades. No es suficiente buscar el destino más popular.',
                    'Define qué servicios son indispensables y cuáles serían convenientes, como club infantil, habitaciones comunicadas, transporte o actividades de baja exigencia.'
                ]
            },
            {
                heading: 'Prioriza una logística sencilla',
                paragraphs: [
                    'Un itinerario familiar funciona mejor cuando los traslados son claros y no se programan demasiadas actividades seguidas. La ubicación del hospedaje puede ser tan importante como la categoría del hotel.',
                    'Pregunta qué incluye cada tour y cuánto tiempo se necesita para llegar al punto de salida.'
                ]
            },
            {
                heading: 'Reserva con información completa',
                paragraphs: [
                    'Antes de elegir, comparte el número de viajeros, edades, fechas y preferencias. Con esa información es más fácil recomendar un hotel y experiencias adecuadas para todos.',
                    'Puedes comenzar revisando destinos, hoteles y tours disponibles en el catálogo.'
                ]
            }
        ],
        relatedLinks: [
            { label: 'Destinos para vacacionar', href: '/destinos/' },
            { label: 'Hoteles disponibles', href: '/hoteles/' },
            { label: 'Tours y experiencias', href: '/tours/' }
        ]
    },
    {
        slug: 'luna-de-miel-en-riviera-maya',
        title: 'Luna de miel en Riviera Maya: cómo planearla',
        metaTitle: 'Luna de Miel en Riviera Maya: Guía y Hoteles | Tu Destino MX',
        description: 'Planifica una luna de miel en Riviera Maya con criterios para elegir hotel, experiencias, fechas y nivel de atención.',
        excerpt: 'Una luna de miel memorable necesita equilibrio entre descanso, privacidad y experiencias que tengan sentido para la pareja.',
        image: rivieraImage,
        imageAlt: 'Escapada romántica en Riviera Maya',
        category: 'Luna de miel',
        destinationSlug: 'riviera-maya',
        publishedAt: '2026-10-02',
        updatedAt: '2026-10-02',
        sections: [
            {
                heading: 'Elige el estilo de celebración',
                paragraphs: [
                    'Algunas parejas prefieren un resort con todo resuelto; otras buscan combinar playa, gastronomía y excursiones. Definir ese estilo evita pagar servicios que no utilizarán.',
                    'También conviene reservar tiempo libre. Una agenda llena puede quitar espacio a la celebración y al descanso.'
                ]
            },
            {
                heading: 'Compara hotel y ubicación',
                paragraphs: [
                    'La privacidad, la categoría, el tipo de habitación y la distancia a las actividades son factores importantes. Revisa qué está incluido y qué servicios tienen costo adicional.',
                    'Consulta hoteles en Riviera Maya y comparte tus prioridades para recibir recomendaciones concretas.'
                ]
            },
            {
                heading: 'Añade experiencias con intención',
                paragraphs: [
                    'Una cena especial, una navegación o una visita cultural pueden complementar la estancia. Elige pocas actividades y confirma sus horarios antes de cerrar el itinerario.',
                    'Nuestro equipo puede ayudarte a combinar hospedaje y tours sin perder el ritmo de la celebración.'
                ]
            }
        ],
        relatedLinks: [
            { label: 'Riviera Maya', href: '/destinos/riviera-maya/' },
            { label: 'Hoteles en Riviera Maya', href: '/destinos/riviera-maya/hoteles/' },
            { label: 'Tours en Riviera Maya', href: '/destinos/riviera-maya/tours/' }
        ]
    },
    {
        slug: 'viajar-a-los-cabos',
        title: 'Viajar a Los Cabos: qué considerar antes de reservar',
        metaTitle: 'Viajar a Los Cabos: Hoteles y Experiencias | Tu Destino MX',
        description: 'Guía para planear un viaje a Los Cabos: tipo de hospedaje, actividades, traslados y recomendaciones de organización.',
        excerpt: 'Los Cabos combina resorts, paisajes y actividades de aventura. Conoce qué revisar para elegir una experiencia adecuada.',
        image: losCabosImage,
        imageAlt: 'Paisaje y vacaciones en Los Cabos',
        category: 'Los Cabos',
        destinationSlug: 'los-cabos',
        publishedAt: '2026-10-02',
        updatedAt: '2026-10-02',
        sections: [
            {
                heading: 'Define si buscas descanso o aventura',
                paragraphs: [
                    'Los Cabos puede funcionar para una escapada de descanso, una celebración o un viaje con actividades. El tipo de plan determina la zona, el hotel y los traslados que conviene considerar.',
                    'Anota tus actividades prioritarias antes de comparar hospedajes para evitar elegir solo por fotografía o precio.'
                ]
            },
            {
                heading: 'Revisa traslados y distancias',
                paragraphs: [
                    'La experiencia cambia según la distancia entre aeropuerto, hotel y puntos de salida. Confirmar la logística antes de reservar ayuda a proteger tiempo y presupuesto.',
                    'Pregunta si los tours incluyen transporte y qué condiciones aplican para cada actividad.'
                ]
            },
            {
                heading: 'Compara opciones con asesoría',
                paragraphs: [
                    'Un hotel de categoría similar puede ofrecer una experiencia distinta por ubicación, plan de alimentos y servicios. Comparar el conjunto de servicios es más útil que mirar una sola tarifa.',
                    'Explora hoteles y tours en Los Cabos para iniciar tu cotización.'
                ]
            }
        ],
        relatedLinks: [
            { label: 'Viajes a Los Cabos', href: '/destinos/los-cabos/' },
            { label: 'Hoteles en Los Cabos', href: '/destinos/los-cabos/hoteles/' },
            { label: 'Todos los destinos', href: '/destinos/' }
        ]
    }
];

export function getGuide(slug: string) {
    return guides.find((guide) => guide.slug === slug);
}
