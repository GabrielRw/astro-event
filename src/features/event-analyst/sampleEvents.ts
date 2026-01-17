import type { EventItem } from './eventTypes';

/**
 * Sample events for testing the Event Analyst feature.
 * These are historical and astronomical events (not crime-related).
 */
export const sampleEvents: EventItem[] = [
    {
        id: 'apollo-11-landing',
        title: 'Apollo 11 Moon Landing',
        datetimeISO: '1969-07-20T20:17:00Z',
        timeType: 'occurred',
        timeConfidence: 'exact',
        location: {
            label: 'Houston, TX (Mission Control)',
            lat: 29.5602,
            lng: -95.0853,
            precision: 'coordinates',
        },
        sourceUrl: 'https://www.nasa.gov/mission_pages/apollo/apollo-11.html',
        dataSource: 'historical',
        notes: 'First crewed Moon landing in history.',
    },
    {
        id: 'woodstock-1969',
        title: 'Woodstock Festival Opening',
        datetimeISO: '1969-08-15T17:07:00-04:00',
        timeType: 'occurred',
        timeConfidence: 'approximate',
        location: {
            label: 'Bethel, NY',
            lat: 41.7029,
            lng: -74.8783,
            precision: 'city',
        },
        dataSource: 'historical',
        notes: 'Iconic music festival, Richie Havens opened.',
    },
    {
        id: 'berlin-wall-fall',
        title: 'Fall of the Berlin Wall',
        datetimeISO: '1989-11-09T18:53:00+01:00',
        timeType: 'occurred',
        timeConfidence: 'approximate',
        location: {
            label: 'Berlin, Germany',
            lat: 52.5163,
            lng: 13.3777,
            precision: 'city',
        },
        dataSource: 'historical',
        notes: 'Press conference announcement that led to the wall opening.',
    },
    {
        id: 'eclipse-2024',
        title: '2024 Total Solar Eclipse',
        datetimeISO: '2024-04-08T18:18:00Z',
        timeType: 'occurred',
        timeConfidence: 'exact',
        location: {
            label: 'Dallas, TX',
            lat: 32.7767,
            lng: -96.7970,
            precision: 'city',
        },
        dataSource: 'historical',
        notes: 'Path of totality crossed North America.',
    },
    {
        id: 'titanic-sinking',
        title: 'Titanic Sinking',
        datetimeISO: '1912-04-15T02:20:00Z',
        timeType: 'occurred',
        timeConfidence: 'approximate',
        location: {
            label: 'North Atlantic Ocean',
            lat: 41.7258,
            lng: -49.9469,
            precision: 'coordinates',
        },
        dataSource: 'historical',
        notes: 'RMS Titanic sank after hitting an iceberg.',
    },
    {
        id: 'chernobyl-explosion',
        title: 'Chernobyl Reactor Explosion',
        datetimeISO: '1986-04-26T01:23:40+03:00',
        timeType: 'occurred',
        timeConfidence: 'exact',
        location: {
            label: 'Pripyat, Ukraine',
            lat: 51.3891,
            lng: 30.0980,
            precision: 'coordinates',
        },
        dataSource: 'historical',
        notes: 'Reactor No. 4 explosion and fire.',
    },
    {
        id: 'first-tweet',
        title: 'First Tweet Posted',
        datetimeISO: '2006-03-21T21:50:00Z',
        timeType: 'occurred',
        timeConfidence: 'exact',
        location: {
            label: 'San Francisco, CA',
            lat: 37.7749,
            lng: -122.4194,
            precision: 'city',
        },
        dataSource: 'historical',
        notes: 'Jack Dorsey posted "just setting up my twttr".',
    },
    {
        id: 'krakatoa-eruption',
        title: 'Krakatoa Eruption',
        datetimeISO: '1883-08-27T10:02:00+07:00',
        timeType: 'occurred',
        timeConfidence: 'approximate',
        location: {
            label: 'Krakatoa, Indonesia',
            lat: -6.1021,
            lng: 105.4230,
            precision: 'coordinates',
        },
        dataSource: 'historical',
        notes: 'Cataclysmic eruption heard 3,000 miles away.',
    },
    // Mock Data for Testing Filters
    {
        id: 'mock-london-theft',
        title: 'Bicycle Theft',
        datetimeISO: '2024-01-15T14:30:00Z',
        timeType: 'reported',
        timeConfidence: 'approximate',
        location: {
            label: 'Camden, London',
            lat: 51.5362,
            lng: -0.1404,
            precision: 'coordinates',
        },
        dataSource: 'uk-police',
        notes: 'Mock data from UK Police API.',
    },
    // UK Police Mock Data (Expanded)
    {
        id: 'uk-2', title: 'Burglary', datetimeISO: '2026-01-15T22:00:00Z', timeType: 'reported', timeConfidence: 'approximate',
        location: { label: 'Islington, London', lat: 51.54, lng: -0.10, precision: 'coordinates' }, dataSource: 'uk-police'
    },
    {
        id: 'uk-3', title: 'Public Order', datetimeISO: '2026-01-14T23:30:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Soho, London', lat: 51.51, lng: -0.13, precision: 'coordinates' }, dataSource: 'uk-police'
    },
    {
        id: 'uk-4', title: 'Shoplifting', datetimeISO: '2026-01-13T14:15:00Z', timeType: 'reported', timeConfidence: 'approximate',
        location: { label: 'Oxford St, London', lat: 51.51, lng: -0.14, precision: 'coordinates' }, dataSource: 'uk-police'
    },
    {
        id: 'uk-5', title: 'Robbery', datetimeISO: '2026-01-12T19:00:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Paddington, London', lat: 51.51, lng: -0.17, precision: 'coordinates' }, dataSource: 'uk-police'
    },
    {
        id: 'uk-6', title: 'Theft from Person', datetimeISO: '2026-01-16T15:45:00Z', timeType: 'reported', timeConfidence: 'approximate',
        location: { label: 'Covent Garden, London', lat: 51.51, lng: -0.12, precision: 'coordinates' }, dataSource: 'uk-police'
    },
    {
        id: 'uk-7', title: 'Drugs', datetimeISO: '2026-01-11T20:20:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Brixton, London', lat: 51.46, lng: -0.11, precision: 'coordinates' }, dataSource: 'uk-police'
    },
    {
        id: 'uk-8', title: 'Other Theft', datetimeISO: '2026-01-15T09:00:00Z', timeType: 'reported', timeConfidence: 'approximate',
        location: { label: 'Westminster, London', lat: 51.49, lng: -0.13, precision: 'coordinates' }, dataSource: 'uk-police'
    },

    // US City Mock Data (Expanded)
    {
        id: 'mock-nyc-incident', title: 'Public disturbance', datetimeISO: '2026-01-16T22:15:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Manhattan, NY', lat: 40.7580, lng: -73.9855, precision: 'coordinates' }, dataSource: 'us-city', notes: 'Mock data from NYC Open Data.'
    },
    {
        id: 'us-1', title: 'Grand Larceny', datetimeISO: '2026-01-16T18:00:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Times Square, NY', lat: 40.75, lng: -73.98, precision: 'coordinates' }, dataSource: 'us-city'
    },
    {
        id: 'us-2', title: 'Assault 3', datetimeISO: '2026-01-15T02:00:00Z', timeType: 'reported', timeConfidence: 'approximate',
        location: { label: "Hell's Kitchen, NY", lat: 40.76, lng: -73.99, precision: 'coordinates' }, dataSource: 'us-city'
    },
    {
        id: 'us-3', title: 'Petty Larceny', datetimeISO: '2026-01-14T12:30:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Chelsea, NY', lat: 40.74, lng: -74.00, precision: 'coordinates' }, dataSource: 'us-city'
    },
    {
        id: 'us-4', title: 'Harassment 2', datetimeISO: '2026-01-13T21:45:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'East Village, NY', lat: 40.72, lng: -73.98, precision: 'coordinates' }, dataSource: 'us-city'
    },
    {
        id: 'us-5', title: 'Burglary', datetimeISO: '2026-01-12T04:15:00Z', timeType: 'reported', timeConfidence: 'approximate',
        location: { label: 'Upper West Side, NY', lat: 40.78, lng: -73.97, precision: 'coordinates' }, dataSource: 'us-city'
    },
    {
        id: 'us-6', title: 'Criminal Mischief', datetimeISO: '2026-01-16T09:30:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Midtown, NY', lat: 40.75, lng: -73.97, precision: 'coordinates' }, dataSource: 'us-city'
    },
    {
        id: 'us-7', title: 'Robbery', datetimeISO: '2026-01-11T23:00:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Harlem, NY', lat: 40.81, lng: -73.94, precision: 'coordinates' }, dataSource: 'us-city'
    },
    {
        id: 'us-8', title: 'Felony Assault', datetimeISO: '2026-01-15T16:20:00Z', timeType: 'reported', timeConfidence: 'exact',
        location: { label: 'Bronx, NY', lat: 40.84, lng: -73.86, precision: 'coordinates' }, dataSource: 'us-city'
    },
];
