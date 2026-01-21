import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Filter, TrendingDown, Flame, Zap, Star, Grid, List } from 'lucide-react';
import { DealCard } from '../components/Deals';
import { showcaseDeals, dealCategories } from '../data/showcaseDeals';

const categoryIcons: Record<string, string> = {
    'Laptops': '💻',
    'Phones': '📱',
    'TVs': '📺',
    'Gaming': '🎮',
    'Audio': '🎧',
    'Electronics': '🔌',
    'Smart Home': '🏠',
    'Wearables': '⌚',
    'Cameras': '📷',
};

export function CategoryPage() {
    const { category } = useParams<{ category: string }>();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [sortBy, setSortBy] = useState('score');
    const [deals, setDeals] = useState(showcaseDeals);

    const categoryName = category?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'All';
    const categoryInfo = dealCategories.find((c: { name: string; icon: string; count: number }) =>
        c.name.toLowerCase() === categoryName.toLowerCase()
    );

    useEffect(() => {
        // Filter deals by category
        let filtered = showcaseDeals;
        if (category && category !== 'all') {
            filtered = showcaseDeals.filter(d =>
                d.category.toLowerCase() === categoryName.toLowerCase()
            );
        }

        // Sort deals
        switch (sortBy) {
            case 'price-low':
                filtered = [...filtered].sort((a, b) => a.currentPrice - b.currentPrice);
                break;
            case 'price-high':
                filtered = [...filtered].sort((a, b) => b.currentPrice - a.currentPrice);
                break;
            case 'discount':
                filtered = [...filtered].sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
                break;
            case 'score':
            default:
                filtered = [...filtered].sort((a, b) => (b.dealScore || 0) - (a.dealScore || 0));
        }

        setDeals(filtered);
    }, [category, categoryName, sortBy]);

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            <div className="container-wide">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-zinc-500 mb-6">
                    <Link to="/deals" className="hover:text-white transition-colors">Deals</Link>
                    <span>/</span>
                    <span className="text-white">{categoryName}</span>
                </div>

                {/* Category Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <Link
                            to="/deals"
                            className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-all"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-3">
                            <span className="text-4xl">{categoryIcons[categoryName] || '📦'}</span>
                            <div>
                                <h1 className="text-3xl font-bold text-white">{categoryName} Deals</h1>
                                <p className="text-zinc-400">
                                    {deals.length} {deals.length === 1 ? 'deal' : 'deals'} available
                                    {categoryInfo && ` • ${categoryInfo.count} in stock`}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm">
                            <TrendingDown className="w-4 h-4" />
                            {deals.filter(d => d.pricePrediction === 'falling').length} Price Drops
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-full text-red-400 text-sm">
                            <Flame className="w-4 h-4" />
                            {deals.filter(d => d.isHot).length} Hot Deals
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-sm">
                            <Star className="w-4 h-4" />
                            {deals.filter(d => d.isAllTimeLow).length} All-Time Lows
                        </div>
                    </div>
                </motion.div>

                {/* Filters Bar */}
                <div className="flex items-center justify-between mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
                    <div className="flex items-center gap-4">
                        <button className="btn-secondary text-sm">
                            <Filter className="w-4 h-4" />
                            Filters
                        </button>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-amber-500"
                        >
                            <option value="score">Best Score</option>
                            <option value="price-low">Price: Low to High</option>
                            <option value="price-high">Price: High to Low</option>
                            <option value="discount">Biggest Discount</option>
                        </select>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-800 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-amber-500 text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <Grid className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-amber-500 text-zinc-900' : 'text-zinc-400 hover:text-white'}`}
                        >
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Deals Grid */}
                {deals.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <h2 className="text-2xl font-bold text-white mb-2">No deals found</h2>
                        <p className="text-zinc-400 mb-6">Try a different category or check back later</p>
                        <Link to="/deals" className="btn-primary inline-flex">
                            <Zap className="w-4 h-4" />
                            Browse All Deals
                        </Link>
                    </motion.div>
                ) : (
                    <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
                        {deals.map((deal, i) => (
                            <motion.div
                                key={deal.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <DealCard
                                    deal={deal as any}
                                    variant={viewMode === 'list' ? 'compact' : 'default'}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
