import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
    Search, Filter, Grid, List,
    Heart, MapPin, Shield, Star
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { getListings, getUserById } from '../services/userVerification';
import { initializeSeedData } from '../data/seedData';

// Initialize seed data on first load
initializeSeedData();

const CATEGORIES = [
    'All',
    'Electronics',
    'Computers & Laptops',
    'Gaming',
    'Audio & Headphones',
    'Wearables',
    'Cameras & Photo',
    'Smart Home',
    'Other',
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
];

export default function Marketplace() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [listings, setListings] = useState<Listing[]>([]);
    const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [category, setCategory] = useState(searchParams.get('category') || 'All');
    const [sortBy, setSortBy] = useState('newest');
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        const allListings = getListings().filter(l => l.status === 'active');
        setListings(allListings);
    }, []);

    useEffect(() => {
        let result = [...listings];

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(l =>
                l.title.toLowerCase().includes(query) ||
                l.description.toLowerCase().includes(query) ||
                l.category.toLowerCase().includes(query)
            );
        }

        // Category filter
        if (category !== 'All') {
            result = result.filter(l => l.category === category);
        }

        // Price filter
        result = result.filter(l => l.price >= priceRange[0] && l.price <= priceRange[1]);

        // Sort
        switch (sortBy) {
            case 'price_low':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_high':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                result.sort((a, b) => (b.views || 0) - (a.views || 0));
                break;
            default:
                result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        }

        setFilteredListings(result);
    }, [listings, searchQuery, category, sortBy, priceRange]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setSearchParams({ q: searchQuery, category });
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Marketplace</h1>
                    <p className="text-zinc-400">Buy & sell with AI-verified trust</p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-6 flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search listings..."
                                className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:outline-none"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 rounded-xl border flex items-center gap-2 ${showFilters ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-zinc-800 text-zinc-400'
                                }`}
                        >
                            <Filter className="w-5 h-5" />
                            Filters
                        </button>
                    </form>
                </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-b border-zinc-800 overflow-hidden"
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Price Range */}
                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Price Range</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={priceRange[0]}
                                            onChange={e => setPriceRange([Number(e.target.value), priceRange[1]])}
                                            placeholder="Min"
                                            className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm"
                                        />
                                        <span className="text-zinc-500">-</span>
                                        <input
                                            type="number"
                                            value={priceRange[1]}
                                            onChange={e => setPriceRange([priceRange[0], Number(e.target.value)])}
                                            placeholder="Max"
                                            className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm"
                                        />
                                    </div>
                                </div>

                                {/* Condition */}
                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Condition</label>
                                    <select className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm">
                                        <option value="">Any</option>
                                        <option value="new">New</option>
                                        <option value="like_new">Like New</option>
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                    </select>
                                </div>

                                {/* Shipping */}
                                <div>
                                    <label className="text-sm text-zinc-400 mb-2 block">Shipping</label>
                                    <select className="w-full p-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm">
                                        <option value="">Any</option>
                                        <option value="free">Free Shipping</option>
                                        <option value="local">Local Pickup</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Category Bar & Controls */}
            <div className="border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between py-3">
                        {/* Categories */}
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${category === cat
                                        ? 'bg-amber-500 text-zinc-900 font-medium'
                                        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* View Controls */}
                        <div className="flex items-center gap-3 ml-4">
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-sm"
                            >
                                {SORT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <div className="flex bg-zinc-800 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-zinc-700' : ''}`}
                                >
                                    <Grid className="w-4 h-4 text-zinc-400" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-zinc-700' : ''}`}
                                >
                                    <List className="w-4 h-4 text-zinc-400" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <p className="text-zinc-500 text-sm mb-4">{filteredListings.length} listings found</p>

                {filteredListings.length === 0 ? (
                    <div className="text-center py-16">
                        <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-400">No listings found</p>
                        <p className="text-zinc-500 text-sm">Try adjusting your filters</p>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
                        : 'space-y-4'
                    }>
                        {filteredListings.map(listing => (
                            <ListingCard key={listing.id} listing={listing} viewMode={viewMode} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTING CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function ListingCard({ listing, viewMode }: { listing: Listing; viewMode: 'grid' | 'list' }) {
    const [liked, setLiked] = useState(false);
    const seller = getUserById(listing.sellerId);
    const discount = listing.originalPrice
        ? Math.round((1 - listing.price / listing.originalPrice) * 100)
        : 0;

    if (viewMode === 'list') {
        return (
            <Link to={`/listing/${listing.id}`}>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex hover:border-zinc-700 transition-colors"
                >
                    <div className="w-40 h-40 bg-zinc-800 flex-shrink-0 relative">
                        {listing.images?.[0] ? (
                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-600">No image</div>
                        )}
                        {discount > 0 && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                                -{discount}%
                            </span>
                        )}
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                        <h3 className="font-medium text-white line-clamp-2">{listing.title}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <span className="text-xl font-bold text-amber-400">${listing.price}</span>
                            {listing.originalPrice && (
                                <span className="text-sm text-zinc-500 line-through">${listing.originalPrice}</span>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                            <span className="px-2 py-0.5 bg-zinc-800 rounded">{listing.condition}</span>
                            {listing.shipping?.type === 'local_only' && (
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Local
                                </span>
                            )}
                            {listing.shipping?.cost === 0 && listing.shipping?.type !== 'local_only' && (
                                <span className="text-emerald-400">Free shipping</span>
                            )}
                        </div>
                        {seller && (
                            <div className="flex items-center gap-2 mt-auto pt-3 border-t border-zinc-800">
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-xs text-white font-bold">
                                    {seller.displayName.charAt(0)}
                                </div>
                                <span className="text-sm text-zinc-400">{seller.displayName}</span>
                                {seller.verificationLevel === 'trusted_seller' && (
                                    <Shield className="w-3 h-3 text-emerald-400" />
                                )}
                                <span className="flex items-center gap-0.5 text-xs text-amber-400 ml-auto">
                                    <Star className="w-3 h-3 fill-amber-400" />
                                    {seller.stats.averageRating.toFixed(1)}
                                </span>
                            </div>
                        )}
                    </div>
                </motion.div>
            </Link>
        );
    }

    return (
        <Link to={`/listing/${listing.id}`}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden group"
            >
                <div className="aspect-square bg-zinc-800 relative overflow-hidden">
                    {listing.images?.[0] ? (
                        <img
                            src={listing.images[0]}
                            alt={listing.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">No image</div>
                    )}
                    {discount > 0 && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded">
                            -{discount}%
                        </span>
                    )}
                    <button
                        onClick={e => { e.preventDefault(); setLiked(!liked); }}
                        className={`absolute top-2 right-2 p-2 rounded-full transition-colors ${liked ? 'bg-red-500 text-white' : 'bg-zinc-900/80 text-zinc-400 hover:text-white'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${liked ? 'fill-white' : ''}`} />
                    </button>
                </div>
                <div className="p-3">
                    <h3 className="font-medium text-white text-sm line-clamp-2 h-10">{listing.title}</h3>
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-lg font-bold text-amber-400">${listing.price}</span>
                        {listing.originalPrice && (
                            <span className="text-xs text-zinc-500 line-through">${listing.originalPrice}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500">
                        <span className="px-1.5 py-0.5 bg-zinc-800 rounded">{listing.condition}</span>
                        {listing.shipping?.type === 'local_only' && <MapPin className="w-3 h-3" />}
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
