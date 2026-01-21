import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Bell, Target, Search, Trash2, CheckCircle,
    PauseCircle, X, Sparkles, TrendingDown
} from 'lucide-react';
import {
    DealHunt, getDealHunts, saveDealHunt, updateDealHunt, deleteDealHunt,
    DealAlert, getDealAlerts, getUnreadAlertCount, markAlertRead,
    BuyerProfile
} from '../services/buyerIntelligence';

interface DealHuntModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialProfile?: Partial<BuyerProfile>;
    searchQuery?: string;
    category?: string;
}

export function DealHuntModal({ isOpen, onClose, initialProfile, searchQuery, category }: DealHuntModalProps) {
    const [targetPrice, setTargetPrice] = useState<string>('');
    const [minScore, setMinScore] = useState<number>(70);
    const [notifications, setNotifications] = useState({
        email: false,
        push: true,
        inApp: true,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        saveDealHunt({
            profile: {
                budget: {
                    min: 0,
                    max: targetPrice ? parseFloat(targetPrice) : 99999,
                },
                priorityFeatures: [],
                useCase: initialProfile?.useCase || 'casual',
            },
            searchQuery: searchQuery || '',
            category: category || '',
            targetPrice: targetPrice ? parseFloat(targetPrice) : undefined,
            minDealScore: minScore,
            notificationSettings: notifications,
        });

        // Request notification permission if push is enabled
        if (notifications.push && 'Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }

        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-zinc-900 rounded-2xl w-full max-w-md overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="p-6 border-b border-zinc-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-amber-500/20">
                                    <Target className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Start Deal Hunt</h2>
                                    <p className="text-sm text-zinc-500">I'll keep searching and alert you</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Search Summary */}
                        <div className="p-4 bg-zinc-800/50 rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-zinc-400 mb-2">
                                <Search className="w-4 h-4" />
                                <span>Hunting for:</span>
                            </div>
                            <p className="text-white font-medium">
                                {category || 'Any category'} {searchQuery && `• "${searchQuery}"`}
                            </p>
                        </div>

                        {/* Target Price */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Alert me when price drops to:
                            </label>
                            <div className="flex items-center gap-2">
                                <span className="text-zinc-500">$</span>
                                <input
                                    type="number"
                                    value={targetPrice}
                                    onChange={(e) => setTargetPrice(e.target.value)}
                                    placeholder="Any price"
                                    className="flex-1 p-3 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Minimum Score */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">
                                Minimum deal score: <span className="text-amber-400 font-medium">{minScore}/100</span>
                            </label>
                            <input
                                type="range"
                                min="50"
                                max="95"
                                value={minScore}
                                onChange={(e) => setMinScore(parseInt(e.target.value))}
                                className="w-full accent-amber-500"
                            />
                            <div className="flex justify-between text-xs text-zinc-500 mt-1">
                                <span>Good deals</span>
                                <span>Exceptional only</span>
                            </div>
                        </div>

                        {/* Notifications */}
                        <div>
                            <label className="block text-sm text-zinc-400 mb-3">
                                Notify me via:
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.push}
                                        onChange={(e) => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                                        className="w-4 h-4 accent-amber-500"
                                    />
                                    <span className="text-white">Push notifications</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-zinc-800/50 rounded-lg cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={notifications.inApp}
                                        onChange={(e) => setNotifications(prev => ({ ...prev, inApp: e.target.checked }))}
                                        className="w-4 h-4 accent-amber-500"
                                    />
                                    <span className="text-white">In-app alerts</span>
                                </label>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Start Hunting
                        </button>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Deal Hunt List Component
export function DealHuntList() {
    const [hunts, setHunts] = useState<DealHunt[]>([]);

    useEffect(() => {
        setHunts(getDealHunts());
    }, []);

    const handlePause = (id: string) => {
        updateDealHunt(id, { status: 'paused' });
        setHunts(getDealHunts());
    };

    const handleResume = (id: string) => {
        updateDealHunt(id, { status: 'active' });
        setHunts(getDealHunts());
    };

    const handleDelete = (id: string) => {
        deleteDealHunt(id);
        setHunts(getDealHunts());
    };

    if (hunts.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
                    <Target className="w-8 h-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No Active Hunts</h3>
                <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                    Start a deal hunt from the AI assistant and I'll keep searching for you.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {hunts.map((hunt) => (
                <motion.div
                    key={hunt.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl"
                >
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                            {hunt.status === 'active' ? (
                                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                            ) : hunt.status === 'found' ? (
                                <CheckCircle className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <PauseCircle className="w-4 h-4 text-zinc-500" />
                            )}
                            <span className={`text-xs font-medium ${hunt.status === 'active' ? 'text-emerald-400' :
                                hunt.status === 'found' ? 'text-amber-400' : 'text-zinc-500'
                                }`}>
                                {hunt.status.charAt(0).toUpperCase() + hunt.status.slice(1)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            {hunt.status === 'active' ? (
                                <button
                                    onClick={() => handlePause(hunt.id)}
                                    className="p-1 text-zinc-500 hover:text-white"
                                >
                                    <PauseCircle className="w-4 h-4" />
                                </button>
                            ) : hunt.status === 'paused' && (
                                <button
                                    onClick={() => handleResume(hunt.id)}
                                    className="p-1 text-zinc-500 hover:text-emerald-400"
                                >
                                    <Target className="w-4 h-4" />
                                </button>
                            )}
                            <button
                                onClick={() => handleDelete(hunt.id)}
                                className="p-1 text-zinc-500 hover:text-red-400"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <h3 className="font-medium text-white mb-1">
                        {hunt.category || 'Any'} {hunt.searchQuery && `• ${hunt.searchQuery}`}
                    </h3>

                    <div className="flex items-center gap-4 text-sm text-zinc-500">
                        {hunt.targetPrice && (
                            <span className="flex items-center gap-1">
                                <TrendingDown className="w-3 h-3" />
                                Under ${hunt.targetPrice}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Score ≥{hunt.minDealScore}
                        </span>
                    </div>

                    {hunt.matchedDeals.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-zinc-800">
                            <span className="text-xs text-amber-400">
                                🎯 Found {hunt.matchedDeals.length} matching deal(s)!
                            </span>
                        </div>
                    )}
                </motion.div>
            ))}
        </div>
    );
}

// Alert Badge for Navigation
export function AlertBadge() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        setCount(getUnreadAlertCount());

        // Poll for updates
        const interval = setInterval(() => {
            setCount(getUnreadAlertCount());
        }, 30000);

        return () => clearInterval(interval);
    }, []);

    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
        </span>
    );
}

// Alert Dropdown
export function AlertDropdown({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [alerts, setAlerts] = useState<DealAlert[]>([]);

    useEffect(() => {
        if (isOpen) {
            setAlerts(getDealAlerts().slice(0, 10));
        }
    }, [isOpen]);

    const handleMarkRead = (id: string) => {
        markAlertRead(id);
        setAlerts(getDealAlerts().slice(0, 10));
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden"
        >
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-medium text-white">Deal Alerts</h3>
                <button onClick={onClose} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>

            {alerts.length === 0 ? (
                <div className="p-6 text-center">
                    <Bell className="w-8 h-8 text-zinc-700 mx-auto mb-2" />
                    <p className="text-sm text-zinc-500">No alerts yet</p>
                </div>
            ) : (
                <div className="max-h-80 overflow-y-auto">
                    {alerts.map((alert) => (
                        <Link
                            key={alert.id}
                            to={`/deal/${alert.dealId}`}
                            className={`block p-4 border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors ${!alert.read ? 'bg-amber-500/5' : ''
                                }`}
                            onClick={() => handleMarkRead(alert.id)}
                        >
                            <div className="flex items-start gap-3">
                                {!alert.read && (
                                    <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-white line-clamp-2">{alert.dealTitle}</p>
                                    <div className="flex items-center gap-2 mt-1 text-xs">
                                        <span className="text-amber-400 font-medium">${alert.dealPrice}</span>
                                        <span className="text-zinc-500">Score: {alert.dealScore}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Link
                to="/account"
                className="block p-3 text-center text-sm text-amber-400 hover:bg-zinc-800/50 border-t border-zinc-800"
                onClick={onClose}
            >
                Manage Deal Hunts
            </Link>
        </motion.div>
    );
}
