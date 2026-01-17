'use client';

import { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapConfig } from '@/src/config/mapConfig';
import type { OverlayGeoJSON } from '@/src/features/event-analyst/eventTypes';

interface MapLibreMapProps {
    center: { lat: number; lng: number };
    overlay: OverlayGeoJSON | null;
    selectedBodyId: string | null;
    onMapReady?: () => void;
}

export function MapLibreMap({ center, overlay, selectedBodyId, onMapReady }: MapLibreMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);

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

        if (ringsSource) {
            ringsSource.setData(overlayData.rings as GeoJSON.FeatureCollection);
        }
        if (raysSource) {
            raysSource.setData(overlayData.rays as GeoJSON.FeatureCollection);
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
