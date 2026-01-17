'use client';

import { useState } from 'react';
import type { Aspect } from '@/lib/schema';

interface AspectsPanelProps {
    aspects: Aspect[];
}

// Aspect symbols and colors
const ASPECT_INFO: Record<string, { symbol: string; color: string; bgColor: string }> = {
    Conjunction: { symbol: '☌', color: 'text-amber-400', bgColor: 'bg-amber-500/20' },
    Opposition: { symbol: '☍', color: 'text-red-400', bgColor: 'bg-red-500/20' },
    Trine: { symbol: '△', color: 'text-emerald-400', bgColor: 'bg-emerald-500/20' },
    Square: { symbol: '□', color: 'text-rose-400', bgColor: 'bg-rose-500/20' },
    Sextile: { symbol: '⚹', color: 'text-blue-400', bgColor: 'bg-blue-500/20' },
    Quincunx: { symbol: '⚻', color: 'text-purple-400', bgColor: 'bg-purple-500/20' },
    Semisextile: { symbol: '⚺', color: 'text-teal-400', bgColor: 'bg-teal-500/20' },
    Semisquare: { symbol: '∠', color: 'text-orange-400', bgColor: 'bg-orange-500/20' },
    Sesquiquadrate: { symbol: '⚼', color: 'text-pink-400', bgColor: 'bg-pink-500/20' },
};

export function AspectsPanel({ aspects }: AspectsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [filter, setFilter] = useState<'all' | 'major' | 'minor'>('all');

    const filteredAspects = aspects.filter(aspect => {
        if (filter === 'major') return aspect.is_major;
        if (filter === 'minor') return !aspect.is_major;
        return true;
    });

    // Sort by orb (tightest first)
    const sortedAspects = [...filteredAspects].sort((a, b) => a.orb - b.orb);

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-rose-500/10 via-pink-500/5 to-transparent px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">Aspects</h3>
                    <span className="text-white/40 text-sm">({aspects.length})</span>
                </div>
                <svg
                    className={`w-5 h-5 text-white/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Content */}
            {isExpanded && (
                <div>
                    {/* Filter tabs */}
                    <div className="flex gap-2 p-4 border-b border-white/5">
                        {(['all', 'major', 'minor'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`
                  px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors
                  ${filter === f
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/50 hover:text-white hover:bg-white/5'
                                    }
                `}
                            >
                                {f}
                            </button>
                        ))}
                    </div>

                    {/* Aspects list */}
                    <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
                        {sortedAspects.length === 0 ? (
                            <div className="px-6 py-8 text-center text-white/50">
                                No {filter !== 'all' ? filter : ''} aspects found
                            </div>
                        ) : (
                            sortedAspects.map((aspect, index) => {
                                const info = ASPECT_INFO[aspect.type] || {
                                    symbol: '•',
                                    color: 'text-white/60',
                                    bgColor: 'bg-white/10',
                                };

                                return (
                                    <div
                                        key={`${aspect.p1}-${aspect.p2}-${aspect.type}-${index}`}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            {/* Aspect type badge */}
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${info.bgColor}`}>
                                                <span className={`text-lg ${info.color}`}>{info.symbol}</span>
                                                <span className={`text-sm font-medium ${info.color}`}>{aspect.type}</span>
                                            </div>

                                            {/* Bodies */}
                                            <div className="text-white/80">
                                                <span className="font-medium">{aspect.p1}</span>
                                                <span className="text-white/40 mx-2">↔</span>
                                                <span className="font-medium">{aspect.p2}</span>
                                            </div>
                                        </div>

                                        {/* Orb */}
                                        <div className="text-right">
                                            <span className="text-white/60 text-sm font-mono">
                                                {aspect.orb.toFixed(2)}°
                                            </span>
                                            {aspect.is_major && (
                                                <span className="ml-2 text-xs text-amber-400/60">Major</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
