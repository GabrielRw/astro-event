import type { House } from '@/lib/schema';

interface HousesTableProps {
    houses: House[];
}

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

// House meanings (brief)
const HOUSE_MEANINGS: Record<number, string> = {
    1: 'Self, Identity',
    2: 'Values, Possessions',
    3: 'Communication',
    4: 'Home, Family',
    5: 'Creativity, Romance',
    6: 'Health, Service',
    7: 'Partnerships',
    8: 'Transformation',
    9: 'Philosophy, Travel',
    10: 'Career, Status',
    11: 'Friends, Goals',
    12: 'Spirituality, Secrets',
};

export function HousesTable({ houses }: HousesTableProps) {
    // Sort houses by house number
    const sortedHouses = [...houses].sort((a, b) => a.house - b.house);

    return (
        <div className="rounded-2xl overflow-hidden border border-white/10 backdrop-blur-sm">
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent px-6 py-4 border-b border-white/10">
                <h3 className="text-lg font-semibold text-white">Houses</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10 bg-white/5">
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                House
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                Sign
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider">
                                Cusp Degree
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/50 uppercase tracking-wider hidden sm:table-cell">
                                Theme
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {sortedHouses.map((house) => (
                            <tr
                                key={house.house}
                                className="hover:bg-white/5 transition-colors"
                            >
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 text-white font-semibold text-lg">
                                        {house.house}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl">{SIGN_SYMBOLS[house.sign] || ''}</span>
                                        <span className="text-white/80">{SIGN_NAMES[house.sign] || house.sign}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-white/80 font-mono">{house.pos.toFixed(2)}°</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                                    <span className="text-white/50 text-sm">
                                        {HOUSE_MEANINGS[house.house] || ''}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
