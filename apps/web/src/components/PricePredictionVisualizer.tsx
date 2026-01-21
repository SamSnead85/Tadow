import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, AlertCircle, Sparkles, Clock } from 'lucide-react';

interface PricePrediction {
    trend: 'rising' | 'falling' | 'stable';
    confidence: number;
    predictedPrice: number;
    currentPrice: number;
    bestBuyWindow: string;
    priceHistory: { price: number; date: string }[];
    factors: { factor: string; impact: 'positive' | 'negative' | 'neutral'; weight: number }[];
}

interface PricePredictionVisualizerProps {
    prediction: PricePrediction;
    dealTitle: string;
}

export function PricePredictionVisualizer({ prediction, dealTitle }: PricePredictionVisualizerProps) {
    const [showFactors, setShowFactors] = useState(false);

    const trendConfig = {
        rising: { icon: TrendingUp, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Price Rising', advice: 'Buy now before prices increase' },
        falling: { icon: TrendingDown, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Price Falling', advice: 'Wait for a better deal' },
        stable: { icon: Minus, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Price Stable', advice: 'Current price is fair' },
    };

    const trend = trendConfig[prediction.trend];
    const TrendIcon = trend.icon;
    const priceDiff = prediction.predictedPrice - prediction.currentPrice;
    const priceDiffPercent = ((priceDiff / prediction.currentPrice) * 100).toFixed(1);

    // Calculate chart bounds
    const prices = prediction.priceHistory.map(p => p.price);
    const minPrice = Math.min(...prices, prediction.predictedPrice) * 0.95;
    const maxPrice = Math.max(...prices, prediction.predictedPrice) * 1.05;
    const priceRange = maxPrice - minPrice;

    // Generate chart path
    const chartPoints = prediction.priceHistory.map((point, i) => {
        const x = (i / (prediction.priceHistory.length - 1)) * 100;
        const y = 100 - ((point.price - minPrice) / priceRange) * 100;
        return { x, y, price: point.price, date: point.date };
    });

    // Predicted point
    const predictedY = 100 - ((prediction.predictedPrice - minPrice) / priceRange) * 100;

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-violet-400" />
                        <h3 className="text-lg font-semibold text-white">AI Price Prediction</h3>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${trend.bg}`}>
                        <TrendIcon className={`w-4 h-4 ${trend.color}`} />
                        <span className={`text-sm font-medium ${trend.color}`}>{trend.label}</span>
                    </div>
                </div>
                <p className="text-sm text-zinc-400 line-clamp-1">{dealTitle}</p>
            </div>

            {/* Chart */}
            <div className="p-4">
                <div className="relative h-40 bg-zinc-900/50 rounded-lg overflow-hidden">
                    {/* Grid lines */}
                    <div className="absolute inset-0 grid grid-rows-4 gap-0">
                        {[0, 1, 2, 3].map(i => (
                            <div key={i} className="border-t border-zinc-800/50" />
                        ))}
                    </div>

                    {/* Price line */}
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                        {/* Historical line gradient */}
                        <defs>
                            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#6b7280" />
                                <stop offset="100%" stopColor="#d4a857" />
                            </linearGradient>
                            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#d4a857" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#d4a857" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Area fill */}
                        <path
                            d={`M ${chartPoints.map(p => `${p.x},${p.y}`).join(' L ')} L 100,100 L 0,100 Z`}
                            fill="url(#areaGradient)"
                        />

                        {/* Line */}
                        <path
                            d={`M ${chartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="2"
                        />

                        {/* Predicted line (dashed) */}
                        <line
                            x1={chartPoints[chartPoints.length - 1].x}
                            y1={chartPoints[chartPoints.length - 1].y}
                            x2="110"
                            y2={predictedY}
                            stroke={prediction.trend === 'falling' ? '#34d399' : prediction.trend === 'rising' ? '#f87171' : '#fbbf24'}
                            strokeWidth="2"
                            strokeDasharray="4 4"
                        />

                        {/* Current price dot */}
                        <circle
                            cx={chartPoints[chartPoints.length - 1].x}
                            cy={chartPoints[chartPoints.length - 1].y}
                            r="4"
                            fill="#d4a857"
                        />
                    </svg>

                    {/* Price labels */}
                    <div className="absolute top-2 left-2 text-xs text-zinc-500">${maxPrice.toFixed(0)}</div>
                    <div className="absolute bottom-2 left-2 text-xs text-zinc-500">${minPrice.toFixed(0)}</div>

                    {/* Current price label */}
                    <div className="absolute right-2 top-2">
                        <div className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-400 font-medium">
                            Now: ${prediction.currentPrice.toLocaleString()}
                        </div>
                    </div>

                    {/* Predicted price label */}
                    <div className="absolute right-2 bottom-2">
                        <div className={`px-2 py-1 rounded text-xs font-medium ${trend.bg} ${trend.color}`}>
                            30d: ${prediction.predictedPrice.toLocaleString()} ({priceDiff >= 0 ? '+' : ''}{priceDiffPercent}%)
                        </div>
                    </div>
                </div>
            </div>

            {/* Prediction Details */}
            <div className="px-4 pb-4 space-y-3">
                {/* Confidence & Best Buy Window */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                            <AlertCircle className="w-3 h-3" />
                            Confidence
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                    style={{ width: `${prediction.confidence}%` }}
                                />
                            </div>
                            <span className="text-sm font-medium text-white">{prediction.confidence}%</span>
                        </div>
                    </div>

                    <div className="p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs mb-1">
                            <Clock className="w-3 h-3" />
                            Best Time to Buy
                        </div>
                        <span className="text-sm font-medium text-amber-400">{prediction.bestBuyWindow}</span>
                    </div>
                </div>

                {/* AI Advice */}
                <div className={`p-3 rounded-lg ${trend.bg}`}>
                    <div className="flex items-center gap-2">
                        <Sparkles className={`w-4 h-4 ${trend.color}`} />
                        <span className={`text-sm font-medium ${trend.color}`}>{trend.advice}</span>
                    </div>
                </div>

                {/* Factors Toggle */}
                <button
                    onClick={() => setShowFactors(!showFactors)}
                    className="w-full text-left text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                    {showFactors ? '▼' : '▶'} Price factors ({prediction.factors.length})
                </button>

                {showFactors && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {prediction.factors.map((factor, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                                <span className="text-zinc-400">{factor.factor}</span>
                                <span className={`font-medium ${factor.impact === 'positive' ? 'text-emerald-400' :
                                    factor.impact === 'negative' ? 'text-red-400' : 'text-zinc-400'
                                    }`}>
                                    {factor.impact === 'positive' ? '↓' : factor.impact === 'negative' ? '↑' : '−'} {(factor.weight * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    );
}

// Helper to generate mock prediction data
export function generateMockPrediction(currentPrice: number, trend: 'rising' | 'falling' | 'stable'): PricePrediction {
    const multiplier = trend === 'falling' ? 0.92 : trend === 'rising' ? 1.08 : 1.01;
    const history = Array.from({ length: 30 }, (_, i) => ({
        price: Math.round(currentPrice * (1 + (Math.random() - 0.5) * 0.1)),
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().split('T')[0]
    }));
    history[history.length - 1].price = currentPrice;

    return {
        trend,
        confidence: Math.floor(Math.random() * 20 + 75),
        predictedPrice: Math.round(currentPrice * multiplier),
        currentPrice,
        bestBuyWindow: trend === 'falling' ? '2-3 weeks' : trend === 'rising' ? 'Now' : 'Anytime',
        priceHistory: history,
        factors: [
            { factor: 'Seasonal demand', impact: trend === 'rising' ? 'negative' : 'positive', weight: 0.35 },
            { factor: 'Inventory levels', impact: trend === 'falling' ? 'positive' : 'neutral', weight: 0.25 },
            { factor: 'Competitor pricing', impact: 'neutral', weight: 0.20 },
            { factor: 'New model release', impact: trend === 'falling' ? 'positive' : 'negative', weight: 0.20 },
        ]
    };
}
