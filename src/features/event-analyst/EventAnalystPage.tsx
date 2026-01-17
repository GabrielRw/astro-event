'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapLibreMap } from '@/src/components/MapLibreMap';
import { EventList } from './EventList';
import { ChartPanel } from './ChartPanel';
import { EventModal } from './EventModal';
import { sampleEvents } from './sampleEvents';
import { buildOverlayGeoJSON, computeRingValues } from './overlayBuilder';
import { signToBearing, parseSign } from './bearing';
import { mapConfig } from '@/src/config/mapConfig';
import type { EventItem, ChartBody, OverlaySettings, OverlayGeoJSON, ZodiacSign } from './eventTypes';
import { DEFAULT_OVERLAY_SETTINGS } from './eventTypes';

export function EventAnalystPage() {
    const [events, setEvents] = useState<EventItem[]>(sampleEvents);
    const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
    const [chartBodies, setChartBodies] = useState<ChartBody[]>([]);
    const [overlaySettings, setOverlaySettings] = useState<OverlaySettings>(DEFAULT_OVERLAY_SETTINGS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calculate chart when event is selected
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

    // Update ring values when mode or distance changes
    useEffect(() => {
        const icBody = chartBodies.find(b => b.id === 'ic' || b.id === 'house_4');
        const referenceDeg = icBody?.deg;

        const ringValues = computeRingValues(
            overlaySettings.ringMode,
            overlaySettings.maxDistanceMiles,
            referenceDeg
        );

        setOverlaySettings(prev => ({
            ...prev,
            ringValuesMiles: ringValues,
        }));
    }, [overlaySettings.ringMode, overlaySettings.maxDistanceMiles, chartBodies]);

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
        setEvents(prev => [...prev, event]);
        setSelectedEvent(event);
    };

    const handleBodySelect = (bodyId: string | null) => {
        setOverlaySettings(prev => ({ ...prev, selectedBodyId: bodyId }));
    };

    return (
        <div className="min-h-screen gradient-bg flex flex-col">
            {/* Header */}
            <header className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <a
                        href="/"
                        className="text-white/50 hover:text-white transition-colors"
                    >
                        ← Back
                    </a>
                    <div className="w-px h-6 bg-white/20" />
                    <h1 className="text-xl font-semibold text-white">Event Analyst</h1>
                </div>
                <p className="text-white/40 text-sm hidden sm:block">
                    Symbolic visualization • Not for investigative use
                </p>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Event List */}
                <div className="w-72 flex-shrink-0 bg-white/5 border-r border-white/10 hidden lg:flex flex-col">
                    <EventList
                        events={events}
                        selectedEventId={selectedEvent?.id || null}
                        onSelectEvent={handleSelectEvent}
                        onAddEvent={() => setIsModalOpen(true)}
                    />
                </div>

                {/* Center: Map */}
                <div className="flex-1 relative">
                    {isCalculating && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                            <div className="flex items-center gap-3 text-white">
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Calculating chart...</span>
                            </div>
                        </div>
                    )}
                    {error && (
                        <div className="absolute top-4 left-4 right-4 z-10 p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm">
                            {error}
                        </div>
                    )}
                    <MapLibreMap
                        center={mapCenter}
                        overlay={overlay}
                        selectedBodyId={overlaySettings.selectedBodyId}
                    />

                    {/* Mobile Event Selector */}
                    <div className="lg:hidden absolute bottom-4 left-4 right-4">
                        <select
                            value={selectedEvent?.id || ''}
                            onChange={(e) => {
                                const event = events.find(ev => ev.id === e.target.value);
                                if (event) handleSelectEvent(event);
                            }}
                            className="w-full px-4 py-3 rounded-lg bg-slate-900/90 backdrop-blur-sm border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        >
                            <option value="">Select an event...</option>
                            {events.map(ev => (
                                <option key={ev.id} value={ev.id}>{ev.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Right Panel: Chart Data */}
                <div className="w-80 flex-shrink-0 bg-white/5 border-l border-white/10 hidden md:flex flex-col">
                    <ChartPanel
                        bodies={chartBodies}
                        settings={overlaySettings}
                        onSettingsChange={setOverlaySettings}
                        onBodySelect={handleBodySelect}
                    />
                </div>
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
