import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp, TrendingDown, Eye, Heart, Bell, Zap,
    BarChart3, PieChart, Target, Clock, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { getWatchlist, getPriceAlerts } from '../utils/storage';
import { showcaseDeals, collections, dealCategories } from '../data/showcaseDeals';

interface StatCardProps {
    label: string;
    value: string | number;
    change?: number;
    icon: React.ElementType;
    color: string;
}

function StatCard({ label, value, change, icon: Icon, color }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-5 rounded-xl"
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${color}`}>
                    <Icon className="w-5 h-5" />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(change)}%
                    </div>
                )}
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm text-zinc-500">{label}</div>
        </motion.div>
    );
}

export function AnalyticsDashboard() {
    const [watchlist, setWatchlist] = useState<ReturnType<typeof getWatchlist>>([]);
    const [alerts, setAlerts] = useState<ReturnType<typeof getPriceAlerts>>([]);
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

    useEffect(() => {
        setWatchlist(getWatchlist());
        setAlerts(getPriceAlerts());
    }, []);

    // Calculate stats
    const totalSavings = watchlist.reduce((acc, item) => {
        const deal = showcaseDeals.find(d => d.id === item.dealId);
        return acc + (deal ? deal.originalPrice - deal.currentPrice : 0);
    }, 0);

    const avgDiscount = showcaseDeals.length > 0
        ? Math.round(showcaseDeals.reduce((acc, d) => acc + d.discountPercent, 0) / showcaseDeals.length)
        : 0;

    const hotDeals = showcaseDeals.filter(d => d.isHot).length;
    const allTimeLows = showcaseDeals.filter(d => d.isAllTimeLow).length;

    // Category breakdown
    const categoryStats = dealCategories.map(cat => ({
        name: cat.name,
        count: showcaseDeals.filter(d => d.category === cat.name).length,
        icon: cat.icon,
    }));

    // Top deals by score
    const topDeals = [...showcaseDeals].sort((a, b) => b.dealScore - a.dealScore).slice(0, 5);

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            <div className="container-wide">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                        <p className="text-zinc-400">Track your savings and deal performance</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {(['7d', '30d', '90d'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setTimeRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm transition-colors ${timeRange === range
                                    ? 'bg-amber-500 text-zinc-900'
                                    : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                    }`}
                            >
                                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatCard
                        label="Total Deals"
                        value={showcaseDeals.length}
                        change={12}
                        icon={BarChart3}
                        color="bg-blue-500/20 text-blue-400"
                    />
                    <StatCard
                        label="All-Time Lows"
                        value={allTimeLows}
                        change={8}
                        icon={TrendingDown}
                        color="bg-emerald-500/20 text-emerald-400"
                    />
                    <StatCard
                        label="Hot Deals"
                        value={hotDeals}
                        change={-5}
                        icon={Zap}
                        color="bg-orange-500/20 text-orange-400"
                    />
                    <StatCard
                        label="Avg Discount"
                        value={`${avgDiscount}%`}
                        change={3}
                        icon={Target}
                        color="bg-purple-500/20 text-purple-400"
                    />
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <StatCard
                        label="Saved Deals"
                        value={watchlist.length}
                        icon={Heart}
                        color="bg-red-500/20 text-red-400"
                    />
                    <StatCard
                        label="Active Alerts"
                        value={alerts.filter(a => !a.triggered).length}
                        icon={Bell}
                        color="bg-amber-500/20 text-amber-400"
                    />
                    <StatCard
                        label="Potential Savings"
                        value={`$${totalSavings.toLocaleString()}`}
                        icon={TrendingUp}
                        color="bg-emerald-500/20 text-emerald-400"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Category Breakdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass rounded-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <PieChart className="w-5 h-5 text-amber-400" />
                            <h2 className="text-lg font-semibold text-white">Deals by Category</h2>
                        </div>
                        <div className="space-y-3">
                            {categoryStats.map((cat, i) => (
                                <div key={cat.name} className="flex items-center gap-3">
                                    <span className="text-xl">{cat.icon}</span>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-white">{cat.name}</span>
                                            <span className="text-sm text-zinc-500">{cat.count}</span>
                                        </div>
                                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${(cat.count / showcaseDeals.length) * 100}%` }}
                                                transition={{ delay: 0.2 + i * 0.05, duration: 0.5 }}
                                                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Top Deals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <Zap className="w-5 h-5 text-amber-400" />
                            <h2 className="text-lg font-semibold text-white">Top Rated Deals</h2>
                        </div>
                        <div className="space-y-4">
                            {topDeals.map((deal, i) => (
                                <div key={deal.id} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sm font-bold text-amber-400">
                                        {i + 1}
                                    </div>
                                    <img
                                        src={deal.imageUrl}
                                        alt={deal.title}
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-medium text-white truncate">{deal.title}</h3>
                                        <div className="flex items-center gap-2 text-xs text-zinc-500">
                                            <span className="text-amber-400 font-medium">{deal.dealScore}/100</span>
                                            <span>•</span>
                                            <span>{deal.discountPercent}% off</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-white">${deal.currentPrice}</div>
                                        <div className="text-xs text-zinc-500 line-through">${deal.originalPrice}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* Collections Overview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 glass rounded-xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Eye className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg font-semibold text-white">Curated Collections</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {collections.map((collection) => (
                            <div key={collection.id} className="p-4 bg-zinc-800/50 rounded-xl text-center hover:bg-zinc-800 transition-colors cursor-pointer">
                                <div className="text-3xl mb-2">{collection.icon}</div>
                                <div className="text-sm font-medium text-white mb-1">{collection.name}</div>
                                <div className="text-2xl font-bold text-amber-400">{collection.deals.length}</div>
                                <div className="text-xs text-zinc-500">deals</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Activity Timeline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 glass rounded-xl p-6"
                >
                    <div className="flex items-center gap-2 mb-6">
                        <Clock className="w-5 h-5 text-amber-400" />
                        <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                    </div>
                    {watchlist.length > 0 ? (
                        <div className="space-y-4">
                            {watchlist.slice(0, 5).map((item) => (
                                <div key={item.dealId} className="flex items-center gap-4 p-3 bg-zinc-800/30 rounded-lg">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <Heart className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-white">Saved <span className="text-amber-400">{item.title.substring(0, 40)}...</span></p>
                                        <p className="text-xs text-zinc-500">{new Date(item.savedAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-zinc-500 text-center py-8">No recent activity. Start saving deals to track your activity!</p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
