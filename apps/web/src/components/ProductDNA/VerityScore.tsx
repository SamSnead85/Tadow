import { motion } from 'framer-motion';
import type { ScoreBreakdown } from '@/types';

interface VerityScoreProps {
    score: number;
    breakdown: ScoreBreakdown;
    size?: 'sm' | 'md' | 'lg';
}

export function VerityScore({ score, breakdown, size = 'lg' }: VerityScoreProps) {
    const sizeConfig = {
        sm: { ring: 80, stroke: 6, text: 'text-xl' },
        md: { ring: 120, stroke: 8, text: 'text-3xl' },
        lg: { ring: 160, stroke: 10, text: 'text-4xl' },
    };

    const config = sizeConfig[size];
    const radius = (config.ring - config.stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    // Determine score color
    const getScoreColor = (s: number) => {
        if (s >= 85) return { stroke: '#22c55e', bg: 'bg-green-50', text: 'text-green-600' };
        if (s >= 70) return { stroke: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600' };
        if (s >= 50) return { stroke: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600' };
        return { stroke: '#ef4444', bg: 'bg-red-50', text: 'text-red-600' };
    };

    const colors = getScoreColor(score);

    return (
        <div className="group relative">
            {/* Score Ring */}
            <div className="score-ring" style={{ width: config.ring, height: config.ring }}>
                <svg className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx={config.ring / 2}
                        cy={config.ring / 2}
                        r={radius}
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth={config.stroke}
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx={config.ring / 2}
                        cy={config.ring / 2}
                        r={radius}
                        fill="none"
                        stroke={colors.stroke}
                        strokeWidth={config.stroke}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                </svg>

                {/* Score Number */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5, duration: 0.3 }}
                        className={`font-display font-bold ${config.text} text-noir-900`}
                    >
                        {score}
                    </motion.span>
                    <span className="text-xs text-noir-500 font-medium">/ 100</span>
                </div>
            </div>

            {/* Hover Breakdown Tooltip */}
            <div className="absolute left-full ml-4 top-0 opacity-0 group-hover:opacity-100 
                      transition-opacity duration-200 pointer-events-none z-10">
                <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    className="glass-card rounded-xl p-4 min-w-[200px] shadow-glass-lg"
                >
                    <h4 className="font-semibold text-noir-900 mb-3 text-sm">Score Breakdown</h4>
                    <div className="space-y-2">
                        {Object.entries(breakdown).map(([key, value]) => (
                            <div key={key} className="score-item">
                                <span className="score-item-label capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                <span className="score-item-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
