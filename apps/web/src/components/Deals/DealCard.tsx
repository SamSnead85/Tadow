import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Flame, CheckCircle, TrendingDown, TrendingUp, Heart, Eye, Share2, Zap, Star, Minus } from 'lucide-react';
import { DealScore } from './DealScore';
import { isInWatchlist, addToWatchlist, removeFromWatchlist } from '../../utils/storage';

interface Deal {
    id: string;
    title: string;
    description?: string;
    imageUrl?: string;
    originalPrice?: number;
    currentPrice: number;
    discountPercent?: number;
    condition: string;
    category: string;
    brand?: string;
    dealScore?: number;
    aiVerdict?: string;
    priceVsAverage?: number;
    pricePrediction?: 'rising' | 'falling' | 'stable';
    priceHistory?: number[];
    isHot?: boolean;
    isFeatured?: boolean;
    isAllTimeLow?: boolean;
    city?: string;
    state?: string;
    sellerRating?: number;
    sellerReviews?: number;
    isVerifiedSeller?: boolean;
    postedAt?: string;
    externalUrl?: string;
    marketplace: {
        name: string;
        color?: string;
    };
}

interface DealCardProps {
    deal: Deal;
    variant?: 'default' | 'compact' | 'featured';
    onQuickView?: (deal: Deal) => void;
}

const conditionLabels: Record<string, string> = {
    'new': 'New',
    'like-new': 'Like New',
    'refurbished': 'Refurb',
    'used': 'Used',
};

