import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, MapPin, RefreshCw } from 'lucide-react';
import { GoogleMap, InfoWindowF, MarkerF, useJsApiLoader } from '@react-google-maps/api';
import type { Milestone } from './Timeline';

interface MapProps {
    activeIndex: number;
    onMarkerClick: (index: number) => void;
    milestones: Milestone[];
}

const mapStyles = [
    { elementType: 'geometry', stylers: [{ color: '#1d2c4d' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#1a3646' }] },
    { featureType: 'administrative.country', elementType: 'geometry.stroke', stylers: [{ color: '#4b6878' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] },
];

function getLocation(title: string) {
    return title.replace(/^XOLO RUTA\s+/i, '');
}

function MapFallback({ error, onRetry, milestones, onMarkerClick }: { error?: boolean; onRetry: () => void; milestones: Milestone[]; onMarkerClick: (index: number) => void }) {
    return (
        <div className="flex min-h-70 flex-col justify-center rounded-[2rem] bg-slate-900 p-6 text-white shadow-xl sm:min-h-80">
            <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-primary">
                    {error ? <AlertTriangle size={20} aria-hidden="true" /> : <MapPin size={20} aria-hidden="true" />}
                </span>
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Mapa de la ruta</p>
                    <p className="font-semibold">{error ? 'El mapa no está disponible' : 'Cargando ciudades...'}</p>
                </div>
            </div>
            {error ? (
                <>
                    <p className="mb-4 text-sm leading-relaxed text-slate-300">Puedes continuar explorando los hitos desde esta lista.</p>
                    <button type="button" onClick={onRetry} className="mb-5 inline-flex w-fit items-center gap-2 rounded-xl bg-brand-primary px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                        <RefreshCw size={16} aria-hidden="true" /> Reintentar mapa
                    </button>
                </>
            ) : <div className="h-2 w-full overflow-hidden rounded-full bg-white/10"><div className="h-full w-1/2 animate-pulse rounded-full bg-brand-primary" /></div>}
            {error && <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {milestones.map((milestone, index) => <button key={milestone.id} type="button" onClick={() => onMarkerClick(index)} className="rounded-xl border border-white/10 px-3 py-2 text-left text-xs font-semibold text-slate-200 transition hover:border-brand-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary">{getLocation(milestone.shortTitle)}</button>)}
            </div>}
        </div>
    );
}

export default function MexicoMap({ activeIndex, onMarkerClick, milestones }: MapProps) {
    const [retryKey, setRetryKey] = useState(0);
    const { isLoaded, loadError } = useJsApiLoader({ id: `google-map-script-${retryKey}`, googleMapsApiKey: import.meta.env.PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyCXKmnPdBL8H7egOAKRnfdSYDc2H0fAI5E' });
    const mapRef = useRef<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => { mapRef.current = map; }, []);

    useEffect(() => {
        if (mapRef.current && milestones[activeIndex]) mapRef.current.panTo(milestones[activeIndex].coords);
    }, [activeIndex, milestones]);

    if (loadError) return <MapFallback error onRetry={() => setRetryKey((key) => key + 1)} milestones={milestones} onMarkerClick={onMarkerClick} />;
    if (!isLoaded) return <MapFallback milestones={milestones} onRetry={() => undefined} onMarkerClick={onMarkerClick} />;

    return (
        <div className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-900 shadow-xl sm:rounded-[2.5rem]">
            <div className="flex items-center justify-between px-5 py-4 text-white sm:px-6">
                <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Explora el mapa</p><p className="font-semibold">Ciudades que forman nuestra ruta</p></div>
                <MapPin size={20} className="text-brand-primary" aria-hidden="true" />
            </div>
            <div className="aspect-[4/3] w-full sm:aspect-[16/10] lg:aspect-[4/3]">
                <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={{ lat: 23.6345, lng: -102.5528 }} zoom={5} onLoad={onLoad} options={{ styles: mapStyles, disableDefaultUI: true, zoomControl: true, gestureHandling: 'cooperative' }}>
                    {milestones.map((milestone, index) => <React.Fragment key={milestone.id}>
                        <MarkerF position={milestone.coords} onClick={() => onMarkerClick(index)} icon={{ path: google.maps.SymbolPath.CIRCLE, fillColor: activeIndex === index ? '#00c0a5' : '#94a3b8', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2, scale: activeIndex === index ? 10 : 7 }} />
                        {activeIndex === index && <InfoWindowF position={milestone.coords} options={{ pixelOffset: new window.google.maps.Size(0, -15) }}><div className="rounded-lg bg-white px-2 py-1"><p className="text-[10px] font-black uppercase tracking-tight text-slate-900">{getLocation(milestone.shortTitle)}</p><p className="text-[10px] text-slate-500">{milestone.date}</p></div></InfoWindowF>}
                    </React.Fragment>)}
                </GoogleMap>
            </div>
        </div>
    );
}
