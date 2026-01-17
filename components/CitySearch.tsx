'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CityResult, CitySearchResponse } from '@/lib/schema';
import { formatCityDisplay } from '@/lib/geo';

interface CitySearchProps {
    value: string;
    onChange: (city: string) => void;
    onSelect: (city: CityResult) => void;
    error?: string;
    disabled?: boolean;
}

export function CitySearch({ value, onChange, onSelect, error, disabled }: CitySearchProps) {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState<CityResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    // Debounced search
    const searchCities = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setSearchError(null);

        try {
            const response = await fetch('/api/geo/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, limit: 8 }),
            });

            const data: CitySearchResponse = await response.json();

            if ('error' in data) {
                setSearchError('Failed to search cities');
                setResults([]);
            } else {
                setResults(data.results || []);
                setIsOpen(data.results.length > 0);
            }
        } catch {
            setSearchError('Failed to search cities');
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Handle input change with debounce
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQuery(newValue);
        onChange(newValue);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        debounceRef.current = setTimeout(() => {
            searchCities(newValue);
        }, 300);
    };

    // Handle city selection
    const handleSelect = (city: CityResult) => {
        setQuery(formatCityDisplay(city));
        onChange(formatCityDisplay(city));
        onSelect(city);
        setIsOpen(false);
        setResults([]);
    };

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Cleanup debounce on unmount
    useEffect(() => {
        return () => {
            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }
        };
    }, []);

    // Sync external value changes
    useEffect(() => {
        if (value !== query) {
            setQuery(value);
        }
    }, [value]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div ref={containerRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => results.length > 0 && setIsOpen(true)}
                    disabled={disabled}
                    placeholder="Search for a city..."
                    className={`
            w-full px-4 py-3 rounded-xl
            bg-white/5 backdrop-blur-sm
            border transition-all duration-200
            text-white placeholder-white/40
            focus:outline-none focus:ring-2 focus:ring-violet-500/50
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'}
          `}
                />
                {isLoading && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    </div>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && results.length > 0 && (
                <div className="absolute z-50 w-full mt-2 py-2 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 max-h-64 overflow-y-auto">
                    {results.map((city, index) => (
                        <button
                            key={`${city.name}-${city.country}-${city.lat}-${index}`}
                            type="button"
                            onClick={() => handleSelect(city)}
                            className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between group"
                        >
                            <div>
                                <span className="text-white font-medium">{city.name}</span>
                                <span className="text-white/40 ml-2">{city.country}</span>
                            </div>
                            <div className="text-xs text-white/30 group-hover:text-white/50 transition-colors">
                                {city.timezone}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {/* No results message */}
            {isOpen && results.length === 0 && !isLoading && query.length >= 2 && (
                <div className="absolute z-50 w-full mt-2 py-4 px-4 rounded-xl bg-slate-800/95 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <p className="text-white/50 text-center text-sm">No cities found</p>
                </div>
            )}

            {/* Error messages */}
            {(error || searchError) && (
                <p className="mt-2 text-sm text-red-400">{error || searchError}</p>
            )}
        </div>
    );
}
