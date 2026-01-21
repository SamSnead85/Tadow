import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface Deal {
    id: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    discountPercent: number;
    dealScore: number;
    category: string;
    brand: string;
    pricePrediction?: 'rising' | 'falling' | 'stable';
}

interface DealClusterProps {
    title: string;
    description?: string;
    deals: Deal[];
    clusterType: 'similar_products' | 'same_brand' | 'price_range' | 'trending';
}

export function DealCluster({ title, description, deals, clusterType }: DealClusterProps) {
    const [expanded, setExpanded] = useState(false);

    if (deals.length === 0) return null;

    const displayDeals = expanded ? deals : deals.slice(0, 4);

    const clusterStyles = {
        similar_products: { bg: 'from-violet-500/10 to-purple-500/10', icon: '🎯' },
        same_brand: { bg: 'from-blue-500/10 to-cyan-500/10', icon: '🏷️' },
        price_range: { bg: 'from-emerald-500/10 to-teal-500/10', icon: '💰' },
        trending: { bg: 'from-amber-500/10 to-orange-500/10', icon: '🔥' },
    };

    const style = clusterStyles[clusterType];

    return (
        <div className={`rounded-xl border border-zinc-800 overflow-hidden bg-gradient-to-br ${style.bg}`}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800/50">
                <div className="flex items-center gap-2">
                    <span className="text-lg">{style.icon}</span>
                    <div>
                        <h3 className="text-base font-semibold text-white">{title}</h3>
                        {description && <p className="text-xs text-zinc-500">{description}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">{deals.length} deals</span>
                    <Sparkles className="w-4 h-4 text-violet-400" />
                </div>
            </div>

            {/* Deal Cards */}
            <div className="p-3 grid grid-cols-2 lg:grid-cols-4 gap-3">
                {displayDeals.map((deal, i) => (
                    <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        <Link
                            to={`/deal/${deal.id}`}
                            className="block bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 rounded-lg p-3 transition-all hover:border-zinc-700 group"
                        >
                            {/* Image */}
                            <div className="aspect-square bg-zinc-800 rounded-md overflow-hidden mb-2">
                                {deal.imageUrl && (
                                    <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                )}
                            </div>

                            {/* Title */}
                            <h4 className="text-sm text-white font-medium line-clamp-2 mb-1 group-hover:text-amber-300 transition-colors">
                                {deal.title}
                            </h4>

                            {/* Price Row */}
                            <div className="flex items-center justify-between">
                                <span className="text-base font-bold text-white">${deal.currentPrice.toLocaleString()}</span>
                                <span className="text-xs text-emerald-400 font-medium">{deal.discountPercent}% off</span>
                            </div>

                            {/* Prediction Badge */}
                            {deal.pricePrediction && (
                                <div className={`mt-2 flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-full w-fit ${deal.pricePrediction === 'falling' ? 'bg-emerald-500/20 text-emerald-400' :
                                        deal.pricePrediction === 'rising' ? 'bg-red-500/20 text-red-400' :
                                            'bg-zinc-700 text-zinc-400'
                                    }`}>
                                    {deal.pricePrediction === 'falling' ? <TrendingDown className="w-3 h-3" /> :
                                        deal.pricePrediction === 'rising' ? <TrendingUp className="w-3 h-3" /> :
                                            <Minus className="w-3 h-3" />}
                                    {deal.pricePrediction === 'falling' ? 'Price dropping' :
                                        deal.pricePrediction === 'rising' ? 'Price rising' : 'Stable'}
                                </div>
                            )}
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Show More */}
            {deals.length > 4 && (
                <div className="px-4 pb-3">
                    <button
                        onClick={() => setExpanded(!expanded)}
                        className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
                    >
                        {expanded ? 'Show less' : `Show ${deals.length - 4} more`}
                        <ArrowRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
                    </button>
                </div>
            )}
        </div>
    );
}

// Generate Similar Products Cluster based on category/brand
export function generateSimilarCluster(baseDeal: Deal, allDeals: Deal[]): Deal[] {
    return allDeals
        .filter(d =>
            d.id !== baseDeal.id &&
            (d.category === baseDeal.category || d.brand === baseDeal.brand)
        )
        .sort((a, b) => b.dealScore - a.dealScore)
        .slice(0, 8);
}

// Generate Price Range Cluster
export function generatePriceRangeCluster(targetPrice: number, allDeals: Deal[], range = 0.2): Deal[] {
    const minPrice = targetPrice * (1 - range);
    const maxPrice = targetPrice * (1 + range);

    return allDeals
        .filter(d => d.currentPrice >= minPrice && d.currentPrice <= maxPrice)
        .sort((a, b) => b.dealScore - a.dealScore)
        .slice(0, 8);
}

// Generate Trending Cluster
export function generateTrendingCluster(allDeals: Deal[]): Deal[] {
    return allDeals
        .filter(d => d.pricePrediction === 'falling' || d.discountPercent >= 20)
        .sort((a, b) => b.discountPercent - a.discountPercent)
        .slice(0, 8);
}
