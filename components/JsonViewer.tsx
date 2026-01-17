'use client';

import { useState } from 'react';

interface JsonViewerProps {
    data: unknown;
    title?: string;
}

export function JsonViewer({ data, title = 'Raw JSON' }: JsonViewerProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [copied, setCopied] = useState(false);

    const jsonString = JSON.stringify(data, null, 2);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(jsonString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between bg-gradient-to-r from-slate-500/10 via-gray-500/5 to-transparent px-6 py-4 border-b border-white/10 hover:bg-white/5 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <span className="text-lg">📋</span>
                    <h3 className="text-lg font-semibold text-white">{title}</h3>
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
                <div className="relative">
                    {/* Copy button */}
                    <button
                        onClick={handleCopy}
                        className="absolute top-4 right-4 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white text-sm font-medium transition-colors flex items-center gap-2 z-10"
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
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Copy
                            </>
                        )}
                    </button>

                    {/* JSON content */}
                    <div className="p-4 max-h-96 overflow-auto">
                        <pre className="text-sm text-white/70 font-mono whitespace-pre-wrap break-words">
                            {jsonString}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
