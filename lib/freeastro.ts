import type { CitySearchResponse, NatalApiRequest, NatalChartResponse } from './schema';

const FREEASTRO_BASE_URL = 'https://astro-api-1qnc.onrender.com/api/v1';

/**
 * Search for cities using FreeAstroAPI Geo Search
 * This endpoint is FREE and does not require an API key
 */
export async function searchCities(
    query: string,
    limit: number = 5
): Promise<CitySearchResponse> {
    const url = new URL(`${FREEASTRO_BASE_URL}/geo/search`);
    url.searchParams.set('q', query);
    url.searchParams.set('limit', limit.toString());

    const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`City search failed: ${error}`);
    }

    return response.json();
}

/**
 * Calculate natal chart using FreeAstroAPI
 * This endpoint REQUIRES an API key (server-side only)
 */
export async function calculateNatalChart(
    data: NatalApiRequest
): Promise<NatalChartResponse> {
    const apiKey = process.env.FREEASTROAPI_KEY;

    if (!apiKey) {
        throw new Error('FREEASTROAPI_KEY environment variable is not set');
    }

    const response = await fetch(`${FREEASTRO_BASE_URL}/natal/calculate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({
            ...data,
            include_speed: true,
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Natal chart calculation failed: ${error}`);
    }

    return response.json();
}
