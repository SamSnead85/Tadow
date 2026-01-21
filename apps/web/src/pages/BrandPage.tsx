import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Tag, TrendingDown, Grid, List } from 'lucide-react';
import { DealCard, QuickViewModal } from '../components/Deals';
import { DealGridSkeleton } from '../components/Skeleton';

// Brand metadata with colors and logos
const BRAND_META: Record<string, { color: string; description: string }> = {
    'Apple': { color: 'from-gray-800/30 to-gray-900/30', description: 'MacBooks, iPhones, iPads, Apple Watch, and accessories' },
    'Samsung': { color: 'from-blue-900/30 to-indigo-900/30', description: 'Galaxy phones, tablets, TVs, and smart home devices' },
    'Sony': { color: 'from-slate-800/30 to-slate-900/30', description: 'PlayStation, headphones, cameras, and TVs' },
    'Microsoft': { color: 'from-blue-800/30 to-blue-900/30', description: 'Xbox, Surface, and software products' },
    'Google': { color: 'from-blue-600/20 to-green-600/20', description: 'Pixel phones, Nest devices, and wearables' },
    'Dell': { color: 'from-blue-700/30 to-blue-800/30', description: 'XPS laptops, monitors, and business solutions' },
    'HP': { color: 'from-cyan-800/30 to-blue-800/30', description: 'Spectre, Omen gaming, and enterprise laptops' },
    'Lenovo': { color: 'from-red-800/30 to-red-900/30', description: 'ThinkPad, Legion gaming, and IdeaPad notebooks' },
    'ASUS': { color: 'from-slate-700/30 to-slate-800/30', description: 'ROG gaming, ZenBook, and components' },
    'LG': { color: 'from-red-700/30 to-red-800/30', description: 'OLED TVs, monitors, and home appliances' },
    'Bose': { color: 'from-zinc-700/30 to-zinc-800/30', description: 'Premium headphones, speakers, and sound systems' },
    'Nintendo': { color: 'from-red-600/30 to-red-700/30', description: 'Switch consoles and gaming accessories' },
    'DJI': { color: 'from-slate-600/30 to-slate-700/30', description: 'Drones, gimbals, and action cameras' },
    'Dyson': { color: 'from-purple-700/30 to-purple-800/30', description: 'Vacuums, air purifiers, and hair care' },
};

export function BrandPage() {
    const { brand } = useParams<{ brand: string }>();
    const navigate = useNavigate();
    const [deals, setDeals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [sortBy, setSortBy] = useState('score');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [quickViewDeal, setQuickViewDeal] = useState<any>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    const brandName = brand?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || '';
    const meta = BRAND_META[brandName] || { color: 'from-zinc-700/30 to-zinc-800/30', description: 'Browse brand deals' };

    useEffect(() => {
        const loadDeals = async () => {
            setLoading(true);
            try {
                const { getByBrand } = await import('../data/extendedDeals');
                const brandDeals = getByBrand(brandName, 50);
                setDeals(brandDeals);
            } catch (e) {
                console.error('Failed to load deals:', e);
            }
            setLoading(false);
        };
        loadDeals();
    }, [brandName]);

    const sortedDeals = [...deals].sort((a, b) => {
        switch (sortBy) {
            case 'price-low': return a.currentPrice - b.currentPrice;
            case 'price-high': return b.currentPrice - a.currentPrice;
            case 'discount': return b.discountPercent - a.discountPercent;
            default: return b.dealScore - a.dealScore;
        }
    });

    const avgDiscount = sortedDeals.length > 0
        ? Math.round(sortedDeals.reduce((acc, d) => acc + d.discountPercent, 0) / sortedDeals.length)
        : 0;

    return (
        <div className="min-h-screen bg-zinc-950">
            <QuickViewModal deal={quickViewDeal} isOpen={isQuickViewOpen} onClose={() => setIsQuickViewOpen(false)} />

            {/* Brand Hero */}
            <section className={`relative py-16 overflow-hidden bg-gradient-to-br ${meta.color}`}>
                <div className="absolute inset-0 opacity-10" style={{
                    backgroundImage: 'radial-gradient(circle at 50% 50%, white 1px, transparent 1px)',
                    backgroundSize: '32px 32px'
                }} />
                <div className="container-wide relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <button onClick={() => navigate('/deals')} className="flex items-center gap-2 text-zinc-400 hover:text-white mb-6 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> All Deals
                        </button>
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-5xl font-bold text-white mb-3">{brandName}</h1>
                                <p className="text-zinc-400 text-lg max-w-xl">{meta.description}</p>
                                <div className="flex items-center gap-4 mt-6 text-sm">
                                    <span className="px-3 py-1.5 bg-zinc-800/60 rounded-lg text-zinc-300">
                                        <Tag className="w-3 h-3 inline mr-1.5" />{sortedDeals.length} deals
                                    </span>
                                    <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg">
                                        <TrendingDown className="w-3 h-3 inline mr-1.5" />avg {avgDiscount}% off
                                    </span>
                                </div>
                            </div>
                            <div className="hidden lg:block text-right">
                                <div className="text-6xl font-bold text-white/10">{brandName.charAt(0)}</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Controls */}
            <div className="sticky top-16 z-30 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800/50 py-3">
                <div className="container-wide flex items-center justify-between">
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="appearance-none pl-3 pr-8 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
                    >
                        <option value="score">Best Score</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="discount">Biggest Discount</option>
                    </select>
                    <div className="flex items-center bg-zinc-800 rounded-lg p-1">
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>
                            <Grid className="w-4 h-4" />
                        </button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Deals */}
            <div className="container-wide py-8">
                {loading ? (
                    <DealGridSkeleton count={12} />
                ) : sortedDeals.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-zinc-400">No deals found for this brand.</p>
                        <Link to="/deals" className="text-amber-400 hover:underline mt-2 inline-block">Browse all deals →</Link>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5" : "space-y-4"}>
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
                                    onQuickView={(d) => { setQuickViewDeal(d); setIsQuickViewOpen(true); }}
                                />
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
