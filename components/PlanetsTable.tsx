import type { Planet } from '@/lib/schema';

interface PlanetsTableProps {
    planets: Planet[];
}

// Planet symbols
const PLANET_SYMBOLS: Record<string, string> = {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
    asc: '⬆',
    mc: '⬇',
    chiron: '⚷',
    lilith: '⚸',
    true_node: '☊',
    mean_node: '☊',
};

// Zodiac sign symbols
const SIGN_SYMBOLS: Record<string, string> = {
    Ari: '♈',
    Tau: '♉',
    Gem: '♊',
    Can: '♋',
    Leo: '♌',
    Vir: '♍',
    Lib: '♎',
    Sco: '♏',
    Sag: '♐',
    Cap: '♑',
    Aqu: '♒',
    Pis: '♓',
};

const SIGN_NAMES: Record<string, string> = {
    Ari: 'Aries',
    Tau: 'Taurus',
    Gem: 'Gemini',
    Can: 'Cancer',
    Leo: 'Leo',
    Vir: 'Virgo',
    Lib: 'Libra',
    Sco: 'Scorpio',
    Sag: 'Sagittarius',
    Cap: 'Capricorn',
    Aqu: 'Aquarius',
    Pis: 'Pisces',
};

export function PlanetsTable({ planets }: PlanetsTableProps) {
    // Filter out Asc and MC for the main table (they're shown in summary)
    const mainPlanets = planets.filter(p => !['asc', 'mc'].includes(p.id));
    const angles = planets.filter(p => ['asc', 'mc'].includes(p.id));

    return (
        <div className="space-y-6">
            {/* Main Planets */}
            <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
                <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent px-6 py-4 border-b border-white/10">
                    <h3 className="text-lg font-semibold text-white">Planets</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/10 bg-white/5">
                                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Planet
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Sign
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Degree
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    House
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                    Status
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {mainPlanets.map((planet) => (
                                <tr
                                    key={planet.id}
                                    className="hover:bg-white/5 transition-colors"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">{PLANET_SYMBOLS[planet.id] || '•'}</span>
                                            <span className="text-white font-medium">{planet.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{SIGN_SYMBOLS[planet.sign] || ''}</span>
                                            <span className="text-white/80">{SIGN_NAMES[planet.sign] || planet.sign}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-white/80 font-mono">{planet.pos.toFixed(2)}°</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white font-medium">
                                            {planet.house}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {planet.retrograde ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/20 text-red-400 text-sm">
                                                <span className="text-xs">℞</span> Retrograde
                                            </span>
                                        ) : planet.is_stationary ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/20 text-amber-400 text-sm">
                                                ⏸ Stationary
                                            </span>
                                        ) : (
                                            <span className="text-white/40 text-sm">Direct</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Angles (Asc/MC) */}
            {angles.length > 0 && (
                <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
                    <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent px-6 py-4 border-b border-white/10">
                        <h3 className="text-lg font-semibold text-white">Angles</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5">
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                        Angle
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                        Sign
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                        Degree
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {angles.map((angle) => (
                                    <tr
                                        key={angle.id}
                                        className="hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{PLANET_SYMBOLS[angle.id] || '•'}</span>
                                                <span className="text-white font-medium">{angle.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">{SIGN_SYMBOLS[angle.sign] || ''}</span>
                                                <span className="text-white/80">{SIGN_NAMES[angle.sign] || angle.sign}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-white/80 font-mono">{angle.pos.toFixed(2)}°</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
