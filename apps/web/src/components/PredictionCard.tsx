/**
 * Prediction Card Component
 * 
 * Visual "Buy Now vs Wait" recommendation with confidence
 * meter, price trajectory, and reasoning.
 */

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Clock, CheckCircle, AlertTriangle, HelpCircle, Timer, Target, Sparkles } from 'lucide-react';

interface PredictionData {
    recommendation: 'buy_now' | 'wait' | 'risky' | 'uncertain';
    recommendationReasons: string[];
    confidence: number;
    predictedPrice7d: number;
    predictedPrice30d: number;
    trend: 'rising' | 'falling' | 'stable';
    trendStrength: number;
    sellOutRisk: 'low' | 'medium' | 'high';
    sellOutProbability: number;
    modelAccuracy: number;
    bestBuyWindow?: { start: Date; end: Date };
    nextPriceDrop?: { date: Date; expectedPrice: number };
}

interface PredictionCardProps {
    currentPrice: number;
    prediction: PredictionData;
    compact?: boolean;
}

export function PredictionCard({ currentPrice, prediction, compact = false }: PredictionCardProps) {
    const getRecommendationStyle = () => {
        switch (prediction.recommendation) {
            case 'buy_now':
                return {
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/30',
                    text: 'text-emerald-400',
                    icon: CheckCircle,
                    label: 'BUY NOW',
                };
            case 'wait':
                return {
                    bg: 'bg-amber-500/10',
                    border: 'border-amber-500/30',
                    text: 'text-amber-400',
                    icon: Timer,
                    label: 'WAIT',
                };
            case 'risky':
                return {
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/30',
                    text: 'text-orange-400',
                    icon: AlertTriangle,
                    label: 'DECIDE SOON',
                };
            default:
                return {
                    bg: 'bg-zinc-500/10',
                    border: 'border-zinc-500/30',
                    text: 'text-zinc-400',
                    icon: HelpCircle,
                    label: 'UNCERTAIN',
                };
        }
    };

    const getTrendIcon = () => {
        switch (prediction.trend) {
            case 'rising':
                return <TrendingUp className="w-4 h-4 text-red-400" />;
            case 'falling':
                return <TrendingDown className="w-4 h-4 text-emerald-400" />;
            default:
                return <Minus className="w-4 h-4 text-zinc-400" />;
        }
    };

    const style = getRecommendationStyle();
    const Icon = style.icon;

    if (compact) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${style.bg} ${style.border} border`}
            >
                <Icon className={`w-4 h-4 ${style.text}`} />
                <span className={`text-sm font-semibold ${style.text}`}>{style.label}</span>
                <span className="text-xs text-zinc-500">
                    {Math.round(prediction.confidence * 100)}% confident
                </span>
            </motion.div>
        );
    }

    const price7dChange = ((prediction.predictedPrice7d - currentPrice) / currentPrice) * 100;
    const price30dChange = ((prediction.predictedPrice30d - currentPrice) / currentPrice) * 100;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl ${style.bg} ${style.border} border p-5`}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${style.bg} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${style.text}`} />
                    </div>
                    <div>
                        <div className={`text-lg font-bold ${style.text}`}>{style.label}</div>
                        <div className="text-sm text-zinc-400">AI Recommendation</div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-sm text-zinc-400">Confidence</div>
                    <div className="text-xl font-bold text-white">
                        {Math.round(prediction.confidence * 100)}%
                    </div>
                </div>
            </div>

            {/* Confidence Bar */}
            <div className="mb-5">
                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${prediction.confidence * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full ${prediction.recommendation === 'buy_now' ? 'bg-emerald-500' :
                                prediction.recommendation === 'wait' ? 'bg-amber-500' :
                                    prediction.recommendation === 'risky' ? 'bg-orange-500' :
                                        'bg-zinc-500'
                            }`}
                    />
                </div>
            </div>

            {/* Price Predictions */}
            <div className="grid grid-cols-2 gap-4 mb-5">
                <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">In 7 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                            ${prediction.predictedPrice7d.toFixed(0)}
                        </span>
                        <span className={`text-xs font-medium ${price7dChange < 0 ? 'text-emerald-400' : price7dChange > 0 ? 'text-red-400' : 'text-zinc-400'
                            }`}>
                            {price7dChange > 0 ? '+' : ''}{price7dChange.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="text-xs text-zinc-500">In 30 days</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold text-white">
                            ${prediction.predictedPrice30d.toFixed(0)}
                        </span>
                        <span className={`text-xs font-medium ${price30dChange < 0 ? 'text-emerald-400' : price30dChange > 0 ? 'text-red-400' : 'text-zinc-400'
                            }`}>
                            {price30dChange > 0 ? '+' : ''}{price30dChange.toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>

            {/* Trend & Risk */}
            <div className="flex items-center gap-4 mb-5 text-sm">
                <div className="flex items-center gap-2">
                    {getTrendIcon()}
                    <span className="text-zinc-400">
                        Price {prediction.trend === 'rising' ? 'expected to rise' :
                            prediction.trend === 'falling' ? 'may drop' : 'stable'}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${prediction.sellOutRisk === 'high' ? 'bg-red-400' :
                            prediction.sellOutRisk === 'medium' ? 'bg-amber-400' :
                                'bg-emerald-400'
                        }`} />
                    <span className="text-zinc-400">
                        {prediction.sellOutRisk === 'high' ? 'High sell-out risk' :
                            prediction.sellOutRisk === 'medium' ? 'Medium demand' :
                                'Likely in stock'}
                    </span>
                </div>
            </div>

            {/* Reasons */}
            <div className="space-y-2">
                {prediction.recommendationReasons.slice(1, 4).map((reason, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                        <Sparkles className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />
                        <span className="text-zinc-300">{reason}</span>
                    </div>
                ))}
            </div>

            {/* Model Accuracy */}
            <div className="mt-4 pt-4 border-t border-zinc-800">
                <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Model accuracy: {Math.round(prediction.modelAccuracy * 100)}%
                    </span>
                    <span>Based on historical data</span>
                </div>
            </div>
        </motion.div>
    );
}

/**
 * Inline Buy/Wait Badge
 */
export function BuyWaitBadge({
    recommendation,
    confidence,
}: {
    recommendation: 'buy_now' | 'wait' | 'risky' | 'uncertain';
    confidence: number;
}) {
    const styles = {
        buy_now: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
        wait: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
        risky: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        uncertain: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30',
    };

    const labels = {
        buy_now: '✓ Buy Now',
        wait: '⏳ Wait',
        risky: '⚡ Act Fast',
        uncertain: '? Uncertain',
    };

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${styles[recommendation]}`}>
            {labels[recommendation]}
            <span className="opacity-70">{Math.round(confidence * 100)}%</span>
        </span>
    );
}
