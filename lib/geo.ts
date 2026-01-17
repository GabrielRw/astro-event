import type { CityResult } from './schema';

/**
 * Country code to full name mapping for common countries
 */
const COUNTRY_NAMES: Record<string, string> = {
    AD: 'Andorra',
    AE: 'UAE',
    AF: 'Afghanistan',
    AG: 'Antigua & Barbuda',
    AL: 'Albania',
    AM: 'Armenia',
    AR: 'Argentina',
    AT: 'Austria',
    AU: 'Australia',
    AZ: 'Azerbaijan',
    BA: 'Bosnia',
    BB: 'Barbados',
    BD: 'Bangladesh',
    BE: 'Belgium',
    BG: 'Bulgaria',
    BH: 'Bahrain',
    BN: 'Brunei',
    BO: 'Bolivia',
    BR: 'Brazil',
    BS: 'Bahamas',
    BW: 'Botswana',
    BY: 'Belarus',
    CA: 'Canada',
    CH: 'Switzerland',
    CL: 'Chile',
    CN: 'China',
    CO: 'Colombia',
    CR: 'Costa Rica',
    CU: 'Cuba',
    CY: 'Cyprus',
    CZ: 'Czechia',
    DE: 'Germany',
    DK: 'Denmark',
    DO: 'Dominican Republic',
    DZ: 'Algeria',
    EC: 'Ecuador',
    EE: 'Estonia',
    EG: 'Egypt',
    ES: 'Spain',
    FI: 'Finland',
    FR: 'France',
    GB: 'United Kingdom',
    GE: 'Georgia',
    GH: 'Ghana',
    GR: 'Greece',
    GT: 'Guatemala',
    HK: 'Hong Kong',
    HN: 'Honduras',
    HR: 'Croatia',
    HU: 'Hungary',
    ID: 'Indonesia',
    IE: 'Ireland',
    IL: 'Israel',
    IN: 'India',
    IQ: 'Iraq',
    IR: 'Iran',
    IS: 'Iceland',
    IT: 'Italy',
    JM: 'Jamaica',
    JO: 'Jordan',
    JP: 'Japan',
    KE: 'Kenya',
    KR: 'South Korea',
    KW: 'Kuwait',
    KZ: 'Kazakhstan',
    LB: 'Lebanon',
    LK: 'Sri Lanka',
    LT: 'Lithuania',
    LU: 'Luxembourg',
    LV: 'Latvia',
    LY: 'Libya',
    MA: 'Morocco',
    MC: 'Monaco',
    MD: 'Moldova',
    ME: 'Montenegro',
    MK: 'North Macedonia',
    MT: 'Malta',
    MX: 'Mexico',
    MY: 'Malaysia',
    NG: 'Nigeria',
    NL: 'Netherlands',
    NO: 'Norway',
    NP: 'Nepal',
    NZ: 'New Zealand',
    OM: 'Oman',
    PA: 'Panama',
    PE: 'Peru',
    PH: 'Philippines',
    PK: 'Pakistan',
    PL: 'Poland',
    PR: 'Puerto Rico',
    PT: 'Portugal',
    PY: 'Paraguay',
    QA: 'Qatar',
    RO: 'Romania',
    RS: 'Serbia',
    RU: 'Russia',
    SA: 'Saudi Arabia',
    SE: 'Sweden',
    SG: 'Singapore',
    SI: 'Slovenia',
    SK: 'Slovakia',
    TH: 'Thailand',
    TN: 'Tunisia',
    TR: 'Turkey',
    TW: 'Taiwan',
    UA: 'Ukraine',
    US: 'United States',
    UY: 'Uruguay',
    UZ: 'Uzbekistan',
    VE: 'Venezuela',
    VN: 'Vietnam',
    ZA: 'South Africa',
    ZW: 'Zimbabwe',
};

/**
 * Get full country name from code
 */
export function getCountryName(code: string): string {
    return COUNTRY_NAMES[code.toUpperCase()] || code;
}

/**
 * Format city for display
 */
export function formatCityDisplay(city: CityResult): string {
    const countryName = getCountryName(city.country);
    return `${city.name}, ${countryName}`;
}

/**
 * Format coordinates for display
 */
export function formatCoordinates(lat: number, lng: number): string {
    const latDir = lat >= 0 ? 'N' : 'S';
    const lngDir = lng >= 0 ? 'E' : 'W';
    return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/**
 * Parse date string to components
 */
export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
    const [year, month, day] = dateStr.split('-').map(Number);
    return { year, month, day };
}

/**
 * Parse time string to components
 */
export function parseTimeString(timeStr: string): { hour: number; minute: number } {
    const [hour, minute] = timeStr.split(':').map(Number);
    return { hour, minute };
}
