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

// Southern Hemisphere
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

// --- Astronomical Math ---

function toRad(deg: number): number { return deg * Math.PI / 180; }
function toDeg(rad: number): number { return rad * 180 / Math.PI; }

function normalize(deg: number): number {
    return ((deg % 360) + 360) % 360;
}

// Julian Day from JS Date
function getJulianDay(date: Date): number {
    return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
}

// GMST calculation (Greenwich Mean Sidereal Time)
function getGMST(date: Date): number {
    const JD = getJulianDay(date);
    const T = (JD - 2451545.0) / 36525.0;
    // GMST in degrees at 0h UT logic... simplified approximation:
    // IAU 1982 GMST
    let st = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
    return normalize(st);
}

// Convert Ecliptic (Lon, Lat=0) to Equatorial (RA, Dec)
function eclipticToEquatorial(lonDeg: number) {
    const lonRad = toRad(lonDeg);
    const epsilon = toRad(23.4393); // Obliquity of éclatric J2000

    // sin(Dec) = sin(Lon) * sin(Eps)
    const sinDec = Math.sin(lonRad) * Math.sin(epsilon);
    const decRad = Math.asin(sinDec);

    // tan(RA) = (sin(Lon) * cos(Eps)) / cos(Lon)
    const y = Math.sin(lonRad) * Math.cos(epsilon);
    const x = Math.cos(lonRad);
    const raRad = Math.atan2(y, x);

    return { ra: toDeg(raRad), dec: toDeg(decRad) };
}

// Compute Azimuth from RA/Dec, Lat, LST
function computeAzimuth(ra: number, dec: number, lat: number, lng: number, date: Date): number {
    const gmst = getGMST(date);
    const lmst = normalize(gmst + lng); // Local Mean Sidereal Time
    const ha = normalize(lmst - ra); // Hour Angle in degrees

    // Convert to Rads
    const haRad = toRad(ha);
    const decRad = toRad(dec);
    const latRad = toRad(lat);

    // tan(Az) formula relative to South? Or North?
    // Standard formula for Az measured from North clockwise:
    // tan(Az) = sin(HA) / ( cos(HA)sin(Lat) - tan(Dec)cos(Lat) )

    const y = Math.sin(haRad);
    const x = Math.cos(haRad) * Math.sin(latRad) - Math.tan(decRad) * Math.cos(latRad);

    // This gives Azimuth from SOUTH (S=0, W=90). We want from NORTH (N=0, E=90).
    const azRad = Math.atan2(y, x);
    let azDeg = toDeg(azRad);

    // Add 180 to convert from South-zero to North-zero convention used in maps usually
    return normalize(azDeg + 180);
}

// -------------------------

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
    latitude: number,
    longitude: number,
    dateStr: string
): ResolverOutput { // Now expects longitude and date string
    const date = new Date(dateStr);

    // 1. Identify Rulers
    const querentRuler = getRulerForHouse(1, chart);
    const targetRuler = getRulerForHouse(targetHouseId, chart);

    // 2. Logic for Standard House Sectors...
    const degA = getPlanetPos(querentRuler, chart);
    const degB = getPlanetPos(targetRuler, chart);
    const targetSign = getPlanetSign(targetRuler, chart);
    const targetModality = MODALITIES[targetSign] || 'Mutable';

    const targetPlanet = chart.planets.find(p => p.name === targetRuler || p.id === targetRuler.toLowerCase());
    const targetLocationHouse = targetPlanet ? targetPlanet.house : targetHouseId;

    const isNorth = latitude >= 0;
    const sectors = isNorth ? N_HEMISPHERE_SECTORS : S_HEMISPHERE_SECTORS;
    const rawSector = sectors[targetLocationHouse] || [0, 30];

    let start = rawSector[0];
    let end = rawSector[1];
    let centerDeg = (start + end) / 2;
    if (Math.abs(start - end) > 180) centerDeg = normalize((start + end + 360) / 2);

    // 3. Modality Distance ...
    let delta = Math.abs(degA - degB);
    if (delta > 180) delta = 360 - delta;
    if (delta < 0.1) delta = 0.5;

    let scales = [1, 10, 100];
    let labels = ['Close', 'Medium', 'Far'];
    if (targetModality === 'Fixed') {
        scales = [0.5, 2, 10];
        labels = ['Very Close (Fixed)', 'Neighborhood (Fixed)', 'Town (Fixed)'];
    } else if (targetModality === 'Cardinal') {
        scales = [5, 50, 200];
        labels = ['Far (Cardinal)', 'Region (Cardinal)', 'Country (Cardinal)'];
    } else {
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

    // 4. Calculate ACTUAL LOCAL AZIMUTH for TARGET PLANET
    let actualAzimuth = undefined;
    if (targetPlanet) {
        const eq = eclipticToEquatorial(targetPlanet.abs_pos);
        actualAzimuth = computeAzimuth(eq.ra, eq.dec, latitude, longitude, date);
    }

    // 5. Calculate Moon Azimuth
    let moonAzimuth = undefined;
    const moonPlanet = chart.planets.find(p => p.name === 'Moon');
    if (moonPlanet) {
        const eqMoon = eclipticToEquatorial(moonPlanet.abs_pos);
        moonAzimuth = computeAzimuth(eqMoon.ra, eqMoon.dec, latitude, longitude, date);
    }

    return {
        sector: { startDeg: start, endDeg: end, centerDeg },
        distanceHints: hints,
        actualAzimuth,
        moonAzimuth,
        analysis: {
            querentRuler,
            targetRuler,
            targetHouse: targetLocationHouse,
        }
    };
}
