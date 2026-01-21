import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, Sparkles, AlertCircle, Bell, Check, ChevronRight, Clock, Zap } from 'lucide-react';
import { useState } from 'react';

interface PricePredictionProps {
    prediction: 'rising' | 'falling' | 'stable';
    currentPrice: number;
    priceHistory?: number[];
    confidence?: number;
    aiInsight?: string;
}

// AI Price Prediction Mini Widget (for deal cards)
export function PricePredictionBadge({ prediction, className = '' }: { prediction: 'rising' | 'falling' | 'stable'; className?: string }) {
    const configs = {
        rising: {
            icon: TrendingUp,
            label: 'Price Rising',
            bg: 'bg-red-500/20',
            border: 'border-red-500/30',
            text: 'text-red-400',
            hint: 'Buy Now'
        },
        falling: {
            icon: TrendingDown,
            label: 'Price Dropping',
            bg: 'bg-emerald-500/20',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            hint: 'Wait'
        },
        stable: {
            icon: Minus,
            label: 'Price Stable',
            bg: 'bg-zinc-500/20',
            border: 'border-zinc-500/30',
            text: 'text-zinc-400',
            hint: 'Hold'
        }
    };

    const config = configs[prediction];
    const Icon = config.icon;

    return (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 ${config.bg} border ${config.border} rounded-full ${className}`}>
            <Icon className={`w-3 h-3 ${config.text}`} />
            <span className={`text-xs font-medium ${config.text}`}>{config.hint}</span>
        </div>
    );
}

// AI Price Prediction Full Widget
export function PricePredictionWidget({ prediction, currentPrice, priceHistory, confidence = 85, aiInsight }: PricePredictionProps) {
    const configs = {
        rising: {
            icon: TrendingUp,
            label: 'Price Expected to Rise',
            bg: 'from-red-500/10 to-orange-500/10',
            border: 'border-red-500/20',
            text: 'text-red-400',
            action: 'Buy Now',
            actionBg: 'bg-red-500 hover:bg-red-400'
        },
        falling: {
            icon: TrendingDown,
            label: 'Price Expected to Drop',
            bg: 'from-emerald-500/10 to-teal-500/10',
            border: 'border-emerald-500/20',
            text: 'text-emerald-400',
            action: 'Set Alert',
            actionBg: 'bg-emerald-500 hover:bg-emerald-400'
        },
        stable: {
            icon: Minus,
            label: 'Price Stable',
            bg: 'from-zinc-500/10 to-slate-500/10',
            border: 'border-zinc-500/20',
            text: 'text-zinc-400',
            action: 'Track',
            actionBg: 'bg-zinc-600 hover:bg-zinc-500'
        }
    };

    const config = configs[prediction];
    const Icon = config.icon;

    // Calculate price change from history
    const priceChange = priceHistory && priceHistory.length > 1
        ? ((currentPrice - priceHistory[0]) / priceHistory[0] * 100).toFixed(0)
        : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-xl bg-gradient-to-br ${config.bg} border ${config.border}`}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center`}>
                        <Sparkles className="w-4 h-4 text-violet-400" />
                    </div>
                    <div>
                        <span className="text-xs text-zinc-500 uppercase tracking-wider">AI Prediction</span>
                        <div className={`font-semibold ${config.text} flex items-center gap-1.5`}>
                            <Icon className="w-4 h-4" />
                            {config.label}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-zinc-500">Confidence</div>
                    <div className="font-bold text-white">{confidence}%</div>
                </div>
            </div>

            {/* Price History Mini Chart */}
            {priceHistory && priceHistory.length > 0 && (
                <div className="mb-3 p-2 bg-zinc-900/50 rounded-lg">
                    <div className="flex items-end justify-between h-12 gap-1">
                        {priceHistory.map((price, i) => {
                            const max = Math.max(...priceHistory);
                            const min = Math.min(...priceHistory);
                            const height = max === min ? 50 : ((price - min) / (max - min) * 80 + 20);
                            const isLast = i === priceHistory.length - 1;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: i * 0.1 }}
                                        className={`w-full rounded-t ${isLast ? 'bg-amber-500' : 'bg-zinc-700'}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-1 text-xs text-zinc-500">
                        <span>${priceHistory[0]}</span>
                        <span>→</span>
                        <span className={priceChange && parseInt(priceChange) < 0 ? 'text-emerald-400' : 'text-white'}>
                            ${currentPrice} {priceChange && `(${parseInt(priceChange) > 0 ? '+' : ''}${priceChange}%)`}
                        </span>
                    </div>
                </div>
            )}

            {/* AI Insight */}
            {aiInsight && (
                <p className="text-sm text-zinc-400 mb-3 italic">"{aiInsight}"</p>
            )}

            {/* Action Button */}
            <button className={`w-full py-2 px-4 rounded-lg ${config.actionBg} text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2`}>
                {prediction === 'falling' ? <Bell className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                {config.action}
            </button>
        </motion.div>
    );
}

