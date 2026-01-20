import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
    Search, Zap, TrendingDown, Flame, ArrowRight, Sparkles, Clock,
    Eye, ChevronRight, Star, Shield, Bell, Target, BarChart3, ArrowUpRight
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
    pricePrediction: string;
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

const aiInsights = [
    { icon: Target, label: 'Best Time to Buy', value: 'Now', color: 'text-emerald-400' },
    { icon: BarChart3, label: 'Market Trend', value: '↓ Prices Dropping', color: 'text-sky-400' },
    { icon: Shield, label: 'Verified Deals', value: '94%', color: 'text-violet-400' },
];

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
            const hotRes = await fetch('/api/deals/hot');
            const hotData = await hotRes.json();
            setHotDeals(hotData);

            let dealsUrl = '/api/deals?limit=20';
            if (selectedCategory) dealsUrl += `&category=${selectedCategory}`;
            if (selectedMarketplaces.length) dealsUrl += `&marketplaces=${selectedMarketplaces.join(',')}`;
            const dealsRes = await fetch(dealsUrl);
            const dealsData = await dealsRes.json();
            setAllDeals(dealsData.deals || []);

            const mpRes = await fetch('/api/marketplaces');
            const mpData = await mpRes.json();
            setMarketplaces(mpData);

            const catRes = await fetch('/api/categories');
            const catData = await catRes.json();
            setCategories(catData.filter((c: Category) => techCategories.includes(c.name)));

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

    const handleQuickView = (deal: Deal) => {
        setQuickViewDeal(deal);
        setIsQuickViewOpen(true);
    };

    const allTimeLowDeals = allDeals.filter(d => d.isAllTimeLow);
    const featuredDeals = allDeals.filter(d => d.isFeatured).slice(0, 1);
    const totalSavings = allDeals.reduce((acc, d) => acc + (d.originalPrice - d.currentPrice), 0);

    return (
        <div className="min-h-screen bg-zinc-950">
            <QuickViewModal deal={quickViewDeal} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />

            {/* Hero Section */}
            <section
                ref={heroRef}
                className="relative py-20 pb-16 overflow-hidden"
                style={{ '--mouse-x': `${mousePosition.x}%`, '--mouse-y': `${mousePosition.y}%` } as React.CSSProperties}
            >
                {/* Ambient Background */}
                <div className="hero-gradient" />
                <div className="ambient-glow inset-0" />

                <div className="container-wide relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        {/* AI Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 border border-violet-500/30 rounded-full mb-8"
                        >
                            <div className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
                            <span className="text-violet-300 text-sm font-medium">AI-Powered Deal Intelligence</span>
                            <Sparkles className="w-4 h-4 text-violet-400" />
                        </motion.div>

                        {/* Headline */}
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
                            Find incredible
                            <span className="block text-gradient-mint">tech deals</span>
                        </h1>

                        <p className="text-zinc-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
                            Our AI searches 7+ marketplaces, analyzes prices, and curates the best deals—
                            so you never overpay again.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-12">
                            <div className="relative group">
                                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 opacity-0 group-focus-within:opacity-100 blur-xl transition-opacity duration-500" />
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-400 transition-colors" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search laptops, phones, TVs, gaming gear..."
                                        className="search-hero"
                                    />
                                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 btn-primary">
                                        <Zap className="w-4 h-4" />
                                        Search
                                    </button>
                                </div>
                            </div>
                        </form>

                        {/* AI Insights Bar */}
                        <div className="flex items-center justify-center gap-6 flex-wrap mb-8">
                            {aiInsights.map((insight, i) => (
                                <motion.div
                                    key={insight.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-2.5 px-4 py-2 bg-zinc-900/60 border border-zinc-800/60 rounded-full"
                                >
                                    <insight.icon className={`w-4 h-4 ${insight.color}`} />
                                    <span className="text-zinc-500 text-sm">{insight.label}:</span>
                                    <span className={`text-sm font-semibold ${insight.color}`}>{insight.value}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-12 text-sm">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-center"
                            >
                                <div className="text-3xl font-bold text-white mb-1">{allDeals.length || 28}+</div>
                                <div className="text-zinc-500">Active Deals</div>
                            </motion.div>
                            <div className="w-px h-10 bg-zinc-800" />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center"
                            >
                                <div className="text-3xl font-bold text-emerald-400 mb-1">
                                    ${totalSavings > 0 ? Math.floor(totalSavings / 1000) : 15}K+
                                </div>
                                <div className="text-zinc-500">Total Savings</div>
                            </motion.div>
                            <div className="w-px h-10 bg-zinc-800" />
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="text-center"
                            >
                                <div className="text-3xl font-bold text-violet-400 mb-1">7</div>
                                <div className="text-zinc-500">Marketplaces</div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Featured Deal Banner */}
            {featuredDeals.length > 0 && (
                <section className="py-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-cyan-500/10 border-y border-emerald-500/20">
                    <div className="container-wide">
                        <Link to={`/deal/${featuredDeals[0].id}`} className="flex items-center justify-center gap-4 group">
                            <span className="badge badge-deal">Featured Deal</span>
                            <span className="text-white font-medium group-hover:text-emerald-300 transition-colors">
                                {featuredDeals[0].title}
                            </span>
                            <span className="text-emerald-400 font-bold">
                                ${featuredDeals[0].currentPrice}
                            </span>
                            <span className="badge badge-savings">
                                -{featuredDeals[0].discountPercent}%
                            </span>
                            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
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

            {/* Main Content */}
            <div className="container-wide py-10">
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
                                        <span className="text-emerald-400 font-semibold">32%</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400 text-sm">Best Today</span>
                                        <span className="text-emerald-400 font-semibold">-75%</span>
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
                                                <p className="text-zinc-500 text-sm">{allDeals.length} results found</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                                        {allDeals.map((deal, i) => (
                                            <motion.div
                                                key={deal.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                                            >
                                                <DealCard deal={deal} onQuickView={handleQuickView} />
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
