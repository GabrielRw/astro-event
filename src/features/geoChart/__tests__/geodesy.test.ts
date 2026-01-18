import { describe, it, expect } from 'vitest';
import { eclipticToBearing, generateGeodesicSector, forwardGeodesic } from '../geodesy';

describe('geodesy helpers', () => {
    describe('eclipticToBearing', () => {
        it('should map 0 (Aries) to 90 (East)', () => {
            expect(eclipticToBearing(0)).toBe(90);
        });
        it('should map 90 (Cancer) to 0 (North)', () => {
            expect(eclipticToBearing(90)).toBe(0);
        });
        it('should map 180 (Libra) to 270 (West)', () => {
            expect(eclipticToBearing(180)).toBe(270);
        });
        it('should map 270 (Capricorn) to 180 (South)', () => {
            expect(eclipticToBearing(270)).toBe(180);
        });
        it('should handle rotation offset', () => {
            // If we rotate by +90, Aries (0) should become simple 0 (North) ?
            // Formula: 90 - (0 + 90) = 0
            expect(eclipticToBearing(0, 90)).toBe(0);
        });
    });

    describe('forwardGeodesic', () => {
        it('should move North when bearing is 0', () => {
            // New York
            const startLat = 40.7128;
            const startLng = -74.0060;
            const dest = forwardGeodesic(startLat, startLng, 0, 100); // 100km North

            expect(dest.lat).toBeGreaterThan(startLat);
            expect(dest.lng).toBeCloseTo(startLng, 1);
        });

        it('should move East when bearing is 90', () => {
            const startLat = 40.7128;
            const startLng = -74.0060;
            const dest = forwardGeodesic(startLat, startLng, 90, 100); // 100km East

            expect(dest.lng).toBeGreaterThan(startLng);
            expect(dest.lat).toBeCloseTo(startLat, 1);
        });
    });

    describe('generateGeodesicSector', () => {
        it('should generate a closed polygon', () => {
            const coords = generateGeodesicSector(0, 0, 100, 0, 90, 10);

            // First and last point should be the center (0,0)
            const first = coords[0];
            const last = coords[coords.length - 1];

            expect(first[0]).toBe(0);
            expect(first[1]).toBe(0);
            expect(last[0]).toBe(0);
            expect(last[1]).toBe(0);

            // Should have steps + 1 arc points (0..steps) + 2 center points (start/end) = 13
            expect(coords.length).toBe(10 + 3); // Wait. 1 (start) + 11 (arc) + 1 (end) = 13. 
            // My default steps=10.
            // i=0..10 is 11 points.
            // + center start
            // + center end
            expect(coords.length).toBe(13);
        });
    });
});
