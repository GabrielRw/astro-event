/**
 * Overlay Builder
 * 
 * Converts chart data + settings into GeoJSON features for map display
 */

import type { ChartBody, OverlaySettings, RayFeature, RingFeature, OverlayGeoJSON } from './eventTypes';
import { generateRayLine, generateCirclePolygon, milesToMeters, computeDecimalRings, computeDegreeDerivedRings } from './geo';

/**
 * Build ray features from chart bodies
 */
export function buildRayFeatures(
    centerLat: number,
    centerLng: number,
    bodies: ChartBody[],
    maxDistanceMiles: number,
    settings: OverlaySettings
): RayFeature[] {
    const distanceMeters = milesToMeters(maxDistanceMiles);

    return bodies
        .filter(body => {
            // Usage: If a specific body is selected, show ONLY that body
            if (settings.selectedBodyId) {
                return body.id === settings.selectedBodyId;
            }

            if (body.group === 'planet' && !settings.enabledGroups.planets) return false;
            if (body.group === 'angle' && !settings.enabledGroups.angles) return false;
            if (body.group === 'house' && !settings.enabledGroups.houses) return false;
            return true;
        })
        .map(body => {
            const coordinates = generateRayLine(centerLat, centerLng, body.bearingDeg, distanceMeters);

            return {
                type: 'Feature' as const,
                properties: {
                    id: body.id,
                    label: body.label,
                    group: body.group,
                    color: body.color,
                    bearingDeg: body.bearingDeg,
                },
                geometry: {
                    type: 'LineString' as const,
                    coordinates,
                },
            };
        });
}

/**
 * Build ring features (concentric circles)
 */
export function buildRingFeatures(
    centerLat: number,
    centerLng: number,
    ringValuesMiles: number[]
): RingFeature[] {
    return ringValuesMiles.map(radiusMiles => {
        const radiusMeters = milesToMeters(radiusMiles);
        const coordinates = generateCirclePolygon(centerLat, centerLng, radiusMeters, 128);

        return {
            type: 'Feature' as const,
            properties: {
                radiusMiles,
                label: formatRingLabel(radiusMiles),
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [coordinates],
            },
        };
    });
}

/**
 * Format ring label for display
 */
function formatRingLabel(miles: number): string {
    if (miles >= 1000) {
        return `${(miles / 1000).toFixed(1)}k mi`;
    }
    if (miles >= 1) {
        return `${miles.toFixed(0)} mi`;
    }
    return `${(miles * 5280).toFixed(0)} ft`;
}

/**
 * Compute ring values based on mode
 */
export function computeRingValues(
    mode: 'decimal' | 'degreeDerived',
    maxDistanceMiles: number,
    referenceDegree?: number
): number[] {
    if (mode === 'degreeDerived' && referenceDegree !== undefined && referenceDegree > 0) {
        return computeDegreeDerivedRings(referenceDegree, maxDistanceMiles);
    }
    return computeDecimalRings(maxDistanceMiles);
}

/**
 * Build complete overlay GeoJSON from chart bodies and settings
 */
export function buildOverlayGeoJSON(
    centerLat: number,
    centerLng: number,
    bodies: ChartBody[],
    settings: OverlaySettings
): OverlayGeoJSON {
    // Determine ray distance: in degreeDerived mode, rays must touch the ends of the circumference (the largest ring)
    let rayDistance = settings.maxDistanceMiles;
    if (settings.ringMode === 'degreeDerived' && settings.ringValuesMiles.length > 0) {
        rayDistance = Math.max(...settings.ringValuesMiles);
    }

    const rays = buildRayFeatures(centerLat, centerLng, bodies, rayDistance, settings);
    const rings = buildRingFeatures(centerLat, centerLng, settings.ringValuesMiles);

    return {
        rays: {
            type: 'FeatureCollection',
            features: rays,
        },
        rings: {
            type: 'FeatureCollection',
            features: rings,
        },
    };
}
