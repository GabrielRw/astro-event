'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { CitySearch } from '@/components/CitySearch';
import { NatalFormSchema, type NatalFormInput, type NatalFormData, type CityResult } from '@/lib/schema';

const HOUSE_SYSTEMS = [
  { value: 'placidus', label: 'Placidus' },
  { value: 'whole_sign', label: 'Whole Sign' },
  { value: 'equal', label: 'Equal House' },
  { value: 'koch', label: 'Koch' },
  { value: 'regiomontanus', label: 'Regiomontanus' },
  { value: 'porphyry', label: 'Porphyry' },
  { value: 'campanus', label: 'Campanus' },
  { value: 'topocentric', label: 'Topocentric' },
];

const EXTRA_BODIES = [
  { value: 'chiron', label: 'Chiron' },
  { value: 'lilith', label: 'Lilith' },
  { value: 'true_node', label: 'True Node' },
];

export default function HomePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<NatalFormInput, unknown, NatalFormData>({
    resolver: zodResolver(NatalFormSchema),
    defaultValues: {
      name: '',
      date: '',
      time: '12:00',
      timeUnknown: false,
      city: '',
      houseSystem: 'placidus',
      zodiacType: 'tropical',
      includeFeatures: [],
    },
  });

  const timeUnknown = watch('timeUnknown');

  const handleCitySelect = (city: CityResult) => {
    setValue('lat', city.lat);
    setValue('lng', city.lng);
    setValue('timezone', city.timezone);
  };

  const onSubmit = async (data: NatalFormData) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Parse date and time
      const [year, month, day] = data.date.split('-').map(Number);
      const [hour, minute] = data.time.split(':').map(Number);

      // Build API request
      const payload = {
        name: data.name || undefined,
        year,
        month,
        day,
        hour,
        minute,
        city: data.city,
        lat: data.lat,
        lng: data.lng,
        tz_str: data.timezone,
        house_system: data.houseSystem,
        zodiac_type: data.zodiacType,
        include_features: data.includeFeatures,
      };

      // Call our API route
      const response = await fetch('/api/natal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || 'error' in result) {
        throw new Error(result.message || 'Failed to calculate chart');
      }

      // Store result and form data in sessionStorage for the results page
      sessionStorage.setItem('chartData', JSON.stringify(result));
      sessionStorage.setItem('formData', JSON.stringify(data));

      // Navigate to results
      router.push('/result');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate chart');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/30 mb-6">
            <span className="text-4xl">✨</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 glow-text">
            Astral Chart
          </h1>
          <p className="text-white/60 text-lg max-w-md mx-auto mb-4">
            Calculate your Western Natal Chart with precise planetary positions and aspects
          </p>
          <a
            href="/event-analyst"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            Event Analyst →
          </a>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Name (optional) */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Name <span className="text-white/40">(optional)</span>
            </label>
            <input
              {...register('name')}
              type="text"
              placeholder="Enter your name"
              className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
            />
          </div>

          {/* Date and Time row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Birth Date <span className="text-red-400">*</span>
              </label>
              <input
                {...register('date')}
                type="date"
                className={`w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border transition-all duration-200 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 ${errors.date ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  }`}
              />
              {errors.date && (
                <p className="mt-2 text-sm text-red-400">{errors.date.message}</p>
              )}
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Birth Time <span className="text-red-400">*</span>
              </label>
              <input
                {...register('time')}
                type="time"
                disabled={timeUnknown}
                className={`w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border transition-all duration-200 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed ${errors.time ? 'border-red-500/50' : 'border-white/10 hover:border-white/20'
                  }`}
              />
              {errors.time && (
                <p className="mt-2 text-sm text-red-400">{errors.time.message}</p>
              )}
            </div>
          </div>

          {/* Time Unknown toggle */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                {...register('timeUnknown')}
                type="checkbox"
                onChange={(e) => {
                  setValue('timeUnknown', e.target.checked);
                  if (e.target.checked) {
                    setValue('time', '12:00');
                  }
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-500/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white/70 after:border-white/10 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-violet-600" />
            </label>
            <span className="text-sm text-white/60">Time unknown (use noon)</span>
          </div>

          {/* Time unknown warning */}
          {timeUnknown && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="text-amber-200 text-sm font-medium">Unknown Birth Time</p>
                <p className="text-amber-200/70 text-sm mt-1">
                  Using noon (12:00) as default. Houses and Moon position may be inaccurate.
                </p>
              </div>
            </div>
          )}

          {/* City Search */}
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">
              Birth City <span className="text-red-400">*</span>
            </label>
            <Controller
              name="city"
              control={control}
              render={({ field }) => (
                <CitySearch
                  value={field.value}
                  onChange={field.onChange}
                  onSelect={handleCitySelect}
                  error={errors.city?.message || errors.lat?.message}
                />
              )}
            />
          </div>

          {/* Settings Section */}
          <div className="pt-4 border-t border-white/10">
            <h2 className="text-lg font-semibold text-white mb-4">Chart Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* House System */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  House System
                </label>
                <select
                  {...register('houseSystem')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                >
                  {HOUSE_SYSTEMS.map((system) => (
                    <option key={system.value} value={system.value} className="bg-slate-800">
                      {system.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Zodiac Type */}
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Zodiac
                </label>
                <select
                  {...register('zodiacType')}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200"
                >
                  <option value="tropical" className="bg-slate-800">Tropical</option>
                  <option value="sidereal" className="bg-slate-800">Sidereal</option>
                </select>
              </div>
            </div>

            {/* Extra Bodies */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-white/70 mb-3">
                Include Extra Bodies
              </label>
              <div className="flex flex-wrap gap-3">
                {EXTRA_BODIES.map((body) => (
                  <label
                    key={body.value}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer transition-all"
                  >
                    <input
                      {...register('includeFeatures')}
                      type="checkbox"
                      value={body.value}
                      className="w-4 h-4 rounded text-violet-600 bg-white/10 border-white/20 focus:ring-violet-500/50 focus:ring-offset-0"
                    />
                    <span className="text-white/80 text-sm">{body.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glow-violet"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Calculating Chart...
              </span>
            ) : (
              'Calculate Natal Chart'
            )}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/30 text-sm mt-8">
          Powered by FreeAstroAPI • Swiss Ephemeris
        </p>
      </div>
    </main>
  );
}
