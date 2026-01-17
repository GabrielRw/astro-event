import type { Planet, NatalChartSubject } from '@/lib/schema';

interface SummaryCardsProps {
    planets: Planet[];
    subject: NatalChartSubject;
}

// Zodiac sign full names
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

// Gradient colors for each card
const CARD_GRADIENTS = {
    sun: 'from-amber-500/20 via-orange-500/10 to-transparent',
    moon: 'from-slate-400/20 via-blue-400/10 to-transparent',
    asc: 'from-violet-500/20 via-purple-500/10 to-transparent',
    settings: 'from-emerald-500/20 via-teal-500/10 to-transparent',
};

function SummaryCard({
    title,
    symbol,
    sign,
    degree,
    gradient,
    icon,
}: {
    title: string;
    symbol: string;
    sign: string;
    degree: number;
    gradient: string;
    icon: string;
}) {
    const signName = SIGN_NAMES[sign] || sign;
    const signSymbol = SIGN_SYMBOLS[sign] || '';

    return (
        <div className={`
      relative overflow-hidden rounded-2xl p-6
      bg-gradient-to-br ${gradient}
      border border-white/10 backdrop-blur-sm
      hover:border-white/20 transition-all duration-300
      group
    `}>
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Icon */}
            <div className="text-4xl mb-3">{icon}</div>

            {/* Title */}
            <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-2">
                {title}
            </h3>

            {/* Sign */}
            <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl">{signSymbol}</span>
                <span className="text-2xl font-semibold text-white">{signName}</span>
            </div>

            {/* Degree */}
            <p className="text-white/50 text-sm">
                {degree.toFixed(2)}° {symbol}
            </p>
        </div>
    );
}

function SettingsCard({ subject }: { subject: NatalChartSubject }) {
    return (
        <div className={`
      relative overflow-hidden rounded-2xl p-6
      bg-gradient-to-br ${CARD_GRADIENTS.settings}
      border border-white/10 backdrop-blur-sm
      hover:border-white/20 transition-all duration-300
    `}>
            <div className="text-4xl mb-3">⚙️</div>

            <h3 className="text-white/60 text-sm font-medium uppercase tracking-wider mb-3">
                Chart Settings
            </h3>

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span className="text-white/50 text-sm">House System</span>
                    <span className="text-white text-sm font-medium capitalize">
                        {subject.settings.house_system.replace('_', ' ')}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-white/50 text-sm">Zodiac</span>
                    <span className="text-white text-sm font-medium">
                        {subject.settings.zodiac_type}
                    </span>
                </div>
                {subject.name && (
                    <div className="flex justify-between">
                        <span className="text-white/50 text-sm">Name</span>
                        <span className="text-white text-sm font-medium">{subject.name}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export function SummaryCards({ planets, subject }: SummaryCardsProps) {
    const sun = planets.find(p => p.id === 'sun');
    const moon = planets.find(p => p.id === 'moon');
    const asc = planets.find(p => p.id === 'asc');

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sun && (
                <SummaryCard
                    title="Sun Sign"
                    symbol="☉"
                    sign={sun.sign}
                    degree={sun.pos}
                    gradient={CARD_GRADIENTS.sun}
                    icon="☀️"
                />
            )}
            {moon && (
                <SummaryCard
                    title="Moon Sign"
                    symbol="☽"
                    sign={moon.sign}
                    degree={moon.pos}
                    gradient={CARD_GRADIENTS.moon}
                    icon="🌙"
                />
            )}
            {asc && (
                <SummaryCard
                    title="Ascendant"
                    symbol="Asc"
                    sign={asc.sign}
                    degree={asc.pos}
                    gradient={CARD_GRADIENTS.asc}
                    icon="⬆️"
                />
            )}
            <SettingsCard subject={subject} />
        </div>
    );
}
