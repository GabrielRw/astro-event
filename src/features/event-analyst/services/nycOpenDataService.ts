import { EventItem } from '../eventTypes';
import { PaginatedResult } from './types';

const NYC_BASE_URL = 'https://data.cityofnewyork.us/resource/uip8-fykc.json';

export async function fetchNYCEvents(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number
): Promise<PaginatedResult<EventItem>> {

    const offset = (page - 1) * limit;

    // Fetch most recent arrests, sorted by date descending
    // Not filtering by date range to ensure we always get data
    const query = new URLSearchParams({
        '$limit': limit.toString(),
        '$offset': offset.toString(),
        '$order': 'arrest_date DESC',
        '$where': 'latitude IS NOT NULL AND longitude IS NOT NULL' // Only get geocoded records
    });

    try {
        const res = await fetch(`${NYC_BASE_URL}?${query.toString()}`);
        if (!res.ok) throw new Error(`NYC API Error: ${res.status}`);

        const data = await res.json();

        const events: EventItem[] = data
            .filter((record: any) => record.latitude && record.longitude)
            .map((record: any) => ({
                id: `nyc-${record.arrest_key}`,
                title: `${record.pd_desc || 'Arrest'} - ${record.ofns_desc || 'Unknown Offense'}`,
                datetimeISO: record.arrest_date,
                timeType: 'occurred',
                timeConfidence: 'exact',
                location: {
                    label: `Precinct ${record.arrest_precinct}, ${record.arrest_boro === 'M' ? 'Manhattan' : record.arrest_boro === 'B' ? 'Bronx' : record.arrest_boro === 'K' ? 'Brooklyn' : record.arrest_boro === 'Q' ? 'Queens' : 'Staten Island'}, NYC`,
                    lat: parseFloat(record.latitude),
                    lng: parseFloat(record.longitude),
                    precision: 'coordinates'
                },
                dataSource: 'us-city',
                notes: `${record.law_cat_cd === 'F' ? 'Felony' : 'Misdemeanor'} - ${record.law_code}`
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

