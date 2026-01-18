'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Navigation, MapPin } from 'lucide-react';
import { AstroLocatorMap } from './AstroLocatorMap';
import { AstroLocatorPanel } from './AstroLocatorPanel';
import { LocationModal } from './LocationModal';
import { resolveHoraryDirection } from './resolver';
import { ResolverOutput, MinimalChart } from './types';
import { mapConfig } from '@/src/config/mapConfig';

export function AstroLocatorPage() {
    const [selectedHouseId, setSelectedHouseId] = useState<number | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number, lng: number } | null>(null);
    // Initialize with current local datetime formatted for input (YYYY-MM-DDThh:mm)
    const [date, setDate] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [resolverOutput, setResolverOutput] = useState<ResolverOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMsg, setStatusMsg] = useState('Waiting for location...');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    // 1. Get Geolocation on Mount
    useEffect(() => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setStatusMsg('Ready for analysis.');
                },
                (error) => {
                    console.error('Geolocation Error:', error);
                    setStatusMsg('Location access denied. Please set location manually.');
                    setUserLocation(mapConfig.defaults.center);
                    // Open modal if auto-location fails
                    setIsLocationModalOpen(true);
                }
            );
        } else {
            setStatusMsg('Geolocation not supported. Using default.');
            setUserLocation(mapConfig.defaults.center);
            setIsLocationModalOpen(true);
        }
    }, []);

    // 2. Handle House Selection -> API Call -> Resolver
    useEffect(() => {
        if (!selectedHouseId || !userLocation) return;

        const analyze = async () => {
            setIsLoading(true);
            setResolverOutput(null);
            setStatusMsg('Calculating horary chart...');

            try {
                // Fetch chart for selected date
                const searchDate = new Date(date);
                const response = await fetch('/api/natal', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: 'Horary Query',
                        year: searchDate.getFullYear(),
                        month: searchDate.getMonth() + 1,
                        day: searchDate.getDate(),
                        hour: searchDate.getHours(),
                        minute: searchDate.getMinutes(),
                        city: 'Local', // Not used for coords if lat/lng provided
                        lat: userLocation.lat,
                        lng: userLocation.lng,
                        tz_str: 'UTC',
                        house_system: 'placidus', // Standard for Horary? Or Regiomontanus? using Placidus as default in API
                        zodiac_type: 'tropical',
                        include_features: []
                    }),
                });

                if (!response.ok) throw new Error('API Failed');
                const data = await response.json();

                // Adapt API response to MinimalChart
                const chart: MinimalChart = {
                    planets: data.planets,
                    houses: data.houses
                };

                // Resolve
                const production = resolveHoraryDirection(selectedHouseId, chart, userLocation.lat);
                setResolverOutput(production);
                setStatusMsg('Analysis complete.');

            } catch (err) {
                console.error(err);
                setStatusMsg('Analysis failed. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        analyze();
    }, [selectedHouseId, userLocation, date]);

    return (
        <div className="h-screen w-full overflow-hidden gradient-bg flex flex-col">
            {/* Header */}
            <header className="px-6 py-4 border-b border-white/5 bg-[#0B0C10]/80 backdrop-blur-xl flex items-center justify-between sticky top-0 z-20">
                <div className="flex items-center gap-4">
                    <Link
                        href="/"
                        className="p-2 -ml-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent hidden sm:block">
                        Astro Locator
                    </h1>
                </div>

                {/* Mobile Toggle & Location */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsLocationModalOpen(true)}
                        className="text-xs font-mono text-slate-500 hover:text-purple-400 flex items-center gap-2 transition-colors"
                    >
                        <Navigation className="w-3 h-3" />
                        {userLocation ? `${userLocation.lat.toFixed(2)}, ${userLocation.lng.toFixed(2)}` : 'Set Location'}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg bg-purple-500/10 text-purple-400"
                    >
                        <span className="sr-only">Menu</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Left Panel (Desktop) / Mobile Drawer */}
                <div className={`
                    flex-shrink-0 bg-[#0B0C10]/95 border-r border-white/5 flex flex-col z-30 backdrop-blur-md
                    md:w-96 md:relative
                    ${isMobileMenuOpen ? 'absolute inset-y-0 left-0 w-96' : 'hidden md:flex'}
                `}>
                    <AstroLocatorPanel
                        selectedHouseId={selectedHouseId}
                        onSelectHouse={setSelectedHouseId}
                        date={date}
                        onDateChange={setDate}
                    />
                </div>

                {/* Mobile Overlay */}
                {isMobileMenuOpen && (
                    <div
                        className="fixed inset-0 bg-black/50 z-20 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    ></div>
                )}

                {/* Map Area */}
                <div className="flex-1 relative bg-[#0B0C10]">
                    <div className="absolute inset-0 z-0">
                        {userLocation && (
                            <AstroLocatorMap
                                center={userLocation}
                                resolverOutput={resolverOutput}
                            />
                        )}
                    </div>

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <div className="flex flex-col items-center gap-3">
                                <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
                                <span className="text-purple-300 text-sm font-mono animate-pulse">{statusMsg}</span>
                            </div>
                        </div>
                    )}

                    {/* Results Overlay */}
                    {resolverOutput && !isLoading && (
                        <div className="absolute top-6 right-6 z-10 w-80 bg-black/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl transition-all hidden md:block">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 border-b border-white/10 pb-2">
                                Horary Analysis
                            </h3>

                            <div className="space-y-4 mb-4">
                                <div className="text-sm text-slate-300">
                                    <span className="text-slate-500">Querent (You):</span> <span className="text-white font-medium">{resolverOutput.analysis.querentRuler}</span>
                                </div>
                                <div className="text-sm text-slate-300">
                                    <span className="text-slate-500">Target (Search):</span> <span className="text-white font-medium">{resolverOutput.analysis.targetRuler}</span>
                                </div>
                                <div className="p-3 bg-purple-500/10 rounded-lg border border-purple-500/20 text-xs text-purple-200">
                                    {resolverOutput.analysis.targetRuler} is in the <strong>{resolverOutput.analysis.targetHouse}th House</strong>.
                                    Looking towards that sector.
                                </div>
                            </div>

                            <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2">Distance Bands</h4>
                            <div className="space-y-2">
                                {resolverOutput.distanceHints.map((hint, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5 border border-white/5">
                                        <span className="text-[10px] text-slate-400">{hint.label}</span>
                                        <span className="text-sm font-bold text-white">{hint.km} km</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Location FAB (Bottom Right) */}
                    <button
                        onClick={() => setIsLocationModalOpen(true)}
                        className="absolute bottom-6 right-6 z-20 w-12 h-12 rounded-full bg-purple-600 hover:bg-purple-500 text-white shadow-lg flex items-center justify-center transition-transform hover:scale-105"
                        title="Set Location"
                    >
                        <MapPin className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <LocationModal
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                onLocationSelect={(loc) => {
                    setUserLocation({ lat: loc.lat, lng: loc.lng });
                    setStatusMsg(`Location set: ${loc.label || 'Manual'}`);
                }}
            />
        </div>
    );
}
