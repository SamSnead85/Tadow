import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

interface ReviewSummaryProps {
    summary: string;
}

export function ReviewSummary({ summary }: ReviewSummaryProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card rounded-xl p-6"
        >
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-tadow-100 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-tadow-600" />
                </div>
                <h3 className="font-semibold text-noir-900">What Real Users Are Saying</h3>
            </div>

            <div className="relative">
                {/* Quote decoration */}
                <span className="absolute -top-2 -left-2 text-4xl text-tadow-200 font-serif">"</span>

                <p className="text-noir-700 leading-relaxed pl-4 italic">
                    {summary}
                </p>

                <span className="absolute -bottom-4 right-0 text-4xl text-tadow-200 font-serif">"</span>
            </div>

            <div className="mt-6 pt-4 border-t border-noir-100">
                <p className="text-xs text-noir-500">
                    AI-summarized from reviews across Amazon, Best Buy, and expert sources
                </p>
            </div>
        </motion.div>
    );
}