export function DealCard({ deal, variant = 'default', onQuickView }: DealCardProps) {
    const [isLiked, setIsLiked] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [showSaveToast, setShowSaveToast] = useState(false);

    // Check watchlist on mount
    useEffect(() => {
        setIsLiked(isInWatchlist(deal.id));
    }, [deal.id]);

    const getTimeAgo = (dateStr?: string) => {
        if (!dateStr) return null;
        const hours = Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60));
        if (hours < 1) return 'just now';
        if (hours < 24) return `${hours}h`;
        const days = Math.floor(hours / 24);
        return `${days}d`;
    };

    const getVerdictClass = (verdict?: string) => {
        if (!verdict) return 'text-zinc-400';
        if (verdict.includes('Incredible')) return 'verdict-incredible';
        if (verdict.includes('Great')) return 'verdict-great';
        if (verdict.includes('Fair')) return 'verdict-fair';
        return 'verdict-overpriced';
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (navigator.share) {
            await navigator.share({
                title: deal.title,
                text: `Check out this deal: ${deal.title} - $${deal.currentPrice}`,
                url: window.location.origin + `/deal/${deal.id}`,
            });
        }
    };

    const handleLike = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isLiked) {
            removeFromWatchlist(deal.id);
            setIsLiked(false);
        } else {
            addToWatchlist({
                dealId: deal.id,
                title: deal.title,
                currentPrice: deal.currentPrice,
                savedAt: new Date().toISOString(),
                imageUrl: deal.imageUrl,
                marketplace: deal.marketplace.name
            });
            setIsLiked(true);
            setShowSaveToast(true);
            setTimeout(() => setShowSaveToast(false), 2000);
        }
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onQuickView?.(deal);
    };

    if (variant === 'compact') {
        return (
            <Link to={`/deal/${deal.id}`}>
                <motion.div
                    whileHover={{ y: -2 }}
                    className="deal-card flex gap-4 p-4"
                >
                    <div className="w-20 h-20 rounded-xl bg-zinc-800 overflow-hidden flex-shrink-0">
                        <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white text-sm line-clamp-2 mb-1">{deal.title}</h3>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-white">${deal.currentPrice.toLocaleString()}</span>
                            {deal.originalPrice && (
                                <span className="text-sm text-zinc-500 line-through">${deal.originalPrice.toLocaleString()}</span>
                            )}
                        </div>
                        <span className="text-xs text-zinc-500">{deal.marketplace.name}</span>
                    </div>
                    {deal.dealScore && <DealScore score={deal.dealScore} size="sm" />}
                </motion.div>
            </Link>
        );
    }

    return (
        <Link to={`/deal/${deal.id}`}>
            <motion.div
                whileHover={{ y: -6 }}
                onHoverStart={() => setShowActions(true)}
                onHoverEnd={() => setShowActions(false)}
                className={`deal-card group relative ${deal.isFeatured ? 'deal-card-featured' : ''}`}
            >
                {/* Save Toast */}
                {showSaveToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-4 py-2 bg-emerald-500 text-white text-sm font-medium rounded-lg shadow-lg"
                    >
                        ✓ Added to Watchlist
                    </motion.div>
                )}

                {/* Image */}
                <div className="aspect-[16/10] relative bg-zinc-800 overflow-hidden">
                    <img
                        src={deal.imageUrl || 'https://via.placeholder.com/400x250'}
                        alt={deal.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                        {deal.isHot && (
                            <motion.span
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="badge badge-hot"
                            >
                                <Flame className="w-3 h-3" /> HOT
                            </motion.span>
                        )}
                        {deal.isAllTimeLow && (
                            <span className="badge badge-deal">
                                <TrendingDown className="w-3 h-3" /> ALL-TIME LOW
                            </span>
                        )}
                    </div>

                    {/* Discount Badge */}
                    {deal.discountPercent && deal.discountPercent >= 10 && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-zinc-900 text-xs font-bold rounded-lg shadow-lg shadow-amber-500/25">
                            -{deal.discountPercent}%
                        </div>
                    )}

                    {/* Score */}
                    {deal.dealScore && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="absolute bottom-3 right-3"
                        >
                            <DealScore score={deal.dealScore} size="md" />
                        </motion.div>
                    )}

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: showActions ? 1 : 0, y: showActions ? 0 : 10 }}
                        className="absolute bottom-3 left-3 flex gap-2"
                    >
                        <button
                            onClick={handleQuickView}
                            className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md rounded-xl text-zinc-300 hover:text-white transition-all shadow-lg"
                            title="Quick View"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                        <button
                            onClick={handleLike}
                            className={`p-2.5 backdrop-blur-md rounded-xl transition-all shadow-lg ${isLiked ? 'bg-red-500/20 text-red-400' : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white'
                                }`}
                            title="Save"
                        >
                            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                        <button
                            onClick={handleShare}
                            className="p-2.5 bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md rounded-xl text-zinc-300 hover:text-white transition-all shadow-lg"
                            title="Share"
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </motion.div>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs mb-3">
                        <span className="badge badge-marketplace">{deal.marketplace.name}</span>
                        <span className="badge badge-condition">{conditionLabels[deal.condition] || deal.condition}</span>
                        {deal.isVerifiedSeller && (
                            <span className="flex items-center gap-1 text-amber-400">
                                <CheckCircle className="w-3 h-3" />
                            </span>
                        )}
                        {deal.sellerRating && deal.sellerRating >= 4.5 && (
                            <span className="flex items-center gap-1 text-amber-400 text-xs">
                                <Star className="w-3 h-3 fill-current" />
                                {deal.sellerRating}
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-white text-sm leading-snug line-clamp-2 mb-3 group-hover:text-amber-300 transition-colors">
                        {deal.title}
                    </h3>

                    {/* AI Verdict */}
                    {deal.aiVerdict && (
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="w-3.5 h-3.5 text-violet-400" />
                            <span className={`text-xs font-medium ${getVerdictClass(deal.aiVerdict)}`}>
                                {deal.aiVerdict}
                            </span>
                            {deal.priceVsAverage && deal.priceVsAverage < 0 && (
                                <span className="text-zinc-600 text-xs">• {Math.abs(deal.priceVsAverage)}% below avg</span>
                            )}
                        </div>
                    )}

                    {/* Price */}
                    <div className="flex items-baseline gap-3 mb-3">
                        <span className="text-2xl font-bold text-white">${deal.currentPrice.toLocaleString()}</span>
                        {deal.originalPrice && (
                            <span className="text-sm text-zinc-500 line-through">${deal.originalPrice.toLocaleString()}</span>
                        )}
                    </div>

                    {/* Price Prediction */}
                    {deal.pricePrediction && (
                        <div className="flex items-center gap-2 mb-3">
                            {deal.pricePrediction === 'rising' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
                                    <TrendingUp className="w-3 h-3 text-red-400" />
                                    <span className="text-xs font-medium text-red-400">Buy Now</span>
                                </span>
                            )}
                            {deal.pricePrediction === 'falling' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                                    <span className="text-xs font-medium text-emerald-400">Wait</span>
                                </span>
                            )}
                            {deal.pricePrediction === 'stable' && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-500/20 border border-zinc-500/30 rounded-full">
                                    <Minus className="w-3 h-3 text-zinc-400" />
                                    <span className="text-xs font-medium text-zinc-400">Stable</span>
                                </span>
                            )}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between text-xs text-zinc-500">
                        <div className="flex items-center gap-4">
                            {deal.city && deal.state && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {deal.city}, {deal.state}
                                </span>
                            )}
                            {deal.postedAt && (
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {getTimeAgo(deal.postedAt)}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
