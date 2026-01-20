import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface StrengthsWeaknessesProps {
    strengths: string;
    weaknesses: string;
}

export function StrengthsWeaknesses({ strengths, weaknesses }: StrengthsWeaknessesProps) {
    // Parse bullet points from summary strings
    const parsePoints = (text: string): string[] => {
        return text.split(/[.;]/).filter(s => s.trim().length > 0).slice(0, 4);
    };

    const strengthPoints = parsePoints(strengths);
    const weaknessPoints = parsePoints(weaknesses);

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Strengths */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-xl p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-noir-900">Strengths</h3>
                </div>
                <ul className="space-y-3">
                    {strengthPoints.map((point, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + index * 0.1 }}
                            className="flex items-start gap-2 text-noir-700"
                        >
                            <span className="text-green-500 mt-1">•</span>
                            <span>{point.trim()}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>

            {/* Weaknesses */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-card rounded-xl p-6"
            >
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                        <X className="w-4 h-4 text-amber-600" />
                    </div>
                    <h3 className="font-semibold text-noir-900">Considerations</h3>
                </div>
                <ul className="space-y-3">
                    {weaknessPoints.map((point, index) => (
                        <motion.li
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.1 }}
                            className="flex items-start gap-2 text-noir-700"
                        >
                            <span className="text-amber-500 mt-1">•</span>
                            <span>{point.trim()}</span>
                        </motion.li>
                    ))}
                </ul>
            </motion.div>
        </div>
    );
}
