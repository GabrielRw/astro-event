export interface GeoChartInput {
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    city: string; // Optional city name for display
    lat: number;
    lng: number;
}

export interface GeoChartSettings {
    radiusKm: number;
    scaleMode: 'fixed' | 'auto'; // 'fixed' uses radiusKm, 'auto' fits view (not fully impl in v1)
    showHouses: boolean;
    showRays: boolean;
    showMarkers: boolean;
    geodesicSteps: number;
    rotationOffset: number; // For tuning ecliptic mapping
}

export interface PlanetData {
    id: string;
    name: string;
    longitude: number; // Ecliptic longitude (0-360)
    latitude: number; // Ecliptic latitude (not usually used for basic wheel but good to have)
    distance: number; // AU or similar
    speed: number;
}

export interface HouseData {
    house: number; // 1-12
    longitude: number; // Cusp longitude
}

export interface ChartData {
    planets: PlanetData[];
    houses: HouseData[];
    ascendant: number;
    mc: number;
}

export interface ApiPlanet {
    name: string;
    id: string;
    pos: number; // Longitude
    lat?: number;
    speed?: number;
}

export interface ApiHouse {
    house: number;
    pos: number;
}

export interface ApiResponse {
    status: string;
    planets: ApiPlanet[];
    houses: ApiHouse[];
    ascendant: number;
    midheaven: number;
    errors?: any[];
}
