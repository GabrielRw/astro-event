import { FetchEventsParams, PaginatedResult } from './types';
import { EventItem } from '../eventTypes';
import { fetchUKPoliceEvents } from './ukPoliceService';
import { fetchNYCEvents } from './nycOpenDataService';

export async function fetchEvents({
    startDate,
    endDate,
    page,
    limit,
    sources
}: FetchEventsParams): Promise<PaginatedResult<EventItem>> {

    const promises: Promise<PaginatedResult<EventItem>>[] = [];

    // Distribute limit across sources? 
    // Simplify: Fetch full limit from EACH source, then combine and sort.
    // This effectively means page size could be limit * numSources at max.
    // This is better for ensuring we don't return sparse pages.

    if (sources.includes('uk-police')) {
        promises.push(fetchUKPoliceEvents(startDate, endDate, page, limit));
    }

    if (sources.includes('us-city')) {
        promises.push(fetchNYCEvents(startDate, endDate, page, limit));
    }

    const results = await Promise.all(promises);

    // Combine
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
