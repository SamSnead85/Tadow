import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ChevronRight, Laptop, Smartphone, Gamepad2, Headphones, Tv, Tablet,
    Watch, Camera, Home, Sparkles, TrendingUp
} from 'lucide-react';

// Category data with icons and stats
const CATEGORIES = [
    { id: 'laptops', name: 'Laptops', icon: Laptop, deals: 17, color: 'from-blue-500 to-indigo-500' },
    { id: 'phones', name: 'Phones', icon: Smartphone, deals: 19, color: 'from-emerald-500 to-teal-500' },
    { id: 'gaming', name: 'Gaming', icon: Gamepad2, deals: 17, color: 'from-purple-500 to-pink-500' },
    { id: 'audio', name: 'Audio', icon: Headphones, deals: 17, color: 'from-orange-500 to-red-500' },
    { id: 'tvs', name: 'TVs', icon: Tv, deals: 11, color: 'from-cyan-500 to-blue-500' },
    { id: 'tablets', name: 'Tablets', icon: Tablet, deals: 11, color: 'from-violet-500 to-purple-500' },
    { id: 'wearables', name: 'Wearables', icon: Watch, deals: 10, color: 'from-rose-500 to-pink-500' },
    { id: 'cameras', name: 'Cameras', icon: Camera, deals: 10, color: 'from-amber-500 to-yellow-500' },
    { id: 'home', name: 'Home', icon: Home, deals: 10, color: 'from-green-500 to-emerald-500' },
];

// Popular brands
const BRANDS = [
    { name: 'Apple', deals: 24, icon: '🍎' },
    { name: 'Samsung', deals: 18, icon: '📱' },
    { name: 'Sony', deals: 12, icon: '🎮' },
    { name: 'Microsoft', deals: 8, icon: '💻' },
    { name: 'Google', deals: 7, icon: '🔍' },
    { name: 'Dell', deals: 6, icon: '🖥️' },
    { name: 'LG', deals: 5, icon: '📺' },
    { name: 'Bose', deals: 4, icon: '🎧' },
    { name: 'ASUS', deals: 6, icon: '⚡' },
    { name: 'Lenovo', deals: 5, icon: '🏢' },
    { name: 'HP', deals: 4, icon: '🖨️' },
    { name: 'DJI', deals: 3, icon: '🚁' },
];

export function AllCategoriesPage() {
    const [totalDeals, setTotalDeals] = useState(0);
    const [totalBrands, setTotalBrands] = useState(0);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const { ALL_DEALS, getBrands } = await import('../data/extendedDeals');
                setTotalDeals(ALL_DEALS.length);
                setTotalBrands(getBrands().length);
            } catch { }
        };
        loadStats();
    }, []);

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Hero */}
            <section className="relative py-16 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-amber-500/10" />
                <div className="container-wide relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Browse All Categories</h1>
                        <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
                            Explore {totalDeals}+ deals across {CATEGORIES.length} categories and {totalBrands}+ brands
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Categories Grid */}
            <section className="container-wide py-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-400" /> Categories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {CATEGORIES.map((cat, i) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                        >
                            <Link
                                to={`/category/${cat.id}`}
                                className="flex items-center gap-4 p-5 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                                    <cat.icon className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white group-hover:text-amber-300 transition-colors">
                                        {cat.name}
                                    </h3>
                                    <p className="text-zinc-500 text-sm">{cat.deals} deals available</p>
                                </div>
                                <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* Popular Brands */}
            <section className="container-wide py-10">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-emerald-400" /> Popular Brands
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {BRANDS.map((brand, i) => (
                        <motion.div
                            key={brand.name}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.03 }}
                        >
                            <Link
                                to={`/brand/${brand.name.toLowerCase()}`}
                                className="flex flex-col items-center p-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-500/30 rounded-xl transition-all group text-center"
                            >
                                <span className="text-3xl mb-2">{brand.icon}</span>
                                <span className="text-white font-medium group-hover:text-amber-300 transition-colors">{brand.name}</span>
                                <span className="text-zinc-500 text-xs">{brand.deals} deals</span>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
