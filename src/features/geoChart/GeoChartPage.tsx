'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { GeoChartPanel } from './GeoChartPanel';
import { GeoChartMap } from './GeoChartMap';
import { fetchNatalChart } from './api';
import { buildGeoChartGeoJSON } from './geoChartBuilder';
import { GeoChartInput, GeoChartSettings, ChartData } from './types';

export default function GeoChartPage() {
    // State
    const [input, setInput] = useState<GeoChartInput>({
        date: new Date().toISOString().slice(0, 10),
        time: '12:00',
        city: 'Greenwich',
        lat: 51.48,
        lng: -0.0077, // Greenwich
    });

    const [settings, setSettings] = useState<GeoChartSettings>({
        radiusKm: 50,
        scaleMode: 'fixed',
        showHouses: false,
        showRays: false,
        showMarkers: false,
        geodesicSteps: 64,
        rotationOffset: 0
    });

    const [chartData, setChartData] = useState<ChartData | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Initial Calculation on mount (optional, or wait for user)
    // Let's wait for user to click calculate to avoid flashing wrong data, 
    // or calc once for default location.
    // Let's do nothing until click for now.

    const handleCalculate = async () => {
        setIsCalculating(true);
        setError(null);
        try {
            const data = await fetchNatalChart(input);
            setChartData(data);
        } catch (err: any) {
            console.error(err);
            setError(err.message || 'Failed to calculate chart');
        } finally {
            setIsCalculating(false);
        }
    };

    // Memoize GeoJSON generation to avoid thrashing map
    const layers = useMemo(() => {
        return buildGeoChartGeoJSON(input.lat, input.lng, chartData, settings);
    }, [input.lat, input.lng, chartData, settings]);

    const mapCenter = useMemo(() => ({ lat: input.lat, lng: input.lng }), [input.lat, input.lng]);

    return (
        <div className="flex flex-col md:flex-row h-screen w-full bg-[#0B0C10] overflow-hidden">
            {/* Left Panel */}
            <div className="w-full md:w-80 lg:w-96 flex-shrink-0 z-20 shadow-2xl">
                <GeoChartPanel
                    input={input}
                    settings={settings}
                    onInputChange={setInput}
                    onSettingsChange={setSettings}
                    onCalculate={handleCalculate}
                    isCalculating={isCalculating}
                    error={error}
                    debugData={chartData}
                />
            </div>

            {/* Main Map Area */}
            <div className="flex-1 relative">
                <GeoChartMap
                    center={mapCenter}
                    layers={layers}
                />

                {/* Floating Title / Info if needed */}
                <div className="absolute top-4 left-4 z-10 pointer-events-none">
                    <h1 className="text-2xl font-bold text-white drop-shadow-md">
                        Geodesic Overlay
                    </h1>
                    <p className="text-white/60 text-sm drop-shadow-md">
                        {input.date} {input.time} • {input.lat.toFixed(2)}, {input.lng.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
}
