/**
 * Enhanced Deal Card Component
 * 
 * Premium deal card with:
 * - AI score display with color coding
 * - Price history mini-chart
 * - Discount badge with animation
 * - Stock status indicator
 * - Quick action buttons
 * - Hover effects and animations
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ExternalLink,
    Heart,
    Share2,
    TrendingDown,
    TrendingUp,
    AlertCircle,
    Check,
    Clock,
    Sparkles,
    ChevronRight,
} from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    marketplace: string;
    marketplaceLogo?: string;
    category: string;
    brand?: string;
    externalUrl: string;

    // AI Analysis
    aiScore?: number;
    aiVerdict?: string;
    recommendation?: 'buy_now' | 'wait' | 'skip';
    insights?: string[];

    // Status
    inStock?: boolean;
    isAllTimeLow?: boolean;
    isHot?: boolean;

    // Price history for mini-chart
    priceHistory?: number[];

    // Engagement
    views?: number;
    saves?: number;
}

interface EnhancedDealCardProps {
    deal: Deal;
    onSave?: (dealId: string) => void;
    onShare?: (dealId: string) => void;
    variant?: 'default' | 'compact' | 'featured';
}

const EnhancedDealCard = ({ deal, onSave, onShare, variant = 'default' }: EnhancedDealCardProps) => {
    const [isSaved, setIsSaved] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleSave = () => {
        setIsSaved(!isSaved);
        onSave?.(deal.id);
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: deal.title,
                text: `Check out this deal: ${deal.title} for $${deal.currentPrice}`,
                url: deal.externalUrl,
            });
        }
        onShare?.(deal.id);
    };

    // Color based on AI score
    const getScoreColor = (score?: number) => {
        if (!score) return 'text-zinc-400';
        if (score >= 85) return 'text-emerald-400';
        if (score >= 70) return 'text-amber-400';
        if (score >= 50) return 'text-orange-400';
        return 'text-red-400';
    };

    const getScoreBg = (score?: number) => {
        if (!score) return 'bg-zinc-800';
        if (score >= 85) return 'bg-emerald-500/20';
        if (score >= 70) return 'bg-amber-500/20';
        if (score >= 50) return 'bg-orange-500/20';
        return 'bg-red-500/20';
    };

    const getRecommendationIcon = () => {
        switch (deal.recommendation) {
            case 'buy_now': return <Check className="w-3 h-3" />;
            case 'wait': return <Clock className="w-3 h-3" />;
            case 'skip': return <AlertCircle className="w-3 h-3" />;
            default: return null;
        }
    };

    const getRecommendationText = () => {
        switch (deal.recommendation) {
            case 'buy_now': return 'Buy Now';
            case 'wait': return 'Wait';
            case 'skip': return 'Skip';
            default: return '';
        }
    };

    if (variant === 'compact') {
        return (
            <motion.div
                whileHover={{ y: -2 }}
                className="flex items-center gap-4 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-all cursor-pointer group"
                onClick={() => window.open(deal.externalUrl, '_blank')}
            >
                {/* Image */}
                <div className="w-16 h-16 rounded-lg bg-zinc-800 overflow-hidden flex-shrink-0">
                    {deal.imageUrl && (
                        <img
                            src={deal.imageUrl}
                            alt={deal.title}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                        {deal.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-white">${deal.currentPrice}</span>
                        {deal.originalPrice && (
                            <span className="text-sm text-zinc-500 line-through">${deal.originalPrice}</span>
                        )}
                        {deal.discountPercent && deal.discountPercent > 0 && (
                            <span className="text-xs font-bold text-emerald-400">-{Math.round(deal.discountPercent)}%</span>
                        )}
                    </div>
                </div>

                {/* AI Score */}
                {deal.aiScore && (
                    <div className={`px-2 py-1 rounded-lg ${getScoreBg(deal.aiScore)} ${getScoreColor(deal.aiScore)} text-sm font-bold`}>
                        {deal.aiScore}
                    </div>
                )}

                <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors" />
            </motion.div>
        );
    }

    return (
        <motion.div
            whileHover={{ y: -4 }}
            className="relative bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group"
        >
            {/* Badges */}
            <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {deal.isAllTimeLow && (
                    <div className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <TrendingDown className="w-3 h-3" />
                        All-Time Low
                    </div>
                )}
                {deal.isHot && (
                    <div className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        🔥 Hot Deal
                    </div>
                )}
                {deal.recommendation && (
                    <div className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${deal.recommendation === 'buy_now' ? 'bg-emerald-500/20 text-emerald-400' :
                            deal.recommendation === 'wait' ? 'bg-amber-500/20 text-amber-400' :
                                'bg-red-500/20 text-red-400'
                        }`}>
                        {getRecommendationIcon()}
                        {getRecommendationText()}
                    </div>
                )}
            </div>

            {/* Action buttons */}
            <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); handleSave(); }}
                    className={`p-2 rounded-full backdrop-blur-md transition-all ${isSaved
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                        }`}
                >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); handleShare(); }}
                    className="p-2 rounded-full bg-zinc-900/80 backdrop-blur-md text-zinc-400 hover:text-white transition-all"
                >
                    <Share2 className="w-4 h-4" />
                </button>
            </div>

            {/* Image */}
            <a href={deal.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                <div className="relative aspect-video bg-zinc-800 overflow-hidden">
                    {!imageLoaded && (
                        <div className="absolute inset-0 skeleton" />
                    )}
                    {deal.imageUrl && (
                        <img
                            src={deal.imageUrl}
                            alt={deal.title}
                            onLoad={() => setImageLoaded(true)}
                            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${imageLoaded ? 'opacity-100' : 'opacity-0'
                                }`}
                        />
                    )}

                    {/* Discount overlay */}
                    {deal.discountPercent && deal.discountPercent > 0 && (
                        <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-emerald-500 text-white font-bold rounded-lg text-sm shadow-lg">
                            -{Math.round(deal.discountPercent)}% OFF
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-4">
                    {/* Marketplace */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                            {deal.marketplace}
                        </span>
                        {/* Mini price trend */}
                        {deal.priceHistory && deal.priceHistory.length > 1 && (
                            <div className="flex items-center gap-1">
                                {deal.priceHistory[deal.priceHistory.length - 1] <= deal.priceHistory[0] ? (
                                    <TrendingDown className="w-3 h-3 text-emerald-400" />
                                ) : (
                                    <TrendingUp className="w-3 h-3 text-red-400" />
                                )}
                                <MiniSparkline data={deal.priceHistory} />
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-white mb-3 line-clamp-2 group-hover:text-amber-400 transition-colors">
                        {deal.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-baseline gap-2 mb-3">
                        <span className="text-2xl font-bold text-white">${deal.currentPrice}</span>
                        {deal.originalPrice && (
                            <span className="text-sm text-zinc-500 line-through">${deal.originalPrice}</span>
                        )}
                    </div>

                    {/* AI Score and Verdict */}
                    {deal.aiScore && (
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${getScoreBg(deal.aiScore)}`}>
                                <Sparkles className={`w-3 h-3 ${getScoreColor(deal.aiScore)}`} />
                                <span className={`font-bold ${getScoreColor(deal.aiScore)}`}>{deal.aiScore}</span>
                                <span className="text-zinc-500">/100</span>
                            </div>
                            {deal.aiVerdict && (
                                <span className="text-sm text-zinc-400">{deal.aiVerdict}</span>
                            )}
                        </div>
                    )}

                    {/* Insights */}
                    {deal.insights && deal.insights.length > 0 && (
                        <p className="text-sm text-zinc-400 line-clamp-2 mb-3">
                            {deal.insights[0]}
                        </p>
                    )}

                    {/* Stock status */}
                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${deal.inStock !== false ? 'bg-emerald-400' : 'bg-red-400'}`} />
                            <span className="text-xs text-zinc-500">
                                {deal.inStock !== false ? 'In Stock' : 'Out of Stock'}
                            </span>
                        </div>

                        <motion.span
                            whileHover={{ x: 3 }}
                            className="flex items-center gap-1 text-xs text-amber-400 font-medium"
                        >
                            View Deal <ExternalLink className="w-3 h-3" />
                        </motion.span>
                    </div>
                </div>
            </a>
        </motion.div>
    );
};

/**
 * Mini Sparkline Chart
 */
const MiniSparkline = ({ data }: { data: number[] }) => {
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * 40;
        const y = 12 - ((value - min) / range) * 10;
        return `${x},${y}`;
    }).join(' ');

    return (
        <svg width="40" height="14" className="text-emerald-400">
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
};

export default EnhancedDealCard;
export { EnhancedDealCard, type Deal as EnhancedDeal };
