import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Coins, Gift, Check, Clock,
    TrendingUp, Sparkles, ChevronDown
} from 'lucide-react';

// Cashback data structure
interface CashbackOffer {
    id: string;
    retailer: string;
    retailerLogo?: string;
    cashbackPercent: number;
    maxCashback?: number;
    category: string;
    expiresAt?: string;
    terms?: string;
    isStackable: boolean;
    activated: boolean;
}

// Mock cashback offers
const CASHBACK_OFFERS: CashbackOffer[] = [
    { id: '1', retailer: 'Amazon', cashbackPercent: 3, category: 'Electronics', isStackable: true, activated: false },
    { id: '2', retailer: 'Best Buy', cashbackPercent: 5, maxCashback: 50, category: 'Electronics', isStackable: true, activated: false },
    { id: '3', retailer: 'Walmart', cashbackPercent: 2, category: 'General', isStackable: false, activated: false },
    { id: '4', retailer: 'Target', cashbackPercent: 4, category: 'General', isStackable: true, activated: false },
    { id: '5', retailer: 'Newegg', cashbackPercent: 6, maxCashback: 100, category: 'Tech', expiresAt: '2026-02-01', isStackable: true, activated: false },
    { id: '6', retailer: 'B&H Photo', cashbackPercent: 4.5, category: 'Electronics', isStackable: true, activated: false },
];

interface CashbackWidgetProps {
    retailer?: string;
    dealPrice?: number;
}

