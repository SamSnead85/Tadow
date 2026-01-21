import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ExternalLink, TrendingDown, Clock, Bell, ArrowRight } from 'lucide-react';
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '../utils/storage';
import { PriceAlertModal } from '../components/PriceAlertModal';

export function WatchlistPage() {
    const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDeal, setSelectedDeal] = useState<WatchlistItem | null>(null);
    const [alertModalOpen, setAlertModalOpen] = useState(false);

    useEffect(() => {
        const items = getWatchlist();
        setWatchlist(items);
        setLoading(false);
    }, []);

    const handleRemove = (dealId: string) => {
        removeFromWatchlist(dealId);
        setWatchlist(prev => prev.filter(item => item.dealId !== dealId));
    };

    const openAlertModal = (item: WatchlistItem) => {
        setSelectedDeal(item);
        setAlertModalOpen(true);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            {/* Price Alert Modal */}
            {selectedDeal && (
                <PriceAlertModal
                    isOpen={alertModalOpen}
                    onClose={() => setAlertModalOpen(false)}
                    deal={{
                        id: selectedDeal.dealId,
                        title: selectedDeal.title,
                        currentPrice: selectedDeal.currentPrice,
                        imageUrl: selectedDeal.imageUrl,
                    }}
                />
            )}

            <div className="container-wide">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Your Watchlist
                        </h1>
                        <p className="text-zinc-400">
                            {watchlist.length} saved {watchlist.length === 1 ? 'deal' : 'deals'}
                        </p>
                    </div>

                    {watchlist.length > 0 && (
                        <Link to="/deals" className="btn-primary">
                            Browse More Deals
                            <ArrowRight className="w-4 h-4" />
                        </Link>
                    )}
                </div>

                {/* Empty State */}
                {watchlist.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                            <Heart className="w-12 h-12 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">
                            No saved deals yet
                        </h2>
                        <p className="text-zinc-400 max-w-md mx-auto mb-8">
                            Start exploring deals and tap the heart icon to save ones you're interested in.
                            They'll appear here for easy access.
                        </p>
                        <Link to="/deals" className="btn-primary inline-flex">
                            <TrendingDown className="w-4 h-4" />
                            Explore Deals
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {watchlist.map((item, i) => (
                                <motion.div
                                    key={item.dealId}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="deal-card p-4"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-24 h-24 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                                            {item.imageUrl ? (
                                                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Heart className="w-8 h-8 text-zinc-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-white line-clamp-2 mb-2">{item.title}</h3>
                                            <div className="flex items-baseline gap-2 mb-2">
                                                <span className="text-xl font-bold text-white">${item.currentPrice.toLocaleString()}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                                <span className="px-2 py-0.5 bg-zinc-800 rounded">{item.marketplace}</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(item.savedAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                                        <Link to={`/deal/${item.dealId}`} className="btn-secondary text-sm">
                                            <ExternalLink className="w-3 h-3" />
                                            View Deal
                                        </Link>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => openAlertModal(item)}
                                                className="p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                                                title="Set Price Alert"
                                            >
                                                <Bell className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRemove(item.dealId)}
                                                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                                                title="Remove"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