// Deal Alert Signup Widget
export function DealAlertWidget({ productName: _productName, currentPrice }: { productName: string; currentPrice: number }) {
    const [targetPrice, setTargetPrice] = useState(Math.floor(currentPrice * 0.9));
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        setSubscribed(true);
    };

    if (subscribed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <div className="font-semibold text-white">Alert Set!</div>
                        <div className="text-sm text-zinc-400">
                            We'll notify you when price drops to ${targetPrice}
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20"
        >
            <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-violet-400" />
                <span className="font-semibold text-white text-sm">Price Drop Alert</span>
            </div>

            <form onSubmit={handleSubscribe} className="space-y-3">
                <div>
                    <label className="text-xs text-zinc-500 mb-1 block">Alert me when price drops to:</label>
                    <div className="flex items-center gap-2">
                        <span className="text-zinc-400">$</span>
                        <input
                            type="number"
                            value={targetPrice}
                            onChange={e => setTargetPrice(Number(e.target.value))}
                            className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-violet-500/50"
                        />
                    </div>
                    <div className="text-xs text-zinc-500 mt-1">
                        Current: ${currentPrice} • Target: {Math.round((1 - targetPrice / currentPrice) * 100)}% off
                    </div>
                </div>

                <div>
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:border-violet-500/50"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-violet-500 hover:bg-violet-400 text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                    <Bell className="w-4 h-4" />
                    Set Price Alert
                </button>
            </form>
        </motion.div>
    );
}

// Quick Price Insights Bar
export function PriceInsightsBar({
    avgDiscount,
    allTimeLowCount,
    priceDropCount,
    totalDeals
}: {
    avgDiscount: number;
    allTimeLowCount: number;
    priceDropCount: number;
    totalDeals: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 md:gap-8 py-3 px-4 bg-zinc-900/50 border-y border-zinc-800/50"
        >
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs md:text-sm text-zinc-400">{totalDeals} deals live</span>
            </div>
            <div className="h-4 w-px bg-zinc-800" />
            <div className="flex items-center gap-1.5 text-emerald-400">
                <TrendingDown className="w-4 h-4" />
                <span className="text-xs md:text-sm font-medium">{avgDiscount}% avg savings</span>
            </div>
            <div className="h-4 w-px bg-zinc-800 hidden md:block" />
            <div className="hidden md:flex items-center gap-1.5 text-sky-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">{allTimeLowCount} all-time lows</span>
            </div>
            <div className="h-4 w-px bg-zinc-800 hidden lg:block" />
            <div className="hidden lg:flex items-center gap-1.5 text-amber-400">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{priceDropCount} price drops today</span>
            </div>
        </motion.div>
    );
}

// AI Recommendation Card
export function AIRecommendationCard({
    title,
    description,
    deals,
    icon
}: {
    title: string;
    description: string;
    deals: any[];
    icon: React.ReactNode;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10 hover:border-violet-500/30 transition-colors group cursor-pointer"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                        {icon}
                    </div>
                    <div>
                        <div className="font-semibold text-white text-sm">{title}</div>
                        <div className="text-xs text-zinc-500">{deals.length} deals</div>
                    </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
            </div>
            <p className="text-xs text-zinc-400">{description}</p>
        </motion.div>
    );
}
