'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SummaryCards } from '@/components/SummaryCards';
import { PlanetsTable } from '@/components/PlanetsTable';
import { HousesTable } from '@/components/HousesTable';
import { AspectsPanel } from '@/components/AspectsPanel';
import { JsonViewer } from '@/components/JsonViewer';
import type { NatalChartResponse, NatalFormData } from '@/lib/schema';

export default function ResultPage() {
    const router = useRouter();
    const [chartData, setChartData] = useState<NatalChartResponse | null>(null);
    const [formData, setFormData] = useState<NatalFormData | null>(null);
    const [shareUrl, setShareUrl] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        // Load data from sessionStorage
        const storedChart = sessionStorage.getItem('chartData');
        const storedForm = sessionStorage.getItem('formData');

        if (storedChart && storedForm) {
            const chart = JSON.parse(storedChart);
            const form = JSON.parse(storedForm);
            setChartData(chart);
            setFormData(form);

            // Save to localStorage for persistence
            localStorage.setItem('lastChart', storedChart);
            localStorage.setItem('lastFormData', storedForm);

            // Generate shareable URL
            const params = new URLSearchParams({
                name: form.name || '',
                date: form.date,
                time: form.time,
                city: form.city,
                lat: form.lat.toString(),
                lng: form.lng.toString(),
                tz: form.timezone,
                house: form.houseSystem || 'placidus',
                zodiac: form.zodiacType || 'tropical',
            });
            setShareUrl(`${window.location.origin}?${params.toString()}`);
        } else {
            // Try to load from localStorage
            const lastChart = localStorage.getItem('lastChart');
            const lastForm = localStorage.getItem('lastFormData');

            if (lastChart && lastForm) {
                setChartData(JSON.parse(lastChart));
                setFormData(JSON.parse(lastForm));
            } else {
                // No data, redirect to form
                router.push('/');
            }
        }
    }, [router]);

    const handleCopyUrl = async () => {
        if (shareUrl) {
            await navigator.clipboard.writeText(shareUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (!chartData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-white/60">Loading chart data...</p>
                </div>
            </div>
        );
    }

    return (
        <main className="min-h-screen py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                            {chartData.subject.name ? `${chartData.subject.name}'s Chart` : 'Your Natal Chart'}
                        </h1>
                        {formData && (
                            <p className="text-white/50">
                                {formData.date} • {formData.time} • {formData.city}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-3">
                        {/* Share button */}
                        <button
                            onClick={handleCopyUrl}
                            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-white/70 hover:text-white text-sm font-medium transition-all flex items-center gap-2"
                        >
                            {copied ? (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    Share
                                </>
                            )}
                        </button>

                        {/* New Chart button */}
                        <button
                            onClick={() => router.push('/')}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-sm font-medium transition-all flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chart
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <section className="mb-8">
                    <SummaryCards planets={chartData.planets} subject={chartData.subject} />
                </section>

                {/* Planets Table */}
                <section className="mb-8">
                    <PlanetsTable planets={chartData.planets} />
                </section>

                {/* Houses Table */}
                <section className="mb-8">
                    <HousesTable houses={chartData.houses} />
                </section>

                {/* Aspects Panel */}
                <section className="mb-8">
                    <AspectsPanel aspects={chartData.aspects} />
                </section>

                {/* JSON Viewer */}
                <section className="mb-8">
                    <JsonViewer data={chartData} title="Raw Chart Data" />
                </section>

                {/* Footer */}
                <div className="text-center text-white/30 text-sm py-8 border-t border-white/10">
                    <p className="mb-2">Powered by FreeAstroAPI • Swiss Ephemeris</p>
                    <p>Chart calculated on {new Date().toLocaleDateString()}</p>
                </div>
            </div>
        </main>
    );
}
