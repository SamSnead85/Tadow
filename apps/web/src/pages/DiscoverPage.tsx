import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    TrendingUp, Clock, Heart, Flame, Sparkles,
    ChevronRight, Eye
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { DEMO_LISTINGS } from '../data/seedData';

// Simulated saved/viewed data
const getRecentlyViewed = (): string[] => {
    try {
        return JSON.parse(localStorage.getItem('tadow_recently_viewed') || '[]');
    } catch { return []; }
};

const addToRecentlyViewed = (listingId: string) => {
    const viewed = getRecentlyViewed();
    const updated = [listingId, ...viewed.filter(id => id !== listingId)].slice(0, 10);
    localStorage.setItem('tadow_recently_viewed', JSON.stringify(updated));
};

export default function DiscoverPage() {
    const [recentIds] = useState(getRecentlyViewed());
    const recentListings = DEMO_LISTINGS.filter(l => recentIds.includes(l.id));

    // Trending = most viewed
    const trendingListings = [...DEMO_LISTINGS].sort((a, b) => b.views - a.views).slice(0, 6);

    // New arrivals = newest
    const newArrivals = [...DEMO_LISTINGS].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 6);

    // Hot deals = biggest discounts
    const hotDeals = [...DEMO_LISTINGS]
        .filter(l => l.originalPrice && l.originalPrice > l.price)
        .sort((a, b) => {
            const discA = (a.originalPrice! - a.price) / a.originalPrice!;
            const discB = (b.originalPrice! - b.price) / b.originalPrice!;
            return discB - discA;
        })
        .slice(0, 6);

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-2">Discover</h1>
                <p className="text-zinc-400 mb-8">Explore trending items and new arrivals</p>

                {/* Recently Viewed */}
                {recentListings.length > 0 && (
                    <Section
                        title="Recently Viewed"
                        icon={<Clock className="w-5 h-5 text-blue-400" />}
                        listings={recentListings}
                        viewAllLink="/marketplace?sort=viewed"
                    />
                )}

                {/* Trending Now */}
                <Section
                    title="Trending Now"
                    icon={<TrendingUp className="w-5 h-5 text-amber-400" />}
                    listings={trendingListings}
                    viewAllLink="/marketplace?sort=popular"
                    badge="🔥 Hot"
                />

                {/* Hot Deals */}
                <Section
                    title="Hot Deals"
                    icon={<Flame className="w-5 h-5 text-red-400" />}
                    listings={hotDeals}
                    viewAllLink="/marketplace?sort=discount"
                    showDiscount
                />

                {/* New Arrivals */}
                <Section
                    title="New Arrivals"
                    icon={<Sparkles className="w-5 h-5 text-purple-400" />}
                    listings={newArrivals}
                    viewAllLink="/marketplace?sort=newest"
                    badge="✨ New"
                />

                {/* Categories Grid */}
                <div className="mt-12">
                    <h2 className="text-xl font-bold text-white mb-4">Browse Categories</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {CATEGORIES.map(cat => (
                            <Link
                                key={cat.name}
                                to={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                                className="group bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 hover:border-amber-500/50 transition-colors"
                            >
                                <div className="text-3xl mb-2">{cat.icon}</div>
                                <h3 className="font-medium text-white group-hover:text-amber-400 transition-colors">{cat.name}</h3>
                                <p className="text-xs text-zinc-500">{cat.count} items</p>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// Category data
const CATEGORIES = [
    { name: 'Electronics', icon: '📱', count: 1234 },
    { name: 'Computers & Laptops', icon: '💻', count: 856 },
    { name: 'Gaming', icon: '🎮', count: 567 },
    { name: 'Audio & Headphones', icon: '🎧', count: 423 },
    { name: 'Cameras & Photo', icon: '📷', count: 312 },
    { name: 'Wearables', icon: '⌚', count: 289 },
    { name: 'Smart Home', icon: '🏠', count: 198 },
    { name: 'Other', icon: '📦', count: 456 },
];

function Section({
    title,
    icon,
    listings,
    viewAllLink,
    badge,
    showDiscount
}: {
    title: string;
    icon: React.ReactNode;
    listings: Listing[];
    viewAllLink: string;
    badge?: string;
    showDiscount?: boolean;
}) {
    if (listings.length === 0) return null;

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {icon}
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    {badge && (
                        <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
                            {badge}
                        </span>
                    )}
                </div>
                <Link
                    to={viewAllLink}
                    className="text-amber-400 text-sm flex items-center gap-1 hover:text-amber-300"
                >
                    View All <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {listings.map(listing => (
                    <ListingCard
                        key={listing.id}
                        listing={listing}
                        showDiscount={showDiscount}
                    />
                ))}
            </div>
        </div>
    );
}

function ListingCard({ listing, showDiscount }: { listing: Listing; showDiscount?: boolean }) {
    const discount = listing.originalPrice
        ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
        : 0;

    return (
        <Link to={`/listing/${listing.id}`} className="group">
            <motion.div
                whileHover={{ y: -4 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-500/30 transition-colors"
            >
                <div className="aspect-square relative overflow-hidden">
                    {listing.images?.[0] && (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                    )}
                    {showDiscount && discount > 0 && (
                        <div className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                            -{discount}%
                        </div>
                    )}
                    <button className="absolute top-2 right-2 p-1.5 bg-zinc-900/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="w-3 h-3 text-white" />
                    </button>
                </div>
                <div className="p-3">
                    <p className="text-sm text-zinc-400 truncate mb-1">{listing.title}</p>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-white">${listing.price}</span>
                        {listing.originalPrice && listing.originalPrice > listing.price && (
                            <span className="text-xs text-zinc-500 line-through">${listing.originalPrice}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                        <span className="flex items-center gap-0.5">
                            <Eye className="w-3 h-3" /> {listing.views}
                        </span>
                        <span className="flex items-center gap-0.5">
                            <Heart className="w-3 h-3" /> {listing.saves || 0}
                        </span>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}

export { addToRecentlyViewed };
