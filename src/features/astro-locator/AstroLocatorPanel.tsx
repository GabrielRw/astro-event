'use client';

import { HouseCategory } from './types';
import { HOUSE_CATEGORIES } from './types';

interface AstroLocatorPanelProps {
    onSelectHouse: (houseId: number) => void;
    selectedHouseId: number | null;
    query: string;
    onQueryChange: (val: string) => void;
}

export function AstroLocatorPanel({
    onSelectHouse,
    selectedHouseId,
    query,
    onQueryChange
}: AstroLocatorPanelProps) {

    return (
        <div className="h-full flex flex-col p-4 space-y-6 overflow-y-auto">
            <div className="space-y-4">
                <div>
                    <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Astro Locator
                    </h2>
                    <p className="text-sm text-slate-400">
                        Select a category to find direction and distance hints.
                    </p>
                </div>

                {/* Query Input */}
                <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Search Intent
                    </label>
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        placeholder="e.g. My keys, A quiet cafe..."
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
                    />
                </div>
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
        </div>
    );
}
