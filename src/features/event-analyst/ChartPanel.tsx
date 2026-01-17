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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${isSelected
                        ? 'bg-amber-500/20 border border-amber-500/50'
                        : 'hover:bg-white/5'
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
        <div className="flex flex-col h-full overflow-hidden">
            {/* Settings Section */}
            <div className="p-4 border-b border-white/10 space-y-4">
                <h2 className="text-lg font-semibold text-white">Chart Overlay</h2>

                {/* Group Toggles */}
                <div className="flex gap-2">
                    {(['planets', 'angles', 'houses'] as const).map(group => (
                        <button
                            key={group}
                            onClick={() => toggleGroup(group)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${settings.enabledGroups[group]
                                    ? 'bg-violet-500/20 text-violet-300 border border-violet-500/50'
                                    : 'bg-white/5 text-white/50 border border-white/10'
                                }`}
                        >
                            {group}
                        </button>
                    ))}
                </div>

                {/* Ring Mode */}
                <div>
                    <label className="block text-xs text-white/50 mb-1">Ring Mode</label>
                    <select
                        value={settings.ringMode}
                        onChange={(e) => setRingMode(e.target.value as RingMode)}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                    >
                        <option value="decimal" className="bg-slate-800">Decimal (1, 10, 100...)</option>
                        <option value="degreeDerived" className="bg-slate-800">Degree-Derived</option>
                    </select>
                    {settings.ringMode === 'degreeDerived' && (
                        <p className="text-xs text-white/40 mt-1">
                            Rings scale based on IC degree (0.01×D, 0.1×D, 1×D...)
                        </p>
                    )}
                </div>

                {/* Max Distance Slider */}
                <div>
                    <div className="flex justify-between text-xs text-white/50 mb-1">
                        <span>Max Distance</span>
                        <span>{settings.maxDistanceMiles} mi</span>
                    </div>
                    <input
                        type="range"
                        min={100}
                        max={3000}
                        step={100}
                        value={settings.maxDistanceMiles}
                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                    />
                </div>
            </div>

            {/* Bodies List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {settings.enabledGroups.planets && groupedBodies.planets.length > 0 && (
                    <div>
                        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Planets</h3>
                        <div className="space-y-1">
                            {groupedBodies.planets.map(renderBodyRow)}
                        </div>
                    </div>
                )}

                {settings.enabledGroups.angles && groupedBodies.angles.length > 0 && (
                    <div>
                        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Angles</h3>
                        <div className="space-y-1">
                            {groupedBodies.angles.map(renderBodyRow)}
                        </div>
                    </div>
                )}

                {settings.enabledGroups.houses && groupedBodies.houses.length > 0 && (
                    <div>
                        <h3 className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2">Houses</h3>
                        <div className="space-y-1">
                            {groupedBodies.houses.map(renderBodyRow)}
                        </div>
                    </div>
                )}

                {bodies.length === 0 && (
                    <div className="text-center text-white/40 text-sm py-8">
                        Select an event to view chart data
                    </div>
                )}
            </div>
        </div>
    );
}
