'use client';

import { useState } from 'react';
import type { EventItem } from './eventTypes';

interface EventListProps {
    events: EventItem[];
    selectedEventId: string | null;
    onSelectEvent: (event: EventItem) => void;
    onAddEvent: () => void;
}

export function EventList({ events, selectedEventId, onSelectEvent, onAddEvent }: EventListProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            exact: 'bg-emerald-500/20 text-emerald-400',
            approximate: 'bg-amber-500/20 text-amber-400',
            unknown: 'bg-red-500/20 text-red-400',
        };
        return colors[confidence] || colors.unknown;
    };

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white mb-3">Events</h2>

                {/* Search */}
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events..."
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
            </div>

            {/* Event List */}
            <div className="flex-1 overflow-y-auto">
                {filteredEvents.map(event => (
                    <button
                        key={event.id}
                        onClick={() => onSelectEvent(event)}
                        className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors ${selectedEventId === event.id ? 'bg-violet-500/10 border-l-2 border-l-violet-500' : ''
                            }`}
                    >
                        <h3 className="text-white font-medium text-sm mb-1 line-clamp-1">
                            {event.title}
                        </h3>
                        <p className="text-white/50 text-xs mb-2">
                            {formatDate(event.datetimeISO)} • {event.location.label}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${getConfidenceBadge(event.timeConfidence)}`}>
                                {event.timeConfidence}
                            </span>
                            <span className="text-white/30 text-xs capitalize">
                                {event.timeType}
                            </span>
                        </div>
                    </button>
                ))}

                {filteredEvents.length === 0 && (
                    <div className="p-4 text-center text-white/40 text-sm">
                        No events found
                    </div>
                )}
            </div>

            {/* Add Event Button */}
            <div className="p-4 border-t border-white/10">
                <button
                    onClick={onAddEvent}
                    className="w-full py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Event
                </button>
            </div>
        </div>
    );
}
