import { ResolverOutput, MinimalChart } from './types';

// Traditional Rulerships (Horary Standard)
const SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const RULERS: Record<string, string> = {
    'Aries': 'Mars',
    'Taurus': 'Venus',
    'Gemini': 'Mercury',
    'Cancer': 'Moon',
    'Leo': 'Sun',
    'Virgo': 'Mercury',
    'Libra': 'Venus',
    'Scorpio': 'Mars', // Traditional
    'Sagittarius': 'Jupiter',
    'Capricorn': 'Saturn',
    'Aquarius': 'Saturn', // Traditional
    'Pisces': 'Jupiter' // Traditional
};

// Map House numbers to Compass Bearings (0-360, 0=North, 90=East)
// Based on "Sun Path" projection logic for Northern Hemisphere
const HOUSE_SECTORS: Record<number, [number, number]> = {
    1: [60, 90],    // East (below horizon)
    2: [30, 60],    // NNE
    3: [0, 30],     // N
    4: [330, 0],    // NNW
    5: [300, 330],  // WNW
    6: [270, 300],  // W (below horizon)
    7: [240, 270],  // W (above horizon)
    8: [210, 240],  // WSW
    9: [180, 210],  // S (near MC)
    10: [150, 180], // SSE (MC)
    11: [120, 150], // ESE
    12: [90, 120],  // E (above horizon)
};

function normalize(deg: number): number {
    return ((deg % 360) + 360) % 360;
}

function getRulerForHouse(houseId: number, chart: MinimalChart): string {
    const house = chart.houses.find(h => h.house === houseId);
    if (!house) return 'Saturn'; // Fallback
    // Note: API returns sign name, ensure casing matches or normalize
    // Assuming API returns Title Case e.g. "Aries"
    return RULERS[house.sign] || 'Saturn';
}

function getPlanetPos(planetName: string, chart: MinimalChart): number {
    // API returns ids like 'sun', 'moon', 'mars' usually lowercase
    // RULERS map uses Title Case values. We need to match.
    const p = chart.planets.find(p => p.name === planetName || p.id === planetName.toLowerCase());
    return p ? p.abs_pos : 0;
}

export function resolveHoraryDirection(
    targetHouseId: number,
    chart: MinimalChart
): ResolverOutput {
    // 1. Identify Rulers
    // Querent = Ruler of 1st House
    const querentRuler = getRulerForHouse(1, chart);

    // Target = Ruler of Selected House
    const targetRuler = getRulerForHouse(targetHouseId, chart);

    // 2. Get Degrees (Absolute 0-360)
    const degA = getPlanetPos(querentRuler, chart);
    const degB = getPlanetPos(targetRuler, chart);

    // 3. Find Target Ruler's House Position (Where is the object?)
    // In Horary, direction is often indicated by the House where the Significator (Target Ruler) IS LOCATED.
    // e.g. If Ruler of 2nd (Money) is in the 10th House, look South.
    const targetPlanet = chart.planets.find(p => p.name === targetRuler || p.id === targetRuler.toLowerCase());
    const targetLocationHouse = targetPlanet ? targetPlanet.house : targetHouseId;

    // 4. Determine Sector
    // Use the House where the Target Ruler is located.
    const rawSector = HOUSE_SECTORS[targetLocationHouse] || [0, 360];
    let start = rawSector[0];
    let end = rawSector[1];

    // Handle crossover 0 logic (e.g. 330 to 0)
    let centerDeg = (start + end) / 2;
    if (Math.abs(start - end) > 180) {
        centerDeg = normalize((start + end + 360) / 2);
    }

    // 5. Calculate Distance Δ
    // |degree(A) - degree(B)|
    let delta = Math.abs(degA - degB);
    if (delta > 180) delta = 360 - delta;
    if (delta === 0) delta = 1;

    // Normalization bands (x1, x10, x100)
    const dist1 = delta;
    const dist10 = delta * 10;
    const dist100 = delta * 100;

    return {
        sector: {
            startDeg: start,
            endDeg: end,
            centerDeg
        },
        distanceHints: [
            {
                km: Math.round(dist1 * 10) / 10,
                miles: Math.round(dist1 * 0.621371 * 10) / 10,
                label: `Close Range (Δ x 1)`
            },
            {
                km: Math.round(dist10 * 10) / 10,
                miles: Math.round(dist10 * 0.621371 * 10) / 10,
                label: `Medium Range (Δ x 10)`
            },
            {
                km: Math.round(dist100 * 10) / 10,
                miles: Math.round(dist100 * 0.621371 * 10) / 10,
                label: `Far Range (Δ x 100)`
            }
        ],
        analysis: {
            querentRuler,
            targetRuler,
            targetHouse: targetLocationHouse
        }
    };
}
