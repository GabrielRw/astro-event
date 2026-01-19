// Basic Identifiers
export interface HouseCategory {
    id: number;
    title: string;
    description: string;
    keywords: string[];
}

export const HOUSE_CATEGORIES: HouseCategory[] = [
    { id: 1, title: '1st House', description: 'Self, physical body, appearance', keywords: ['Me', 'Appearance', 'Health'] },
    { id: 2, title: '2nd House', description: 'Money, valuables, lost objects', keywords: ['Wallet', 'Money', 'Possessions'] },
    { id: 3, title: '3rd House', description: 'Local movement, cars, siblings', keywords: ['Brother', 'Sister', 'Car', 'Trip'] },
    { id: 4, title: '4th House', description: 'Home, family, parents, land', keywords: ['Home', 'Mom', 'Dad', 'Property'] },
    { id: 5, title: '5th House', description: 'Fun, romance, children, creativity', keywords: ['Date', 'Child', 'Game', 'Party'] },
    { id: 6, title: '6th House', description: 'Work, daily routines, pets, illness', keywords: ['Job', 'Pet', 'Checkup'] },
    { id: 7, title: '7th House', description: 'Partners, spouse, open enemies', keywords: ['Wife', 'Husband', 'Partner', 'Rival'] },
    { id: 8, title: '8th House', description: 'Shared resources, transformation, loss', keywords: ['Debt', 'Taxes', 'Change'] },
    { id: 9, title: '9th House', description: 'Travel, higher education, law, religion', keywords: ['Travel', 'University', 'Court', 'God'] },
    { id: 10, title: '10th House', description: 'Career, reputation, public status, authority', keywords: ['Boss', 'Career', 'Fame'] },
    { id: 11, title: '11th House', description: 'Friends, groups, hopes, wishes', keywords: ['Friend', 'Club', 'Hope'] },
    { id: 12, title: '12th House', description: 'Hidden things, hospitals, isolation, loss', keywords: ['Lost', 'Secret', 'Hospital'] },
];

// Resolver Outputs
export interface ResolverOutput {
    sector: {
        startDeg: number;
        endDeg: number;
        centerDeg: number;
    };
    distanceHints: {
        km: number;
        miles: number;
        meters: number;
        label: string;
    }[];
    analysis: {
        querentRuler: string;
        targetRuler: string;
        targetHouse: number;
    };
    actualAzimuth?: number;
    moonAzimuth?: number;
    debug?: any;
}

// Distance Settings
export type DistanceMode = 'auto' | 'manual' | 'aspect' | 'ic';

export interface DistanceSettings {
    mode: DistanceMode;
    // Manual mode: user-defined distances in km
    manualDistances: [number, number, number];
    // Aspect/IC mode multiplier (uses angular separation * multiplier)
    aspectMultiplier: number;
    unit: 'miles' | 'km' | 'meters';
}

export const DEFAULT_DISTANCE_SETTINGS: DistanceSettings = {
    mode: 'auto',
    manualDistances: [1, 10, 50],
    aspectMultiplier: 1,
    unit: 'km',
};

// Modality presets for reference
export const MODALITY_PRESETS = {
    fixed: { scales: [0.5, 2, 10], labels: ['Very Close (Fixed)', 'Neighborhood (Fixed)', 'Town (Fixed)'] },
    cardinal: { scales: [5, 50, 200], labels: ['Far (Cardinal)', 'Region (Cardinal)', 'Country (Cardinal)'] },
    mutable: { scales: [1, 10, 50], labels: ['Nearby (Mutable)', 'City (Mutable)', 'State (Mutable)'] },
};

// Chart Data Types (Subset of what API returns)
export interface ChartPlanet {
    id: string;
    name: string;
    sign: string;
    pos: number; // 0-30 in sign
    abs_pos: number; // 0-360
    house: number;
}

export interface ChartHouse {
    house: number;
    sign: string;
    pos: number; // 0-30 in sign
    abs_pos: number; // 0-360
}

export interface MinimalChart {
    planets: ChartPlanet[];
    houses: ChartHouse[];
}
