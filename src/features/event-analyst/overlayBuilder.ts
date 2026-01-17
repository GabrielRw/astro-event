/**
 * Overlay Builder
 * 
 * Converts chart data + settings into GeoJSON features for map display
 */

import type { ChartBody, OverlaySettings, RayFeature, RingFeature, IntersectionFeature, OverlayGeoJSON, DistanceUnit } from './eventTypes';
import { generateRayLine, generateCirclePolygon, milesToMeters, destinationPoint, milesToKm, computeDecimalRings, computeDegreeDerivedRings } from './geo';

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
    ringValuesMiles: number[],
    unit: DistanceUnit
): RingFeature[] {
    return ringValuesMiles.map(radiusMiles => {
        const radiusMeters = milesToMeters(radiusMiles);
        const coordinates = generateCirclePolygon(centerLat, centerLng, radiusMeters, 128);

        // Convert radius for display based on unit
        const displayRadius = unit === 'km' ? milesToKm(radiusMiles) : radiusMiles;

        return {
            type: 'Feature' as const,
            properties: {
                radius: displayRadius,
                unit: unit,
                label: formatRingLabel(displayRadius, unit),
            },
            geometry: {
                type: 'Polygon' as const,
                coordinates: [coordinates],
            },
        };
    });
}

/**
 * Build intersection features (points where rays cross rings)
 */
export function buildIntersectionFeatures(
    centerLat: number,
    centerLng: number,
    bodies: ChartBody[],
    ringValuesMiles: number[],
    settings: OverlaySettings
): IntersectionFeature[] {
    const intersections: IntersectionFeature[] = [];

    // Filter bodies same as rays
    const visibleBodies = bodies.filter(body => {
        if (settings.selectedBodyId) {
            return body.id === settings.selectedBodyId;
        }
        if (body.group === 'planet' && !settings.enabledGroups.planets) return false;
        if (body.group === 'angle' && !settings.enabledGroups.angles) return false;
        if (body.group === 'house' && !settings.enabledGroups.houses) return false;
        return true;
    });

    const unit = settings.distanceUnit;

    visibleBodies.forEach(body => {
        ringValuesMiles.forEach(radiusMiles => {
            // Only add if within max distance
            if (radiusMiles > settings.maxDistanceMiles) return;

            const radiusMeters = milesToMeters(radiusMiles);
            const point = destinationPoint(centerLat, centerLng, body.bearingDeg, radiusMeters);

            // Display values
            const displayRadius = unit === 'km' ? milesToKm(radiusMiles) : radiusMiles;

            intersections.push({
                type: 'Feature' as const,
                properties: {
                    bodyId: body.id,
                    bodyLabel: body.label,
                    ringRadius: displayRadius,
                    unit: unit,
                    bearing: body.bearingDeg,
                    lat: point.lat,
                    lng: point.lng
                },
                geometry: {
                    type: 'Point' as const,
                    coordinates: [point.lng, point.lat]
                }
            });
        });
    });

    return intersections;
}

/**
 * Format ring label for display
 */
function formatRingLabel(value: number, unit: DistanceUnit): string {
    if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}k ${unit}`;
    }
    if (value >= 1) {
        return `${value.toFixed(1)} ${unit}`;
    }
    // Small values
    return `${value.toFixed(2)} ${unit}`;
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
    const rings = buildRingFeatures(centerLat, centerLng, settings.ringValuesMiles, settings.distanceUnit);
    const intersections = buildIntersectionFeatures(centerLat, centerLng, bodies, settings.ringValuesMiles, settings);

    return {
        rays: {
            type: 'FeatureCollection',
            features: rays,
        },
        rings: {
            type: 'FeatureCollection',
            features: rings,
        },
        intersections: {
            type: 'FeatureCollection',
            features: intersections,
        }
    };
}
