import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    TrendingDown, Flame, ArrowRight, Sparkles,
    Eye, Bell, ArrowUpDown, Grid, List
} from 'lucide-react';
import { DealCard, MarketplaceFilter, QuickViewModal } from '../components/Deals';
import { DealGridSkeleton, FilterSkeleton } from '../components/Skeleton';

interface Deal {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    originalPrice: number;
    currentPrice: number;
    discountPercent: number;
    category: string;
    brand: string;
    condition: string;
    dealScore: number;
    aiVerdict: string;
    priceVsAverage: number;
    isHot: boolean;
    isFeatured: boolean;
    isAllTimeLow: boolean;
    pricePrediction?: 'rising' | 'falling' | 'stable';
    fakeReviewRisk: number;
    reviewQualityScore: number;
    city: string;
    state: string;
    sellerName: string;
    sellerRating: number;
    sellerReviews: number;
    isVerifiedSeller: boolean;
    marketplace: { id: string; name: string; color: string; };
}

interface Marketplace {
    id: string;
    name: string;
    color: string;
    _count: { deals: number };
}

interface Category {
    id: string;
    name: string;
    slug: string;
    icon: string;
}

const techCategories = ['Electronics', 'Laptops', 'Phones', 'TVs', 'Gaming'];

const sortOptions = [
    { value: 'score', label: 'Best Score' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'discount', label: 'Biggest Discount' },
    { value: 'recent', label: 'Most Recent' },
];

