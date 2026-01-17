'use client';

import { useState } from 'react';
import type { EventItem } from './eventTypes';

interface EventListProps {
    events: EventItem[];
    selectedEventId: string | null;
    onSelectEvent: (event: EventItem) => void;
    onAddEvent: () => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoadingMore?: boolean;
    dateRange: { start: string; end: string };
    onDateRangeChange: (range: { start: string; end: string }) => void;
    activeFilters: string[];
    onFilterChange: (filters: string[]) => void;
}

export function EventList({
    events,
    selectedEventId,
    onSelectEvent,
    onAddEvent,
    onLoadMore,
    hasMore,
    isLoadingMore,
    dateRange,
    onDateRangeChange,
    activeFilters,
    onFilterChange
}: EventListProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const toggleFilter = (source: string) => {
        onFilterChange(
            activeFilters.includes(source) ? activeFilters.filter(s => s !== source) : [...activeFilters, source]
        );
    };

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight + 50) { // Load when near bottom
            if (hasMore && !isLoadingMore && onLoadMore) {
                onLoadMore();
            }
        }
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.location.label.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    const formatDate = (isoString: string) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const getConfidenceBadge = (confidence: string) => {
        const colors: Record<string, string> = {
            exact: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
            approximate: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
            unknown: 'bg-red-500/10 text-red-400 border border-red-500/20',
        };
        return colors[confidence] || colors.unknown;
    };

    return (
        <div className="flex flex-col h-full bg-[#0B0C10]/80 backdrop-blur-xl border-l border-white/5 mx-2 my-2 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-white/5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                        Events
                    </h2>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-white/30">{filteredEvents.length}</span>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`p-1.5 rounded-lg transition-colors ${showFilters ? 'bg-emerald-500/20 text-emerald-400' : 'hover:bg-white/5 text-white/40'}`}
                            title="Filter Data Sources"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Filters Collapse */}
                {showFilters && (
                    <div className="mb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">Data Sources</p>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { id: 'historical', label: 'Historical' },
                                { id: 'uk-police', label: 'UK Police' },
                                { id: 'us-city', label: 'US City' }
                            ].map(source => (
                                <button
                                    key={source.id}
                                    onClick={() => toggleFilter(source.id)}
                                    className={`
                                        px-3 py-1.5 rounded-lg text-xs font-medium border transition-all
                                        ${activeFilters.includes(source.id)
                                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                            : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                                        }
                                    `}
                                >
                                    {source.label}
                                </button>
                            ))}
                        </div>

                        <div className="pt-2 border-t border-white/5 mt-2">
                            <p className="text-[10px] uppercase tracking-wider text-white/30 font-semibold mb-2">Date Range</p>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="text-[10px] text-white/40 block mb-1">From</label>
                                    <input
                                        type="date"
                                        value={dateRange.start}
                                        onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[10px] text-white/40 block mb-1">To</label>
                                    <input
                                        type="date"
                                        value={dateRange.end}
                                        onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="relative">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search events..."
                        className="w-full px-4 py-2.5 rounded-xl bg-black/20 border border-white/5 text-white placeholder-white/20 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                    />
                    <svg className="absolute right-3 top-2.5 w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>

            {/* Event List */}
            <div
                className="flex-1 overflow-y-auto p-3 space-y-2"
                onScroll={handleScroll}
            >
                {filteredEvents.map(event => (
                    <button
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className={`
                            group w-full text-left p-4 rounded-xl border transition-all duration-300
                            ${selectedEventId === event.id
                                ? 'bg-emerald-500/5 border-emerald-500/50 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)]'
                                : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.04] hover:border-white/10'
                            }
                        `}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`font-medium text-sm line-clamp-1 transition-colors ${selectedEventId === event.id ? 'text-emerald-400' : 'text-white/90 group-hover:text-white'}`}>
                                {event.title}
                            </h3>
                            {selectedEventId === event.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            )}
                        </div>

                        <p className="text-white/40 text-xs mb-3 font-light tracking-wide">
                            {formatDate(event.datetimeISO)} • {event.location.label}
                        </p>

                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider ${getConfidenceBadge(event.timeConfidence)}`}>
                                {event.timeConfidence}
                            </span>
                            <span className="text-white/20 text-[10px] uppercase tracking-wider">
                                {event.timeType}
                            </span>
                        </div>
                    </button>
                ))}

                {isLoadingMore && (
                    <div className="py-4 flex justify-center">
                        <div className="w-6 h-6 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    </div>
                )}

                {!isLoadingMore && filteredEvents.length === 0 && (
                    <div className="p-8 text-center">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/5 mb-3 text-white/20">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <p className="text-white/30 text-sm">No events found</p>
                    </div>
                )}
            </div>

            {/* Add Event Button */}
            <div className="p-4 border-t border-white/5 bg-white/[0.02]">
                <button
                    onClick={onAddEvent}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 hover:from-emerald-500 hover:to-green-400 text-white text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Event
                </button>
            </div>
        </div>
    );
}
