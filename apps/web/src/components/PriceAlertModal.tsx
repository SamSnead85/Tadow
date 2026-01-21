import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, TrendingDown, DollarSign, Mail, Check } from 'lucide-react';
import { addPriceAlert } from '../utils/storage';

interface PriceAlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    deal: {
        id: string;
        title: string;
        currentPrice: number;
        imageUrl?: string;
    };
}

export function PriceAlertModal({ isOpen, onClose, deal }: PriceAlertModalProps) {
    const [targetPrice, setTargetPrice] = useState(Math.floor(deal.currentPrice * 0.9));
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [notifyMethod, setNotifyMethod] = useState<'browser' | 'email'>('browser');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        addPriceAlert({
            dealId: deal.id,
            title: deal.title,
            targetPrice,
            currentPrice: deal.currentPrice,
            email: notifyMethod === 'email' ? email : undefined,
        });

        // Request push notification permission
        if (notifyMethod === 'browser' && 'Notification' in window) {
            Notification.requestPermission();
        }

        setSubmitted(true);
        setTimeout(() => {
            onClose();
            setSubmitted(false);
        }, 2000);
    };

    const suggestedPrices = [
        { label: '-10%', value: Math.floor(deal.currentPrice * 0.9) },
        { label: '-20%', value: Math.floor(deal.currentPrice * 0.8) },
        { label: '-30%', value: Math.floor(deal.currentPrice * 0.7) },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
                    >
                        <div className="glass-strong rounded-2xl p-6">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {submitted ? (
                                /* Success State */
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-8"
                                >
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Alert Set!</h3>
                                    <p className="text-zinc-400">
                                        We'll notify you when the price drops to ${targetPrice}
                                    </p>
                                </motion.div>
                            ) : (
                                /* Form */
                                <form onSubmit={handleSubmit}>
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 rounded-xl bg-amber-500/20">
                                            <Bell className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-white">Set Price Alert</h2>
                                            <p className="text-sm text-zinc-400">Get notified when price drops</p>
                                        </div>
                                    </div>

                                    {/* Product Preview */}
                                    <div className="flex gap-4 mb-6 p-4 bg-zinc-800/50 rounded-xl">
                                        {deal.imageUrl && (
                                            <img
                                                src={deal.imageUrl}
                                                alt={deal.title}
                                                className="w-16 h-16 rounded-lg object-cover"
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium text-sm line-clamp-2 mb-1">
                                                {deal.title}
                                            </h3>
                                            <div className="text-lg font-bold text-amber-400">
                                                ${deal.currentPrice.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Target Price */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                                            Alert me when price drops to:
                                        </label>
                                        <div className="flex gap-3 mb-3">
                                            {suggestedPrices.map((price) => (
                                                <button
                                                    key={price.label}
                                                    type="button"
                                                    onClick={() => setTargetPrice(price.value)}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${targetPrice === price.value
                                                            ? 'bg-amber-500 text-zinc-900'
                                                            : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                        }`}
                                                >
                                                    {price.label}
                                                    <span className="block text-xs opacity-70">${price.value}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                            <input
                                                type="number"
                                                value={targetPrice}
                                                onChange={(e) => setTargetPrice(Number(e.target.value))}
                                                className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                placeholder="Custom price"
                                            />
                                        </div>
                                        {targetPrice < deal.currentPrice && (
                                            <p className="mt-2 text-sm text-emerald-400 flex items-center gap-1">
                                                <TrendingDown className="w-4 h-4" />
                                                Save ${(deal.currentPrice - targetPrice).toLocaleString()} ({Math.round((1 - targetPrice / deal.currentPrice) * 100)}% off)
                                            </p>
                                        )}
                                    </div>

                                    {/* Notification Method */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-zinc-300 mb-3">
                                            How should we notify you?
                                        </label>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setNotifyMethod('browser')}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${notifyMethod === 'browser'
                                                        ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400'
                                                        : 'bg-zinc-800 border-2 border-transparent text-zinc-300 hover:bg-zinc-700'
                                                    }`}
                                            >
                                                <Bell className="w-4 h-4" />
                                                Browser
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setNotifyMethod('email')}
                                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2 ${notifyMethod === 'email'
                                                        ? 'bg-amber-500/20 border-2 border-amber-500 text-amber-400'
                                                        : 'bg-zinc-800 border-2 border-transparent text-zinc-300 hover:bg-zinc-700'
                                                    }`}
                                            >
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </button>
                                        </div>
                                    </div>

                                    {/* Email Input */}
                                    {notifyMethod === 'email' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-6"
                                        >
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                                                    placeholder="Enter your email"
                                                    required={notifyMethod === 'email'}
                                                />
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Submit */}
                                    <button
                                        type="submit"
                                        className="w-full btn-primary justify-center py-3"
                                    >
                                        <Bell className="w-4 h-4" />
                                        Set Price Alert
                                    </button>
                                </form>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
