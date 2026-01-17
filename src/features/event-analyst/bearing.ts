/**
 * Bearing calculations for astrological chart positions
 * 
 * Converts zodiac sign + degree to compass bearing (0-360°)
 * where 0° = North, 90° = East, 180° = South, 270° = West
 */

import type { ZodiacSign } from './eventTypes';

/**
 * Base degrees for each zodiac sign starting from Aries at 0°
 * Following the natural zodiac order
 */
export const SIGN_BASE_DEGREES: Record<ZodiacSign, number> = {
    Ari: 0,     // Aries
    Tau: 30,    // Taurus
    Gem: 60,    // Gemini
    Can: 90,    // Cancer
    Leo: 120,   // Leo
    Vir: 150,   // Virgo
    Lib: 180,   // Libra
    Sco: 210,   // Scorpio
    Sag: 240,   // Sagittarius
    Cap: 270,   // Capricorn
    Aqu: 300,   // Aquarius
    Pis: 330,   // Pisces
};

/**
 * Full sign names for display
 */
export const SIGN_NAMES: Record<ZodiacSign, string> = {
    Ari: 'Aries',
    Tau: 'Taurus',
    Gem: 'Gemini',
    Can: 'Cancer',
    Leo: 'Leo',
    Vir: 'Virgo',
    Lib: 'Libra',
    Sco: 'Scorpio',
    Sag: 'Sagittarius',
    Cap: 'Capricorn',
    Aqu: 'Aquarius',
    Pis: 'Pisces',
};

/**
 * Convert sign abbreviation from 3-letter to ZodiacSign
 */
export function parseSign(signStr: string): ZodiacSign {
    const normalized = signStr.slice(0, 3) as ZodiacSign;
    if (normalized in SIGN_BASE_DEGREES) {
        return normalized;
    }
    throw new Error(`Unknown zodiac sign: ${signStr}`);
}

/**
 * Calculate bearing from zodiac sign and degree within sign
 * 
 * @param sign - Zodiac sign abbreviation (e.g., 'Vir')
 * @param degWithinSign - Degree within the sign (0-29.999)
 * @returns Bearing in degrees (0-360) where 0 = North
 * 
 * @example
 * signToBearing('Vir', 17) // => 167 (150 + 17)
 * signToBearing('Ari', 0)  // => 0 (North)
 * signToBearing('Lib', 0)  // => 180 (South)
 */
export function signToBearing(sign: ZodiacSign, degWithinSign: number): number {
    const base = SIGN_BASE_DEGREES[sign];
    const bearing = base + degWithinSign;
    // Normalize to 0-360 range
    return ((bearing % 360) + 360) % 360;
}

/**
 * Convert absolute degree (0-360) to sign + degree within sign
 */
export function absDegToSignDeg(absDeg: number): { sign: ZodiacSign; deg: number } {
    const normalizedDeg = ((absDeg % 360) + 360) % 360;
    const signIndex = Math.floor(normalizedDeg / 30);
    const degInSign = normalizedDeg % 30;

    const signs: ZodiacSign[] = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];

    return {
        sign: signs[signIndex],
        deg: degInSign,
    };
}

/**
 * Format degree as string with sign
 */
export function formatDegree(sign: ZodiacSign, deg: number): string {
    return `${deg.toFixed(1)}° ${SIGN_NAMES[sign]}`;
}

/**
 * Format bearing for display
 */
export function formatBearing(bearing: number): string {
    const normalized = ((bearing % 360) + 360) % 360;
    return `${normalized.toFixed(1)}°`;
}

/**
 * Get cardinal direction label for a bearing
 */
export function bearingToCardinal(bearing: number): string {
    const normalized = ((bearing % 360) + 360) % 360;
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(normalized / 22.5) % 16;
    return directions[index];
}
