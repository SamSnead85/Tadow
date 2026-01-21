import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Plus, Package, DollarSign, Eye, TrendingUp,
    Star, Clock, ShieldCheck, AlertCircle, BarChart3
} from 'lucide-react';
import {
    getCurrentUser, getUserListings, calculateTrustScore,
    getVerificationProgress, checkBadgeEligibility, getReviews
} from '../services/userVerification';
import { VerifiedUser, Listing } from '../types/marketplace';

export default function SellerDashboard() {
    const [user, setUser] = useState<VerifiedUser | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'orders' | 'analytics'>('overview');

    useEffect(() => {
        const currentUser = getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            setListings(getUserListings(currentUser.id));
        }
    }, []);

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
                <div className="text-center">
                    <ShieldCheck className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Sign In to Sell</h1>
                    <p className="text-zinc-500 mb-6">Create an account to start listing items</p>
                    <Link to="/account" className="btn-primary">
                        Get Started
                    </Link>
                </div>
            </div>
        );
    }

    const trustScore = calculateTrustScore(user, getReviews());
    const verification = getVerificationProgress(user);
    const eligibleBadges = checkBadgeEligibility(user);

    const activeListings = listings.filter(l => l.status === 'active');
    const soldListings = listings.filter(l => l.status === 'sold');
    const totalEarnings = soldListings.reduce((sum, l) => sum + l.price, 0);
    const totalViews = listings.reduce((sum, l) => sum + l.views, 0);

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-start justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Seller Dashboard</h1>
                            <p className="text-zinc-400">Manage your listings and track performance</p>
                        </div>
                        <Link
                            to="/sell/create"
                            className="btn-primary flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Create Listing
                        </Link>
                    </div>

                    {/* Trust Score Card */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-zinc-400 font-medium">Trust Score</h3>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${trustScore.recommendation === 'safe' ? 'bg-emerald-500/20 text-emerald-400' :
                                        trustScore.recommendation === 'caution' ? 'bg-amber-500/20 text-amber-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {trustScore.recommendation.replace('_', ' ').toUpperCase()}
                                </div>
                            </div>
                            <div className="flex items-end gap-2 mb-4">
                                <span className="text-5xl font-bold text-white">{trustScore.overall}</span>
                                <span className="text-zinc-500 mb-2">/100</span>
                            </div>
                            <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
                                <div
                                    className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all"
                                    style={{ width: `${trustScore.overall}%` }}
                                />
                            </div>
                            <div className="text-xs text-zinc-500">
                                Verification: {verification.currentLevel.replace('_', ' ')}
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-zinc-400 font-medium mb-4">Quick Stats</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 flex items-center gap-2">
                                        <Package className="w-4 h-4" />
                                        Active Listings
                                    </span>
                                    <span className="text-white font-medium">{activeListings.length}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 flex items-center gap-2">
                                        <DollarSign className="w-4 h-4" />
                                        Total Earned
                                    </span>
                                    <span className="text-emerald-400 font-medium">${totalEarnings.toLocaleString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-zinc-500 flex items-center gap-2">
                                        <Eye className="w-4 h-4" />
                                        Total Views
                                    </span>
                                    <span className="text-white font-medium">{totalViews.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
                            <h3 className="text-zinc-400 font-medium mb-4">Your Badges</h3>
                            {user.badges.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.badges.map(badge => (
                                        <span
                                            key={badge}
                                            className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-medium"
                                        >
                                            {badge.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-zinc-500 text-sm">
                                    {eligibleBadges.length > 0 ? (
                                        <span>You qualify for: {eligibleBadges.join(', ')}</span>
                                    ) : (
                                        <span>Complete more transactions to earn badges</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex gap-1 bg-zinc-900/50 p-1 rounded-xl mb-6 w-fit">
                    {(['overview', 'listings', 'orders', 'analytics'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'bg-amber-500 text-zinc-900'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Performance Metrics */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <MetricCard
                                icon={<TrendingUp className="w-5 h-5" />}
                                label="Conversion Rate"
                                value={listings.length > 0 ? `${Math.round((soldListings.length / listings.length) * 100)}%` : '0%'}
                                color="emerald"
                            />
                            <MetricCard
                                icon={<Star className="w-5 h-5" />}
                                label="Avg Rating"
                                value={user.stats.averageRating.toFixed(1)}
                                color="amber"
                            />
                            <MetricCard
                                icon={<Clock className="w-5 h-5" />}
                                label="Response Time"
                                value={user.stats.responseTime ? `${user.stats.responseTime}m` : 'N/A'}
                                color="blue"
                            />
                            <MetricCard
                                icon={<BarChart3 className="w-5 h-5" />}
                                label="Completion Rate"
                                value={`${user.stats.completionRate}%`}
                                color="purple"
                            />
                        </div>

                        {/* Recent Listings */}
                        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-white">Recent Listings</h3>
                                <Link to="/sell/listings" className="text-amber-400 text-sm hover:underline">
                                    View All
                                </Link>
                            </div>

                            {listings.length === 0 ? (
                                <div className="text-center py-12">
                                    <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                                    <p className="text-zinc-500 mb-4">No listings yet</p>
                                    <Link to="/sell/create" className="btn-primary inline-flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Create Your First Listing
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {listings.slice(0, 5).map(listing => (
                                        <ListingRow key={listing.id} listing={listing} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Trust Score Improvement */}
                        {trustScore.overall < 80 && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-white mb-1">Improve Your Trust Score</h3>
                                        <p className="text-zinc-400 text-sm mb-3">
                                            Higher trust scores lead to more sales. Here's how to improve:
                                        </p>
                                        <ul className="text-sm text-zinc-400 space-y-1">
                                            {trustScore.overall < 60 && verification.nextLevel && (
                                                <li>• Verify your {verification.nextLevel.replace('_', ' ')}</li>
                                            )}
                                            {user.stats.responseRate < 90 && (
                                                <li>• Respond to messages faster</li>
                                            )}
                                            {user.transactionCount < 10 && (
                                                <li>• Complete more transactions</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'listings' && (
                    <div className="space-y-4">
                        {listings.length === 0 ? (
                            <div className="text-center py-16">
                                <Package className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-white mb-2">No Listings Yet</h3>
                                <p className="text-zinc-500 mb-6">Start selling by creating your first listing</p>
                                <Link to="/sell/create" className="btn-primary inline-flex items-center gap-2">
                                    <Plus className="w-5 h-5" />
                                    Create Listing
                                </Link>
                            </div>
                        ) : (
                            listings.map(listing => (
                                <ListingRow key={listing.id} listing={listing} showActions />
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Metric Card Component
function MetricCard({ icon, label, value, color }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    color: 'emerald' | 'amber' | 'blue' | 'purple';
}) {
    const colors = {
        emerald: 'text-emerald-400 bg-emerald-500/20',
        amber: 'text-amber-400 bg-amber-500/20',
        blue: 'text-blue-400 bg-blue-500/20',
        purple: 'text-purple-400 bg-purple-500/20',
    };

    return (
        <div className="bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-xl p-4">
            <div className={`p-2 rounded-lg w-fit ${colors[color]} mb-3`}>
                {icon}
            </div>
            <p className="text-2xl font-bold text-white">{value}</p>
            <p className="text-zinc-500 text-sm">{label}</p>
        </div>
    );
}

// Listing Row Component
function ListingRow({ listing, showActions }: { listing: Listing; showActions?: boolean }) {
    const statusColors: Record<string, string> = {
        active: 'bg-emerald-500/20 text-emerald-400',
        pending: 'bg-amber-500/20 text-amber-400',
        sold: 'bg-blue-500/20 text-blue-400',
        expired: 'bg-zinc-500/20 text-zinc-400',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl"
        >
            <div className="w-16 h-16 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                {listing.images[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-6 h-6 text-zinc-500" />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white truncate">{listing.title}</h4>
                <div className="flex items-center gap-3 text-sm text-zinc-500">
                    <span>${listing.price}</span>
                    <span>•</span>
                    <span>{listing.views} views</span>
                    <span>•</span>
                    <span>{listing.saves} saves</span>
                </div>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[listing.status] || statusColors.pending}`}>
                {listing.status}
            </span>
            {showActions && (
                <Link
                    to={`/sell/edit/${listing.id}`}
                    className="px-3 py-1 text-sm text-amber-400 hover:bg-amber-500/10 rounded"
                >
                    Edit
                </Link>
            )}
        </motion.div>
    );
}
