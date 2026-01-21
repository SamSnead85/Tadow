import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    MapPin, Navigation, Shield, Clock,
    Search, ChevronDown
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { getListings, getCurrentUser } from '../services/userVerification';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE MEETUP LOCATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const SAFE_MEETUP_SPOTS = [
    {
        id: 'police1',
        name: 'Police Station - Downtown',
        type: 'police',
        address: '123 Main St',
        hours: '24/7',
        features: ['Security cameras', 'Well-lit', 'Officers present'],
    },
    {
        id: 'fire1',
        name: 'Fire Station #5',
        type: 'fire',
        address: '456 Oak Ave',
        hours: '24/7',
        features: ['Security cameras', 'Public area'],
    },
    {
        id: 'bank1',
        name: 'Chase Bank Lobby',
        type: 'bank',
        address: '789 Commerce Blvd',
        hours: '9am - 5pm',
        features: ['Security guard', 'Well-lit', 'High traffic'],
    },
    {
        id: 'library1',
        name: 'Central Library',
        type: 'library',
        address: '321 Book Lane',
        hours: '9am - 8pm',
        features: ['Security cameras', 'Staff present', 'Public area'],
    },
    {
        id: 'mall1',
        name: 'City Mall Food Court',
        type: 'mall',
        address: '555 Shopping Way',
        hours: '10am - 9pm',
        features: ['Security patrol', 'High traffic', 'Well-lit'],
    },
];

