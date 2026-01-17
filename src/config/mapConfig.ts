/**
 * MapLibre configuration for the Event Analyst feature
 * Uses OpenFreeMap as the default basemap (open data, no API key required)
 */

export const mapConfig = {
    // Carto Dark Matter style for premium dark mode feel
    defaultStyleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',

    // Attribution required by OpenFreeMap / OpenStreetMap
    attribution: '© <a href="https://openfreemap.org">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',

    // Initial map view defaults
    defaults: {
        zoom: 6,
        pitch: 0,
        bearing: 0,
        // Default center (will be overridden by event location)
        center: { lng: -98.5795, lat: 39.8283 } as { lng: number; lat: number }, // Center of USA
    },

    // Layer styling
    layers: {
        rays: {
            defaultColor: '#8b5cf6', // violet-500
            highlightColor: '#f59e0b', // amber-500
            width: 2,
            highlightWidth: 4,
            opacity: 0.8,
        },
        rings: {
            fillColor: '#8b5cf6',
            fillOpacity: 0.05,
            outlineColor: '#a78bfa', // violet-400
            outlineWidth: 1,
            outlineOpacity: 0.4,
        },
        centerMarker: {
            color: '#ef4444', // red-500
            size: 12,
        },
        eventMarkers: {
            color: '#22c55e', // green-500
            strokeColor: '#ffffff',
            strokeWidth: 2,
            radius: 6,
        },
        eventMarkersGlow: {
            color: '#22c55e',
            radius: 12,
            blur: 1,
            opacity: 0.4,
        }
    },

    // Body group colors
    bodyColors: {
        sun: '#fbbf24',      // amber-400
        moon: '#94a3b8',     // slate-400
        mercury: '#a78bfa',  // violet-400
        venus: '#f472b6',    // pink-400
        mars: '#ef4444',     // red-500
        jupiter: '#fb923c',  // orange-400
        saturn: '#78716c',   // stone-500
        uranus: '#22d3ee',   // cyan-400
        neptune: '#60a5fa',  // blue-400
        pluto: '#a855f7',    // purple-500
        asc: '#10b981',      // emerald-500
        mc: '#f59e0b',       // amber-500
        ic: '#6366f1',       // indigo-500
        dc: '#ec4899',       // pink-500
        house: '#6b7280',    // gray-500
    } as Record<string, string>,
};

export type MapConfig = typeof mapConfig;
