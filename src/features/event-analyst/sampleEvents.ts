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
        notes: 'Cataclysmic eruption heard 3,000 miles away.',
    },
];
