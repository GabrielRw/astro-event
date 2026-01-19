import { FetchEventsParams, PaginatedResult } from './types';
import { EventItem } from '../eventTypes';
import { fetchNYCEvents } from './nycOpenDataService';
import { fetchChicagoEvents } from './chicagoDataService';

export async function fetchEvents({
    startDate,
    endDate,
    page,
    limit,
    sources
}: FetchEventsParams): Promise<PaginatedResult<EventItem>> {

    const promises: Promise<PaginatedResult<EventItem>>[] = [];

    // Fetch from both NYC and Chicago for US city data
    if (sources.includes('us-city')) {
        // Split limit between cities
        const perCityLimit = Math.ceil(limit / 2);
        promises.push(fetchNYCEvents(startDate, endDate, page, perCityLimit));
        promises.push(fetchChicagoEvents(startDate, endDate, page, perCityLimit));
    }

    const results = await Promise.all(promises);

    // Combine all events
    const allEvents = results.flatMap(r => r.data);
    const hasMore = results.some(r => r.hasMore);

    // Sort by date descending (newest first)
    allEvents.sort((a, b) =>
        new Date(b.datetimeISO).getTime() - new Date(a.datetimeISO).getTime()
    );

    return {
        data: allEvents,
        hasMore
    };
}

