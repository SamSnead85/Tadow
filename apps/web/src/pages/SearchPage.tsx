import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, SlidersHorizontal, X, TrendingDown, Sparkles, Grid, List, ArrowUpDown } from 'lucide-react';
import { DealCard, MarketplaceFilter, QuickViewModal } from '../components/Deals';
import { DealGridSkeleton } from '../components/Skeleton';

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

const conditions = ['All', 'New', 'Like New', 'Refurbished', 'Used'];
const sortOptions = [
    { value: 'score', label: 'Best Score' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'discount', label: 'Biggest Discount' },
    { value: 'recent', label: 'Most Recent' },
];

export function SearchPage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get('q') || '';

    const [results, setResults] = useState<Deal[]>([]);
    const [marketplaces, setMarketplaces] = useState<Marketplace[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchInput, setSearchInput] = useState(query);
    const [selectedMarketplaces, setSelectedMarketplaces] = useState<string[]>([]);
    const [selectedCondition, setSelectedCondition] = useState('All');
    const [sortBy, setSortBy] = useState('score');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [quickViewDeal, setQuickViewDeal] = useState<Deal | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    useEffect(() => {
        fetchMarketplaces();
    }, []);

    useEffect(() => {
        if (query) {
            fetchResults();
        }
    }, [query, selectedMarketplaces, selectedCondition, sortBy]);

    const fetchMarketplaces = async () => {
        try {
            const res = await fetch('/api/marketplaces');
            const data = await res.json();
            setMarketplaces(data);
        } catch (error) {
            console.error('Error fetching marketplaces:', error);
        }
    };

    const fetchResults = async () => {
        setLoading(true);
        try {
            let url = `/api/deals/search?q=${encodeURIComponent(query)}`;
            if (selectedMarketplaces.length) url += `&marketplaces=${selectedMarketplaces.join(',')}`;
            if (selectedCondition !== 'All') url += `&condition=${selectedCondition.toLowerCase().replace(' ', '-')}`;

            const res = await fetch(url);
            const data = await res.json();

            let sorted = [...(data.deals || data || [])];
            switch (sortBy) {
                case 'price-low':
                    sorted.sort((a, b) => a.currentPrice - b.currentPrice);
                    break;
                case 'price-high':
                    sorted.sort((a, b) => b.currentPrice - a.currentPrice);
                    break;
                case 'discount':
                    sorted.sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
                    break;
                case 'score':
                default:
                    sorted.sort((a, b) => (b.dealScore || 0) - (a.dealScore || 0));
            }

            setResults(sorted);
        } catch (error) {
            console.error('Error searching:', error);
        }
        setLoading(false);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchInput.trim()) {
            setSearchParams({ q: searchInput });
        }
    };

    const handleQuickView = (deal: Deal) => {
        setQuickViewDeal(deal);
        setIsQuickViewOpen(true);
    };

    const clearFilters = () => {
        setSelectedMarketplaces([]);
        setSelectedCondition('All');
        setPriceRange([0, 5000]);
    };

    const activeFiltersCount = selectedMarketplaces.length + (selectedCondition !== 'All' ? 1 : 0);
    const avgDiscount = results.length > 0
        ? Math.round(results.reduce((acc, d) => acc + (d.discountPercent || 0), 0) / results.length)
        : 0;
    const allTimeLowCount = results.filter(d => d.isAllTimeLow).length;

    return (
        <div className="min-h-screen bg-zinc-950">
            <QuickViewModal deal={quickViewDeal} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />

            {/* Search Header */}
            <section className="py-8 border-b border-zinc-800/50 bg-zinc-900/30">
                <div className="container-wide">
                    <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
                        <div className="relative">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search for products..."
                                className="w-full pl-14 pr-24 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                            />
                            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary">
                                Search
                            </button>
                        </div>
                    </form>

                    {/* Quick Stats */}
                    {results.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-6 mt-6 text-sm"
                        >
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800/50 rounded-full">
                                <span className="text-zinc-400">Results:</span>
                                <span className="font-semibold text-white">{results.length}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="text-zinc-400">Avg. Discount:</span>
                                <span className="font-semibold text-emerald-400">{avgDiscount}%</span>
                            </div>
                            {allTimeLowCount > 0 && (
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-sky-500/10 border border-sky-500/20 rounded-full">
                                    <TrendingDown className="w-4 h-4 text-sky-400" />
                                    <span className="font-semibold text-sky-400">{allTimeLowCount} All-Time Low</span>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </section>

            {/* Main Content */}
            <div className="container-wide py-8">
                <div className="flex gap-8">
                    {/* Sidebar Filters */}
                    <aside className="hidden lg:block w-60 flex-shrink-0">
                        <div className="sticky top-32 space-y-6">
                            {/* AI Summary */}
                            {results.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-4 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 border border-violet-500/20 rounded-xl"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <Sparkles className="w-4 h-4 text-violet-400" />
                                        <span className="font-semibold text-white text-sm">AI Insight</span>
                                    </div>
                                    <p className="text-zinc-400 text-xs leading-relaxed">
                                        Best value in these results is from <span className="text-violet-300">eBay</span> and <span className="text-violet-300">Swappa</span>.
                                        Consider refurbished options for 20-30% savings.
                                    </p>
                                </motion.div>
                            )}

                            <MarketplaceFilter
                                marketplaces={marketplaces.map(m => ({
                                    id: m.id,
                                    name: m.name,
                                    color: m.color,
                                    dealCount: m._count?.deals || 0
                                }))}
                                selectedIds={selectedMarketplaces}
                                onChange={setSelectedMarketplaces}
                            />

                            {/* Condition Filter */}
                            <div className="filter-section">
                                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">Condition</h4>
                                <div className="space-y-2">
                                    {conditions.map(condition => (
                                        <button
                                            key={condition}
                                            onClick={() => setSelectedCondition(condition)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCondition === condition
                                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                                                }`}
                                        >
                                            {condition}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {activeFiltersCount > 0 && (
                                <button onClick={clearFilters} className="w-full btn-ghost text-xs text-zinc-500">
                                    <X className="w-3 h-3" />
                                    Clear {activeFiltersCount} Filters
                                </button>
                            )}
                        </div>
                    </aside>

                    {/* Results */}
                    <main className="flex-1 min-w-0">
                        {/* Toolbar */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <h1 className="text-xl font-bold text-white">
                                    {query ? `Results for "${query}"` : 'All Deals'}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Sort */}
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none pl-3 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white cursor-pointer focus:outline-none focus:border-emerald-500/50"
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

                                {/* Mobile Filter Toggle */}
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="lg:hidden btn-secondary"
                                >
                                    <SlidersHorizontal className="w-4 h-4" />
                                    Filters
                                    {activeFiltersCount > 0 && (
                                        <span className="ml-1 px-1.5 py-0.5 bg-emerald-500 text-zinc-900 text-xs font-bold rounded">
                                            {activeFiltersCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Results Grid */}
                        {loading ? (
                            <DealGridSkeleton count={6} />
                        ) : results.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-10 h-10 text-zinc-600" />
                                </div>
                                <h2 className="text-xl font-bold text-white mb-2">
                                    {query ? 'No results found' : 'Start searching'}
                                </h2>
                                <p className="text-zinc-500 mb-6">
                                    {query ? "Try adjusting your search or filters" : "Enter a search term above to find deals"}
                                </p>
                                {query && (
                                    <Link to="/" className="btn-primary">
                                        Browse All Deals
                                    </Link>
                                )}
                            </div>
                        ) : (
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5'
                                : 'space-y-4'}>
                                {results.map((deal, i) => (
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
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
