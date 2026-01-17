export interface FetchEventsParams {
    startDate: Date;
    endDate: Date;
    page: number; // 1-based index
    limit: number;
    sources: string[]; // 'uk-police', 'us-city'
    lat?: number;
    lng?: number; // For location-based lookups like UK Police
}

export interface PaginatedResult<T> {
    data: T[];
    hasMore: boolean;
}
