import { FeatureCollection, Feature, Point, Polygon, LineString } from 'geojson';
import { ChartData, GeoChartSettings } from './types';
import { generateGeodesicSector, eclipticToBearing, forwardGeodesic, generateGeodesicLine } from './geodesy';

import { AstroFontSignMapping, AstroFontBodyMapping, Sign } from './fontMapping';

// Zodiac Order
const ZODIAC_KEYS: Sign[] = [
    Sign.Aries, Sign.Taurus, Sign.Gemini, Sign.Cancer,
    Sign.Leo, Sign.Virgo, Sign.Libra, Sign.Scorpio,
    Sign.Sagittarius, Sign.Capricorn, Sign.Aquarius, Sign.Pisces
];

export function buildGeoChartGeoJSON(
    centerLat: number,
    centerLng: number,
    chartData: ChartData | null,
    settings: GeoChartSettings
): Record<string, FeatureCollection> {
    // ... (existing helper setup) ...
    const centerFC: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] };
    const housesFC: FeatureCollection<Polygon> = { type: 'FeatureCollection', features: [] };
    const housesRingFC: FeatureCollection<Polygon> = { type: 'FeatureCollection', features: [] };
    const housesLabelsFC: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] };
    const zodiacRingFC: FeatureCollection<Polygon> = { type: 'FeatureCollection', features: [] };
    const zodiacLabelsFC: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] };
    const raysFC: FeatureCollection<LineString> = { type: 'FeatureCollection', features: [] };
    const markersFC: FeatureCollection<Point> = { type: 'FeatureCollection', features: [] };

    // ... (radii defs) ...
    const R_BASE = settings.radiusKm;
    const R_HOUSES_END = R_BASE;
    const R_HOUSES_RING_END = R_BASE * 1.08;
    const R_ZODIAC_RING_END = R_BASE * 1.20;
    const R_PLANETS = R_BASE * 1.25;

    if (!chartData) {
        // ... (empty return) ...
        centerFC.features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [centerLng, centerLat] },
            properties: { id: 'center' }
        });
        return {
            'geoChart-center': centerFC,
            'geoChart-houses': housesFC,
            'geoChart-houses-ring': housesRingFC,
            'geoChart-houses-labels': housesLabelsFC,
            'geoChart-zodiac-ring': zodiacRingFC,
            'geoChart-zodiac-labels': zodiacLabelsFC,
            'geoChart-planet-rays': raysFC,
            'geoChart-planet-markers': markersFC,
        };
    }

    // 1. Center
    centerFC.features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [centerLng, centerLat] },
        properties: { id: 'center' }
    });

    // 2. Houses
    if (settings.showHouses && chartData.houses.length > 0) {
        const houses = [...chartData.houses].sort((a, b) => a.house - b.house);
        for (let i = 0; i < houses.length; i++) {
            const current = houses[i];
            const next = houses[(i + 1) % houses.length];
            const startBearing = eclipticToBearing(current.longitude, settings.rotationOffset);
            const endBearing = eclipticToBearing(next.longitude, settings.rotationOffset);

            const sectorCoords = generateGeodesicSector(centerLat, centerLng, R_HOUSES_END, endBearing, startBearing, settings.geodesicSteps / 4);
            housesFC.features.push({
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [sectorCoords] },
                properties: { house: current.house }
            });

            const ringCoords = generateGeodesicSector(centerLat, centerLng, R_HOUSES_RING_END, endBearing, startBearing, settings.geodesicSteps / 4);
            housesRingFC.features.push({
                type: 'Feature',
                geometry: { type: 'Polygon', coordinates: [ringCoords] },
                properties: { house: current.house }
            });

            // Label
            let midBearing = (startBearing + endBearing) / 2;
            if (Math.abs(startBearing - endBearing) > 180) midBearing = (midBearing + 180) % 360;
            const labelDist = (R_BASE + R_HOUSES_RING_END) / 2;
            const labelPos = forwardGeodesic(centerLat, centerLng, midBearing, labelDist);
            housesLabelsFC.features.push({
                type: 'Feature',
                geometry: { type: 'Point', coordinates: [labelPos.lng, labelPos.lat] },
                properties: { label: `${current.house}` }
            });
        }
    }

    // 3. Zodiac Ring
    for (let i = 0; i < 12; i++) {
        const startLong = i * 30;
        const endLong = (i + 1) * 30;
        const startBearing = eclipticToBearing(startLong, settings.rotationOffset);
        const endBearing = eclipticToBearing(endLong, settings.rotationOffset);

        const zodiacCoords = generateGeodesicSector(centerLat, centerLng, R_ZODIAC_RING_END, endBearing, startBearing, settings.geodesicSteps / 4);

        // Get glyph char from mapping
        const signKey = ZODIAC_KEYS[i];
        const glyphChar = AstroFontSignMapping[signKey] || '?';

        zodiacRingFC.features.push({
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [zodiacCoords] },
            properties: { sign: i, name: signKey }
        });

        // Label
        let midBearing = (startBearing + endBearing) / 2;
        if (Math.abs(startBearing - endBearing) > 180) midBearing = (midBearing + 180) % 360;
        const labelDist = (R_HOUSES_RING_END + R_ZODIAC_RING_END) / 2;
        const labelPos = forwardGeodesic(centerLat, centerLng, midBearing, labelDist);

        zodiacLabelsFC.features.push({
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [labelPos.lng, labelPos.lat] },
            properties: { label: glyphChar }
        });
    }

    // 4. Planet Rays & Markers
    if (chartData.planets.length > 0) {
        chartData.planets.forEach(planet => {
            const bearing = eclipticToBearing(planet.longitude, settings.rotationOffset);

            // Lookup glyph in mapping using planet name or id
            // Store mapping accepts Body enum or string keys matching common names
            // API returns 'Sun', 'Moon', 'Mercury' etc. which matches Body enum string values mostly
            // Or use the normalized keys from my previous step.
            // Let's rely on the keys I put in AstroFontBodyMapping
            // I added 'sun': 's' etc (lowercase) or capitalized?
            // In fontMapping.ts I used 'Sun', 'Moon' (Capitalized) as keys for Enum Body.
            // But I also added lowercase normalized keys at the bottom of the map!
            // 'true_node', 'asc', 'mc', 'pof'.
            // The API returns 'Sun', 'Moon' etc (Capitalized).
            // So planet.name should map directly if capitalized.
            // Let's try name first, then id.

            let glyph = AstroFontBodyMapping[planet.name] || AstroFontBodyMapping[planet.id] || planet.name.substring(0, 1);

            if (settings.showRays) {
                const rayCoords = generateGeodesicLine(centerLat, centerLng, bearing, R_PLANETS, settings.geodesicSteps / 2);
                raysFC.features.push({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: rayCoords },
                    properties: { id: planet.id, name: planet.name, glyph }
                });
            }

            if (settings.showMarkers) {
                const dest = forwardGeodesic(centerLat, centerLng, bearing, R_PLANETS);
                markersFC.features.push({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [dest.lng, dest.lat] },
                    properties: { id: planet.id, name: planet.name, glyph, degree: Math.round(planet.longitude) }
                });
            }
        });
    }

    return {
        'geoChart-center': centerFC,
        'geoChart-houses': housesFC,
        'geoChart-houses-ring': housesRingFC,
        'geoChart-houses-labels': housesLabelsFC,
        'geoChart-zodiac-ring': zodiacRingFC,
        'geoChart-zodiac-labels': zodiacLabelsFC,
        'geoChart-planet-rays': raysFC,
        'geoChart-planet-markers': markersFC,
    };
}
