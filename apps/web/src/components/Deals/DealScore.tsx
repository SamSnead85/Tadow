import { motion } from 'framer-motion';

interface DealScoreProps {
    score: number;
    size?: 'sm' | 'md' | 'lg';
}

export function DealScore({ score, size = 'md' }: DealScoreProps) {
    const sizeConfig = {
        sm: { container: 'w-9 h-9', text: 'text-xs', ring: 2.5, radius: 14 },
        md: { container: 'w-12 h-12', text: 'text-sm', ring: 3, radius: 18 },
        lg: { container: 'w-16 h-16', text: 'text-lg', ring: 4, radius: 24 },
    };

    const config = sizeConfig[size];

    const getColor = (s: number) => {
        if (s >= 90) return { stroke: '#10b981', bg: 'rgba(16, 185, 129, 0.2)' }; // emerald
        if (s >= 80) return { stroke: '#0ea5e9', bg: 'rgba(14, 165, 233, 0.2)' }; // sky
        if (s >= 70) return { stroke: '#f59e0b', bg: 'rgba(245, 158, 11, 0.2)' }; // amber
        return { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.2)' }; // red
    };

    const colors = getColor(score);
    const circumference = config.radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`relative ${config.container} flex items-center justify-center rounded-full`}
            style={{ backgroundColor: colors.bg }}
        >
            <svg className="absolute inset-0 -rotate-90" viewBox="0 0 48 48">
                <circle
                    cx="24"
                    cy="24"
                    r={config.radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={config.ring}
                />
                <motion.circle
                    cx="24"
                    cy="24"
                    r={config.radius}
                    fill="none"
                    stroke={colors.stroke}
                    strokeWidth={config.ring}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                />
            </svg>
            <span className={`font-mono font-bold ${config.text} text-white relative z-10`}>
                {score}
            </span>
        </motion.div>
    );
}
