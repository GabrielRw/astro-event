import { EventItem } from '../eventTypes';
import { PaginatedResult } from './types';

const BASE_URL = 'https://data.cityofnewyork.us/resource/uip8-fykc.json';

export async function fetchNYCEvents(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
): Promise<PaginatedResult<EventItem>> {

    // Socrata Query (SoQL)
    // $where=arrest_date between '...' and '...'
    // $limit=...
    // $offset=...
    // $order=arrest_date DESC

    const startStr = startDate.toISOString().slice(0, 10); // YYYY-MM-DD
    const endStr = endDate.toISOString().slice(0, 10);
    const offset = (page - 1) * limit;

    const query = new URLSearchParams({
        '$where': `arrest_date between '${startStr}' and '${endStr}'`,
        '$limit': limit.toString(),
        '$offset': offset.toString(),
        '$order': 'arrest_date DESC'
    });

    try {
        const res = await fetch(`${BASE_URL}?${query.toString()}`);
        if (!res.ok) throw new Error(`NYC API Error: ${res.status}`);

        const data = await res.json();

        const events: EventItem[] = data.map((record: any) => ({
            id: `nyc-${record.arrest_key}`,
            title: `${record.pd_desc || 'Arrest'} (${record.ofns_desc || 'Unknown'})`,
            datetimeISO: `${record.arrest_date}T12:00:00Z`, // NYPD gives date only
            timeType: 'reported',
            timeConfidence: 'exact', // Date is exact
            location: {
                label: `Precinct ${record.arrest_precinct}, NYC`,
                lat: parseFloat(record.latitude),
                lng: parseFloat(record.longitude),
                precision: 'coordinates'
            },
            dataSource: 'us-city',
            notes: `Law Code: ${record.law_code}`
        }));

        return {
            data: events,
            hasMore: events.length === limit
        };

    } catch (err) {
        console.error('Failed to fetch NYC events', err);
        return { data: [], hasMore: false };
    }
}
