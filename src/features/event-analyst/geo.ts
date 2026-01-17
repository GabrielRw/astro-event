/**
 * Geodesic calculations for map overlay
 * 
 * Uses great-circle formulas for accurate distance/bearing calculations
 * on the Earth's surface.
 */

// Earth's mean radius in meters
const EARTH_RADIUS_METERS = 6371000;

// Conversion factors
const MILES_TO_METERS = 1609.344;
const METERS_TO_MILES = 1 / MILES_TO_METERS;

/**
 * Convert miles to meters
 */
export function milesToMeters(miles: number): number {
    return miles * MILES_TO_METERS;
}

/**
 * Convert meters to miles
 */
export function metersToMiles(meters: number): number {
    return meters * METERS_TO_MILES;
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
}

/**
 * Convert radians to degrees
 */
function toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
}

/**
 * Calculate destination point given start point, bearing, and distance
 * using the great-circle (Haversine) formula.
 * 
 * @param lat - Starting latitude in degrees
 * @param lng - Starting longitude in degrees
 * @param bearingDeg - Bearing in degrees (0 = North, 90 = East)
 * @param distanceMeters - Distance in meters
 * @returns Destination point as { lat, lng }
 * 
 * Formula:
 * φ2 = asin( sin φ1 ⋅ cos δ + cos φ1 ⋅ sin δ ⋅ cos θ )
 * λ2 = λ1 + atan2( sin θ ⋅ sin δ ⋅ cos φ1, cos δ − sin φ1 ⋅ sin φ2 )
 * 
 * where φ = latitude, λ = longitude, θ = bearing, δ = angular distance
 */
export function destinationPoint(
    lat: number,
    lng: number,
    bearingDeg: number,
    distanceMeters: number
): { lat: number; lng: number } {
    const φ1 = toRadians(lat);
    const λ1 = toRadians(lng);
    const θ = toRadians(bearingDeg);
    const δ = distanceMeters / EARTH_RADIUS_METERS;

    const sinφ1 = Math.sin(φ1);
    const cosφ1 = Math.cos(φ1);
    const sinδ = Math.sin(δ);
    const cosδ = Math.cos(δ);
    const sinθ = Math.sin(θ);
    const cosθ = Math.cos(θ);

    const sinφ2 = sinφ1 * cosδ + cosφ1 * sinδ * cosθ;
    const φ2 = Math.asin(sinφ2);
    const y = sinθ * sinδ * cosφ1;
    const x = cosδ - sinφ1 * sinφ2;
    const λ2 = λ1 + Math.atan2(y, x);

    // Normalize longitude to -180 to +180
    const lng2 = ((toDegrees(λ2) + 540) % 360) - 180;

    return {
        lat: toDegrees(φ2),
        lng: lng2,
    };
}

/**
 * Generate a circle polygon around a center point
 * 
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude
 * @param radiusMeters - Radius in meters
 * @param numPoints - Number of points to generate (default 64)
 * @returns Array of [lng, lat] coordinates (GeoJSON format)
 */
export function generateCirclePolygon(
    centerLat: number,
    centerLng: number,
    radiusMeters: number,
    numPoints: number = 64
): [number, number][] {
    const coordinates: [number, number][] = [];

    for (let i = 0; i <= numPoints; i++) {
        const bearing = (360 / numPoints) * i;
        const point = destinationPoint(centerLat, centerLng, bearing, radiusMeters);
        coordinates.push([point.lng, point.lat]);
    }

    // Close the polygon
    if (coordinates.length > 0) {
        coordinates.push(coordinates[0]);
    }

    return coordinates;
}

/**
 * Calculate a line (ray) from center to destination at given bearing
 * 
 * @param centerLat - Center latitude
 * @param centerLng - Center longitude
 * @param bearingDeg - Bearing in degrees
 * @param distanceMeters - Distance in meters
 * @returns Array of [lng, lat] coordinates for the line
 */
export function generateRayLine(
    centerLat: number,
    centerLng: number,
    bearingDeg: number,
    distanceMeters: number
): [number, number][] {
    const endPoint = destinationPoint(centerLat, centerLng, bearingDeg, distanceMeters);
    return [
        [centerLng, centerLat],
        [endPoint.lng, endPoint.lat],
    ];
}

/**
 * Calculate distance between two points using Haversine formula
 * 
 * @returns Distance in meters
 */
export function distanceBetween(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const φ1 = toRadians(lat1);
    const φ2 = toRadians(lat2);
    const Δφ = toRadians(lat2 - lat1);
    const Δλ = toRadians(lng2 - lng1);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return EARTH_RADIUS_METERS * c;
}

/**
 * Compute decimal ring values based on max distance
 * Standard: [1, 10, 100, 1000, maxDistance] capped
 */
export function computeDecimalRings(maxDistanceMiles: number): number[] {
    const standardRings = [1, 10, 100, 1000];
    const filtered = standardRings.filter(r => r < maxDistanceMiles);
    filtered.push(maxDistanceMiles);
    return filtered;
}

/**
 * Compute degree-derived ring values based on a reference degree
 * Formula: [0.01*D, 0.1*D, 1*D, 10*D, 100*D] clamped to maxDistance
 */
export function computeDegreeDerivedRings(
    referenceDegree: number,
    maxDistanceMiles: number
): number[] {
    if (referenceDegree <= 0) {
        return computeDecimalRings(maxDistanceMiles);
    }

    const multipliers = [0.01, 0.1, 1, 10, 100];
    // Return all rings regardless of maxDistanceMiles, as the line must touch the largest one
    return multipliers.map(m => m * referenceDegree);
}
