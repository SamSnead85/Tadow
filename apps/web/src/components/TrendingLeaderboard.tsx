import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Trophy, Medal, Crown, Star, TrendingUp, Flame,
    Users, DollarSign, Target, ChevronRight, ArrowUp
} from 'lucide-react';
import { ALL_DEALS } from '../data/extendedDeals';

// Leaderboard Types
interface LeaderboardEntry {
    rank: number;
    username: string;
    avatar?: string;
    score: number;
    change: number; // position change
    badge?: string;
}

interface TrendingDeal {
    id: string;
    title: string;
    imageUrl?: string;
    velocity: number; // saves per hour
    totalSaves: number;
    trend: 'rising' | 'hot' | 'cooling';
}

// Mock leaderboard data
const MOCK_LEADERBOARD: LeaderboardEntry[] = [
    { rank: 1, username: 'DealMaster99', score: 12450, change: 0, badge: '👑' },
    { rank: 2, username: 'SavingsQueen', score: 11200, change: 2, badge: '🔥' },
    { rank: 3, username: 'BargainHunter', score: 10890, change: -1 },
    { rank: 4, username: 'TechDealer', score: 9750, change: 1 },
    { rank: 5, username: 'SmartShopper22', score: 9200, change: -2 },
    { rank: 6, username: 'PriceWatcher', score: 8900, change: 3 },
    { rank: 7, username: 'DealSniper', score: 8500, change: 0 },
    { rank: 8, username: 'SavvySaver', score: 8100, change: -1 },
    { rank: 9, username: 'CouponKing', score: 7800, change: 2 },
    { rank: 10, username: 'BudgetBoss', score: 7500, change: 0 },
];

// Generate trending deals
function getTrendingDeals(): TrendingDeal[] {
    return ALL_DEALS
        .filter(d => d.isHot || d.discountPercent >= 25)
        .slice(0, 10)
        .map((deal, i) => ({
            id: deal.id,
            title: deal.title,
            imageUrl: deal.imageUrl,
            velocity: Math.floor(Math.random() * 50 + 10),
            totalSaves: Math.floor(Math.random() * 500 + 100),
            trend: i < 3 ? 'hot' : i < 6 ? 'rising' : 'cooling',
        }));
}

