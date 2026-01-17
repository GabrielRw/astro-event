/**
 * Unit tests for geodesic calculations
 */

import { describe, it, expect } from 'vitest';
import { destinationPoint, milesToMeters, metersToMiles, distanceBetween } from '../geo';

describe('unit conversions', () => {
    it('should convert miles to meters correctly', () => {
        expect(milesToMeters(1)).toBeCloseTo(1609.344);
        expect(milesToMeters(100)).toBeCloseTo(160934.4);
    });

    it('should convert meters to miles correctly', () => {
        expect(metersToMiles(1609.344)).toBeCloseTo(1);
        expect(metersToMiles(160934.4)).toBeCloseTo(100);
    });

    it('should be reversible', () => {
        const miles = 42;
        expect(metersToMiles(milesToMeters(miles))).toBeCloseTo(miles);
    });
});

describe('destinationPoint', () => {
    // Test from a known starting point
    const startLat = 40.7128; // New York City
    const startLng = -74.0060;

    it('should return same point for 0 distance', () => {
        const result = destinationPoint(startLat, startLng, 0, 0);
        expect(result.lat).toBeCloseTo(startLat, 4);
        expect(result.lng).toBeCloseTo(startLng, 4);
    });

    it('should move north when bearing is 0', () => {
        const result = destinationPoint(startLat, startLng, 0, 100000);
        expect(result.lat).toBeGreaterThan(startLat);
        expect(result.lng).toBeCloseTo(startLng, 1);
    });

    it('should move east when bearing is 90', () => {
        const result = destinationPoint(startLat, startLng, 90, 100000);
        expect(result.lat).toBeCloseTo(startLat, 1);
        expect(result.lng).toBeGreaterThan(startLng);
    });

    it('should move south when bearing is 180', () => {
        const result = destinationPoint(startLat, startLng, 180, 100000);
        expect(result.lat).toBeLessThan(startLat);
        expect(result.lng).toBeCloseTo(startLng, 1);
    });

    it('should move west when bearing is 270', () => {
        const result = destinationPoint(startLat, startLng, 270, 100000);
        expect(result.lat).toBeCloseTo(startLat, 1);
        expect(result.lng).toBeLessThan(startLng);
    });

    it('should calculate correct distance for known points', () => {
        // NYC to approximately 100km north
        const distance = 100000; // 100 km
        const result = destinationPoint(startLat, startLng, 0, distance);

        // Verify by calculating distance back
        const calculatedDistance = distanceBetween(startLat, startLng, result.lat, result.lng);
        expect(calculatedDistance).toBeCloseTo(distance, -2); // Within 100 meters
    });
});

describe('distanceBetween', () => {
    it('should return 0 for same point', () => {
        const result = distanceBetween(40.7128, -74.0060, 40.7128, -74.0060);
        expect(result).toBeCloseTo(0);
    });

    it('should calculate known distance between NYC and LA (approx 3940 km)', () => {
        const nycLat = 40.7128, nycLng = -74.0060;
        const laLat = 34.0522, laLng = -118.2437;

        const result = distanceBetween(nycLat, nycLng, laLat, laLng);

        // Should be approximately 3,940 km (within 50 km tolerance)
        expect(result).toBeGreaterThan(3890000);
        expect(result).toBeLessThan(3990000);
    });

    it('should be symmetric', () => {
        const d1 = distanceBetween(40.7128, -74.0060, 51.5074, -0.1278);
        const d2 = distanceBetween(51.5074, -0.1278, 40.7128, -74.0060);
        expect(d1).toBeCloseTo(d2);
    });
});
