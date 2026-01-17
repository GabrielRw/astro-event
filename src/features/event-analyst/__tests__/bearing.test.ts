/**
 * Unit tests for bearing conversion
 */

import { describe, it, expect } from 'vitest';
import { signToBearing, absDegToSignDeg, SIGN_BASE_DEGREES } from '../bearing';

describe('SIGN_BASE_DEGREES', () => {
    it('should have correct base degrees for all signs', () => {
        expect(SIGN_BASE_DEGREES.Ari).toBe(0);
        expect(SIGN_BASE_DEGREES.Tau).toBe(30);
        expect(SIGN_BASE_DEGREES.Gem).toBe(60);
        expect(SIGN_BASE_DEGREES.Can).toBe(90);
        expect(SIGN_BASE_DEGREES.Leo).toBe(120);
        expect(SIGN_BASE_DEGREES.Vir).toBe(150);
        expect(SIGN_BASE_DEGREES.Lib).toBe(180);
        expect(SIGN_BASE_DEGREES.Sco).toBe(210);
        expect(SIGN_BASE_DEGREES.Sag).toBe(240);
        expect(SIGN_BASE_DEGREES.Cap).toBe(270);
        expect(SIGN_BASE_DEGREES.Aqu).toBe(300);
        expect(SIGN_BASE_DEGREES.Pis).toBe(330);
    });
});

describe('signToBearing', () => {
    it('should convert Mars 17° Virgo to 167°', () => {
        const result = signToBearing('Vir', 17);
        expect(result).toBe(167);
    });

    it('should convert 0° Aries to 0° (North)', () => {
        const result = signToBearing('Ari', 0);
        expect(result).toBe(0);
    });

    it('should convert 0° Cancer to 90° (East)', () => {
        const result = signToBearing('Can', 0);
        expect(result).toBe(90);
    });

    it('should convert 0° Libra to 180° (South)', () => {
        const result = signToBearing('Lib', 0);
        expect(result).toBe(180);
    });

    it('should convert 0° Capricorn to 270° (West)', () => {
        const result = signToBearing('Cap', 0);
        expect(result).toBe(270);
    });

    it('should handle degrees with decimals', () => {
        const result = signToBearing('Tau', 15.5);
        expect(result).toBeCloseTo(45.5);
    });

    it('should handle edge case at 29.99° Pisces (near 360°)', () => {
        const result = signToBearing('Pis', 29.99);
        expect(result).toBeCloseTo(359.99);
    });
});

describe('absDegToSignDeg', () => {
    it('should convert 167° back to Virgo 17°', () => {
        const result = absDegToSignDeg(167);
        expect(result.sign).toBe('Vir');
        expect(result.deg).toBeCloseTo(17);
    });

    it('should convert 0° to Aries 0°', () => {
        const result = absDegToSignDeg(0);
        expect(result.sign).toBe('Ari');
        expect(result.deg).toBe(0);
    });

    it('should convert 359° to Pisces 29°', () => {
        const result = absDegToSignDeg(359);
        expect(result.sign).toBe('Pis');
        expect(result.deg).toBeCloseTo(29);
    });

    it('should handle wraparound (360° = 0° Aries)', () => {
        const result = absDegToSignDeg(360);
        expect(result.sign).toBe('Ari');
        expect(result.deg).toBeCloseTo(0);
    });
});