const SPOT_ICONS: Record<string, string> = {
    police: '👮',
    fire: '🚒',
    bank: '🏦',
    library: '📚',
    mall: '🛍️',
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCAL DEALS PAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export default function LocalDeals() {
    const [listings, setListings] = useState<Listing[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [distance, setDistance] = useState<number>(25);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [showSafeSpots, setShowSafeSpots] = useState(false);

    const user = getCurrentUser();

    useEffect(() => {
        // Get local-only listings
        const allListings = getListings();
        const localListings = allListings.filter(l =>
            l.status === 'active' &&
            (l.shipping?.type === 'local_only' || l.shipping?.type === 'both')
        );
        setListings(localListings);
    }, []);

    const filteredListings = listings.filter(l => {
        if (selectedCategory !== 'all' && l.category !== selectedCategory) return false;
        if (searchQuery && !l.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const categories = ['all', ...new Set(listings.map(l => l.category))];

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-b from-emerald-500/10 to-transparent">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-8 h-8 text-emerald-400" />
                        <h1 className="text-3xl font-bold text-white">Local Deals</h1>
                    </div>
                    <p className="text-zinc-400">Buy and sell locally with safe meetup options</p>

                    {/* Location Info */}
                    {user?.location ? (
                        <div className="flex items-center gap-2 mt-4 text-sm text-zinc-400">
                            <Navigation className="w-4 h-4" />
                            <span>{user.location.city}, {user.location.state}</span>
                        </div>
                    ) : (
                        <button className="flex items-center gap-2 mt-4 text-sm text-amber-400 hover:underline">
                            <Navigation className="w-4 h-4" />
                            Set your location
                        </button>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="max-w-7xl mx-auto px-4 mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    {/* Search */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search local deals..."
                            className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>

                    {/* Distance */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-400">Within</span>
                        <select
                            value={distance}
                            onChange={e => setDistance(Number(e.target.value))}
                            className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                        >
                            <option value={5}>5 miles</option>
                            <option value={10}>10 miles</option>
                            <option value={25}>25 miles</option>
                            <option value={50}>50 miles</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={e => setSelectedCategory(e.target.value)}
                            className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none appearance-none pr-8"
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    </div>

                    {/* Safe Spots Toggle */}
                    <button
                        onClick={() => setShowSafeSpots(!showSafeSpots)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors ${showSafeSpots
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-700'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Safe Meetup Spots
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Map View Placeholder */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden h-[400px]">
                            <div className="w-full h-full bg-zinc-800 flex items-center justify-center relative">
                                {/* Map placeholder with pins */}
                                <div className="absolute inset-0 opacity-30">
                                    <div className="w-full h-full" style={{
                                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                                        backgroundRepeat: 'repeat',
                                    }} />
                                </div>

                                {/* Listing pins */}
                                {filteredListings.slice(0, 5).map((listing, i) => (
                                    <motion.div
                                        key={listing.id}
                                        initial={{ scale: 0, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        className="absolute"
                                        style={{
                                            left: `${20 + (i * 15)}%`,
                                            top: `${30 + ((i % 3) * 20)}%`,
                                        }}
                                    >
                                        <div className="relative">
                                            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                                <span className="text-sm font-bold text-zinc-900">
                                                    ${Math.round(listing.price / 100)}
                                                </span>
                                            </div>
                                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-500 rotate-45" />
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Safe spot pins */}
                                {showSafeSpots && SAFE_MEETUP_SPOTS.slice(0, 3).map((spot, i) => (
                                    <motion.div
                                        key={spot.id}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.3 + i * 0.1 }}
                                        className="absolute"
                                        style={{
                                            left: `${50 + (i * 12)}%`,
                                            top: `${50 + ((i % 2) * 15)}%`,
                                        }}
                                    >
                                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
                                            <span className="text-sm">{SPOT_ICONS[spot.type]}</span>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* Map label */}
                                <div className="absolute bottom-4 left-4 bg-zinc-900/80 backdrop-blur px-3 py-2 rounded-lg">
                                    <p className="text-xs text-zinc-400">
                                        {filteredListings.length} listings within {distance} miles
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Safe Spots Panel or Listings */}
                    <div className="space-y-4">
                        {showSafeSpots ? (
                            <>
                                <h3 className="font-semibold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-emerald-400" />
                                    Safe Meetup Locations
                                </h3>
                                {SAFE_MEETUP_SPOTS.map(spot => (
                                    <SafeSpotCard key={spot.id} spot={spot} />
                                ))}
                            </>
                        ) : (
                            <>
                                <h3 className="font-semibold text-white">
                                    Nearby Listings ({filteredListings.length})
                                </h3>
                                {filteredListings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <MapPin className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                                        <p className="text-zinc-500">No local listings found</p>
                                    </div>
                                ) : (
                                    filteredListings.slice(0, 6).map(listing => (
                                        <LocalListingCard key={listing.id} listing={listing} />
                                    ))
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Safety Tips */}
                <div className="mt-8 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                    <h3 className="font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Local Transaction Safety Tips
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                                1
                            </div>
                            <div>
                                <p className="font-medium text-white">Meet in public</p>
                                <p className="text-sm text-zinc-400">Use police stations, banks, or busy areas</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                                2
                            </div>
                            <div>
                                <p className="font-medium text-white">Bring someone</p>
                                <p className="text-sm text-zinc-400">Never meet alone for high-value items</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400">
                                3
                            </div>
                            <div>
                                <p className="font-medium text-white">Inspect before paying</p>
                                <p className="text-sm text-zinc-400">Verify the item works as described</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SAFE SPOT CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function SafeSpotCard({ spot }: { spot: typeof SAFE_MEETUP_SPOTS[0] }) {
    return (
        <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center text-xl">
                    {SPOT_ICONS[spot.type]}
                </div>
                <div className="flex-1">
                    <h4 className="font-medium text-white">{spot.name}</h4>
                    <p className="text-sm text-zinc-500">{spot.address}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                        <Clock className="w-3 h-3" />
                        {spot.hours}
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                        {spot.features.map(f => (
                            <span key={f} className="px-2 py-0.5 bg-zinc-800 rounded text-xs text-zinc-400">
                                {f}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LOCAL LISTING CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function LocalListingCard({ listing }: { listing: Listing }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden flex cursor-pointer hover:border-zinc-700 transition-colors"
        >
            <div className="w-24 h-24 bg-zinc-800 flex-shrink-0">
                {listing.images?.[0] ? (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        No image
                    </div>
                )}
            </div>
            <div className="p-3 flex-1">
                <h4 className="font-medium text-white text-sm line-clamp-1">{listing.title}</h4>
                <p className="text-amber-400 font-bold">${listing.price}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-zinc-500">
                    <MapPin className="w-3 h-3" />
                    <span>2.4 miles</span>
                    {listing.shipping?.type === 'local_only' && (
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                            Local only
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
