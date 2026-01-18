import { ChartData, GeoChartInput } from './types';

// Use the same API config as existing app if possible, but for now we'll fetch direct or via proxy
// as per user instructions. We'll use the /api/natal endpoint if it fits, or direct call.
// The user said: "Use FreeAstroAPI Western natal endpoint... Use the API key from the app’s existing env/config"

// Sign offsets for fallback calculation
const SIGN_OFFSETS: Record<string, number> = {
    'Ari': 0, 'Tau': 30, 'Gem': 60, 'Can': 90,
    'Leo': 120, 'Vir': 150, 'Lib': 180, 'Sco': 210,
    'Sag': 240, 'Cap': 270, 'Aqu': 300, 'Pis': 330
};

function getAbsoluteLongitude(sign: string, deg: number): number {
    const base = SIGN_OFFSETS[sign] ?? 0;
    return (base + deg) % 360;
}

export async function fetchNatalChart(input: GeoChartInput): Promise<ChartData> {
    const [year, month, day] = input.date.split('-').map(Number);
    const [hour, minute] = input.time.split(':').map(Number);

    const response = await fetch('/api/natal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            year,
            month,
            day,
            hour,
            minute,
            lat: input.lat,
            lng: input.lng,
            name: 'User',
            city: input.city || 'Unknown',
            tz_str: 'UTC', // Required by backend schema
            include_features: ['houses', 'planets']
        }),
    });

    if (!response.ok) {
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
            const errorData = await response.json();
            if (errorData.message) errorMessage += ` - ${errorData.message}`;
            if (errorData.details) errorMessage += ` (${JSON.stringify(errorData.details)})`;
        } catch (e) {
            // Ignore json parse error
        }
        throw new Error(errorMessage);
    }

    const data = await response.json();

    // Planets: User requested to use 'abs_pos' directly
    const planets = (data.planets || []).map((p: any) => ({
        id: p.name.toLowerCase() === 'part of fortune' ? 'pof' : p.name.toLowerCase(),
        name: p.name,
        longitude: p.abs_pos ?? getAbsoluteLongitude(p.sign, p.pos), // Prefer abs_pos
        latitude: p.lat || 0,
        distance: 0,
        speed: p.speed || 0,
    }));

    // Houses: Check for abs_pos or similar, fallback to calculation
    const houses = (data.houses || []).map((h: any) => ({
        house: h.house,
        longitude: h.abs_pos ?? getAbsoluteLongitude(h.sign, h.pos),
    }));

    return {
        planets,
        houses,
        ascendant: 0,
        mc: 0
    };
}
