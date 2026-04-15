import React, { useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';

interface MapProps {
    activeIndex: number;
    onMarkerClick: (index: number) => void;
    milestones: any[];
}

const mapStyles = [
    { "elementType": "geometry", "stylers": [{ "color": "#1d2c4d" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#8ec3b9" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1a3646" }] },
    { "featureType": "administrative.country", "elementType": "geometry.stroke", "stylers": [{ "color": "#4b6878" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0e1626" }] }
];

const GoogleMexicoMap: React.FC<MapProps> = ({ activeIndex, onMarkerClick, milestones }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "AIzaSyCXKmnPdBL8H7egOAKRnfdSYDc2H0fAI5E"
    });

    const mapRef = useRef<google.maps.Map | null>(null);

    const onLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    useEffect(() => {
        if (mapRef.current && milestones[activeIndex]) {
            const { lat, lng } = milestones[activeIndex].coords;
            mapRef.current.panTo({ lat, lng });
        }
    }, [activeIndex, milestones]);

    return isLoaded ? (
        <div className="w-full aspect-video md:aspect-21/9 container mx-auto rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-2xl border border-slate-800 mb-10">
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: 23.6345, lng: -102.5528 }}
                zoom={5}
                onLoad={onLoad}
                options={{
                    styles: mapStyles,
                    disableDefaultUI: true,
                    zoomControl: true,
                }}
            >
                {milestones.map((milestone, idx) => (
                    <React.Fragment key={milestone.id}>
                        <MarkerF
                            position={milestone.coords}
                            onClick={() => onMarkerClick(idx)}
                            icon={{
                                path: google.maps.SymbolPath.CIRCLE,
                                fillColor: activeIndex === idx ? "#6366f1" : "#475569",
                                fillOpacity: 1,
                                strokeColor: "#ffffff",
                                strokeWeight: 2,
                                scale: activeIndex === idx ? 10 : 7,
                            }}
                        />

                        {/* Muestra el shortTitle solo si es el activo */}
                        {activeIndex === idx && (
                            <InfoWindowF
                                position={milestone.coords}
                                options={{ pixelOffset: new window.google.maps.Size(0, -15) }}
                            >
                                <div className="bg-white p-2 rounded-lg">
                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">
                                        {milestone.shortTitle}
                                    </p>
                                </div>
                            </InfoWindowF>
                        )}
                    </React.Fragment>
                ))}
            </GoogleMap>
        </div>
    ) : <div className="h-96 bg-slate-900 animate-pulse rounded-[4rem]"></div>;
};

export default GoogleMexicoMap;