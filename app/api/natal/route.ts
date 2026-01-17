import { NextRequest, NextResponse } from 'next/server';
import { calculateNatalChart } from '@/lib/freeastro';
import { NatalApiRequestSchema } from '@/lib/schema';
import type { ApiError } from '@/lib/schema';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate request
        const result = NatalApiRequestSchema.safeParse(body);
        if (!result.success) {
            const error: ApiError = {
                error: 'validation_error',
                message: 'Invalid request data',
                details: result.error.flatten(),
            };
            return NextResponse.json(error, { status: 400 });
        }

        // Call FreeAstroAPI (requires API key - handled server-side)
        const chartData = await calculateNatalChart(result.data);

        return NextResponse.json(chartData);
    } catch (error) {
        console.error('Natal chart calculation error:', error);

        const apiError: ApiError = {
            error: 'calculation_error',
            message: error instanceof Error ? error.message : 'Failed to calculate natal chart',
        };

        return NextResponse.json(apiError, { status: 500 });
    }
}
