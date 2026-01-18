'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapConfig } from '@/src/config/mapConfig';
import { FeatureCollection } from 'geojson';

interface GeoChartMapProps {
    center: { lat: number; lng: number };
    layers: Record<string, FeatureCollection>;
}

export function GeoChartMap({ center, layers }: GeoChartMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: mapConfig.defaultStyleUrl,
            center: [center.lng, center.lat],
            zoom: 6,
            pitch: 0,
            bearing: 0,
            attributionControl: false,
        });

        map.current.addControl(
            new maplibregl.AttributionControl({
                customAttribution: mapConfig.attribution,
            }),
            'bottom-right'
        );

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            // SOURCES
            const sources = [
                'geoChart-center',
                'geoChart-houses',
                'geoChart-houses-ring',
                'geoChart-zodiac-ring',
                'geoChart-planet-rays',
            ];

            sources.forEach(id => {
                map.current!.addSource(id, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
            });


            // LAYERS (Order: Bottom to Top)

            // 1. Zodiac Ring (Widest, sits at back)
            map.current!.addLayer({
                id: 'layer-zodiac-ring',
                type: 'fill',
                source: 'geoChart-zodiac-ring',
                paint: {
                    'fill-color': '#475569', // Slate 600
                    'fill-opacity': 0.1,
                    'fill-outline-color': '#1e293b'
                }
            });
            map.current!.addLayer({
                id: 'layer-zodiac-lines',
                type: 'line',
                source: 'geoChart-zodiac-ring',
                paint: {
                    'line-color': '#475569',
                    'line-width': 1,
                    'line-opacity': 0.3
                }
            });

            // 2. House Number Ring (Middle)
            map.current!.addLayer({
                id: 'layer-houses-ring',
                type: 'fill',
                source: 'geoChart-houses-ring',
                paint: {
                    'fill-color': '#1e293b', // Slate 800
                    'fill-opacity': 0.8, // Opaque to hide inner start of zodiac ring
                    'fill-outline-color': '#64748b'
                }
            });

            // 3. Inner Houses (Center)
            map.current!.addLayer({
                id: 'layer-houses',
                type: 'fill',
                source: 'geoChart-houses',
                paint: {
                    'fill-color': '#0f172a', // Slate 900
                    'fill-opacity': 0.9, // Hides inner start of House Ring
                }
            });
            map.current!.addLayer({
                id: 'layer-houses-lines',
                type: 'line',
                source: 'geoChart-houses',
                paint: {
                    'line-color': '#334155',
                    'line-width': 1,
                    'line-opacity': 0.5
                }
            });


            // 5. Rays
            map.current!.addLayer({
                id: 'layer-rays',
                type: 'line',
                source: 'geoChart-planet-rays',
                paint: {
                    'line-color': '#e2e8f0',
                    'line-width': 1,
                    'line-opacity': 0.6
                }
            });



            // 7. Center
            map.current!.addLayer({
                id: 'layer-center',
                type: 'circle',
                source: 'geoChart-center',
                paint: {
                    'circle-color': '#ef4444',
                    'circle-radius': 5,
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#fff'
                }
            });

            // House Labels (on the ring essentially) - Maybe too cluttered, let's skip for now or add simple
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update Data
    useEffect(() => {
        if (!map.current || !layers) return;

        const setSourceData = (id: string, geojson: any) => {
            const source = map.current?.getSource(id) as maplibregl.GeoJSONSource;
            if (source) {
                source.setData(geojson);
            }
        };

        setSourceData('geoChart-center', layers['geoChart-center']);
        setSourceData('geoChart-houses', layers['geoChart-houses']);
        setSourceData('geoChart-houses-ring', layers['geoChart-houses-ring']);
        setSourceData('geoChart-zodiac-ring', layers['geoChart-zodiac-ring']);
        setSourceData('geoChart-planet-rays', layers['geoChart-planet-rays']);

        // Sync Markers
        updateMarkers('markers', layers['geoChart-planet-markers'], createPlanetMarker);
        updateMarkers('zodiac-labels', layers['geoChart-zodiac-labels'], createZodiacLabel);
        updateMarkers('house-labels', layers['geoChart-houses-labels'], createHouseLabel);

    }, [layers]);

    // Marker Refs
    const markersRef = useRef<Record<string, maplibregl.Marker[]>>({
        markers: [],
        'zodiac-labels': [],
        'house-labels': []
    });

    // Helper to sync markers
    const updateMarkers = (
        key: 'markers' | 'zodiac-labels' | 'house-labels',
        fc: FeatureCollection,
        createFunc: (props: any) => HTMLElement
    ) => {
        // Clear existing
        markersRef.current[key].forEach(m => m.remove());
        markersRef.current[key] = [];

        if (!map.current || !fc || !fc.features) return;

        fc.features.forEach((f: any) => {
            if (f.geometry.type === 'Point') {
                const el = createFunc(f.properties);
                const marker = new maplibregl.Marker({ element: el })
                    .setLngLat(f.geometry.coordinates as [number, number])
                    .addTo(map.current!);
                markersRef.current[key].push(marker);
            }
        });
    };

    // Element Creators
    const createPlanetMarker = (props: any) => {
        const div = document.createElement('div');
        div.className = 'flex flex-col items-center';

        // Dot
        const dot = document.createElement('div');
        dot.style.cssText = 'width: 8px; height: 8px; background: #fbbf24; border-radius: 50%; border: 1px solid #000; box-shadow: 0 0 4px rgba(0,0,0,0.5);';

        // Glyph
        const glyph = document.createElement('span');
        glyph.innerText = props.glyph;
        glyph.style.cssText = 'font-family: "AstroFont"; font-size: 24px; color: #fbbf24; text-shadow: 0 0 2px #000; margin-top: 2px;';

        div.appendChild(dot);
        div.appendChild(glyph);
        return div;
    };

    const createZodiacLabel = (props: any) => {
        const div = document.createElement('div');
        div.innerText = props.label;
        div.style.cssText = 'font-family: "AstroFont"; font-size: 26px; color: #e2e8f0; text-shadow: 0 0 3px #000; opacity: 0.9;';
        return div;
    };

    const createHouseLabel = (props: any) => {
        const div = document.createElement('div');
        div.innerText = props.label;
        div.style.cssText = 'font-family: sans-serif; font-size: 12px; font-weight: bold; color: #94a3b8; text-shadow: 0 0 2px #000;';
        return div;
    };


    // Update center flyTo
    useEffect(() => {
        if (map.current) {
            map.current.flyTo({
                center: [center.lng, center.lat],
                essential: true // this animation is considered essential with respect to prefers-reduced-motion
            });
        }
    }, [center.lat, center.lng]);

    return <div ref={mapContainer} className="w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10" />;
}
