import { EventItem } from '../eventTypes';
import { PaginatedResult } from './types';

const BASE_URL = 'https://data.police.uk/api/crimes-street/all-crime';

const cache: Record<string, any[]> = {};

export async function fetchUKPoliceEvents(
    startDate: Date,
    endDate: Date,
    page: number,
    limit: number,
    lat: number = 51.5074,
    lng: number = -0.1278
): Promise<PaginatedResult<EventItem>> {

    // 1. Identify months to fetch
    const months = getMonthsInRange(startDate, endDate);

    // 2. Fetch all months
    let allCrimes: any[] = [];

    for (const month of months) {
        const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}_${month}`;

        if (cache[cacheKey]) {
            allCrimes = allCrimes.concat(cache[cacheKey]);
        } else {
            try {
                // Rate limit guard
                const res = await fetch(`${BASE_URL}?lat=${lat}&lng=${lng}&date=${month}`);
                if (!res.ok) {
                    console.warn(`UK Police API error for ${month}: ${res.status}`);
                    continue;
                }
                const data = await res.json();
                if (Array.isArray(data)) {
                    cache[cacheKey] = data;
                    allCrimes = allCrimes.concat(data);
                }
            } catch (err) {
                console.error(`Failed to fetch UK police data for ${month}`, err);
            }
        }
    }

    // 3. Transform and Filter
    const filteredEvents: EventItem[] = allCrimes
        .map((crime: any) => {
            // Deterministic random day based on ID to spread events across the month
            const idNum = parseInt(crime.id, 36) || 0;
            const day = (idNum % 28) + 1;
            const approxDate = new Date(`${crime.month}-15T12:00:00Z`);
            approxDate.setUTCDate(day);

            return {
                id: `uk-${crime.id}`,
                title: crime.category.replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
                datetimeISO: approxDate.toISOString(),
                timeType: 'reported',
                timeConfidence: 'approximate',
                location: {
                    label: crime.location.street.name,
                    lat: parseFloat(crime.location.latitude),
                    lng: parseFloat(crime.location.longitude),
                    precision: 'coordinates'
                },
                dataSource: 'uk-police',
                notes: `Outcome: ${crime.outcome_status?.category || 'Unknown'}`
            } as EventItem;
        })
        .filter(event => {
            const eventDate = new Date(event.datetimeISO);
            return eventDate >= startDate && eventDate <= endDate;
        });

    // 4. Paginate in memory
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEvents = filteredEvents.slice(startIndex, endIndex);

    return {
        data: paginatedEvents,
        hasMore: endIndex < filteredEvents.length
    };
}

function getMonthsInRange(start: Date, end: Date): string[] {
    const dates: string[] = [];
    let curr = new Date(start);
    curr.setDate(1);

    while (curr <= end) {
        dates.push(curr.toISOString().slice(0, 7)); // YYYY-MM
        curr.setMonth(curr.getMonth() + 1);
    }
    return Array.from(new Set(dates));
}
