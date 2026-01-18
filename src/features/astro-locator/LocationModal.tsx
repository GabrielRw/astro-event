'use client';

import { useState } from 'react';
import { CitySearch } from '@/components/CitySearch';
import type { CityResult } from '@/lib/schema';
import { Locate } from 'lucide-react';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLocationSelect: (location: { lat: number; lng: number; label?: string }) => void;
}

export function LocationModal({ isOpen, onClose, onLocationSelect }: LocationModalProps) {
    const [cityLabel, setCityLabel] = useState('');
    const [manualLat, setManualLat] = useState('');
    const [manualLng, setManualLng] = useState('');
    const [isManualMode, setIsManualMode] = useState(false);

    if (!isOpen) return null;

    const handleCitySelect = (city: CityResult) => {
        onLocationSelect({
            lat: city.lat,
            lng: city.lng,
            label: `${city.name}, ${city.country}`
        });
        onClose();
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const lat = parseFloat(manualLat);
        const lng = parseFloat(manualLng);
        if (!isNaN(lat) && !isNaN(lng)) {
            onLocationSelect({ lat, lng, label: 'Manual Coordinates' });
            onClose();
        }
    };

    const handleUseCurrentLocation = () => {
        if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    onLocationSelect({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                        label: 'Current Location'
                    });
                    onClose();
                },
                (error) => {
                    alert('Could not get current location. Please check browser permissions.');
                }
            );
        } else {
            alert('Geolocation is not supported by your browser.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-[#0B0C10] border border-white/10 rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-white">Set Location</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
                    </div>

                    <button
                        onClick={handleUseCurrentLocation}
                        className="w-full py-3 px-4 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 hover:text-purple-200 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <Locate className="w-4 h-4" />
                        Use My Current Location
                    </button>

                    <div className="relative flex items-center py-2">
                        <div className="flex-grow border-t border-white/10"></div>
                        <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase tracking-widest">OR</span>
                        <div className="flex-grow border-t border-white/10"></div>
                    </div>

                    {!isManualMode ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-slate-400 mb-2">Search City</label>
                                <CitySearch
                                    value={cityLabel}
                                    onChange={setCityLabel}
                                    onSelect={handleCitySelect}
                                />
                            </div>
                            <button
                                onClick={() => setIsManualMode(true)}
                                className="text-xs text-slate-500 hover:text-slate-300 underline"
                            >
                                Enter coordinates manually
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleManualSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Latitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={manualLat}
                                        onChange={e => setManualLat(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-slate-400 mb-2">Longitude</label>
                                    <input
                                        type="number"
                                        step="any"
                                        value={manualLng}
                                        onChange={e => setManualLng(e.target.value)}
                                        placeholder="0.00"
                                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsManualMode(false)}
                                    className="flex-1 py-2 rounded-lg bg-white/5 text-slate-400 text-sm"
                                >
                                    Back
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium"
                                >
                                    Set Coordinates
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