// Leaderboard Component
export function Leaderboard() {
    const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'alltime'>('week');
    const [leaderboard] = useState(MOCK_LEADERBOARD);

    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown className="w-5 h-5 text-amber-400" />;
        if (rank === 2) return <Medal className="w-5 h-5 text-zinc-300" />;
        if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="w-5 h-5 flex items-center justify-center text-zinc-500">#{rank}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Trophy className="w-6 h-6 text-amber-400" />
                    Top Savers
                </h2>
                <div className="flex gap-1 bg-zinc-800 rounded-lg p-1">
                    {(['today', 'week', 'month', 'alltime'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${timeRange === range
                                    ? 'bg-amber-500 text-black'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {range === 'alltime' ? 'All Time' : range.charAt(0).toUpperCase() + range.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
                {/* Top 3 */}
                <div className="flex items-end justify-center gap-4 p-6 bg-gradient-to-b from-amber-500/10 to-transparent">
                    {[leaderboard[1], leaderboard[0], leaderboard[2]].map((entry, i) => (
                        <div key={entry.rank} className={`flex flex-col items-center ${i === 1 ? '-mt-4' : ''}`}>
                            <div className={`relative ${i === 1 ? 'w-20 h-20' : 'w-16 h-16'} rounded-full bg-gradient-to-br ${i === 1 ? 'from-amber-400 to-orange-500' : i === 0 ? 'from-zinc-300 to-zinc-500' : 'from-amber-600 to-amber-800'
                                } p-[3px]`}>
                                <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center">
                                    <Users className="w-6 h-6 text-zinc-400" />
                                </div>
                                {entry.badge && (
                                    <span className="absolute -top-1 -right-1 text-lg">{entry.badge}</span>
                                )}
                            </div>
                            <div className="mt-2 text-center">
                                <div className="text-white font-medium text-sm">{entry.username}</div>
                                <div className="text-amber-400 font-bold">{entry.score.toLocaleString()}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Rest of leaderboard */}
                <div className="divide-y divide-zinc-800/50">
                    {leaderboard.slice(3).map(entry => (
                        <div key={entry.rank} className="flex items-center gap-4 px-4 py-3 hover:bg-zinc-800/30 transition-colors">
                            <div className="w-8 flex justify-center">{getRankIcon(entry.rank)}</div>
                            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Users className="w-5 h-5 text-zinc-500" />
                            </div>
                            <div className="flex-1">
                                <div className="text-white font-medium">{entry.username}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-white font-bold">{entry.score.toLocaleString()}</div>
                                <div className={`text-xs flex items-center gap-1 ${entry.change > 0 ? 'text-emerald-400' : entry.change < 0 ? 'text-red-400' : 'text-zinc-500'
                                    }`}>
                                    {entry.change > 0 && <ArrowUp className="w-3 h-3" />}
                                    {entry.change > 0 ? `+${entry.change}` : entry.change < 0 ? entry.change : '-'}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Trending Deals Component
export function TrendingDeals() {
    const [trending, setTrending] = useState<TrendingDeal[]>([]);

    useEffect(() => {
        setTrending(getTrendingDeals());
    }, []);

    const getTrendBadge = (trend: TrendingDeal['trend']) => {
        switch (trend) {
            case 'hot':
                return <span className="px-2 py-0.5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1"><Flame className="w-3 h-3" /> HOT</span>;
            case 'rising':
                return <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full flex items-center gap-1"><TrendingUp className="w-3 h-3" /> Rising</span>;
            default:
                return null;
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-emerald-400" />
                    Trending Now
                </h2>
                <Link to="/deals" className="text-amber-400 hover:underline text-sm">View All</Link>
            </div>

            <div className="grid gap-3">
                {trending.slice(0, 5).map((deal, i) => (
                    <Link
                        key={deal.id}
                        to={`/deal/${deal.id}`}
                        className="flex items-center gap-4 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                    >
                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold">
                            {i + 1}
                        </div>
                        {deal.imageUrl && (
                            <img src={deal.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        )}
                        <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">{deal.title}</div>
                            <div className="flex items-center gap-2 text-xs text-zinc-500">
                                <span>{deal.totalSaves} saves</span>
                                <span>•</span>
                                <span>{deal.velocity}/hr</span>
                            </div>
                        </div>
                        {getTrendBadge(deal.trend)}
                        <ChevronRight className="w-4 h-4 text-zinc-600" />
                    </Link>
                ))}
            </div>
        </div>
    );
}

// Live Activity Feed
interface Activity {
    type: 'save' | 'buy' | 'alert';
    user: string;
    deal: string;
    time: string;
}

export function LiveActivityFeed() {
    const [activities, setActivities] = useState<Activity[]>([
        { type: 'save', user: 'Anonymous', deal: 'MacBook Air M3', time: '2s ago' },
        { type: 'buy', user: 'TechFan', deal: 'Sony WH-1000XM5', time: '15s ago' },
        { type: 'alert', user: 'DealWatcher', deal: 'PS5 Bundle', time: '30s ago' },
        { type: 'save', user: 'Anonymous', deal: 'iPhone 15 Pro', time: '45s ago' },
        { type: 'buy', user: 'SmartShopper', deal: 'Samsung OLED TV', time: '1m ago' },
    ]);

    // Simulate live updates
    useEffect(() => {
        const interval = setInterval(() => {
            const types: Activity['type'][] = ['save', 'buy', 'alert'];
            const users = ['Anonymous', 'DealHunter', 'Saver123', 'TechFan', 'BargainKing'];
            const deals = ['MacBook Air M3', 'iPhone 15 Pro', 'PS5 Bundle', 'AirPods Pro', 'Samsung TV'];

            const newActivity: Activity = {
                type: types[Math.floor(Math.random() * types.length)],
                user: users[Math.floor(Math.random() * users.length)],
                deal: deals[Math.floor(Math.random() * deals.length)],
                time: 'Just now',
            };

            setActivities(prev => [newActivity, ...prev.slice(0, 4)]);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const getActivityIcon = (type: Activity['type']) => {
        switch (type) {
            case 'save': return <Star className="w-4 h-4 text-pink-400" />;
            case 'buy': return <DollarSign className="w-4 h-4 text-emerald-400" />;
            case 'alert': return <Target className="w-4 h-4 text-amber-400" />;
        }
    };

    const getActivityText = (activity: Activity) => {
        switch (activity.type) {
            case 'save': return `saved ${activity.deal}`;
            case 'buy': return `bought ${activity.deal}`;
            case 'alert': return `set alert for ${activity.deal}`;
        }
    };

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Live Activity
            </h4>
            <div className="space-y-2">
                <AnimatePresence>
                    {activities.map((activity, i) => (
                        <motion.div
                            key={`${activity.deal}-${activity.time}-${i}`}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-3 text-sm"
                        >
                            {getActivityIcon(activity.type)}
                            <span className="text-zinc-400">
                                <span className="text-white">{activity.user}</span> {getActivityText(activity)}
                            </span>
                            <span className="ml-auto text-xs text-zinc-600">{activity.time}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default { Leaderboard, TrendingDeals, LiveActivityFeed };
