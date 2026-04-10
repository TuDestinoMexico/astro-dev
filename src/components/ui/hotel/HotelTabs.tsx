import React, { useState, useEffect } from 'react';

interface Props {
    description: string;
    amenities: string[];
    coordinates: number[];
    address: string;
}

const HotelTabs: React.FC<Props> = ({ description, amenities, coordinates, address }) => {
    const [activeTab, setActiveTab] = useState<'desc' | 'amenities' | 'location'>('desc');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Estado para la carga

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

    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isModalOpen]);

    const visibleAmenities = amenities.slice(0, 10);
    const hasMore = amenities.length > 10;

    return (
        <div className="relative w-full min-h-[500px] flex flex-col">
            {/* Menu de Navegación */}
            <div className="flex border-b border-slate-100 bg-white sticky top-0 z-10">
                {(['desc', 'amenities', 'location'] as const).map((tab) => (
                    <button
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
                                <p dangerouslySetInnerHTML={{ __html: description }} />
                            </div>
                        )}

                        {activeTab === 'amenities' && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {visibleAmenities.map((item, index) => (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50">
                                            <div className="bg-blue-100 p-1 rounded-md shrink-0">
                                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                            <span className="text-slate-700 text-sm font-medium truncate">{item}</span>
                                        </div>
                                    ))}
                                </div>
                                {hasMore && (
                                    <button
                                        onClick={() => setIsModalOpen(true)}
                                        className="w-full py-3 text-blue-600 font-bold border-2 border-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-sm"
                                    >
                                        Mostrar las {amenities.length} amenidades
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
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-3xl max-h-[85vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col scale-up-center">
                        {/* ... contenido del modal ... */}
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-800">Servicios y Amenidades</h2>
                                <p className="text-slate-500 text-sm">Todo lo que incluye tu estadía</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-100 hover:bg-red-100 hover:text-red-600 rounded-full transition-all">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="p-8 overflow-y-auto bg-white">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {amenities.map((item, index) => (
                                    <div key={index} className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-transparent hover:border-blue-200 hover:bg-white transition-all shadow-sm group">
                                        <div className="bg-white p-2 rounded-lg shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <span className="text-slate-700 font-bold text-xs uppercase tracking-tight">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50/50 border-t border-slate-100 flex justify-center">
                            <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white px-10 py-3 rounded-xl font-bold hover:bg-slate-700 transition-all">Entendido</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HotelTabs;