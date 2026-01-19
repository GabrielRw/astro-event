import { EventItem } from '../eventTypes';
import { PaginatedResult } from './types';

// Chicago Data Portal - Crimes dataset
const CHICAGO_BASE_URL = 'https://data.cityofchicago.org/resource/ijzp-q8t2.json';

export async function fetchChicagoEvents(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
): Promise<PaginatedResult<EventItem>> {

    const offset = (page - 1) * limit;

    // Fetch most recent crimes with coordinates
    const query = new URLSearchParams({
        '$limit': limit.toString(),
        '$offset': offset.toString(),
        '$order': 'date DESC',
        '$where': 'latitude IS NOT NULL AND longitude IS NOT NULL'
    });

    try {
        const res = await fetch(`${CHICAGO_BASE_URL}?${query.toString()}`);
        if (!res.ok) throw new Error(`Chicago API Error: ${res.status}`);

        const data = await res.json();

        const events: EventItem[] = data
            .filter((record: any) => record.latitude && record.longitude)
            .map((record: any) => ({
                id: `chi-${record.id}`,
                title: `${record.primary_type || 'Crime'} - ${record.description || 'Unknown'}`,
                datetimeISO: record.date,
                timeType: 'occurred',
                timeConfidence: 'exact',
                location: {
                    label: `${record.block || ''}, ${record.community_area ? `Area ${record.community_area}` : ''} Chicago`,
                    lat: parseFloat(record.latitude),
                    lng: parseFloat(record.longitude),
                    precision: 'coordinates'
                },
                dataSource: 'us-city',
                notes: `${record.arrest ? 'Arrest Made' : 'No Arrest'} - Case #${record.case_number || 'N/A'}`
            }));

        return {
            data: events,
            hasMore: events.length === limit
        };

    } catch (err) {
        console.error('Failed to fetch Chicago events', err);
        return { data: [], hasMore: false };
    }
}
