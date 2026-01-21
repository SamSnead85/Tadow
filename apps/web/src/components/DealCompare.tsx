import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Check, ArrowRight, Sparkles, TrendingDown, Shield, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Deal {
    id: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    originalPrice: number;
    discountPercent: number;
    dealScore: number;
    aiVerdict: string;
    brand: string;
    category: string;
    marketplace?: { name: string; color: string };
}

interface DealCompareProps {
    isOpen: boolean;
    onClose: () => void;
    initialDeals?: Deal[];
}

export function DealCompare({ isOpen, onClose, initialDeals = [] }: DealCompareProps) {
    const [deals, setDeals] = useState<Deal[]>(initialDeals.slice(0, 3));

    const removeFromCompare = (id: string) => {
        setDeals(deals.filter(d => d.id !== id));
    };

    const getBestValue = (key: 'currentPrice' | 'discountPercent' | 'dealScore') => {
        if (deals.length === 0) return null;
        if (key === 'currentPrice') {
            return deals.reduce((min, d) => d.currentPrice < min.currentPrice ? d : min, deals[0]).id;
        }
        return deals.reduce((max, d) => d[key] > max[key] ? d : max, deals[0]).id;
    };

    const bestPrice = getBestValue('currentPrice');
    const bestDiscount = getBestValue('discountPercent');
    const bestScore = getBestValue('dealScore');

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-t-2xl max-h-[80vh] overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-amber-400" />
                            <h2 className="text-lg font-semibold text-white">Compare Deals</h2>
                            <span className="text-zinc-500 text-sm">({deals.length} of 3)</span>
                        </div>
                        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Comparison Grid */}
                    <div className="p-6 overflow-x-auto">
                        {deals.length === 0 ? (
                            <div className="text-center py-16">
                                <p className="text-zinc-400 mb-4">Add deals to compare them side-by-side</p>
                                <button onClick={onClose} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-white text-sm">
                                    Browse Deals
                                </button>
                            </div>
                        ) : (
                            <div className="grid" style={{ gridTemplateColumns: `200px repeat(${deals.length}, 1fr) ${deals.length < 3 ? '1fr' : ''}` }}>
                                {/* Row Labels */}
                                <div className="space-y-4 pr-4">
                                    <div className="h-32" /> {/* Spacer for images */}
                                    <div className="py-3 text-sm text-zinc-400">Price</div>
                                    <div className="py-3 text-sm text-zinc-400">Original</div>
                                    <div className="py-3 text-sm text-zinc-400">Discount</div>
                                    <div className="py-3 text-sm text-zinc-400">Deal Score</div>
                                    <div className="py-3 text-sm text-zinc-400">AI Verdict</div>
                                    <div className="py-3 text-sm text-zinc-400">Brand</div>
                                    <div className="py-3 text-sm text-zinc-400">Marketplace</div>
                                    <div className="py-3" /> {/* Action spacer */}
                                </div>

                                {/* Deal Columns */}
                                {deals.map((deal) => (
                                    <div key={deal.id} className="space-y-4 px-4 border-l border-zinc-800">
                                        {/* Product Image & Title */}
                                        <div className="h-32 relative">
                                            <button
                                                onClick={() => removeFromCompare(deal.id)}
                                                className="absolute -top-2 -right-2 p-1 bg-zinc-800 hover:bg-red-500 rounded-full text-zinc-500 hover:text-white transition-colors z-10"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            <div className="w-full h-20 bg-zinc-800 rounded-lg mb-2 overflow-hidden">
                                                {deal.imageUrl && (
                                                    <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />
                                                )}
                                            </div>
                                            <p className="text-sm text-white font-medium line-clamp-2">{deal.title}</p>
                                        </div>

                                        {/* Price */}
                                        <div className={`py-3 ${deal.id === bestPrice ? 'bg-emerald-500/10 rounded-lg px-2 -mx-2' : ''}`}>
                                            <div className="flex items-center gap-1">
                                                <span className="text-xl font-bold text-white">${deal.currentPrice.toLocaleString()}</span>
                                                {deal.id === bestPrice && <Check className="w-4 h-4 text-emerald-400" />}
                                            </div>
                                        </div>

                                        {/* Original Price */}
                                        <div className="py-3">
                                            <span className="text-zinc-500 line-through">${deal.originalPrice.toLocaleString()}</span>
                                        </div>

                                        {/* Discount */}
                                        <div className={`py-3 ${deal.id === bestDiscount ? 'bg-amber-500/10 rounded-lg px-2 -mx-2' : ''}`}>
                                            <div className="flex items-center gap-1">
                                                <span className={`font-semibold ${deal.id === bestDiscount ? 'text-amber-400' : 'text-emerald-400'}`}>
                                                    {deal.discountPercent}% off
                                                </span>
                                                {deal.id === bestDiscount && <TrendingDown className="w-4 h-4 text-amber-400" />}
                                            </div>
                                        </div>

                                        {/* Deal Score */}
                                        <div className={`py-3 ${deal.id === bestScore ? 'bg-violet-500/10 rounded-lg px-2 -mx-2' : ''}`}>
                                            <div className="flex items-center gap-1">
                                                <span className={`font-semibold ${deal.id === bestScore ? 'text-violet-400' : 'text-white'}`}>
                                                    {deal.dealScore}/100
                                                </span>
                                                {deal.id === bestScore && <Star className="w-4 h-4 text-violet-400" />}
                                            </div>
                                        </div>

                                        {/* AI Verdict */}
                                        <div className="py-3">
                                            <span className={`text-sm font-medium ${deal.aiVerdict.includes('Incredible') ? 'text-emerald-400' :
                                                deal.aiVerdict.includes('Great') ? 'text-amber-400' : 'text-zinc-400'
                                                }`}>
                                                {deal.aiVerdict}
                                            </span>
                                        </div>

                                        {/* Brand */}
                                        <div className="py-3">
                                            <span className="text-white">{deal.brand}</span>
                                        </div>

                                        {/* Marketplace */}
                                        <div className="py-3">
                                            {deal.marketplace && (
                                                <span
                                                    className="px-2 py-1 text-xs font-medium rounded"
                                                    style={{ backgroundColor: deal.marketplace.color + '20', color: deal.marketplace.color }}
                                                >
                                                    {deal.marketplace.name}
                                                </span>
                                            )}
                                        </div>

                                        {/* Action */}
                                        <div className="py-3">
                                            <Link
                                                to={`/deal/${deal.id}`}
                                                className="w-full flex items-center justify-center gap-2 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg text-sm transition-colors"
                                            >
                                                View Deal <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}

                                {/* Add More Slot */}
                                {deals.length < 3 && (
                                    <div className="flex flex-col items-center justify-center px-4 border-l border-dashed border-zinc-700 min-h-[400px]">
                                        <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mb-3">
                                            <Plus className="w-6 h-6 text-zinc-500" />
                                        </div>
                                        <p className="text-zinc-500 text-sm text-center">Add another deal to compare</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* AI Recommendation */}
                    {deals.length >= 2 && bestScore && (
                        <div className="px-6 py-4 border-t border-zinc-800 bg-gradient-to-r from-violet-500/10 via-transparent to-amber-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
                                    <Shield className="w-5 h-5 text-violet-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-zinc-400">AI Recommendation</p>
                                    <p className="text-white font-medium">
                                        Based on price, discount, and deal score, the <span className="text-amber-400">{deals.find(d => d.id === bestScore)?.title.slice(0, 30)}...</span> offers the best overall value.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// Floating compare bar (shown when items added to compare)
export function CompareBar({ deals, onOpen, onClear }: { deals: Deal[]; onOpen: () => void; onClear: () => void }) {
    if (deals.length === 0) return null;

    return (
        <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 shadow-2xl"
        >
            <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                    {deals.slice(0, 3).map((deal) => (
                        <div key={deal.id} className="w-10 h-10 rounded-lg bg-zinc-800 border-2 border-zinc-900 overflow-hidden">
                            {deal.imageUrl && <img src={deal.imageUrl} alt="" className="w-full h-full object-cover" />}
                        </div>
                    ))}
                </div>
                <div>
                    <p className="text-white text-sm font-medium">{deals.length} deal{deals.length > 1 ? 's' : ''} to compare</p>
                    <p className="text-zinc-500 text-xs">Add up to 3 deals</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClear} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 text-sm">
                        Clear
                    </button>
                    <button onClick={onOpen} className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg text-sm flex items-center gap-1">
                        Compare <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
