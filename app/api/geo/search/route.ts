import { NextRequest, NextResponse } from 'next/server';
import { searchCities } from '@/lib/freeastro';
import { CitySearchQuerySchema } from '@/lib/schema';
import type { ApiError } from '@/lib/schema';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request
        const result = CitySearchQuerySchema.safeParse(body);
        if (!result.success) {
            const error: ApiError = {
                error: 'validation_error',
                message: 'Invalid request data',
                details: result.error.flatten(),
            };
            return NextResponse.json(error, { status: 400 });
        }

        const { query, limit } = result.data;

        // Call FreeAstroAPI (free endpoint, no API key needed)
        const cities = await searchCities(query, limit);

        return NextResponse.json(cities);
    } catch (error) {
        console.error('City search error:', error);

        const apiError: ApiError = {
            error: 'search_error',
            message: error instanceof Error ? error.message : 'Failed to search cities',
        };

        return NextResponse.json(apiError, { status: 500 });
    }
}
