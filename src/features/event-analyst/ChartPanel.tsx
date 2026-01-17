'use client';

import type { ChartBody, OverlaySettings, RingMode } from './eventTypes';
import { SIGN_NAMES } from './bearing';

interface ChartPanelProps {
    bodies: ChartBody[];
    settings: OverlaySettings;
    onSettingsChange: (settings: OverlaySettings) => void;
    onBodySelect: (bodyId: string | null) => void;
}

export function ChartPanel({ bodies, settings, onSettingsChange, onBodySelect }: ChartPanelProps) {
    const groupedBodies = {
        planets: bodies.filter(b => b.group === 'planet'),
        angles: bodies.filter(b => b.group === 'angle'),
        houses: bodies.filter(b => b.group === 'house'),
    };

    const toggleGroup = (group: keyof typeof settings.enabledGroups) => {
        onSettingsChange({
            ...settings,
            enabledGroups: {
                ...settings.enabledGroups,
                [group]: !settings.enabledGroups[group],
            },
        });
    };

    const setRingMode = (mode: RingMode) => {
        onSettingsChange({ ...settings, ringMode: mode });
    };

    const setMaxDistance = (miles: number) => {
        onSettingsChange({ ...settings, maxDistanceMiles: miles });
    };

    const renderBodyRow = (body: ChartBody) => {
        const isSelected = settings.selectedBodyId === body.id;
        const signName = SIGN_NAMES[body.sign] || body.sign;

        return (
            <button
                key={body.id}
                onClick={() => onBodySelect(isSelected ? null : body.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 border ${isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]'
                    : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                    }`}
            >
                <div className="flex items-center gap-2">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: body.color }}
                    />
                    <span className="text-white font-medium">{body.label}</span>
                </div>
                <div className="text-right">
                    <span className="text-white/70">{body.deg.toFixed(1)}° {signName}</span>
                    <span className="text-white/40 ml-2">→ {body.bearingDeg.toFixed(1)}°</span>
                </div>
            </button>
        );
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0C10]/80 backdrop-blur-xl border-r border-white/5 mx-2 my-2 rounded-2xl overflow-hidden">
            {/* Settings Section */}
            <div className="p-5 border-b border-white/5 space-y-5">
                <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                    Chart Overlay
                </h2>

                {/* Group Toggles */}
                <div className="flex gap-2">
                    {(['planets', 'angles', 'houses'] as const).map(group => (
                        <button
                            key={group}
                            onClick={() => toggleGroup(group)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${settings.enabledGroups[group]
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/5 text-white/40 border border-white/5 hover:bg-white/10'
                                }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>

                {/* Ring Mode */}
                <div>
                    <label className="block text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">Ring Mode</label>
                    <select
                        value={settings.ringMode}
                        onChange={(e) => setRingMode(e.target.value as RingMode)}
                        className="w-full px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-white text-xs focus:outline-none focus:border-emerald-500/50 transition-colors"
                    >
                        <option value="decimal" className="bg-[#0B0C10]">Decimal (1, 10, 100...)</option>
                        <option value="degreeDerived" className="bg-[#0B0C10]">Degree-Derived</option>
                    </select>
                    {settings.ringMode === 'degreeDerived' && (
                        <p className="text-[10px] text-white/30 mt-1.5 font-light">
                            Rings scale based on IC degree (0.01×D, 0.1×D...)
                        </p>
                    )}
                </div>

                {/* Max Distance Slider */}
                <div>
                    <div className="flex justify-between text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">
                        <span>Max Distance</span>
                        <span className="text-emerald-400">{settings.maxDistanceMiles} mi</span>
                    </div>
                    <input
                        type="range"
                        min={100}
                        max={3000}
                        step={100}
                        value={settings.maxDistanceMiles}
                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400"
                    />
                </div>
            </div>

            {/* Bodies List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
                {settings.enabledGroups.planets && groupedBodies.planets.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 px-2">Planets</h3>
                        <div className="space-y-1">
                            {groupedBodies.planets.map(renderBodyRow)}
                        </div>
                    </div>
                )}

                {settings.enabledGroups.angles && groupedBodies.angles.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 px-2">Angles</h3>
                        <div className="space-y-1">
                            {groupedBodies.angles.map(renderBodyRow)}
                        </div>
                    </div>
                )}

                {settings.enabledGroups.houses && groupedBodies.houses.length > 0 && (
                    <div>
                        <h3 className="text-[10px] font-semibold text-white/30 uppercase tracking-wider mb-2 px-2">Houses</h3>
                        <div className="space-y-1">
                            {groupedBodies.houses.map(renderBodyRow)}
                        </div>
                    </div>
                )}

                {bodies.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center opacity-40">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-3">
                            <span className="text-xl">✨</span>
                        </div>
                        <p className="text-white text-xs">Select an event to view chart</p>
                    </div>
                )}
            </div>
        </div>
    );
}