export function CashbackWidget({ retailer, dealPrice }: CashbackWidgetProps) {
    const [activated, setActivated] = useState(false);
    const [showDetails, setShowDetails] = useState(false);

    const offer = retailer ? CASHBACK_OFFERS.find(o => o.retailer.toLowerCase() === retailer.toLowerCase()) : null;

    if (!offer) {
        return (
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-zinc-500">
                    <Coins className="w-5 h-5" />
                    <span className="text-sm">Cashback not available for this retailer</span>
                </div>
            </div>
        );
    }

    const estimatedCashback = dealPrice ? Math.min(
        (dealPrice * offer.cashbackPercent / 100),
        offer.maxCashback || Infinity
    ) : null;

    return (
        <motion.div
            className={`border rounded-xl overflow-hidden transition-colors ${activated
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-zinc-900/60 border-zinc-800'
                }`}
        >
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <Coins className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <h4 className="text-white font-medium">Tadow Cashback</h4>
                            <p className="text-sm text-emerald-400">{offer.cashbackPercent}% back at {offer.retailer}</p>
                        </div>
                    </div>
                    {estimatedCashback && (
                        <div className="text-right">
                            <div className="text-lg font-bold text-emerald-400">+${estimatedCashback.toFixed(2)}</div>
                            <div className="text-xs text-zinc-500">estimated</div>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setActivated(!activated)}
                    className={`w-full py-2.5 rounded-lg font-medium transition-all ${activated
                        ? 'bg-emerald-600 text-white'
                        : 'bg-emerald-500 hover:bg-emerald-400 text-black'
                        }`}
                >
                    {activated ? (
                        <span className="flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" /> Cashback Activated
                        </span>
                    ) : (
                        <span className="flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4" /> Activate Cashback
                        </span>
                    )}
                </button>

                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className="w-full mt-2 flex items-center justify-center gap-1 text-xs text-zinc-500 hover:text-white"
                >
                    Terms & conditions
                    <ChevronDown className={`w-3 h-3 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                    {showDetails && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-400 space-y-1"
                        >
                            {offer.maxCashback && <p>• Maximum cashback: ${offer.maxCashback}</p>}
                            {offer.expiresAt && <p>• Offer expires: {new Date(offer.expiresAt).toLocaleDateString()}</p>}
                            <p>• {offer.isStackable ? 'Stackable with other offers' : 'Cannot be combined with other offers'}</p>
                            <p>• Cashback credited within 30-60 days after purchase</p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Cashback Dashboard
export function CashbackDashboard() {
    const [offers, setOffers] = useState(CASHBACK_OFFERS);
    const [filter, setFilter] = useState<'all' | 'activated'>('all');

    const toggleActivate = (id: string) => {
        setOffers(offers.map(o => o.id === id ? { ...o, activated: !o.activated } : o));
    };

    // Stats
    const stats = {
        totalEarned: 127.45,
        pending: 23.80,
        activeOffers: offers.filter(o => o.activated).length,
    };

    const filteredOffers = filter === 'all' ? offers : offers.filter(o => o.activated);

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                        <Coins className="w-4 h-4" />
                        Total Earned
                    </div>
                    <div className="text-2xl font-bold text-emerald-400">${stats.totalEarned}</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                        <Clock className="w-4 h-4" />
                        Pending
                    </div>
                    <div className="text-2xl font-bold text-amber-400">${stats.pending}</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-zinc-400 text-sm mb-1">
                        <TrendingUp className="w-4 h-4" />
                        Active Offers
                    </div>
                    <div className="text-2xl font-bold text-white">{stats.activeOffers}</div>
                </div>
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'all' ? 'bg-amber-500 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}
                >
                    All Offers ({offers.length})
                </button>
                <button
                    onClick={() => setFilter('activated')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === 'activated' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
                        }`}
                >
                    Activated ({stats.activeOffers})
                </button>
            </div>

            {/* Offers Grid */}
            <div className="grid md:grid-cols-2 gap-4">
                {filteredOffers.map(offer => (
                    <div
                        key={offer.id}
                        className={`border rounded-xl p-4 transition-colors ${offer.activated
                            ? 'bg-emerald-500/10 border-emerald-500/30'
                            : 'bg-zinc-900/60 border-zinc-800'
                            }`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                                    {offer.retailer[0]}
                                </div>
                                <div>
                                    <h4 className="text-white font-medium">{offer.retailer}</h4>
                                    <p className="text-xs text-zinc-500">{offer.category}</p>
                                </div>
                            </div>
                            <div className="text-xl font-bold text-emerald-400">{offer.cashbackPercent}%</div>
                        </div>

                        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3">
                            {offer.maxCashback && <span>Max ${offer.maxCashback}</span>}
                            {offer.isStackable && (
                                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">Stackable</span>
                            )}
                        </div>

                        <button
                            onClick={() => toggleActivate(offer.id)}
                            className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${offer.activated
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                : 'bg-emerald-500 text-black hover:bg-emerald-400'
                                }`}
                        >
                            {offer.activated ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Coupon Finder Widget
interface Coupon {
    code: string;
    description: string;
    discount: string;
    verified: boolean;
    successRate: number;
    expiresAt?: string;
}

export function CouponFinder({ retailer }: { retailer: string }) {
    const [coupons] = useState<Coupon[]>([
        { code: 'SAVE20', description: '20% off orders over $100', discount: '20%', verified: true, successRate: 92 },
        { code: 'FREESHIP', description: 'Free shipping on any order', discount: 'Free Ship', verified: true, successRate: 98 },
        { code: 'TECH15', description: '15% off electronics', discount: '15%', verified: false, successRate: 67 },
    ]);
    const [appliedCode, setAppliedCode] = useState<string | null>(null);

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
        setAppliedCode(code);
        setTimeout(() => setAppliedCode(null), 2000);
    };

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
                <Gift className="w-5 h-5 text-violet-400" />
                <h4 className="text-white font-medium">Available Coupons for {retailer}</h4>
            </div>

            <div className="space-y-2">
                {coupons.map((coupon, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <code className="px-2 py-0.5 bg-amber-500/20 text-amber-400 font-mono text-sm rounded">
                                    {coupon.code}
                                </code>
                                {coupon.verified && (
                                    <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded">
                                        Verified
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1">{coupon.description}</p>
                            <p className="text-[10px] text-zinc-500">{coupon.successRate}% success rate</p>
                        </div>
                        <button
                            onClick={() => copyCode(coupon.code)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${appliedCode === coupon.code
                                ? 'bg-emerald-500 text-black'
                                : 'bg-amber-500 hover:bg-amber-400 text-black'
                                }`}
                        >
                            {appliedCode === coupon.code ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                ))}
            </div>

            <p className="text-[10px] text-zinc-600 text-center mt-3">
                Coupons automatically tested • Updated daily
            </p>
        </div>
    );
}

export default { CashbackWidget, CashbackDashboard, CouponFinder };
