/**
 * Event Analyst Types
 * 
 * Note: This feature is purely symbolic/interpretive visualization.
 * It does NOT provide investigative or predictive capabilities.
 */

// Time type indicates what the datetime represents
export type EventTimeType = 'occurred' | 'reported' | 'published' | 'unknown';

// Confidence level for the data
export type Confidence = 'exact' | 'approximate' | 'unknown';

// Location precision level
export type EventLocationPrecision = 'coordinates' | 'city' | 'region' | 'unknown';

// Event location data
export interface EventLocation {
    label: string;
    lat: number;
    lng: number;
    precision: EventLocationPrecision;
}

// An event to analyze
export interface EventItem {
    id: string;
    title: string;
    sourceUrl?: string;
    datetimeISO: string; // ISO 8601 format
    timeType: EventTimeType;
    timeConfidence: Confidence;
    location: EventLocation;
    dataSource?: 'historical' | 'uk-police' | 'us-city' | 'user';
    notes?: string;
}

// Zodiac sign abbreviations
export type ZodiacSign =
    | 'Ari' | 'Tau' | 'Gem' | 'Can' | 'Leo' | 'Vir'
    | 'Lib' | 'Sco' | 'Sag' | 'Cap' | 'Aqu' | 'Pis';

// Body group type
export type BodyGroup = 'planet' | 'angle' | 'house';

// Chart body (planet, angle, or house cusp)
export interface ChartBody {
    id: string;
    label: string;
    sign: ZodiacSign;
    deg: number;      // Degree within sign (0-29.999)
    absDeg: number;   // Absolute degree (0-360)
    bearingDeg: number; // Same as absDeg for our purposes
    group: BodyGroup;
    color: string;
}

// Ring calculation mode
export type RingMode = 'decimal' | 'degreeDerived';

// Overlay display settings
export interface OverlaySettings {
    enabledGroups: {
        planets: boolean;
        angles: boolean;
        houses: boolean;
    };
    maxDistanceMiles: number;
    ringMode: RingMode;
    ringValuesMiles: number[];
    showLabelsOnMap: boolean;
    selectedBodyId: string | null;
}

// Default overlay settings
export const DEFAULT_OVERLAY_SETTINGS: OverlaySettings = {
    enabledGroups: {
        planets: true,
        angles: true,
        houses: false,
    },
    maxDistanceMiles: 1600,
    ringMode: 'decimal',
    ringValuesMiles: [1, 10, 100, 1000, 1600],
    showLabelsOnMap: true,
    selectedBodyId: null,
};

// GeoJSON types for overlay
export interface RayFeature {
    type: 'Feature';
    properties: {
        id: string;
        label: string;
        group: BodyGroup;
        color: string;
        bearingDeg: number;
    };
    geometry: {
        type: 'LineString';
        coordinates: [number, number][];
    };
}

export interface RingFeature {
    type: 'Feature';
    properties: {
        radiusMiles: number;
        label: string;
    };
    geometry: {
        type: 'Polygon';
        coordinates: [number, number][][];
    };
}

export interface OverlayGeoJSON {
    rays: {
        type: 'FeatureCollection';
        features: RayFeature[];
    };
    rings: {
        type: 'FeatureCollection';
        features: RingFeature[];
    };
}
