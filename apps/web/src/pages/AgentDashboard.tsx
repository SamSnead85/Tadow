/**
 * Agent Dashboard Page
 * 
 * Dashboard for the autonomous shopping agent showing
 * activity, hunts, savings, and preferences.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Bot, Zap, Target, Clock, Bell,
    Search, Settings, Plus, Trash2, DollarSign,
    ChevronRight, Sparkles, Activity, BarChart3
} from 'lucide-react';

interface AgentStats {
    totalDealsFound: number;
    totalSavings: number;
    totalPurchases: number;
    averageMatchScore: number;
    lastRunAt: string;
    runsLast24h: number;
    dealsFoundLast24h: number;
}

interface DealHunt {
    id: string;
    query: string;
    category?: string;
    maxPrice: number;
    minDealScore: number;
    status: 'hunting' | 'found' | 'expired';
    createdAt: string;
    foundDeals: FoundDeal[];
}

interface FoundDeal {
    dealId: string;
    title: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    dealScore: number;
    matchScore: number;
    reasons: string[];
    foundAt: string;
}

interface AgentActivity {
    type: string;
    timestamp: string;
    message: string;
    dealCount?: number;
}

export function AgentDashboard() {
    const [stats, setStats] = useState<AgentStats | null>(null);
    const [hunts, setHunts] = useState<DealHunt[]>([]);
    const [activities, setActivities] = useState<AgentActivity[]>([]);
    const [aggressiveness, setAggressiveness] = useState(0.5);
    const [isCreatingHunt, setIsCreatingHunt] = useState(false);
    const [newHunt, setNewHunt] = useState({ query: '', maxPrice: 500, minDealScore: 70 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAgentData();
    }, []);

    const fetchAgentData = async () => {
        try {
            // In production, these would be API calls
            // Demo data for now
            setStats({
                totalDealsFound: 47,
                totalSavings: 1284,
                totalPurchases: 8,
                averageMatchScore: 0.87,
                lastRunAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                runsLast24h: 96,
                dealsFoundLast24h: 12,
            });

            setHunts([
                {
                    id: 'hunt_1',
                    query: 'MacBook Air M3',
                    category: 'Laptops',
                    maxPrice: 1200,
                    minDealScore: 85,
                    status: 'hunting',
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                    foundDeals: [
                        {
                            dealId: 'laptop-1',
                            title: 'Apple MacBook Air M3 15" - 256GB',
                            price: 1099,
                            originalPrice: 1299,
                            discountPercent: 15,
                            dealScore: 94,
                            matchScore: 0.92,
                            reasons: ['Matches your hunt', 'All-time low price'],
                            foundAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                        },
                    ],
                },
                {
                    id: 'hunt_2',
                    query: 'Sony WH-1000XM5',
                    maxPrice: 300,
                    minDealScore: 80,
                    status: 'hunting',
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    foundDeals: [],
                },
            ]);

            setActivities([
                { type: 'deals_found', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), message: 'Found 3 deals matching your preferences', dealCount: 3 },
                { type: 'run_completed', timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), message: 'Agent run complete: 12 matches found', dealCount: 12 },
                { type: 'hunt_started', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), message: 'Started hunting for: MacBook Air M3' },
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Failed to fetch agent data:', error);
            setLoading(false);
        }
    };

    const createHunt = async () => {
        if (!newHunt.query || !newHunt.maxPrice) return;

        const hunt: DealHunt = {
            id: `hunt_${Date.now()}`,
            query: newHunt.query,
            maxPrice: newHunt.maxPrice,
            minDealScore: newHunt.minDealScore,
            status: 'hunting',
            createdAt: new Date().toISOString(),
            foundDeals: [],
        };

        setHunts(prev => [hunt, ...prev]);
        setNewHunt({ query: '', maxPrice: 500, minDealScore: 70 });
        setIsCreatingHunt(false);
    };

    const deleteHunt = (huntId: string) => {
        setHunts(prev => prev.filter(h => h.id !== huntId));
    };

    const formatTimeAgo = (date: string) => {
        const ms = Date.now() - new Date(date).getTime();
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return `${Math.floor(hours / 24)}d ago`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <Bot className="w-12 h-12 text-violet-400 mx-auto mb-4 animate-pulse" />
                    <p className="text-zinc-400">Waking up your shopping agent...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            <div className="container-wide">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-violet-500/25">
                            <Bot className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Your Shopping Agent</h1>
                            <p className="text-zinc-400 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                Hunting deals 24/7
                            </p>
                        </div>
                    </div>
                    <button className="btn-ghost">
                        <Settings className="w-4 h-4" />
                        Settings
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            <span className="text-zinc-400 text-sm">Total Savings</span>
                        </div>
                        <div className="text-3xl font-bold text-white">${stats?.totalSavings || 0}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-5 h-5 text-violet-400" />
                            <span className="text-zinc-400 text-sm">Deals Found</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.totalDealsFound || 0}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <BarChart3 className="w-5 h-5 text-amber-400" />
                            <span className="text-zinc-400 text-sm">Match Accuracy</span>
                        </div>
                        <div className="text-3xl font-bold text-white">
                            {Math.round((stats?.averageMatchScore || 0) * 100)}%
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Activity className="w-5 h-5 text-sky-400" />
                            <span className="text-zinc-400 text-sm">Runs Today</span>
                        </div>
                        <div className="text-3xl font-bold text-white">{stats?.runsLast24h || 0}</div>
                    </motion.div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Active Hunts */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Search className="w-5 h-5 text-violet-400" />
                                Active Deal Hunts
                            </h2>
                            <button
                                onClick={() => setIsCreatingHunt(true)}
                                className="btn-primary text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                New Hunt
                            </button>
                        </div>

                        {/* Create Hunt Form */}
                        {isCreatingHunt && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="p-5 bg-zinc-900 border border-violet-500/30 rounded-xl"
                            >
                                <h3 className="font-semibold text-white mb-4">What are you looking for?</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-zinc-400 mb-1 block">Search Query</label>
                                        <input
                                            type="text"
                                            value={newHunt.query}
                                            onChange={e => setNewHunt(p => ({ ...p, query: e.target.value }))}
                                            placeholder="e.g., MacBook Pro M3, RTX 4080, Sony TV..."
                                            className="input-primary w-full"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm text-zinc-400 mb-1 block">Max Price</label>
                                            <input
                                                type="number"
                                                value={newHunt.maxPrice}
                                                onChange={e => setNewHunt(p => ({ ...p, maxPrice: +e.target.value }))}
                                                className="input-primary w-full"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm text-zinc-400 mb-1 block">Min Deal Score</label>
                                            <input
                                                type="number"
                                                value={newHunt.minDealScore}
                                                onChange={e => setNewHunt(p => ({ ...p, minDealScore: +e.target.value }))}
                                                className="input-primary w-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex gap-3">
                                        <button onClick={createHunt} className="btn-primary flex-1">
                                            <Sparkles className="w-4 h-4" />
                                            Start Hunting
                                        </button>
                                        <button onClick={() => setIsCreatingHunt(false)} className="btn-secondary">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Hunts List */}
                        <div className="space-y-4">
                            {hunts.map((hunt, i) => (
                                <motion.div
                                    key={hunt.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-zinc-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Target className="w-4 h-4 text-violet-400" />
                                                <span className="font-semibold text-white">{hunt.query}</span>
                                                {hunt.status === 'hunting' && (
                                                    <span className="px-2 py-0.5 bg-violet-500/20 text-violet-400 text-xs rounded-full">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-zinc-500">
                                                <span>Max ${hunt.maxPrice}</span>
                                                <span>•</span>
                                                <span>Score 85+</span>
                                                <span>•</span>
                                                <span>Started {formatTimeAgo(hunt.createdAt)}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => deleteHunt(hunt.id)}
                                            className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Found Deals */}
                                    {hunt.foundDeals.length > 0 && (
                                        <div className="mt-4 pt-4 border-t border-zinc-800">
                                            <div className="text-sm text-zinc-400 mb-3">
                                                🎯 {hunt.foundDeals.length} deal{hunt.foundDeals.length > 1 ? 's' : ''} found
                                            </div>
                                            {hunt.foundDeals.slice(0, 2).map(deal => (
                                                <Link
                                                    key={deal.dealId}
                                                    to={`/deal/${deal.dealId}`}
                                                    className="block p-3 bg-zinc-800/50 rounded-lg mb-2 hover:bg-zinc-800 transition-colors"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <div className="font-medium text-white text-sm">{deal.title}</div>
                                                            <div className="flex items-center gap-2 text-xs text-zinc-400">
                                                                <span className="text-emerald-400 font-semibold">${deal.price}</span>
                                                                <span className="line-through">${deal.originalPrice}</span>
                                                                <span className="text-amber-400">-{deal.discountPercent}%</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-sm text-violet-400 font-semibold">
                                                                {Math.round(deal.matchScore * 100)}% match
                                                            </span>
                                                            <ChevronRight className="w-4 h-4 text-zinc-500" />
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Agent Aggressiveness */}
                        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-400" />
                                Agent Mode
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-zinc-400">Passive</span>
                                    <span className="text-zinc-400">Aggressive</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={aggressiveness}
                                    onChange={e => setAggressiveness(parseFloat(e.target.value))}
                                    className="w-full accent-violet-500"
                                />
                                <p className="text-xs text-zinc-500">
                                    {aggressiveness < 0.3 && 'Only alert for exceptional deals (90+ score)'}
                                    {aggressiveness >= 0.3 && aggressiveness < 0.7 && 'Balanced: Good deals with high confidence'}
                                    {aggressiveness >= 0.7 && 'Aggressive: More alerts, earlier opportunities'}
                                </p>
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-sky-400" />
                                Recent Activity
                            </h3>
                            <div className="space-y-3">
                                {activities.map((activity, i) => (
                                    <div key={i} className="text-sm">
                                        <div className="text-zinc-300">{activity.message}</div>
                                        <div className="text-zinc-500 text-xs">{formatTimeAgo(activity.timestamp)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Notification Settings */}
                        <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-xl">
                            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                                <Bell className="w-4 h-4 text-emerald-400" />
                                Notifications
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-zinc-300 text-sm">Email alerts</span>
                                    <input type="checkbox" defaultChecked className="toggle" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-zinc-300 text-sm">Push notifications</span>
                                    <input type="checkbox" defaultChecked className="toggle" />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-zinc-300 text-sm">SMS for urgent deals</span>
                                    <input type="checkbox" className="toggle" />
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
