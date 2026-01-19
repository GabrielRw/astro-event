'use client';

import { HouseCategory, DistanceSettings, DistanceMode } from './types';
import { HOUSE_CATEGORIES } from './types';
import { Settings } from 'lucide-react';
import { useState } from 'react';

interface AstroLocatorPanelProps {
    onSelectHouse: (houseId: number) => void;
    selectedHouseId: number | null;
    date: string;
    onDateChange: (date: string) => void;
    distanceSettings: DistanceSettings;
    onDistanceSettingsChange: (settings: DistanceSettings) => void;
}

const MODE_OPTIONS: { value: DistanceMode; label: string; description: string }[] = [
    { value: 'auto', label: 'Auto (Modality)', description: 'Based on sign modality' },
    { value: 'manual', label: 'Manual', description: 'Set distances manually' },
    { value: 'aspect', label: 'Aspect Δ°', description: 'Ruler separation × multiplier' },
    { value: 'ic', label: 'IC Distance', description: 'Distance from IC × multiplier' },
];

export function AstroLocatorPanel({
    onSelectHouse,
    selectedHouseId,
    date,
    onDateChange,
    distanceSettings,
    onDistanceSettingsChange
}: AstroLocatorPanelProps) {
    const [showSettings, setShowSettings] = useState(false);

    const updateMode = (mode: DistanceMode) => {
        onDistanceSettingsChange({ ...distanceSettings, mode });
    };

    const updateManualDistance = (index: number, value: number) => {
        const newDists = [...distanceSettings.manualDistances] as [number, number, number];
        newDists[index] = value;
        onDistanceSettingsChange({ ...distanceSettings, manualDistances: newDists });
    };

    const updateMultiplier = (value: number) => {
        onDistanceSettingsChange({ ...distanceSettings, aspectMultiplier: value });
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                            Astro Locator
                        </h2>
                        <p className="text-sm text-slate-400">
                            Select a category to find direction and distance hints.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>

                {/* Date Selection */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Search Time
                    </label>
                    <input
                        type="datetime-local"
                        value={date}
                        onChange={(e) => onDateChange(e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all text-sm color-scheme-dark"
                    />
                </div>

                {/* Distance Settings (Collapsible) */}
                {showSettings && (
                    <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Distance Calculation Mode
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {MODE_OPTIONS.map(opt => (
                                <button
                                    key={opt.value}
                                    onClick={() => updateMode(opt.value)}
                                    className={`p-3 rounded-lg text-left transition-all ${distanceSettings.mode === opt.value
                                        ? 'bg-purple-500/20 border border-purple-500/50 text-purple-300'
                                        : 'bg-black/20 border border-white/5 text-slate-400 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="text-sm font-medium">{opt.label}</div>
                                    <div className="text-[10px] opacity-60">{opt.description}</div>
                                </button>
                            ))}
                        </div>

                        {/* Manual Mode Inputs */}
                        {distanceSettings.mode === 'manual' && (
                            <div className="space-y-2 pt-2">
                                <label className="text-xs text-slate-500">Manual Distances (km)</label>
                                <div className="flex gap-2">
                                    {distanceSettings.manualDistances.map((dist, i) => (
                                        <input
                                            key={i}
                                            type="number"
                                            value={dist}
                                            onChange={(e) => updateManualDistance(i, parseFloat(e.target.value) || 0)}
                                            className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                                            placeholder={`Band ${i + 1}`}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Multiplier for Aspect/IC modes */}
                        {(distanceSettings.mode === 'aspect' || distanceSettings.mode === 'ic') && (
                            <div className="space-y-2 pt-2">
                                <label className="text-xs text-slate-500">
                                    Multiplier (1° = {distanceSettings.aspectMultiplier} km)
                                </label>
                                <input
                                    type="range"
                                    min="0.1"
                                    max="10"
                                    step="0.1"
                                    value={distanceSettings.aspectMultiplier}
                                    onChange={(e) => updateMultiplier(parseFloat(e.target.value))}
                                    className="w-full accent-purple-500"
                                />
                                <div className="flex justify-between text-[10px] text-slate-600">
                                    <span>0.1</span>
                                    <span className="text-purple-400 font-medium">{distanceSettings.aspectMultiplier}×</span>
                                    <span>10</span>
                                </div>
                            </div>
                        )}
                        <div className="pt-2">
                            <label className="text-xs text-slate-500">Unit</label>
                            <div className="flex bg-black/40 rounded-lg p-1 border border-white/10">
                                {['km', 'miles', 'meters'].map((u) => (
                                    <button
                                        key={u}
                                        onClick={() => onDistanceSettingsChange({ ...distanceSettings, unit: u as any })}
                                        className={`flex-1 py-1 text-xs rounded transition-colors ${distanceSettings.unit === u
                                                ? 'bg-purple-500 text-white'
                                                : 'text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {u === 'km' ? 'km' : u === 'miles' ? 'mi' : 'm'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Categories */}
            <div className="space-y-3">
                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Categories
                </label>
                <div className="grid grid-cols-1 gap-3">
                    {HOUSE_CATEGORIES.map((house) => (
                        <button
                            key={house.id}
                            onClick={() => onSelectHouse(house.id)}
                            className={`
                                group relative w-full text-left p-4 rounded-xl border transition-all duration-200
                                ${selectedHouseId === house.id
                                    ? 'bg-purple-500/10 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                                }
                            `}
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`font-semibold mb-1 ${selectedHouseId === house.id ? 'text-purple-400' : 'text-slate-200'}`}>
                                        {house.title}
                                    </div>
                                    <div className="text-xs text-slate-400 leading-relaxed">
                                        {house.description}
                                    </div>
                                </div>
                                {selectedHouseId === house.id && (
                                    <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 animate-pulse" />
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-4 border-t border-white/5">
                <p className="text-[10px] text-slate-600 italic text-center">
                    "This tool provides directional guidance and search hints. It does not guarantee exact locations."
                </p>
            </div>
        </div >
    );
}