export function DealsPage() {
    const [hotDeals, setHotDeals] = useState<Deal[]>([]);
    const [allDeals, setAllDeals] = useState<Deal[]>([]);
    const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [sortBy, setSortBy] = useState('score');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(true);
    const [quickViewDeal, setQuickViewDeal] = useState<Deal | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [selectedMarketplaces, selectedCategory]);

    const fetchData = async () => {
        try {
            const { ALL_DEALS, getTrending } = await import('../data/extendedDeals');

            const normalizeDeal = (deal: any) => ({
                ...deal,
                discountPercent: deal.discount || deal.discountPercent,
                sellerName: deal.seller?.name || deal.sellerName || 'Unknown',
                sellerRating: deal.seller?.rating || deal.sellerRating || 0,
                sellerReviews: deal.seller?.reviews || deal.sellerReviews || 0,
                isVerifiedSeller: deal.seller?.verified || deal.isVerifiedSeller || false,
                city: deal.location?.city || deal.city,
                state: deal.location?.state || deal.state,
                marketplace: deal.marketplace || { name: deal.source || 'Unknown', color: '#888' },
            });

            try {
                const hotRes = await fetch('/api/deals/hot');
                if (hotRes.ok) {
                    const hotData = await hotRes.json();
                    setHotDeals((hotData.deals || hotData || []).map(normalizeDeal));
                } else {
                    throw new Error('API unavailable');
                }
            } catch {
                setHotDeals(getTrending(12) as Deal[]);
            }

            try {
                let dealsUrl = '/api/deals?limit=50';
                if (selectedCategory) dealsUrl += `&category=${selectedCategory}`;
                if (selectedMarketplaces.length) dealsUrl += `&marketplaces=${selectedMarketplaces.join(',')}`;
                const dealsRes = await fetch(dealsUrl);
                if (dealsRes.ok) {
                    const dealsData = await dealsRes.json();
                    setAllDeals((dealsData.deals || []).map(normalizeDeal));
                } else {
                    throw new Error('API unavailable');
                }
            } catch {
                let deals = [...ALL_DEALS];
                if (selectedCategory) {
                    deals = deals.filter(d => d.category === selectedCategory);
                }
                setAllDeals(deals as Deal[]);
            }

            try {
                const mpRes = await fetch('/api/marketplaces');
                const mpData = await mpRes.json();
                setMarketplaces(mpData);
            } catch {
                setMarketplaces([
                    { id: 'amazon', name: 'Amazon', color: '#FF9900', _count: { deals: 5 } },
                    { id: 'bestbuy', name: 'Best Buy', color: '#0046BE', _count: { deals: 3 } },
                    { id: 'apple', name: 'Apple', color: '#555555', _count: { deals: 3 } },
                ]);
            }

            try {
                const catRes = await fetch('/api/categories');
                const catData = await catRes.json();
                setCategories(catData.filter((c: Category) => techCategories.includes(c.name)));
            } catch {
                setCategories([
                    { id: 'laptops', name: 'Laptops', slug: 'laptops', icon: '💻' },
                    { id: 'phones', name: 'Phones', slug: 'phones', icon: '📱' },
                    { id: 'gaming', name: 'Gaming', slug: 'gaming', icon: '🎮' },
                    { id: 'audio', name: 'Audio', slug: 'audio', icon: '🎧' },
                    { id: 'tvs', name: 'TVs', slug: 'tvs', icon: '📺' },
                ]);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching deals:', error);
            setLoading(false);
        }
    };



    const handleMarketplaceChange = (marketplaceIds: string[]) => {
        setSelectedMarketplaces(marketplaceIds);
    };

    const handleQuickView = (deal: any) => {
        setQuickViewDeal(deal);
        setIsQuickViewOpen(true);
    };

    const sortDeals = (deals: Deal[]) => {
        const sorted = [...deals];
        switch (sortBy) {
            case 'price-low':
                return sorted.sort((a, b) => a.currentPrice - b.currentPrice);
            case 'price-high':
                return sorted.sort((a, b) => b.currentPrice - a.currentPrice);
            case 'discount':
                return sorted.sort((a, b) => (b.originalPrice - b.currentPrice) - (a.originalPrice - a.currentPrice));
            case 'recent':
                return sorted.sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());
            case 'score':
            default:
                return sorted.sort((a, b) => (b.dealScore || 0) - (a.dealScore || 0));
        }
    };

    const sortedDeals = sortDeals(allDeals);
    const allTimeLowDeals = sortedDeals.filter(d => d.isAllTimeLow);

    return (
        <div className="min-h-screen bg-zinc-950">
            <QuickViewModal deal={quickViewDeal} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />

            {/* Category Pills - Sticky */}
            <section className="py-3 border-b border-zinc-800/50 sticky top-[104px] z-30 bg-zinc-950/95 backdrop-blur-md">
                <div className="container-wide">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`category-pill ${!selectedCategory ? 'category-pill-active' : 'category-pill-inactive'}`}
                        >
                            <Sparkles className="w-4 h-4" /> All
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.name)}
                                className={`category-pill ${selectedCategory === cat.name ? 'category-pill-active' : 'category-pill-inactive'}`}
                            >
                                {cat.icon} {cat.name}
                            </button>
                        ))}
                        <div className="ml-auto flex items-center gap-2">
                            <button className="btn-ghost text-xs">
                                <Bell className="w-4 h-4" />
                                Alerts
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Value Proposition Banner */}
            <section className="py-10 border-b border-zinc-800/30">
                <div className="container-wide">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Headline */}
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
                            The smartest way to find
                            <span className="text-gradient-gold"> tech deals</span>
                        </h1>

                        {/* Subtitle */}
                        <p className="text-zinc-400 text-lg mb-8 max-w-2xl mx-auto">
                            AI-powered deal intelligence across every major marketplace.
                            Never overpay again.
                        </p>

                        {/* Value Props */}
                        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-violet-500/15 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                </div>
                                <span className="text-sm text-zinc-300 font-medium">AI-Powered Scoring</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center">
                                    <Flame className="w-4 h-4 text-amber-400" />
                                </div>
                                <span className="text-sm text-zinc-300 font-medium">10+ Marketplaces</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
                                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                                </div>
                                <span className="text-sm text-zinc-300 font-medium">Price History Tracking</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <div className="container-wide py-12">
                <div className="flex gap-8">
                    {/* Sidebar - Compact */}
                    <aside className="hidden lg:block w-56 flex-shrink-0">
                        <div className="sticky top-32 space-y-6">
                            {loading ? (
                                <FilterSkeleton />
                            ) : (
                                <MarketplaceFilter
                                    marketplaces={marketplaces.map(m => ({
                                        id: m.id,
                                        name: m.name,
                                        color: m.color,
                                        dealCount: m._count?.deals || 0
                                    }))}
                                    selectedIds={selectedMarketplaces}
                                    onChange={handleMarketplaceChange}
                                />
                            )}

                            {/* AI Assistant Mini */}
                            <div className="p-4 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-violet-400" />
                                    <span className="font-medium text-white text-sm">Need help?</span>
                                </div>
                                <p className="text-zinc-400 text-xs mb-3">Ask our AI to find the perfect deal</p>
                                <Link to="/assistant" className="btn-ai w-full text-xs py-2">
                                    Ask AI
                                </Link>
                            </div>
                        </div>
                    </aside>

                    {/* Deals Grid */}
                    <main className="flex-1 min-w-0 space-y-14">
                        {loading ? (
                            <DealGridSkeleton count={9} />
                        ) : (
                            <>
                                {/* Hot Deals Section */}
                                {hotDeals.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <Flame className="w-5 h-5 text-orange-500" />
                                                <h2 className="text-lg font-semibold text-white">Hot Deals</h2>
                                            </div>
                                            <Link to="/search?filter=hot" className="text-sm text-zinc-400 hover:text-amber-400 flex items-center gap-1">
                                                View all <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                            {hotDeals.slice(0, 6).map((deal, i) => (
                                                <motion.div
                                                    key={deal.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <DealCard deal={deal} onQuickView={handleQuickView} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* All-Time Low Section */}
                                {allTimeLowDeals.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="w-5 h-5 text-emerald-500" />
                                                <h2 className="text-lg font-semibold text-white">All-Time Lows</h2>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {allTimeLowDeals.slice(0, 3).map((deal, i) => (
                                                <motion.div
                                                    key={deal.id}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <DealCard deal={deal} onQuickView={handleQuickView} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* All Deals Section */}
                                <section>
                                    <div className="flex items-center justify-between mb-5">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-5 h-5 text-zinc-400" />
                                            <h2 className="text-lg font-semibold text-white">
                                                {selectedCategory || 'All'} Deals
                                            </h2>
                                            <span className="text-sm text-zinc-500">({sortedDeals.length})</span>
                                        </div>

                                        {/* Sort & View Controls */}
                                        <div className="flex items-center gap-2">
                                            <div className="relative">
                                                <select
                                                    value={sortBy}
                                                    onChange={(e) => setSortBy(e.target.value)}
                                                    className="appearance-none pl-3 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white cursor-pointer focus:outline-none focus:border-amber-500/50 hover:bg-zinc-700 transition-colors"
                                                >
                                                    {sortOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                <ArrowUpDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                            </div>

                                            <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => setViewMode('grid')}
                                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
                                                >
                                                    <Grid className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
                                                >
                                                    <List className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className={viewMode === 'grid'
                                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
                                        : "space-y-4"
                                    }>
                                        {sortedDeals.map((deal, i) => (
                                            <motion.div
                                                key={deal.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                            >
                                                <DealCard
                                                    deal={deal}
                                                    variant={viewMode === 'list' ? 'compact' : 'default'}
                                                    onQuickView={handleQuickView}
                                                />
                                            </motion.div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
