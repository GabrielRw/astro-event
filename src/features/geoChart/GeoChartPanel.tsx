import React, { useState } from 'react';
import { GeoChartInput, GeoChartSettings } from './types';
import { CitySearch } from '@/components/CitySearch';
import { CityResult } from '@/lib/schema';

interface GeoChartPanelProps {
    input: GeoChartInput;
    settings: GeoChartSettings;
    onInputChange: (input: GeoChartInput) => void;
    onSettingsChange: (settings: GeoChartSettings) => void;
    onCalculate: () => void;
    isCalculating: boolean;
    error: string | null;
    debugData?: any;
}

export function GeoChartPanel({
    input,
    settings,
    onInputChange,
    onSettingsChange,
    onCalculate,
    isCalculating,
    error,
    debugData
}: GeoChartPanelProps) {
    const [showDebug, setShowDebug] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        onInputChange({
            ...input,
            [name]: name === 'lat' || name === 'lng' ? parseFloat(value) : value
        });
    };

    const handleSettingChange = (key: keyof GeoChartSettings, value: any) => {
        onSettingsChange({
            ...settings,
            [key]: value
        });
    };

    const handleCitySelect = (city: CityResult) => {
        onInputChange({
            ...input,
            city: city.name,
            lat: city.lat,
            lng: city.lng
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0C10]/95 text-slate-300 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="p-6 border-b border-white/5">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                    Geo Chart
                </h2>
                <p className="text-xs text-slate-500 mt-1">Geodesic Astrological Overlay</p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-8 flex-1">
                {/* Section A: Birth Data */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
                        Birth Data
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Date</label>
                            <input
                                type="date"
                                name="date"
                                value={input.date}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-500">Time</label>
                            <input
                                type="time"
                                name="time"
                                value={input.time}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-slate-500">Location</label>
                        <CitySearch
                            value={input.city}
                            onChange={(val) => onInputChange({ ...input, city: val })}
                            onSelect={handleCitySelect}
                        />
                        <div className="flex gap-2 mt-1 text-[10px] text-slate-600 font-mono">
                            <span>Lat: {input.lat.toFixed(4)}</span>
                            <span>Lng: {input.lng.toFixed(4)}</span>
                        </div>
                    </div>

                    <button
                        onClick={onCalculate}
                        disabled={isCalculating}
                        className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${isCalculating
                            ? 'bg-blue-500/20 text-blue-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:shadow-blue-500/25 text-white'
                            }`}
                    >
                        {isCalculating ? 'Calculating...' : 'Calculate Overlay'}
                    </button>

                    {error && (
                        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs text-red-400">
                            {error}
                        </div>
                    )}
                </section>

                {/* Section B: Overlay Controls */}
                <section className="space-y-4">
                    <h3 className="text-sm font-semibold text-white/90 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1 h-4 bg-indigo-500 rounded-full"></span>
                        Overlay Controls
                    </h3>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <label className="text-slate-400">Chart Radius</label>
                            <span className="text-indigo-400 font-mono">{settings.radiusKm} km</span>
                        </div>
                        <input
                            type="range"
                            min="10"
                            max="5000"
                            step="10"
                            value={settings.radiusKm}
                            onChange={(e) => handleSettingChange('radiusKm', Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <label className="text-slate-400">Geodesic Steps (Quality)</label>
                            <span className="text-indigo-400 font-mono">{settings.geodesicSteps}</span>
                        </div>
                        <input
                            type="range"
                            min="16"
                            max="360"
                            step="16"
                            value={settings.geodesicSteps}
                            onChange={(e) => handleSettingChange('geodesicSteps', Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                            <label className="text-slate-400">Rotation Offset (Degrees)</label>
                            <span className="text-indigo-400 font-mono">{settings.rotationOffset}°</span>
                        </div>
                        <input
                            type="range"
                            min="-180"
                            max="180"
                            step="1"
                            value={settings.rotationOffset}
                            onChange={(e) => handleSettingChange('rotationOffset', Number(e.target.value))}
                            className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500"
                        />
                    </div>

                    <div className="space-y-3 pt-2">
                        <LayerToggle
                            label="House Sectors"
                            checked={settings.showHouses}
                            onChange={(v) => handleSettingChange('showHouses', v)}
                        />
                        <LayerToggle
                            label="Planet Rays"
                            checked={settings.showRays}
                            onChange={(v) => handleSettingChange('showRays', v)}
                        />
                        <LayerToggle
                            label="Planet Markers"
                            checked={settings.showMarkers}
                            onChange={(v) => handleSettingChange('showMarkers', v)}
                        />
                    </div>
                </section>

                {/* Section C: Debug / Legend */}
                {debugData && (
                    <section className="space-y-2">
                        <button
                            onClick={() => setShowDebug(!showDebug)}
                            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-white transition-colors py-2 border-t border-white/5"
                        >
                            <span>Debug Data</span>
                            <span>{showDebug ? 'Hide' : 'Show'}</span>
                        </button>

                        {showDebug && (
                            <div className="p-3 bg-black/20 rounded-lg space-y-2 text-xs font-mono text-slate-400 overflow-x-auto">
                                <div>
                                    <div className="font-bold text-indigo-400 mb-1">Houses</div>
                                    {debugData.houses?.map((h: any) => (
                                        <div key={h.house} className="flex justify-between">
                                            <span>H{h.house}</span>
                                            <span>{h.longitude.toFixed(2)}°</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-2">
                                    <div className="font-bold text-indigo-400 mb-1">Planets</div>
                                    {debugData.planets?.map((p: any) => (
                                        <div key={p.id} className="flex justify-between">
                                            <span>{p.name}</span>
                                            <span>{p.longitude.toFixed(2)}°</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/5 text-[10px] text-center text-slate-600">
                Geo Chart Module v1.0
            </div>
        </div>
    );
}

function LayerToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">{label}</span>
            <button
                onClick={() => onChange(!checked)}
                className={`w-10 h-5 rounded-full transition-colors relative ${checked ? 'bg-indigo-600' : 'bg-white/10'}`}
            >
                <span className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
            </button>
        </div>
    );
}
