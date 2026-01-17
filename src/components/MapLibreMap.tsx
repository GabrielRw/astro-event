'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapConfig } from '@/src/config/mapConfig';
import type { OverlayGeoJSON, EventItem } from '@/src/features/event-analyst/eventTypes';

interface MapLibreMapProps {
    center: { lat: number; lng: number };
    overlay: OverlayGeoJSON | null;
    selectedBodyId: string | null;
    allEvents?: EventItem[];
    onEventClick?: (eventId: string) => void;
    onMapReady?: () => void;
}

export function MapLibreMap({ center, overlay, selectedBodyId, allEvents = [], onEventClick, onMapReady }: MapLibreMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);
    const popup = useRef<maplibregl.Popup | null>(null);

    // Initialize map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: mapConfig.defaultStyleUrl,
            center: [center.lng, center.lat],
            zoom: mapConfig.defaults.zoom,
            pitch: mapConfig.defaults.pitch,
            bearing: mapConfig.defaults.bearing,
            attributionControl: false,
        });

        // Add custom attribution
        map.current.addControl(
            new maplibregl.AttributionControl({
                customAttribution: mapConfig.attribution,
            }),
            'bottom-right'
        );

        // Add navigation controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            // Add sources
            map.current!.addSource('overlayRings', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.current!.addSource('overlayRays', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.current!.addSource('allEvents', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: allEvents.map(event => ({
                        type: 'Feature' as const,
                        geometry: {
                            type: 'Point' as const,
                            coordinates: [event.location.lng, event.location.lat],
                        },
                        properties: {
                            id: event.id,
                            title: event.title,
                        },
                    }))
                },
            });

            // Add ring fill layer
            map.current!.addLayer({
                id: 'rings-fill',
                type: 'fill',
                source: 'overlayRings',
                paint: {
                    'fill-color': mapConfig.layers.rings.fillColor,
                    'fill-opacity': mapConfig.layers.rings.fillOpacity,
                },
            });

            // Add ring outline layer
            map.current!.addLayer({
                id: 'rings-outline',
                type: 'line',
                source: 'overlayRings',
                paint: {
                    'line-color': mapConfig.layers.rings.outlineColor,
                    'line-width': mapConfig.layers.rings.outlineWidth,
                    'line-opacity': mapConfig.layers.rings.outlineOpacity,
                },
            });

            // Add rays layer
            map.current!.addLayer({
                id: 'rays-lines',
                type: 'line',
                source: 'overlayRays',
                paint: {
                    'line-color': ['get', 'color'],
                    'line-width': mapConfig.layers.rays.width,
                    'line-opacity': mapConfig.layers.rays.opacity,
                },
            });

            // Add highlight layer (filtered by selected body)
            map.current!.addLayer({
                id: 'rays-highlight',
                type: 'line',
                source: 'overlayRays',
                filter: ['==', ['get', 'id'], ''],
                paint: {
                    'line-color': mapConfig.layers.rays.highlightColor,
                    'line-width': mapConfig.layers.rays.highlightWidth,
                    'line-opacity': 1,
                },
            });

            // Add event markers glow (behind the main marker)
            map.current!.addLayer({
                id: 'event-markers-glow',
                type: 'circle',
                source: 'allEvents',
                paint: {
                    'circle-color': mapConfig.layers.eventMarkersGlow.color,
                    'circle-radius': mapConfig.layers.eventMarkersGlow.radius,
                    'circle-blur': mapConfig.layers.eventMarkersGlow.blur,
                    'circle-opacity': mapConfig.layers.eventMarkersGlow.opacity,
                },
            });

            // Add all events markers layer
            map.current!.addLayer({
                id: 'event-markers',
                type: 'circle',
                source: 'allEvents',
                paint: {
                    'circle-color': mapConfig.layers.eventMarkers.color,
                    'circle-radius': mapConfig.layers.eventMarkers.radius,
                    'circle-stroke-width': mapConfig.layers.eventMarkers.strokeWidth,
                    'circle-stroke-color': mapConfig.layers.eventMarkers.strokeColor,
                    'circle-opacity': 0.8,
                },
            });

            // Handle event marker clicks
            map.current!.on('click', 'event-markers', (e) => {
                const feature = e.features?.[0];
                const eventId = feature?.properties?.id;
                if (eventId && onEventClick) {
                    onEventClick(eventId);
                }
            });

            // Cursor style and popup on hover
            map.current!.on('mouseenter', 'event-markers', (e) => {
                if (!map.current) return;
                map.current.getCanvas().style.cursor = 'pointer';

                const feature = e.features?.[0];
                const title = feature?.properties?.title;
                const coordinates = (feature?.geometry as any)?.coordinates?.slice();

                if (title && coordinates) {
                    if (popup.current) popup.current.remove();
                    const popupInstance = new maplibregl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 10,
                        className: 'event-popup'
                    })
                        .setLngLat(coordinates)
                        .setHTML(`
                            <div class="text-slate-900 px-1">
                                <div class="font-bold text-sm mb-1">${title}</div>
                                <div class="text-[10px] text-slate-500 font-mono animate-pulse">Scanning location...</div>
                            </div>
                        `)
                        .addTo(map.current);

                    popup.current = popupInstance;

                    // Reverse Geocode
                    const [lng, lat] = coordinates;
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                        headers: { 'User-Agent': 'AstroNatalChart/1.0' }
                    })
                        .then(res => res.json())
                        .then(data => {
                            // Check if popup is still open and for the same location (simple check)
                            if (popup.current === popupInstance) {
                                const address = data.display_name ?
                                    data.display_name.split(',').slice(0, 3).join(',') : // Shorten address
                                    'Address not found';

                                popupInstance.setHTML(`
                                    <div class="text-slate-900 px-1">
                                        <div class="font-bold text-sm mb-1">${title}</div>
                                        <div class="text-[10px] text-slate-600 leading-tight">${address}</div>
                                    </div>
                                `);
                            }
                        })
                        .catch(err => {
                            if (popup.current === popupInstance) {
                                popupInstance.setHTML(`
                                    <div class="text-slate-900 px-1">
                                        <div class="font-bold text-sm mb-1">${title}</div>
                                        <div class="text-[10px] text-red-500">Address lookup failed</div>
                                    </div>
                                `);
                            }
                        });
                }
            });

            map.current!.on('mouseleave', 'event-markers', () => {
                if (map.current) {
                    map.current.getCanvas().style.cursor = '';
                    if (popup.current) {
                        popup.current.remove();
                        popup.current = null;
                    }
                }
            });

            // --- INTERSECTIONS LAYER ---
            map.current!.addSource('overlayIntersections', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
            });

            map.current!.addLayer({
                id: 'intersections-points',
                type: 'circle',
                source: 'overlayIntersections',
                paint: {
                    'circle-color': '#ffffff',
                    'circle-radius': 3,
                    'circle-stroke-width': 1,
                    'circle-stroke-color': '#000000',
                    'circle-opacity': 0.9,
                },
            });

            // Intersection interaction
            map.current!.on('mouseenter', 'intersections-points', (e) => {
                if (!map.current) return;
                map.current.getCanvas().style.cursor = 'crosshair';

                const feature = e.features?.[0];
                const props = feature?.properties;
                const coordinates = (feature?.geometry as any)?.coordinates?.slice();

                if (props && coordinates) {
                    if (popup.current) popup.current.remove();

                    // Format Coordinates nicely
                    const lat = props.lat;
                    const lng = props.lng;
                    const latStr = Math.abs(lat).toFixed(4) + (lat >= 0 ? '°N' : '°S');
                    const lngStr = Math.abs(lng).toFixed(4) + (lng >= 0 ? '°E' : '°W');

                    const popupInstance = new maplibregl.Popup({
                        closeButton: false,
                        closeOnClick: false,
                        offset: 5,
                        className: 'intersection-popup'
                    })
                        .setLngLat(coordinates)
                        .setHTML(`
                            <div class="text-slate-900 text-xs px-1">
                                <div class="font-bold border-b border-slate-300 pb-1 mb-1">${props.bodyLabel} @ ${props.bearing.toFixed(1)}°</div>
                                <div>Dist: <strong>${Math.round(props.ringRadius * 10) / 10} ${props.unit}</strong></div>
                                <div class="mt-1 font-mono text-[10px] text-slate-600">${latStr}, ${lngStr}</div>
                                <div class="mt-1 pt-1 border-t border-slate-200 text-[10px] text-slate-500 italic animate-pulse">Scanning street...</div>
                            </div>
                        `)
                        .addTo(map.current);

                    popup.current = popupInstance;

                    // Reverse Geocode Intersection
                    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
                        headers: { 'User-Agent': 'AstroNatalChart/1.0' }
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (popup.current === popupInstance) {
                                const address = data.address?.road || data.address?.pedestrian || data.address?.suburb || 'Street not found';

                                popupInstance.setHTML(`
                                    <div class="text-slate-900 text-xs px-1">
                                        <div class="font-bold border-b border-slate-300 pb-1 mb-1">${props.bodyLabel} @ ${props.bearing.toFixed(1)}°</div>
                                        <div>Dist: <strong>${Math.round(props.ringRadius * 10) / 10} ${props.unit}</strong></div>
                                        <div class="mt-1 font-mono text-[10px] text-slate-600">${latStr}, ${lngStr}</div>
                                        <div class="mt-1 pt-1 border-t border-slate-200 text-[10px] text-emerald-700 font-medium">${address}</div>
                                    </div>
                                `);
                            }
                        })
                        .catch(() => {
                            if (popup.current === popupInstance) {
                                // removing the loading text on error
                                popupInstance.setHTML(`
                                    <div class="text-slate-900 text-xs px-1">
                                        <div class="font-bold border-b border-slate-300 pb-1 mb-1">${props.bodyLabel} @ ${props.bearing.toFixed(1)}°</div>
                                        <div>Dist: <strong>${Math.round(props.ringRadius * 10) / 10} ${props.unit}</strong></div>
                                        <div class="mt-1 font-mono text-[10px] text-slate-600">${latStr}, ${lngStr}</div>
                                    </div>
                                `);
                            }
                        });
                }
            });

            map.current!.on('mouseleave', 'intersections-points', () => {
                if (map.current) {
                    map.current.getCanvas().style.cursor = '';
                    if (popup.current) {
                        popup.current.remove();
                        popup.current = null;
                    }
                }
            });

            onMapReady?.();
        });

        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Update center and marker
    useEffect(() => {
        if (!map.current) return;

        map.current.flyTo({
            center: [center.lng, center.lat],
            zoom: 6,
            duration: 1000,
        });

        // Update or create marker
        if (marker.current) {
            marker.current.setLngLat([center.lng, center.lat]);
        } else {
            marker.current = new maplibregl.Marker({ color: mapConfig.layers.centerMarker.color })
                .setLngLat([center.lng, center.lat])
                .addTo(map.current);
        }
    }, [center.lat, center.lng]);

    // Update overlay data
    const updateOverlay = useCallback((overlayData: OverlayGeoJSON) => {
        if (!map.current) return;

        const ringsSource = map.current.getSource('overlayRings') as maplibregl.GeoJSONSource;
        const raysSource = map.current.getSource('overlayRays') as maplibregl.GeoJSONSource;
        const intersectionsSource = map.current.getSource('overlayIntersections') as maplibregl.GeoJSONSource;

        if (ringsSource) {
            ringsSource.setData(overlayData.rings as GeoJSON.FeatureCollection);
        }
        if (raysSource) {
            raysSource.setData(overlayData.rays as GeoJSON.FeatureCollection);
        }
        if (intersectionsSource && overlayData.intersections) {
            intersectionsSource.setData(overlayData.intersections as GeoJSON.FeatureCollection);
        }
    }, []);

    useEffect(() => {
        if (overlay) {
            // Wait for map to be loaded
            if (map.current?.isStyleLoaded()) {
                updateOverlay(overlay);
            } else {
                map.current?.on('load', () => updateOverlay(overlay));
            }
        }
    }, [overlay, updateOverlay]);

    // Update all events markers
    useEffect(() => {
        if (!map.current?.getSource('allEvents') || !allEvents) return;

        const source = map.current.getSource('allEvents') as maplibregl.GeoJSONSource;

        const features = allEvents.map(event => ({
            type: 'Feature' as const,
            geometry: {
                type: 'Point' as const,
                coordinates: [event.location.lng, event.location.lat],
            },
            properties: {
                id: event.id,
                title: event.title,
            },
        }));

        source.setData({
            type: 'FeatureCollection',
            features,
        });
    }, [allEvents]);

    // Update highlight filter
    useEffect(() => {
        if (!map.current?.isStyleLoaded()) return;

        map.current.setFilter('rays-highlight', [
            '==',
            ['get', 'id'],
            selectedBodyId || '',
        ]);
    }, [selectedBodyId]);

    return (
        <div
            ref={mapContainer}
            className="w-full h-full rounded-lg overflow-hidden"
            style={{ minHeight: '400px' }}
        />
    );
}
