'use client';

import { useState } from 'react';
import type { EventItem, EventTimeType, Confidence, EventLocationPrecision } from './eventTypes';
import { CitySearch } from '@/components/CitySearch';
import type { CityResult } from '@/lib/schema';

interface EventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (event: EventItem) => void;
}

export function EventModal({ isOpen, onClose, onSave }: EventModalProps) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('12:00');
    const [locationLabel, setLocationLabel] = useState('');
    const [lat, setLat] = useState('');
    const [lng, setLng] = useState('');
    const [timeType, setTimeType] = useState<EventTimeType>('occurred');
    const [timeConfidence, setTimeConfidence] = useState<Confidence>('approximate');
    const [notes, setNotes] = useState('');
    const [geocodeError, setGeocodeError] = useState('');

    const handleCitySelect = (city: CityResult) => {
        setLat(city.lat.toString());
        setLng(city.lng.toString());
        setLocationLabel(`${city.name}, ${city.country}`);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !date || !lat || !lng) return;

        const datetimeISO = new Date(`${date}T${time}`).toISOString();

        const newEvent: EventItem = {
            id: `custom-${Date.now()}`,
            title,
            datetimeISO,
            timeType,
            timeConfidence,
            location: {
                label: locationLabel,
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                precision: 'city' as EventLocationPrecision,
            },
            notes: notes || undefined,
        };

        onSave(newEvent);
        onClose();

        // Reset form
        setTitle('');
        setDate('');
        setTime('12:00');
        setLocationLabel('');
        setLat('');
        setLng('');
        setNotes('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-xl font-semibold text-white mb-6">Add Event</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Title */}
                        <div>
                            <label className="block text-sm text-white/70 mb-1">Title *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Event name"
                                required
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                            />
                        </div>

                        {/* Date & Time */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Date *</label>
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    required
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Time</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => setTime(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                            </div>
                        </div>

                        {/* Time Type & Confidence */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Time Type</label>
                                <select
                                    value={timeType}
                                    onChange={(e) => setTimeType(e.target.value as EventTimeType)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                >
                                    <option value="occurred" className="bg-slate-800">Occurred</option>
                                    <option value="reported" className="bg-slate-800">Reported</option>
                                    <option value="published" className="bg-slate-800">Published</option>
                                    <option value="unknown" className="bg-slate-800">Unknown</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-white/70 mb-1">Confidence</label>
                                <select
                                    value={timeConfidence}
                                    onChange={(e) => setTimeConfidence(e.target.value as Confidence)}
                                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                                >
                                    <option value="exact" className="bg-slate-800">Exact</option>
                                    <option value="approximate" className="bg-slate-800">Approximate</option>
                                    <option value="unknown" className="bg-slate-800">Unknown</option>
                                </select>
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm text-white/70 mb-1">Location *</label>
                            <CitySearch
                                value={locationLabel}
                                onChange={setLocationLabel}
                                onSelect={handleCitySelect}
                                error={geocodeError}
                            />
                            {geocodeError && <p className="text-red-400 text-xs mt-1">{geocodeError}</p>}
                            {lat && lng && (
                                <p className="text-white/40 text-xs mt-1">
                                    Coordinates: {parseFloat(lat).toFixed(4)}, {parseFloat(lng).toFixed(4)}
                                </p>
                            )}
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm text-white/70 mb-1">Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional notes..."
                                rows={2}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={!title || !date || !lat || !lng}
                                className="flex-1 py-2 px-4 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Event
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
