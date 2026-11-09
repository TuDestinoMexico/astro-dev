import React, { useId, useState } from 'react';
import {
    Accessibility,
    Baby,
    Bell,
    Bus,
    ClipboardList,
    FileText,
    Flower2,
    List as ListIcon,
    MapPin,
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
type TabKey = 'desc' | 'amenities' | 'location';

interface Props {
    descriptionHtml: string;
    amenities: AmenityEntry[];
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

const TAB_META: Record<TabKey, { label: string; Icon: LucideIcon }> = {
    desc: { label: 'Descripción', Icon: FileText },
    amenities: { label: 'Amenidades', Icon: Sparkles },
    location: { label: 'Ubicación', Icon: MapPin },
};

const HotelTabs: React.FC<Props> = ({ descriptionHtml, amenities, address, showAmenities = true }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('desc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const baseId = useId();
    const titleId = useId();
    const { dialogRef } = useAccessibleDialog({
        open: isModalOpen,
        onClose: () => setIsModalOpen(false),
    });

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
    const tabs: TabKey[] = showAmenities ? ['desc', 'amenities', 'location'] : ['desc', 'location'];

    // Flechas izquierda y derecha mueven el foco entre pestañas (patrón de tabs accesible).
    const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
        event.preventDefault();
        const current = tabs.indexOf(activeTab);
        const offset = event.key === 'ArrowRight' ? 1 : -1;
        const next = tabs[(current + offset + tabs.length) % tabs.length];
        setActiveTab(next);
        document.getElementById(`${baseId}-${next}-tab`)?.focus();
    };

    return (
        <div className="flex w-full flex-col">
            <style>{`
                @keyframes tdmx-tab-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
                @keyframes tdmx-fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes tdmx-pop-in { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
            `}</style>

            {/* Pestañas: cambian al instante, sin loader */}
            <div role="tablist" aria-label="Información del lugar" className="flex gap-1.5 border-b border-slate-100 bg-white p-2 md:p-3">
                {tabs.map((tab) => {
                    const { label, Icon } = TAB_META[tab];
                    const isActive = activeTab === tab;
                    return (
                        <button
                            key={tab}
                            id={`${baseId}-${tab}-tab`}
                            type="button"
                            role="tab"
                            aria-selected={isActive}
                            aria-controls={`${baseId}-${tab}-panel`}
                            tabIndex={isActive ? 0 : -1}
                            onClick={() => setActiveTab(tab)}
                            onKeyDown={handleTabKeyDown}
                            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                                isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                            <span>{label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Contenido: se vuelve a montar al cambiar de pestaña para animar la entrada */}
            <div className="p-5 md:p-8">
                {activeTab === 'desc' && (
                    <div
                        key="desc"
                        id={`${baseId}-desc-panel`}
                        role="tabpanel"
                        aria-labelledby={`${baseId}-desc-tab`}
                        className="mx-auto max-w-3xl motion-safe:animate-[tdmx-tab-in_.3s_ease-out]"
                    >
                        <p className="mb-3 text-xs font-black uppercase tracking-widest text-blue-600">Acerca de</p>
                        <div
                            className="text-[15px] leading-8 text-slate-600 md:text-base [&_p]:mb-4 [&_p:last-child]:mb-0 [&_strong]:font-bold [&_strong]:text-slate-800"
                            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
                        />
                    </div>
                )}

                {activeTab === 'amenities' && showAmenities && (
                    <div
                        key="amenities"
                        id={`${baseId}-amenities-panel`}
                        role="tabpanel"
                        aria-labelledby={`${baseId}-amenities-tab`}
                        className="space-y-6 motion-safe:animate-[tdmx-tab-in_.3s_ease-out]"
                    >
                        {visibleAmenities.length ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {visibleAmenities.map((group, index) => {
                                    const Icon = AMENITY_ICONS[group.icon || 'list'] || ListIcon;
                                    const remaining = amenityGroups[index].items.length - group.items.length;

                                    return (
                                        <section key={`${group.category}-${index}`} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                                            <h3 className="flex items-center gap-2.5 text-base font-extrabold text-slate-800">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                                <span className="min-w-0 break-words">{group.category}</span>
                                            </h3>
                                            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
                                                {group.items.map((item, itemIndex) => (
                                                    <li key={`${item}-${itemIndex}`} className="flex items-start gap-2.5">
                                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                                                        <span className="break-words">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                            {remaining > 0 && <p className="mt-3 text-xs font-bold text-blue-600">+{remaining} más</p>}
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
                                className="w-full rounded-xl border-2 border-blue-600 py-3 text-sm font-bold text-blue-600 transition-all hover:bg-blue-600 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            >
                                Ver las {amenityCount} amenidades
                            </button>
                        )}
                    </div>
                )}

                {activeTab === 'location' && (
                    <div
                        key="location"
                        id={`${baseId}-location-panel`}
                        role="tabpanel"
                        aria-labelledby={`${baseId}-location-tab`}
                        className="mx-auto max-w-3xl motion-safe:animate-[tdmx-tab-in_.3s_ease-out]"
                    >
                        <div className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:gap-5 sm:p-6">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-red-500 text-white shadow-lg shadow-red-500/20" aria-hidden="true">
                                <MapPin className="h-6 w-6" />
                            </span>
                            <div className="min-w-0">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-400">Dirección</p>
                                <p className="mt-1 text-base font-semibold leading-relaxed text-slate-800">
                                    {address || 'Dirección no disponible'}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de todas las amenidades */}
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center p-4 md:p-10" style={{ zIndex: 9999 }}>
                    <div
                        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md motion-safe:animate-[tdmx-fade-in_.25s_ease-out]"
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
                        className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl motion-safe:animate-[tdmx-pop-in_.3s_cubic-bezier(0.2,0.8,0.2,1)]"
                    >
                        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-8 py-6">
                            <div>
                                <h2 id={titleId} className="text-2xl font-black text-slate-800">Servicios y Amenidades</h2>
                                <p className="text-sm text-slate-500">{amenityCount} amenidades en {amenityGroups.length} categorías</p>
                            </div>
                            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-full bg-slate-100 p-3 transition-all hover:bg-red-100 hover:text-red-600" aria-label="Cerrar amenidades">
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="overflow-y-auto bg-white p-8">
                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                {amenityGroups.map((group, index) => {
                                    const Icon = AMENITY_ICONS[group.icon || 'list'] || ListIcon;

                                    return (
                                        <section key={`${group.category}-${index}`} className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 p-5">
                                            <h3 className="flex items-center gap-2.5 text-base font-extrabold text-slate-800">
                                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                                    <Icon className="h-4 w-4" aria-hidden="true" />
                                                </span>
                                                <span className="min-w-0 break-words">{group.category}</span>
                                            </h3>
                                            <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-600">
                                                {group.items.map((item, itemIndex) => (
                                                    <li key={`${item}-${itemIndex}`} className="flex items-start gap-2.5">
                                                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" aria-hidden="true" />
                                                        <span className="break-words">{item}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </section>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex justify-center border-t border-slate-100 bg-slate-50/50 p-6">
                            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl bg-slate-800 px-10 py-3 font-bold text-white transition-all hover:bg-slate-700">Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelTabs;
