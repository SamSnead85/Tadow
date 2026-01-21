import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Mail, X, Zap, CheckCircle, Sparkles } from 'lucide-react';

interface PriceAlertSignupProps {
    dealTitle?: string;
    dealId?: string;
    currentPrice?: number;
    variant?: 'inline' | 'modal' | 'banner';
    onClose?: () => void;
}

export function PriceAlertSignup({ dealTitle, dealId, currentPrice, variant = 'inline', onClose }: PriceAlertSignupProps) {
    const [email, setEmail] = useState('');
    const [targetPrice, setTargetPrice] = useState(currentPrice ? Math.round(currentPrice * 0.9) : 0);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store locally for demo
        const alerts = JSON.parse(localStorage.getItem('tadow_price_alerts') || '[]');
        alerts.push({
            id: `alert_${Date.now()}`,
            email,
            dealId,
            dealTitle,
            targetPrice,
            currentPrice,
            createdAt: new Date().toISOString()
        });
        localStorage.setItem('tadow_price_alerts', JSON.stringify(alerts));

        setIsSubmitting(false);
        setIsSubmitted(true);
    };

    if (variant === 'banner') {
        return (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/20 rounded-xl p-6">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-white">Never miss a price drop</h3>
                            <p className="text-zinc-400 text-sm">Get instant alerts when prices fall on your favorite tech</p>
                        </div>
                    </div>
                    {isSubmitted ? (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="flex items-center gap-2 text-emerald-400"
                        >
                            <CheckCircle className="w-5 h-5" />
                            <span>You're subscribed!</span>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleSubmit} className="flex gap-2 w-full lg:w-auto">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="flex-1 lg:w-64 px-4 py-2.5 bg-zinc-900/80 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
                            />
                            <motion.button
                                type="submit"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg flex items-center gap-2 disabled:opacity-50"
                            >
                                {isSubmitting ? (
                                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Zap className="w-4 h-4" />
                                        Subscribe
                                    </>
                                )}
                            </motion.button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    if (variant === 'modal') {
        return (
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                    <Bell className="w-5 h-5 text-amber-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">Set Price Alert</h3>
                            </div>
                            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {dealTitle && (
                            <div className="mb-4 p-3 bg-zinc-800/50 rounded-lg">
                                <p className="text-sm text-zinc-400">Alert for:</p>
                                <p className="text-white font-medium truncate">{dealTitle}</p>
                                {currentPrice && (
                                    <p className="text-amber-400 text-sm mt-1">Current: ${currentPrice.toLocaleString()}</p>
                                )}
                            </div>
                        )}

                        {isSubmitted ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center py-8"
                            >
                                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
                                <h4 className="text-xl font-semibold text-white mb-2">Alert Created!</h4>
                                <p className="text-zinc-400">We'll email you when the price drops to ${targetPrice.toLocaleString()} or below.</p>
                            </motion.div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1.5">Your email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            required
                                            className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
                                        />
                                    </div>
                                </div>

                                {currentPrice && (
                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-1.5">Alert me when price drops to</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                                            <input
                                                type="number"
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(Number(e.target.value))}
                                                className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
                                            />
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {Math.round((1 - targetPrice / currentPrice) * 100)}% below current price
                                        </p>
                                    </div>
                                )}

                                <motion.button
                                    type="submit"
                                    disabled={isSubmitting}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isSubmitting ? (
                                        <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <Sparkles className="w-4 h-4" />
                                            Create Alert
                                        </>
                                    )}
                                </motion.button>
                            </form>
                        )}
                    </motion.div>
                </motion.div>
            </AnimatePresence>
        );
    }

    // Inline variant (default)
    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Get Price Drop Alerts</span>
            </div>
            {isSubmitted ? (
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>Alert created!</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white placeholder-zinc-500 focus:border-amber-500 outline-none"
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg text-sm disabled:opacity-50"
                    >
                        {isSubmitting ? '...' : 'Alert'}
                    </button>
                </form>
            )}
        </div>
    );
}

// Email capture banner for homepage
export function EmailCaptureBanner() {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        // Store for demo
        const subscribers = JSON.parse(localStorage.getItem('tadow_subscribers') || '[]');
        subscribers.push({ email, subscribedAt: new Date().toISOString() });
        localStorage.setItem('tadow_subscribers', JSON.stringify(subscribers));

        setIsSubmitted(true);
    };

    if (isSubmitted) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center"
            >
                <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <p className="text-white font-semibold">Welcome to Tadow!</p>
                <p className="text-zinc-400 text-sm">You'll get the best deals in your inbox weekly.</p>
            </motion.div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-violet-500/10 via-transparent to-amber-500/10 border border-zinc-800 rounded-xl p-6">
            <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-white mb-2">Get Weekly Deal Drops 🔥</h3>
                <p className="text-zinc-400 text-sm">Curated tech deals delivered to your inbox. No spam, unsubscribe anytime.</p>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="flex-1 px-4 py-3 bg-zinc-900 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:border-amber-500 outline-none"
                />
                <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-lg whitespace-nowrap"
                >
                    Subscribe Free
                </motion.button>
            </form>
        </div>
    );
}
