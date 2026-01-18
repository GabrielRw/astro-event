import { ResolverOutput, MinimalChart } from './types';

// Traditional Rulerships (Horary Standard)
const RULERS: Record<string, string> = {
    'Aries': 'Mars', 'Taurus': 'Venus', 'Gemini': 'Mercury', 'Cancer': 'Moon',
    'Leo': 'Sun', 'Virgo': 'Mercury', 'Libra': 'Venus', 'Scorpio': 'Mars',
    'Sagittarius': 'Jupiter', 'Capricorn': 'Saturn', 'Aquarius': 'Saturn', 'Pisces': 'Jupiter'
};

// Sign Modalities
const MODALITIES: Record<string, 'Cardinal' | 'Fixed' | 'Mutable'> = {
    'Aries': 'Cardinal', 'Cancer': 'Cardinal', 'Libra': 'Cardinal', 'Capricorn': 'Cardinal',
    'Taurus': 'Fixed', 'Leo': 'Fixed', 'Scorpio': 'Fixed', 'Aquarius': 'Fixed',
    'Gemini': 'Mutable', 'Virgo': 'Mutable', 'Sagittarius': 'Mutable', 'Pisces': 'Mutable'
};

// House to Compass Bearings (Northern Hemisphere Standard)
// South = MC (10), North = IC (4), East = Asc (1), West = Dsc (7)
const N_HEMISPHERE_SECTORS: Record<number, [number, number]> = {
    10: [165, 195], // S
    11: [135, 165], // SE
    12: [105, 135], // ESE
    1: [75, 105],  // E
    2: [45, 75],   // ENE
    3: [15, 45],   // NNE
    4: [345, 15],  // N (Crossing 0)
    5: [315, 345], // NNW
    6: [285, 315], // WNW
    7: [255, 285], // W
    8: [225, 255], // WSW
    9: [195, 225], // SSW
};

// Southern Hemisphere: MC is North, IC is South.
const S_HEMISPHERE_SECTORS: Record<number, [number, number]> = {
    10: [345, 15],  // N
    11: [15, 45],   // NNE
    12: [45, 75],   // ENE
    1: [75, 105],  // E
    2: [105, 135], // ESE
    3: [135, 165], // SSE
    4: [165, 195], // S
    5: [195, 225], // SSW
    6: [225, 255], // WSW
    7: [255, 285], // W
    8: [285, 315], // WNW
    9: [315, 345], // NNW
};

function normalize(deg: number): number {
    return ((deg % 360) + 360) % 360;
}

function getRulerForHouse(houseId: number, chart: MinimalChart): string {
    const house = chart.houses.find(h => h.house === houseId);
    if (!house) return 'Saturn';
    return RULERS[house.sign] || 'Saturn';
}

function getPlanetPos(planetName: string, chart: MinimalChart): number {
    const p = chart.planets.find(p => p.name === planetName || p.id === planetName.toLowerCase());
    return p ? p.abs_pos : 0;
}

function getPlanetSign(planetName: string, chart: MinimalChart): string {
    const p = chart.planets.find(p => p.name === planetName || p.id === planetName.toLowerCase());
    return p ? p.sign : 'Aries';
}

export function resolveHoraryDirection(
    targetHouseId: number,
    chart: MinimalChart,
    latitude: number
): ResolverOutput {
    // 1. Identify Rulers
    const querentRuler = getRulerForHouse(1, chart);
    const targetRuler = getRulerForHouse(targetHouseId, chart);
    const moonSign = getPlanetSign('Moon', chart);

    // 2. Get Degrees & Modalities
    const degA = getPlanetPos(querentRuler, chart);
    const degB = getPlanetPos(targetRuler, chart);
    const targetSign = getPlanetSign(targetRuler, chart); // e.g., "Leo"
    const targetModality = MODALITIES[targetSign] || 'Mutable'; // Default to medium

    // 3. Find House Position (Direction)
    const targetPlanet = chart.planets.find(p => p.name === targetRuler || p.id === targetRuler.toLowerCase());
    const targetLocationHouse = targetPlanet ? targetPlanet.house : targetHouseId;

    // Hemisphere Logic
    const isNorth = latitude >= 0;
    const sectors = isNorth ? N_HEMISPHERE_SECTORS : S_HEMISPHERE_SECTORS;
    const rawSector = sectors[targetLocationHouse] || [0, 30]; // Fallback

    let start = rawSector[0];
    let end = rawSector[1];

    // Handle crossover 0 logic (e.g. 345 to 15)
    let centerDeg = (start + end) / 2;
    if (Math.abs(start - end) > 180) {
        centerDeg = normalize((start + end + 360) / 2);
    }

    // 4. Calculate Distance Δ
    let delta = Math.abs(degA - degB);
    if (delta > 180) delta = 360 - delta;
    if (delta < 0.1) delta = 0.5; // Minimum

    // Modality Scaling
    // Fixed: Close (x0.5, x1, x5)
    // Mutable: Medium (x1, x10, x20)
    // Cardinal: Far (x5, x20, x100)

    let scales = [1, 10, 100];
    let labels = ['Close', 'Medium', 'Far'];

    if (targetModality === 'Fixed') {
        scales = [0.5, 2, 10];
        labels = ['Very Close (Fixed)', 'Neighborhood (Fixed)', 'Town (Fixed)'];
    } else if (targetModality === 'Cardinal') {
        scales = [5, 50, 200];
        labels = ['Far (Cardinal)', 'Region (Cardinal)', 'Country (Cardinal)'];
    } else {
        // Mutable
        scales = [1, 10, 50];
        labels = ['Nearby (Mutable)', 'City (Mutable)', 'State (Mutable)'];
    }

    const hints = scales.map((scale, i) => {
        const dist = delta * scale;
        return {
            km: Math.round(dist * 10) / 10,
            miles: Math.round(dist * 0.621371 * 10) / 10,
            label: `${labels[i]} (Δ ${delta.toFixed(1)}°)`
        };
    });

    return {
        sector: {
            startDeg: start,
            endDeg: end,
            centerDeg
        },
        distanceHints: hints,
        analysis: {
            querentRuler,
            targetRuler,
            targetHouse: targetLocationHouse,
            // Add Moon info for debug/UI if needed, but not in interface yet
        }
    };
}
