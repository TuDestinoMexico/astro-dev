import React, { useId, useState } from 'react';
import {
    Accessibility,
    Baby,
    Bell,
    Bus,
    ClipboardList,
    Flower2,
    List as ListIcon,
    Shirt,
    Smile,
    Sparkles,
    Store,
    Utensils,
    type LucideIcon,
} from 'lucide-react';
import { useAccessibleDialog } from '../../../hooks/useAccessibleDialog';

interface AmenityGroup {
    category?: string;
    icon?: string;
    items: string[];
}

type AmenityEntry = AmenityGroup | string;

interface Props {
    descriptionHtml: string;
    amenities: AmenityEntry[];
    coordinates: number[];
    address: string;
    showAmenities?: boolean;
}

const AMENITY_ICONS: Record<string, LucideIcon> = {
    list: ListIcon,
    smile: Smile,
    spa: Sparkles,
    kids: Baby,
    outdoor: Flower2,
    food: Utensils,
    mobility: Bus,
    accessibility: Accessibility,
    laundry: Shirt,
    common: Store,
    reception: Bell,
    rules: ClipboardList,
};

const HotelTabs: React.FC<Props> = ({ descriptionHtml, amenities, coordinates, address, showAmenities = true }) => {
    const [activeTab, setActiveTab] = useState<'desc' | 'amenities' | 'location'>('desc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Estado para la carga
    const titleId = useId();
    const { dialogRef } = useAccessibleDialog({
        open: isModalOpen,
        onClose: () => setIsModalOpen(false),
    });

    const apiKey = "AIzaSyCXKmnPdBL8H7egOAKRnfdSYDc2H0fAI5E";
    const lat = coordinates[0];
    const lng = coordinates[1];

    // Función para manejar el cambio de pestaña con efecto de carga
    const handleTabChange = (tab: 'desc' | 'amenities' | 'location') => {
        if (tab === activeTab) return;

        setIsLoading(true);
        setActiveTab(tab);

        // Simulamos un tiempo de carga para suavizar la transición (600ms)
        setTimeout(() => {
            setIsLoading(false);
        }, 600);
    };

    const groupedAmenities = amenities.flatMap((entry): AmenityGroup[] => {
        if (entry && typeof entry === 'object' && Array.isArray(entry.items)) {
            const items = entry.items.filter((item) => typeof item === 'string' && item.trim()).map((item) => item.trim());
            return items.length ? [{ ...entry, category: entry.category?.trim() || 'Otros', icon: entry.icon || 'list', items }] : [];
        }
        return [];
    });
    const legacyAmenities = amenities.filter((entry): entry is string => typeof entry === 'string' && Boolean(entry.trim())).map((entry) => entry.trim());
    const amenityGroups = legacyAmenities.length
        ? [...groupedAmenities, { category: 'Otros', icon: 'list', items: legacyAmenities }]
        : groupedAmenities;
    const visibleAmenities = amenityGroups.slice(0, 4).map((group) => ({
        ...group,
        items: group.items.slice(0, 5),
    }));
    const amenityCount = amenityGroups.reduce((total, group) => total + group.items.length, 0);
    const hasMore = amenityGroups.length > 4 || amenityGroups.some((group) => group.items.length > 5);
    const tabs = showAmenities ? ['desc', 'amenities', 'location'] as const : ['desc', 'location'] as const;

    return (
        <div className="relative w-full min-h-[500px] flex flex-col">
            {/* Menu de Navegación */}
            <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
                {tabs.map((tab) => (
                    <button
                        type="button"
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`flex-1 py-4 text-center font-bold text-xs md:text-sm transition-all relative ${
                            activeTab === tab
                                ? 'text-blue-600'
                                : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        {tab === 'desc' ? 'Descripción' : tab === 'amenities' ? 'Amenidades' : 'Ubicación'}
                        {activeTab === tab && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 animate-in fade-in slide-in-from-bottom-1" />
                        )}
                    </button>
                ))}
            </div>

            {/* Contenedor de Contenido / Carga */}
            <div className="p-5 md:p-8 flex-1 flex flex-col relative">

                {isLoading ? (
                    /* SPINNER DE CARGA */
                    <div className="flex-1 flex flex-col items-center justify-center py-20 animate-in fade-in duration-300">
                        <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-slate-400 text-sm font-medium animate-pulse">Cargando información...</p>
                    </div>
                ) : (
                    /* CONTENIDO REAL */
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {activeTab === 'desc' && (
                            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed italic">
                                <div dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
                            </div>
                        )}

                        {activeTab === 'amenities' && showAmenities && (
                            <div className="space-y-5">
                                {visibleAmenities.length ? (
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                        {visibleAmenities.map((group, index) => {
                                            const Icon = AMENITY_ICONS[group.icon || 'list'] || ListIcon;
                                            const remaining = amenityGroups[index].items.length - group.items.length;

                                            return (
                                                <section key={`${group.category}-${index}`} className="min-w-0 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
                                                    <h3 className="flex items-start gap-2.5 text-base font-extrabold text-slate-800">
                                                        <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                                                        <span className="break-words">{group.category}</span>
                                                    </h3>
                                                    <ul className="mt-3 space-y-2 text-sm leading-relaxed text-slate-600">
                                                        {group.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`} className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" /><span className="break-words">{item}</span></li>)}
                                                    </ul>
                                                    {remaining > 0 && <p className="mt-2 text-xs font-semibold text-slate-400">+{remaining} más</p>}
                                                </section>
                                            );
                                })}
                                    </div>
                                ) : (
                                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                                        No hay amenidades disponibles para este producto.
                                    </div>
                                )}
                                {hasMore && (
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-3 text-blue-600 font-bold border-2 border-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-sm"
                                    >
                                        Mostrar las {amenityCount} amenidades
                                    </button>
                                )}
                            </div>
                        )}

                        {activeTab === 'location' && (
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-slate-600 mb-2">
                                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium text-sm">{address}</span>
                                </div>

                                {lat && lng ? (
                                    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-slate-200 shadow-inner bg-slate-100">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            style={{ border: 0 }}
                                            loading="lazy"
                                            allowFullScreen
                                            src={`https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15`}
                                        ></iframe>
                                    </div>
                                ) : (
                                    <div className="p-10 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400">
                                        Coordenadas no disponibles.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* MODAL (Se mantiene igual que antes) */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 md:p-10" style={{ zIndex: 9999 }}>
                    <div
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
                        onMouseDown={(event) => {
                            if (event.target === event.currentTarget) setIsModalOpen(false);
                        }}
                    ></div>
                    <div
                        ref={dialogRef}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={titleId}
                        tabIndex={-1}
                        className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col scale-up-center"
                    >
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
                            <div>
                                <h2 id={titleId} className="text-2xl font-black text-slate-800">Servicios y Amenidades</h2>
                                <p className="text-slate-500 text-sm">{amenityCount} amenidades en {amenityGroups.length} categorías</p>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-all" aria-label="Cerrar amenidades">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {amenityGroups.map((group, index) => {
                                    const Icon = AMENITY_ICONS[group.icon || 'list'] || ListIcon;

                                    return (
                                        <section key={`${group.category}-${index}`} className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                            <h3 className="flex items-start gap-2.5 text-base font-extrabold text-slate-800">
                                                <Icon className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
                                                <span className="break-words">{group.category}</span>
                                            </h3>
                                            <ul className="mt-4 space-y-2 text-sm leading-relaxed text-slate-600">
                                                {group.items.map((item, itemIndex) => <li key={`${item}-${itemIndex}`} className="flex items-start gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" /><span className="break-words">{item}</span></li>)}
                                            </ul>
                                        </section>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white px-10 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all">Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelTabs;
