import * as turf from '@turf/turf';

// Earth radius in km (standard WGS84 approx is 6371)
const EARTH_RADIUS_KM = 6371;

/**
 * Calculates a destination point given a start point, bearing, and distance.
 * Wrapper around turf.destination.
 * 
 * @param lat Start Latitude
 * @param lng Start Longitude
 * @param bearingDeg Bearing in degrees (0 = North, 90 = East)
 * @param distanceKm Distance in kilometers
 * @returns {lat, lng}
 */
export function forwardGeodesic(lat: number, lng: number, bearingDeg: number, distanceKm: number): { lat: number, lng: number } {
    const point = turf.point([lng, lat]);
    const dest = turf.destination(point, distanceKm, bearingDeg, { units: 'kilometers' });
    const [destLng, destLat] = dest.geometry.coordinates;
    return { lat: destLat, lng: destLng };
}

/**
 * Generates a geodesic circle polygon.
 * 
 * @param lat Center Latitude
 * @param lng Center Longitude
 * @param radiusKm Radius in kilometers
 * @param steps Number of steps for the polygon ring
 * @returns GeoJSON Position[][] (ring coordinates)
 */
export function generateGeodesicCircle(lat: number, lng: number, radiusKm: number, steps: number = 64): number[][] {
    const center = turf.point([lng, lat]);
    const circle = turf.circle(center, radiusKm, { steps, units: 'kilometers' });
    return circle.geometry.coordinates[0];
}

/**
 * Generates a geodesic sector polygon (slice of pie on the sphere).
 * 
 * @param lat Center Latitude
 * @param lng Center Longitude
 * @param radiusKm Radius in kilometers
 * @param startBearingDeg Start bearing (degrees)
 * @param endBearingDeg End bearing (degrees)
 * @param steps Number of steps for the arc
 * @returns GeoJSON Position[][] (polygon coordinates, closed at center)
 */
/**
 * Generates a geodesic line (Great Circle path) coordinates.
 * 
 * @param lat Start Latitude
 * @param lng Start Longitude
 * @param bearingDeg Bearing in degrees
 * @param distanceKm Distance in kilometers
 * @param steps Number of steps
 * @returns GeoJSON Position[]
 */
export function generateGeodesicLine(lat: number, lng: number, bearingDeg: number, distanceKm: number, steps: number = 32): number[][] {
    const coords: number[][] = [];
    for (let i = 0; i <= steps; i++) {
        const dist = (distanceKm * i) / steps;
        const pt = forwardGeodesic(lat, lng, bearingDeg, dist);
        coords.push([pt.lng, pt.lat]);
    }
    return coords;
}

export function generateGeodesicSector(
    lat: number,
    lng: number,
    radiusKm: number,
    startBearingDeg: number,
    endBearingDeg: number,
    steps: number = 32
): number[][] {
    const coords: number[][] = [];

    // 1. Radial Line 1 (Center -> Start of Arc)
    // We already have generateGeodesicLine.
    const radial1 = generateGeodesicLine(lat, lng, startBearingDeg, radiusKm, steps / 2);
    // Remove last point of radial1 to avoid dup with arc start? No, arc generation handles it.
    // Actually simpler to just push all points. 
    coords.push(...radial1);

    // 2. Arc
    // Handle wrapping (e.g. 350 to 10)
    let end = endBearingDeg;
    if (end < startBearingDeg) {
        end += 360;
    }
    const span = end - startBearingDeg;

    // We start arc at step 1 because step 0 is the same as last point of radial1 (radius distance)
    for (let i = 1; i <= steps; i++) {
        const bearing = startBearingDeg + (span * i / steps);
        // Normalize bearing
        const normBearing = ((bearing % 360) + 360) % 360;
        const dest = forwardGeodesic(lat, lng, normBearing, radiusKm);
        coords.push([dest.lng, dest.lat]);
    }

    // 3. Radial Line 2 (End of Arc -> Center)
    // Generate line from Center to End, then reverse it? 
    // Or generate from End to Center?
    // Bearing from End back to Center is EndBearing + 180.
    // Normalized check.
    // Let's simpler: Generate Center -> End, then reverse.
    const radial2 = generateGeodesicLine(lat, lng, endBearingDeg, radiusKm, steps / 2);
    // We want from End (radius) to Center (0). radial2 goes Center -> End.
    // So reverse radial2.
    // Also remove first point of radial2 (Center) and last point (End) to avoid dups?
    // The previous loop ended at End of Arc.
    // radial2 reversed starts at End of Arc.
    // So remove the first point of the REVERSED array (which is End of Arc).
    const radial2Reversed = radial2.reverse();
    radial2Reversed.shift(); // Remove End of Arc (already added)

    coords.push(...radial2Reversed);

    // coords now ends at Center. Perfect.

    return coords;
}

/**
 * Maps ecliptic longitude (0-360) to compass bearing.
 * 
 * Choice: 0° Aries = 90° East (Standard map default where 0 is East) 
 * OR 0° Aries = 0° North?
 * 
 * User requirement: "Recommended for intuitive compass: bearingDeg = (90 - eclipticLongitudeDeg) mod 360 (This makes 0° Aries point East)"
 * 
 * @param eclipticDeg Zodiac degree (0 = 0 Aries, 90 = 0 Cancer)
 * @param rotationOffset user adjustment
 * @returns Bearing in degrees (0 = North, 90 = East)
 */
export function eclipticToBearing(eclipticDeg: number, rotationOffset: number = 0): number {
    // Formula: Bearing = 90 - (Ecliptic + Offset)
    // If Ecliptic=0 (Aries), Bearing = 90 (East)
    // If Ecliptic=90 (Cancer), Bearing = 0 (North)
    // If Ecliptic=180 (Libra), Bearing = -90 -> 270 (West)
    // If Ecliptic=270 (Capricorn), Bearing = -180 -> 180 (South)

    let bearing = 90 - (eclipticDeg + rotationOffset);

    // Normalize to 0-360
    bearing = bearing % 360;
    if (bearing < 0) bearing += 360;

    return bearing;
}
