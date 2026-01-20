import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Heart, Share2, Bell, TrendingDown, MapPin, Star, Shield, Zap } from 'lucide-react';
import { DealScore } from './DealScore';

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
    isHot?: boolean;
    isAllTimeLow?: boolean;
    city?: string;
    state?: string;
    sellerName?: string;
    sellerRating?: number;
    sellerReviews?: number;
    isVerifiedSeller?: boolean;
    externalUrl?: string;
    marketplace: {
        name: string;
        color?: string;
    };
}

interface QuickViewModalProps {
    deal: Deal | null;
    isOpen: boolean;
    onClose: () => void;
}

export function QuickViewModal({ deal, isOpen, onClose }: QuickViewModalProps) {
    if (!deal) return null;

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
                        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    >
                        <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-10 p-2 bg-zinc-800/80 hover:bg-zinc-700 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>

                            <div className="flex flex-col md:flex-row">
                                {/* Image */}
                                <div className="md:w-1/2 relative bg-zinc-800">
                                    <img
                                        src={deal.imageUrl || 'https://via.placeholder.com/500'}
                                        alt={deal.title}
                                        className="w-full h-64 md:h-full object-cover"
                                    />

                                    {/* Badges */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        {deal.isHot && (
                                            <span className="badge badge-hot">🔥 HOT</span>
                                        )}
                                        {deal.isAllTimeLow && (
                                            <span className="badge badge-deal">
                                                <TrendingDown className="w-3 h-3" /> ALL-TIME LOW
                                            </span>
                                        )}
                                    </div>

                                    {/* Score */}
                                    {deal.dealScore && (
                                        <div className="absolute bottom-4 right-4">
                                            <DealScore score={deal.dealScore} size="lg" />
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="md:w-1/2 p-6 overflow-y-auto max-h-[60vh] md:max-h-[80vh]">
                                    {/* Header */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="badge badge-marketplace">{deal.marketplace.name}</span>
                                            <span className="badge badge-condition">{deal.condition}</span>
                                        </div>
                                        <h2 className="text-xl font-semibold text-white leading-tight">
                                            {deal.title}
                                        </h2>
                                    </div>

                                    {/* AI Verdict */}
                                    {deal.aiVerdict && (
                                        <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4">
                                            <Zap className="w-4 h-4 text-emerald-400" />
                                            <span className="text-emerald-300 text-sm font-medium">
                                                {deal.aiVerdict}
                                            </span>
                                            {deal.priceVsAverage && deal.priceVsAverage < 0 && (
                                                <span className="text-emerald-400/60 text-xs ml-auto">
                                                    {Math.abs(deal.priceVsAverage)}% below avg
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Price */}
                                    <div className="flex items-baseline gap-3 mb-4">
                                        <span className="text-3xl font-bold text-white">
                                            ${deal.currentPrice.toLocaleString()}
                                        </span>
                                        {deal.originalPrice && (
                                            <>
                                                <span className="text-lg text-zinc-500 line-through">
                                                    ${deal.originalPrice.toLocaleString()}
                                                </span>
                                                <span className="px-2 py-1 bg-emerald-500 text-zinc-900 text-sm font-bold rounded">
                                                    -{deal.discountPercent}%
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    {/* Location & Seller */}
                                    <div className="grid grid-cols-2 gap-3 mb-6">
                                        {deal.city && deal.state && (
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <MapPin className="w-4 h-4" />
                                                {deal.city}, {deal.state}
                                            </div>
                                        )}
                                        {deal.sellerRating && (
                                            <div className="flex items-center gap-2 text-sm text-zinc-400">
                                                <Star className="w-4 h-4 text-amber-400" />
                                                {deal.sellerRating} ({deal.sellerReviews} reviews)
                                            </div>
                                        )}
                                        {deal.isVerifiedSeller && (
                                            <div className="flex items-center gap-2 text-sm text-emerald-400">
                                                <Shield className="w-4 h-4" />
                                                Verified Seller
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 mb-4">
                                        <a
                                            href={deal.externalUrl || '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 btn-primary justify-center"
                                        >
                                            View Deal
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button className="btn-secondary px-3">
                                            <Heart className="w-4 h-4" />
                                        </button>
                                        <button className="btn-secondary px-3">
                                            <Share2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Price Alert */}
                                    <button className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-zinc-700 rounded-xl text-zinc-400 hover:border-sky-500/50 hover:text-sky-400 transition-colors">
                                        <Bell className="w-4 h-4" />
                                        <span className="text-sm">Get price drop alerts</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
