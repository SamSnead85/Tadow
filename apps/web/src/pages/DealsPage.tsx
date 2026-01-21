import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Zap, TrendingDown, Flame, ArrowRight, Sparkles,
    Eye, Shield, Bell, Target, BarChart3, ArrowUpDown, Grid, List, Trophy, ShoppingCart
} from 'lucide-react';
import { DealCard, MarketplaceFilter, QuickViewModal } from '../components/Deals';
import { DealGridSkeleton, FilterSkeleton } from '../components/Skeleton';
import { DealOfTheDay, TrendingCarousel } from '../components/FeaturedDeals';
import { PriceInsightsBar } from '../components/PriceIntelligence';

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
    { value: 'category', label: 'By Category' },
];

// AI Insights are now rendered inline in the trust bar

export function DealsPage() {
    const navigate = useNavigate();
    const heroRef = useRef<HTMLDivElement>(null);
    const [searchQuery, setSearchQuery] = useState('');
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
    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });

    useEffect(() => {
        fetchData();
    }, [selectedMarketplaces, selectedCategory]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (heroRef.current) {
                const rect = heroRef.current.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setMousePosition({ x, y });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const fetchData = async () => {
        try {
            // Dynamic import for extended deals database (112 products)
            const { ALL_DEALS, getTrending } = await import('../data/extendedDeals');

            // Helper to normalize deal data from API to component format
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
                // Fallback to extended deals - get trending/hot deals
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
                // Fallback to extended deals, optionally filtered by category
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
                // Fallback marketplaces
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
                // Fallback categories
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    const handleMarketplaceChange = (marketplaceIds: string[]) => {
        setSelectedMarketplaces(marketplaceIds);
    };

    const handleQuickView = (deal: any) => {
        setQuickViewDeal(deal);
        setIsQuickViewOpen(true);
    };

    // Sort deals based on selected sort option
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
            case 'category':
                return sorted.sort((a, b) => a.category.localeCompare(b.category));
            case 'score':
            default:
                return sorted.sort((a, b) => (b.dealScore || 0) - (a.dealScore || 0));
        }
    };

    const sortedDeals = sortDeals(allDeals);
    const allTimeLowDeals = sortedDeals.filter(d => d.isAllTimeLow);
    const featuredDeals = allDeals.filter(d => d.isFeatured).slice(0, 1);
    const totalSavings = allDeals.reduce((acc, d) => acc + (d.originalPrice - d.currentPrice), 0);

    return (
        <div className="min-h-screen bg-zinc-950">
            <QuickViewModal deal={quickViewDeal} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />

            {/* Hero Section - Cutting Edge Design */}
            <section
                ref={heroRef}
                className="relative py-12 pb-10 overflow-hidden"
                style={{ '--mouse-x': `${mousePosition.x}%`, '--mouse-y': `${mousePosition.y}%` } as React.CSSProperties}
            >
                {/* Premium Ambient Background */}
                <div className="hero-gradient" />
                <div className="ambient-glow inset-0" />

                {/* Animated grid overlay for premium feel */}
                <div className="absolute inset-0 opacity-[0.015]" style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '64px 64px'
                }} />

                <div className="container-wide relative z-10">
                    {/* Two-column layout: Left content, Right visual */}
                    <div className="grid lg:grid-cols-12 gap-8 items-center">
                        {/* Left: Hero Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:col-span-7 text-left"
                        >
                            {/* Trust Bar - Compact inline */}
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="flex items-center gap-4 mb-6 flex-wrap"
                            >
                                <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                    <span className="font-medium text-emerald-400">LIVE</span>
                                    Scanning deals now
                                </div>
                                <div className="w-px h-4 bg-zinc-700" />
                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                    <Shield className="w-3 h-3 text-amber-400" />
                                    <span><span className="text-amber-400 font-semibold">94%</span> Verified</span>
                                </div>
                                <div className="w-px h-4 bg-zinc-700" />
                                <div className="flex items-center gap-1 text-xs text-zinc-500">
                                    <BarChart3 className="w-3 h-3 text-sky-400" />
                                    <span className="text-sky-400">Prices dropping</span>
                                </div>
                            </motion.div>

                            {/* Headline - Tighter, more impactful */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-[1.1]">
                                Never overpay for
                                <span className="block bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 bg-clip-text text-transparent">
                                    tech again
                                </span>
                            </h1>

                            <p className="text-zinc-400 text-lg mb-6 max-w-xl leading-relaxed">
                                AI-powered price intelligence across 7 marketplaces. Find all-time lows,
                                track price drops, and buy at the perfect moment.
                            </p>

                            {/* Search Bar - Prominent */}
                            <form onSubmit={handleSearch} className="max-w-xl mb-6">
                                <div className="relative group">
                                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-amber-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-5 w-5 h-5 text-zinc-500 group-focus-within:text-amber-400 transition-colors" />
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder='Try "MacBook Pro under $1500" or "best gaming laptop"'
                                            className="w-full pl-14 pr-28 py-4 bg-zinc-900/80 border border-zinc-700/60 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 text-base"
                                        />
                                        <button type="submit" className="absolute right-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-900 font-semibold rounded-xl hover:from-amber-400 hover:to-yellow-300 transition-all flex items-center gap-2">
                                            <Zap className="w-4 h-4" />
                                            Search
                                        </button>
                                    </div>
                                </div>
                            </form>

                            {/* Quick search suggestions */}
                            <div className="flex items-center gap-2 flex-wrap mb-8">
                                <span className="text-zinc-600 text-sm">Popular:</span>
                                {['MacBook Air M3', 'RTX 4070', 'AirPods Pro', 'OLED TV'].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => setSearchQuery(term)}
                                        className="px-3 py-1.5 text-xs bg-zinc-800/60 hover:bg-zinc-700/60 border border-zinc-700/40 hover:border-amber-500/30 text-zinc-400 hover:text-amber-300 rounded-lg transition-all"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>

                            {/* Compact Stats Row */}
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/20 to-yellow-500/20 flex items-center justify-center">
                                        <Target className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-white">{allDeals.length || 28}+</div>
                                        <div className="text-zinc-500 text-xs">Live Deals</div>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-zinc-800" />
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                                        <TrendingDown className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-emerald-400">${totalSavings > 0 ? Math.floor(totalSavings / 1000) : 15}K+</div>
                                        <div className="text-zinc-500 text-xs">Saved by users</div>
                                    </div>
                                </div>
                                <div className="w-px h-10 bg-zinc-800" />
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-violet-400" />
                                    </div>
                                    <div>
                                        <div className="text-xl font-bold text-violet-400">7</div>
                                        <div className="text-zinc-500 text-xs">Marketplaces</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right: Featured Deal Preview Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-5 hidden lg:block"
                        >
                            <div className="relative">
                                {/* Glow effect behind */}
                                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-amber-500/20 via-transparent to-violet-500/20 blur-2xl opacity-40" />

                                {/* Featured deal card preview */}
                                <div className="relative bg-zinc-900/80 backdrop-blur-sm border border-zinc-700/50 rounded-2xl p-5 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-900 text-xs font-bold rounded-full">
                                            <Trophy className="w-3 h-3" /> DEAL OF THE DAY
                                        </span>
                                        <span className="text-xs text-zinc-500">Ends in 4h 32m</span>
                                    </div>

                                    {featuredDeals.length > 0 ? (
                                        <Link to={`/deal/${featuredDeals[0].id}`} className="block group">
                                            <div className="flex items-start gap-4">
                                                <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                                    {featuredDeals[0].imageUrl ? (
                                                        <img src={featuredDeals[0].imageUrl} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <ShoppingCart className="w-8 h-8 text-zinc-600" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-white font-medium line-clamp-2 group-hover:text-amber-300 transition-colors">
                                                        {featuredDeals[0].title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1.5">
                                                        <span className="text-xl font-bold text-emerald-400">${featuredDeals[0].currentPrice}</span>
                                                        <span className="text-zinc-500 line-through text-sm">${featuredDeals[0].originalPrice}</span>
                                                        {featuredDeals[0].discountPercent && featuredDeals[0].discountPercent > 0 && featuredDeals[0].discountPercent <= 99 && (
                                                            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">
                                                                -{featuredDeals[0].discountPercent}%
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ) : (
                                        <div className="flex items-start gap-4">
                                            <div className="w-20 h-20 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0">
                                                <ShoppingCart className="w-8 h-8 text-zinc-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-white font-medium">MacBook Air M3 15" - 256GB</h4>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-xl font-bold text-emerald-400">$1,049</span>
                                                    <span className="text-zinc-500 line-through text-sm">$1,299</span>
                                                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded">-19%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Verdict mini */}
                                    <div className="flex items-center gap-2 p-3 bg-violet-500/10 border border-violet-500/20 rounded-xl">
                                        <Sparkles className="w-4 h-4 text-violet-400" />
                                        <span className="text-sm text-violet-300">AI says: <span className="font-semibold text-white">Great time to buy</span></span>
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        to="/deals"
                                        className="flex items-center justify-center gap-2 w-full py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl text-white font-medium transition-all group"
                                    >
                                        View All Deals
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Featured Deal Banner */}
            {featuredDeals.length > 0 && (
                <section className="py-4 bg-gradient-to-r from-amber-500/10 via-yellow-400/10 to-amber-500/10 border-y border-amber-500/20">
                    <div className="container-wide">
                        <Link to={`/deal/${featuredDeals[0].id}`} className="flex items-center justify-center gap-4 group">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-yellow-400 text-zinc-900 text-xs font-bold rounded-full">
                                <Trophy className="w-3 h-3" /> Featured
                            </span>
                            <span className="text-white font-medium group-hover:text-amber-300 transition-colors">
                                {featuredDeals[0].title}
                            </span>
                            <span className="text-amber-400 font-bold">
                                ${featuredDeals[0].currentPrice}
                            </span>
                            {featuredDeals[0].discountPercent && featuredDeals[0].discountPercent > 0 && featuredDeals[0].discountPercent <= 99 && (
                                <span className="px-2 py-0.5 bg-amber-500 text-zinc-900 text-xs font-bold rounded">
                                    -{featuredDeals[0].discountPercent}%
                                </span>
                            )}
                            <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </section>
            )}

            {/* Categories */}
            <section className="py-4 border-b border-zinc-800/50 sticky top-16 z-30 bg-zinc-950/95 backdrop-blur-md">
                <div className="container-wide">
                    <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar pb-1">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`category-pill ${!selectedCategory ? 'category-pill-active' : 'category-pill-inactive'}`}
                        >
                            <Sparkles className="w-4 h-4" /> All Tech
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
                        <div className="ml-auto flex items-center gap-3">
                            <button className="btn-ghost text-xs">
                                <Bell className="w-4 h-4" />
                                Price Alerts
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Price Insights Bar */}
            <PriceInsightsBar
                avgDiscount={allDeals.length > 0 ? Math.round(allDeals.reduce((acc, d) => acc + (d.discountPercent || 0), 0) / allDeals.length) : 25}
                allTimeLowCount={allDeals.filter(d => d.isAllTimeLow).length || 8}
                priceDropCount={allDeals.filter(d => d.pricePrediction === 'falling').length || 12}
                totalDeals={allDeals.length || 28}
            />

            {/* Main Content */}
            <div className="container-wide py-10">
                {/* Deal of the Day - Prime Position */}
                <div className="mb-8">
                    <DealOfTheDay />
                </div>

                {/* Trending Carousel */}
                <div className="mb-10">
                    <TrendingCarousel />
                </div>

                <div className="flex gap-10">
                    {/* Sidebar */}
                    <aside className="hidden lg:block w-60 flex-shrink-0">
                        <div className="sticky top-32 space-y-6">
                            {/* AI Assistant Card */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl"
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center">
                                        <Zap className="w-4 h-4 text-white" />
                                    </div>
                                    <span className="font-semibold text-white text-sm">AI Assistant</span>
                                </div>
                                <p className="text-zinc-400 text-xs mb-3">Need help finding the perfect deal?</p>
                                <Link to="/assistant" className="btn-ai w-full text-xs py-2">
                                    <Sparkles className="w-3 h-3" />
                                    Ask AI
                                </Link>
                            </motion.div>

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

                            {/* Quick Stats */}
                            <div className="filter-section">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Savings Snapshot</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400 text-sm">Avg. Discount</span>
                                        <span className="text-amber-400 font-semibold">32%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400 text-sm">Best Today</span>
                                        <span className="text-amber-400 font-semibold">-75%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400 text-sm">All-Time Lows</span>
                                        <span className="text-sky-400 font-semibold">{allTimeLowDeals.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Deals Grid */}
                    <main className="flex-1 min-w-0 space-y-12">
                        {loading ? (
                            <DealGridSkeleton count={6} />
                        ) : (
                            <>
                                {/* Hot Deals */}
                                {hotDeals.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                                                    <Flame className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">Hot Deals</h2>
                                                    <p className="text-zinc-500 text-sm">Trending right now</p>
                                                </div>
                                            </div>
                                            <Link to="/search?filter=hot" className="btn-ghost">
                                                View All <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {hotDeals.slice(0, 6).map((deal, i) => (
                                                <motion.div
                                                    key={deal.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <DealCard deal={deal} onQuickView={handleQuickView} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* All-Time Low */}
                                {allTimeLowDeals.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                                                    <TrendingDown className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <h2 className="text-xl font-bold text-white">All-Time Low Prices</h2>
                                                    <p className="text-zinc-500 text-sm">Historically best prices</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                            {allTimeLowDeals.slice(0, 3).map((deal, i) => (
                                                <motion.div
                                                    key={deal.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                >
                                                    <DealCard deal={deal} onQuickView={handleQuickView} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* All Deals */}
                                <section>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                                                <Eye className="w-5 h-5 text-zinc-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-white">
                                                    {selectedCategory || 'All Tech'} Deals
                                                </h2>
                                                <p className="text-zinc-500 text-sm">{sortedDeals.length} results found</p>
                                            </div>
                                        </div>

                                        {/* Sort & View Controls */}
                                        <div className="flex items-center gap-3">
                                            {/* Sort Dropdown */}
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

                                            {/* View Toggle */}
                                            <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                                                <button
                                                    onClick={() => setViewMode('grid')}
                                                    className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
                                                    title="Grid view"
                                                >
                                                    <Grid className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setViewMode('list')}
                                                    className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'}`}
                                                    title="List view"
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
                                                initial={{ opacity: 0, y: 20 }}
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
