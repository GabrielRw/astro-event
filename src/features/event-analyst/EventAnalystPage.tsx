'use client';

import { useState, useEffect, useMemo } from 'react';
import { MapLibreMap } from '@/src/components/MapLibreMap';
import { ChartPanel } from './ChartPanel';
import { EventList } from './EventList';
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

    // Update ring values when mode, distance, or selected body changes
    useEffect(() => {
        let referenceDeg: number | undefined;

        if (overlaySettings.selectedBodyId) {
            const selectedBody = chartBodies.find(b => b.id === overlaySettings.selectedBodyId);
            referenceDeg = selectedBody?.deg;
        } else {
            // Default to IC if nothing selected
            const icBody = chartBodies.find(b => b.id === 'ic' || b.id === 'house_4');
            referenceDeg = icBody?.deg;
        }

        const ringValues = computeRingValues(
            overlaySettings.ringMode,
            overlaySettings.maxDistanceMiles,
            referenceDeg
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
        setEvents(prev => [...prev, event]);
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
                {/* Left Panel: Chart Data */}
                <div className="w-80 flex-shrink-0 bg-white/5 border-r border-white/5 hidden md:flex flex-col z-10 backdrop-blur-md">
                    <ChartPanel
                        bodies={chartBodies}
                        settings={overlaySettings}
                        onSettingsChange={setOverlaySettings}
                        onBodySelect={handleBodySelect}
                    />
                </div>

                {/* Center: Map */}
                <div className="flex-1 relative bg-[#0B0C10]">
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

                    {/* Mobile Event Selector */}
                    <div className="lg:hidden absolute bottom-6 left-6 right-6 z-10">
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
                </div>

                {/* Right Panel: Event List */}
                <div className="w-80 flex-shrink-0 hidden lg:flex flex-col z-10">
                    <EventList
                        events={events}
                        selectedEventId={selectedEvent?.id || null}
                        onSelectEvent={handleSelectEvent}
                        onAddEvent={() => setIsModalOpen(true)}
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
