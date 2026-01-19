'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapLibreMap } from '@/src/components/MapLibreMap';
import { ChartPanel } from './ChartPanel';
import { EventList } from './EventList';
import { EventModal } from './EventModal';
import { buildOverlayGeoJSON, computeRingValues } from './overlayBuilder';
import { signToBearing, parseSign } from './bearing';
import { mapConfig } from '@/src/config/mapConfig';
import type { EventItem, ChartBody, OverlaySettings, OverlayGeoJSON, ZodiacSign } from './eventTypes';
import { DEFAULT_OVERLAY_SETTINGS } from './eventTypes';

export function EventAnalystPage() {
    // Search & Filter State
    const [events, setEvents] = useState<EventItem[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [activeFilters, setActiveFilters] = useState<string[]>(['us-city']);
    // Default to last 30 days to ensure data availability
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
            start: thirtyDaysAgo.toISOString().slice(0, 10),
            end: now.toISOString().slice(0, 10)
        };
    });

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    // Other State
    const [chartBodies, setChartBodies] = useState<ChartBody[]>([]);
    const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(DEFAULT_OVERLAY_SETTINGS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Mobile Navigation State
    const [activeMobileTab, setActiveMobileTab] = useState<'map' | 'chart' | 'events'>('map');

    // Initial Load & Filter Change
    useEffect(() => {
        // Reset and fetch
        setPage(1);
        setEvents([]);
        loadEvents(1, true);
    }, [activeFilters, dateRange]);

    const loadEvents = async (pageNum: number, reset: boolean = false) => {
        if (!activeFilters.includes('us-city')) {
            setEvents(reset ? [] : prev => prev);
            return;
        }

        setIsLoading(true);
        try {
            const { fetchEvents } = await import('./services/eventService');

            const result = await fetchEvents({
                startDate: new Date(dateRange.start),
                endDate: new Date(dateRange.end),
                page: pageNum,
                limit: 100, // Fetch more events for better coverage
                sources: ['us-city']
            });

            setEvents(prev => reset ? result.data : [...prev, ...result.data]);
            setHasMore(result.hasMore);
        } catch (err) {
            console.error('Failed to load events', err);
            setError('Failed to load events. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLoadMore = () => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            loadEvents(nextPage);
        }
    };

    // Calculate chart when event is selected (Keep existing logic)
    useEffect(() => {
        if (!selectedEvent) {
            setChartBodies([]);
            return;
        }

        const calculateChart = async () => {
            setIsCalculating(true);
            setError(null);

            try {
                // Parse date from event
                const eventDate = new Date(selectedEvent.datetimeISO);
                const year = eventDate.getUTCFullYear();
                const month = eventDate.getUTCMonth() + 1;
                const day = eventDate.getUTCDate();
                const hour = eventDate.getUTCHours();
                const minute = eventDate.getUTCMinutes();

                // Call natal API
                const response = await fetch('/api/natal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: selectedEvent.title,
                        year,
                        month,
                        day,
                        hour,
                        minute,
                        city: selectedEvent.location.label,
                        lat: selectedEvent.location.lat,
                        lng: selectedEvent.location.lng,
                        tz_str: 'UTC',
                        house_system: 'placidus',
                        zodiac_type: 'tropical',
                        include_features: ['true_node'],
                    }),
                });

                const data = await response.json();

                if (!response.ok || 'error' in data) {
                    throw new Error(data.message || 'Chart calculation failed');
                }

                // Transform response to ChartBody array
                const bodies: ChartBody[] = [];

                // Add planets
                for (const planet of data.planets || []) {
                    const sign = planet.sign as ZodiacSign;
                    const deg = planet.pos;
                    const absDeg = signToBearing(sign, deg);
                    const group = ['asc', 'mc', 'ic', 'dc'].includes(planet.id) ? 'angle' : 'planet';

                    bodies.push({
                        id: planet.id,
                        label: planet.name,
                        sign,
                        deg,
                        absDeg,
                        bearingDeg: absDeg,
                        group,
                        color: mapConfig.bodyColors[planet.id] || mapConfig.bodyColors.house,
                    });
                }

                // Add houses
                for (const house of data.houses || []) {
                    const sign = house.sign as ZodiacSign;
                    const deg = house.pos;
                    const absDeg = signToBearing(sign, deg);

                    bodies.push({
                        id: `house_${house.house}`,
                        label: `House ${house.house}`,
                        sign,
                        deg,
                        absDeg,
                        bearingDeg: absDeg,
                        group: 'house',
                        color: mapConfig.bodyColors.house,
                    });
                }

                setChartBodies(bodies);
            } catch (err) {
                console.error('Chart calculation error:', err);
                setError(err instanceof Error ? err.message : 'Failed to calculate chart');
            } finally {
                setIsCalculating(false);
            }
        };

        calculateChart();
    }, [selectedEvent]);

    // Update ring values when mode, distance, or selected body changes
    useEffect(() => {
        let referenceDeg: number | undefined;
        let icDeg: number | undefined;

        // Get IC degree for IC mode
        const icBody = chartBodies.find(b => b.id === 'ic' || b.id === 'house_4');
        icDeg = icBody?.deg;

        if (overlaySettings.selectedBodyId) {
            const selectedBody = chartBodies.find(b => b.id === overlaySettings.selectedBodyId);
            referenceDeg = selectedBody?.deg;
        } else {
            // Default to IC if nothing selected
            referenceDeg = icDeg;
        }

        const ringValues = computeRingValues(
            overlaySettings.ringMode,
            overlaySettings.maxDistanceMiles,
            referenceDeg,
            icDeg
        );

        setOverlaySettings(prev => ({
            ...prev,
            ringValuesMiles: ringValues,
        }));
    }, [overlaySettings.ringMode, overlaySettings.maxDistanceMiles, overlaySettings.selectedBodyId, chartBodies]);

    // Build overlay GeoJSON
    const overlay = useMemo<OverlayGeoJSON | null>(() => {
        if (!selectedEvent || chartBodies.length === 0) return null;

        return buildOverlayGeoJSON(
            selectedEvent.location.lat,
            selectedEvent.location.lng,
            chartBodies,
            overlaySettings
        );
    }, [selectedEvent, chartBodies, overlaySettings]);

    // Map center
    const mapCenter = useMemo(() => {
        if (selectedEvent) {
            return { lat: selectedEvent.location.lat, lng: selectedEvent.location.lng };
        }
        return mapConfig.defaults.center;
    }, [selectedEvent]);

    const handleSelectEvent = (event: EventItem) => {
        setSelectedEvent(event);
    };

    const handleAddEvent = (event: EventItem) => {
        setEvents(prev => [event, ...prev]);
        setSelectedEvent(event);
    };

    const handleBodySelect = (bodyId: string | null) => {
        setOverlaySettings(prev => ({ ...prev, selectedBodyId: bodyId }));
    };

    return (
        <div className="h-screen w-full overflow-hidden gradient-bg flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">Event Analyst</h1>
                </div>
                <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <p className="text-white/30 text-xs font-mono hidden sm:block">
                        LIVE SYSTEM • V2.0.26
                    </p>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Panel: Chart Data (Desktop) */}
                <div className="w-80 flex-shrink-0 bg-white/5 border-r border-white/5 hidden md:flex flex-col z-10 backdrop-blur-md">
                    <ChartPanel
                        bodies={chartBodies}
                        settings={overlaySettings}
                        onSettingsChange={setOverlaySettings}
                        onBodySelect={handleBodySelect}
                    />
                </div>

                {/* Center: Map (Visible if Tab is Map or on Desktop) */}
                <div className={`flex-1 relative bg-[#0B0C10] ${activeMobileTab === 'map' ? 'block' : 'hidden md:block'}`}>
                    {isCalculating && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                <span className="text-emerald-400 font-mono text-sm tracking-widest animate-pulse">CALCULATING...</span>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="absolute top-6 left-6 right-6 z-50 p-4 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-md text-red-400 text-sm flex items-center gap-3">
                            <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="absolute inset-0 m-2 rounded-2xl overflow-hidden border border-white/5 shadow-2xl">
                        <MapLibreMap
                            center={mapCenter}
                            overlay={overlay}
                            selectedBodyId={overlaySettings.selectedBodyId}
                            allEvents={events}
                            onEventClick={(id) => {
                                const event = events.find(e => e.id === id);
                                if (event) handleSelectEvent(event);
                            }}
                        />
                    </div>

                    {/* Mobile Event Selector (Optional now that we have Tabs, but good for Map View) */}
                    {activeMobileTab === 'map' && (
                        <div className="lg:hidden absolute bottom-6 left-6 right-6 z-10 pb-16">
                            {/* Added pb-16 to avoid bottom nav overlap */}
                            <select
                                value={selectedEvent?.id || ''}
                                onChange={(e) => {
                                    const event = events.find(ev => ev.id === e.target.value);
                                    if (event) handleSelectEvent(event);
                                }}
                                className="w-full px-4 py-3 rounded-xl bg-black/80 backdrop-blur-xl border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 appearance-none shadow-lg"
                            >
                                <option value="">Select an event...</option>
                                {events.map(ev => (
                                    <option key={ev.id} value={ev.id}>{ev.title}</option>
                                ))}
                            </select>
                        </div>
                    )}
                </div>

                {/* Mobile View: Chart Panel */}
                <div className={`flex-1 bg-[#0B0C10] md:hidden flex flex-col ${activeMobileTab === 'chart' ? 'block' : 'hidden'}`}>
                    <ChartPanel
                        bodies={chartBodies}
                        settings={overlaySettings}
                        onSettingsChange={setOverlaySettings}
                        onBodySelect={handleBodySelect}
                    />
                </div>

                {/* Mobile View: Event List */}
                <div className={`flex-1 bg-[#0B0C10] md:hidden flex flex-col ${activeMobileTab === 'events' ? 'block' : 'hidden'}`}>
                    <EventList
                        events={events}
                        selectedEventId={selectedEvent?.id || null}
                        onSelectEvent={(ev) => {
                            handleSelectEvent(ev);
                            setActiveMobileTab('map'); // Switch to map on selection
                        }}
                        onAddEvent={() => setIsModalOpen(true)}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        isLoadingMore={isLoading}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        activeFilters={activeFilters}
                        onFilterChange={setActiveFilters}
                    />
                </div>

                {/* Right Panel: Event List (Desktop) */}
                <div className="w-80 flex-shrink-0 hidden lg:flex flex-col z-10 border-l border-white/5 bg-white/5 backdrop-blur-md">
                    <EventList
                        events={events} // We already filtered state-side or api-side.
                        selectedEventId={selectedEvent?.id || null}
                        onSelectEvent={handleSelectEvent}
                        onAddEvent={() => setIsModalOpen(true)}
                        onLoadMore={handleLoadMore}
                        hasMore={hasMore}
                        isLoadingMore={isLoading}
                        dateRange={dateRange}
                        onDateRangeChange={setDateRange}
                        activeFilters={activeFilters}
                        onFilterChange={setActiveFilters}
                    />
                </div>
            </div>

            {/* Mobile Bottom Navigation */}
            <div className="md:hidden flex items-center justify-around border-t border-white/10 bg-[#0B0C10]/95 backdrop-blur-xl pb-safe">
                <button
                    onClick={() => setActiveMobileTab('chart')}
                    className={`flex flex-col items-center py-3 px-6 gap-1 ${activeMobileTab === 'chart' ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    <span className="text-[10px] font-medium uppercase tracking-wide">Chart</span>
                </button>

                <button
                    onClick={() => setActiveMobileTab('map')}
                    className={`flex flex-col items-center py-3 px-6 gap-1 ${activeMobileTab === 'map' ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                    {/* Map Icon */}
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                    </svg>
                    <span className="text-[10px] font-medium uppercase tracking-wide">Map</span>
                </button>

                <button
                    onClick={() => setActiveMobileTab('events')}
                    className={`flex flex-col items-center py-3 px-6 gap-1 ${activeMobileTab === 'events' ? 'text-emerald-400' : 'text-slate-500'}`}
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <span className="text-[10px] font-medium uppercase tracking-wide">Events</span>
                </button>
            </div>

            {/* Add Event Modal */}
            <EventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddEvent}
            />
        </div>
    );
}
