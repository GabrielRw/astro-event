'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { mapConfig } from '@/src/config/mapConfig';
import { ResolverOutput } from './types';
import * as turf from '@turf/turf';

interface AstroLocatorMapProps {
    center: { lat: number; lng: number };
    resolverOutput: ResolverOutput | null;
}

export function AstroLocatorMap({ center, resolverOutput }: AstroLocatorMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const marker = useRef<maplibregl.Marker | null>(null);

    // Init Map
    useEffect(() => {
        if (!mapContainer.current || map.current) return;

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: mapConfig.defaultStyleUrl,
            center: [center.lng, center.lat],
            zoom: 11,
            pitch: 45,
            bearing: 0,
            attributionControl: false,
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        map.current.on('load', () => {
            // Source for sector
            map.current!.addSource('sectorSource', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Source for rings (distance hints)
            map.current!.addSource('ringsSource', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Layer: Sector Fill
            map.current!.addLayer({
                id: 'sector-fill',
                type: 'fill',
                source: 'sectorSource',
                paint: {
                    'fill-color': '#a855f7', // Purple-500
                    'fill-opacity': 0.2,
                }
            });

            // Layer: Sector Outline
            map.current!.addLayer({
                id: 'sector-outline',
                type: 'line',
                source: 'sectorSource',
                paint: {
                    'line-color': '#d8b4fe', // Purple-300
                    'line-width': 2,
                    'line-dasharray': [2, 2],
                    'line-opacity': 0.6,
                }
            });

            // Layer: Rings
            map.current!.addLayer({
                id: 'rings-line',
                type: 'line',
                source: 'ringsSource',
                paint: {
                    'line-color': '#34d399', // Emerald-400
                    'line-width': 2,
                    'line-opacity': 0.7,
                }
            });

            // Layer: Ring Labels (Symbol)
            map.current!.addLayer({
                id: 'rings-labels',
                type: 'symbol',
                source: 'ringsSource',
                layout: {
                    'text-field': ['get', 'label'],
                    'text-font': ['Noto Sans Regular'],
                    'text-size': 12,
                    'text-offset': [0, -1],
                    'symbol-placement': 'line-center'
                },
                paint: {
                    'text-color': '#34d399',
                    'text-halo-color': '#000',
                    'text-halo-width': 2,
                }
            });
            // Source for Azimuth Line
            map.current!.addSource('azimuthSource', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Source for Moon Line
            map.current!.addSource('moonSource', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Layer: Azimuth Line (Target)
            map.current!.addLayer({
                id: 'azimuth-line-layer',
                type: 'line',
                source: 'azimuthSource',
                paint: {
                    'line-color': '#f472b6', // Pink-400
                    'line-width': 3,
                    'line-opacity': 0.9,
                }
            });

            // Layer: Moon Line
            map.current!.addLayer({
                id: 'moon-line-layer',
                type: 'line',
                source: 'moonSource',
                paint: {
                    'line-color': '#94a3b8', // Slate-400
                    'line-width': 2,
                    'line-dasharray': [4, 4],
                    'line-opacity': 0.8,
                }
            });

            // Label for Moon
            map.current!.addLayer({
                id: 'moon-label',
                type: 'symbol',
                source: 'moonSource',
                layout: {
                    'text-field': 'Moon',
                    'text-size': 10,
                    'symbol-placement': 'line-center',
                    'text-offset': [0, 1]
                },
                paint: { 'text-color': '#94a3b8' }
            });
        });

        // Cleanup
        return () => {
            map.current?.remove();
            map.current = null;
        };
    }, []);

    // Update Marker & FlyTo
    useEffect(() => {
        if (!map.current) return;

        // Marker
        if (!marker.current) {
            marker.current = new maplibregl.Marker({ color: '#a855f7' })
                .setLngLat([center.lng, center.lat])
                .addTo(map.current);
        } else {
            marker.current.setLngLat([center.lng, center.lat]);
        }

        // Smooth Fly to new location
        map.current.flyTo({
            center: [center.lng, center.lat],
            zoom: 11
        });
    }, [center]);

    // Update Shapes based on Resolver Output
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;

        const sectorSource = map.current.getSource('sectorSource') as maplibregl.GeoJSONSource;
        const ringsSource = map.current.getSource('ringsSource') as maplibregl.GeoJSONSource;
        const azimuthSource = map.current.getSource('azimuthSource') as maplibregl.GeoJSONSource;
        const moonSource = map.current.getSource('moonSource') as maplibregl.GeoJSONSource;

        if (!resolverOutput) {
            sectorSource?.setData({ type: 'FeatureCollection', features: [] });
            ringsSource?.setData({ type: 'FeatureCollection', features: [] });
            azimuthSource?.setData({ type: 'FeatureCollection', features: [] });
            moonSource?.setData({ type: 'FeatureCollection', features: [] });
            return;
        }

        const centerPt = [center.lng, center.lat];
        const { startDeg, endDeg } = resolverOutput.sector;
        const radiusKm = 5000;

        // Create Wedge
        const wedge = turf.sector(centerPt, radiusKm, startDeg, endDeg, { units: 'kilometers' });

        sectorSource?.setData({
            type: 'FeatureCollection',
            features: [wedge]
        });

        // Create Rings
        const rings = resolverOutput.distanceHints.map(hint =>
            turf.circle(centerPt, hint.km, { units: 'kilometers', properties: { label: hint.label } })
        );

        ringsSource?.setData({
            type: 'FeatureCollection',
            features: rings
        });

        // Azimuth Line
        if (resolverOutput.actualAzimuth !== undefined) {
            const dest = turf.destination(centerPt, radiusKm, resolverOutput.actualAzimuth, { units: 'kilometers' });
            const line = turf.lineString([centerPt, dest.geometry.coordinates], { label: 'Target' });
            azimuthSource?.setData({ type: 'FeatureCollection', features: [line] });
        } else {
            azimuthSource?.setData({ type: 'FeatureCollection', features: [] });
        }

        // Moon Line
        if (resolverOutput.moonAzimuth !== undefined) {
            const dest = turf.destination(centerPt, radiusKm, resolverOutput.moonAzimuth, { units: 'kilometers' });
            const line = turf.lineString([centerPt, dest.geometry.coordinates], { label: 'Moon' });
            moonSource?.setData({ type: 'FeatureCollection', features: [line] });
        } else {
            moonSource?.setData({ type: 'FeatureCollection', features: [] });
        }

    }, [resolverOutput, center]);

    return (
        <div ref={mapContainer} className="w-full h-full" />
    );
}
