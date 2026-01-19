'use client';

import Link from 'next/link';
import { ArrowRight, Map, Compass } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen w-full gradient-bg flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 pb-2">
            Astro Event
          </h1>
          <p className="text-xl text-slate-400">
            Select a tool to begin your analysis
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Crime Analyst Card */}
          <Link
            href="/crime-analyst"
            className="group relative p-8 rounded-3xl bg-[#0B0C10]/80 border border-white/10 hover:border-emerald-500/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/20 flex flex-col items-center text-center space-y-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Map className="w-10 h-10 text-emerald-400" />
            </div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                Crime Analyst
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Investigative analysis using planetary bearings, distance rings, and historical event correlations.
              </p>
            </div>

            <div className="pt-4 relative z-10">
              <span className="inline-flex items-center gap-2 text-emerald-400 text-sm font-medium group-hover:gap-3 transition-all">
                Launch Analyst <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Astro Locator Card */}
          <Link
            href="/astro-locator"
            className="group relative p-8 rounded-3xl bg-[#0B0C10]/80 border border-white/10 hover:border-purple-500/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20 flex flex-col items-center text-center space-y-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Compass className="w-10 h-10 text-purple-400" />
            </div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-bold text-white group-hover:text-purple-400 transition-colors">
                Astro Locator
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Intent-based locator using house sectors to find people, objects, or places of interest.
              </p>
            </div>

            <div className="pt-4 relative z-10">
              <span className="inline-flex items-center gap-2 text-purple-400 text-sm font-medium group-hover:gap-3 transition-all">
                Open Locator <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link>

          {/* Geo Chart Card - NEW (Hidden/Experimental) */}
          {/* <Link
            href="/geo-chart"
            className="group relative p-8 rounded-3xl bg-[#0B0C10]/80 border border-white/10 hover:border-blue-500/50 backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col items-center text-center space-y-6 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="w-20 h-20 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-10 h-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <div className="space-y-2 relative z-10">
              <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                Geo Chart
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                Visualise planets and house sectors as geodesic shapes projected on the Earth.
              </p>
            </div>

            <div className="pt-4 relative z-10">
              <span className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium group-hover:gap-3 transition-all">
                Open Cartography <ArrowRight className="w-4 h-4" />
              </span>
            </div>
          </Link> */}
        </div>
      </div>
    </div>
  );
}
