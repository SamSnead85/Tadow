import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import {
    Star, MapPin, Calendar, Shield, MessageSquare,
    Package, Heart, Share2, Check, ThumbsUp, Clock, Award, TrendingUp
} from 'lucide-react';
import { VerifiedUser, Listing, Review } from '../types/marketplace';
import { getUserById, getCurrentUser } from '../services/userVerification';
import { DEMO_USERS, DEMO_LISTINGS, DEMO_REVIEWS } from '../data/seedData';

export default function ProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const [user, setUser] = useState<VerifiedUser | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'about'>('listings');
    const currentUser = getCurrentUser();
    const isOwnProfile = currentUser?.id === userId;

    useEffect(() => {
        const foundUser = DEMO_USERS.find(u => u.id === userId) || getUserById(userId || '');
        setUser(foundUser || null);
        const userListings = DEMO_LISTINGS.filter(l => l.sellerId === userId);
        setListings(userListings);
        const userReviews = DEMO_REVIEWS.filter(r => r.revieweeId === userId);
        setReviews(userReviews);
    }, [userId]);

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <p className="text-zinc-500">User not found</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Hero */}
            <div className="bg-gradient-to-b from-amber-500/10 to-transparent">
                <div className="max-w-4xl mx-auto px-4 pt-8 pb-6">
                    <div className="flex items-start gap-4">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-amber-500/20">
                            {user.displayName.charAt(0)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl font-bold text-white">{user.displayName}</h1>
                                {user.verificationLevel !== 'none' && (
                                    <div className="p-1 bg-emerald-500/20 rounded-full">
                                        <Shield className="w-4 h-4 text-emerald-400" />
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-zinc-400 mb-3">
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {user.location?.city || 'Unknown'}, {user.location?.state || ''}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    Member since {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {user.badges.map(badge => (
                                    <BadgePill key={badge} badge={badge} />
                                ))}
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {!isOwnProfile && (
                                <>
                                    <Link to={`/messages?with=${user.id}`} className="px-4 py-2 bg-amber-500 text-zinc-900 rounded-lg font-medium hover:bg-amber-400 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4" /> Message
                                    </Link>
                                    <button className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700"><Heart className="w-5 h-5" /></button>
                                </>
                            )}
                            <button className="p-2 bg-zinc-800 text-zinc-400 rounded-lg hover:bg-zinc-700"><Share2 className="w-5 h-5" /></button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Bar */}
            <div className="border-y border-zinc-800 bg-zinc-900/50">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="grid grid-cols-5 gap-4 text-center">
                        <div><div className="flex items-center justify-center gap-1 mb-1"><Star className="w-4 h-4 text-amber-400" /><span className="text-lg font-bold text-white">{user.stats.averageRating?.toFixed(1) || '0'}</span></div><span className="text-xs text-zinc-500">Rating</span></div>
                        <div><div className="flex items-center justify-center gap-1 mb-1"><Package className="w-4 h-4 text-blue-400" /><span className="text-lg font-bold text-white">{user.stats.totalSales}</span></div><span className="text-xs text-zinc-500">Sales</span></div>
                        <div><div className="flex items-center justify-center gap-1 mb-1"><TrendingUp className="w-4 h-4 text-emerald-400" /><span className="text-lg font-bold text-white">{user.stats.completionRate}%</span></div><span className="text-xs text-zinc-500">Completion</span></div>
                        <div><div className="flex items-center justify-center gap-1 mb-1"><Clock className="w-4 h-4 text-purple-400" /><span className="text-lg font-bold text-white">{user.stats.responseTime || 30}m</span></div><span className="text-xs text-zinc-500">Response</span></div>
                        <div><div className="flex items-center justify-center gap-1 mb-1"><Award className="w-4 h-4 text-rose-400" /><span className="text-lg font-bold text-white">{user.trustScore}</span></div><span className="text-xs text-zinc-500">Trust</span></div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-1 mt-6 mb-4 border-b border-zinc-800">
                    {(['listings', 'reviews', 'about'] as const).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'text-amber-400 border-amber-400' : 'text-zinc-400 border-transparent hover:text-white'}`}>
                            {tab} {tab === 'listings' && `(${listings.length})`}{tab === 'reviews' && `(${reviews.length})`}
                        </button>
                    ))}
                </div>

                {activeTab === 'listings' && (
                    listings.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No listings yet</p></div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {listings.map(listing => (
                                <Link key={listing.id} to={`/listing/${listing.id}`} className="group">
                                    <div className="aspect-square bg-zinc-800 rounded-lg overflow-hidden mb-2">
                                        {listing.images?.[0] && <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                                    </div>
                                    <p className="font-medium text-white truncate">${listing.price}</p>
                                    <p className="text-sm text-zinc-400 truncate">{listing.title}</p>
                                </Link>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'reviews' && (
                    reviews.length === 0 ? (
                        <div className="text-center py-12 text-zinc-500"><Star className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>No reviews yet</p></div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <motion.div key={review.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-white font-medium">
                                            {DEMO_USERS.find(u => u.id === review.reviewerId)?.displayName.charAt(0) || '?'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-white">{DEMO_USERS.find(u => u.id === review.reviewerId)?.displayName || 'User'}</span>
                                                <div className="flex items-center gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-zinc-600'}`} />)}</div>
                                            </div>
                                            <h4 className="text-white font-medium">{review.title}</h4>
                                            <p className="text-zinc-400 text-sm mt-1">{review.comment}</p>
                                            <div className="flex items-center gap-4 mt-3 text-zinc-500 text-xs">
                                                <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                                                <button className="flex items-center gap-1 hover:text-white"><ThumbsUp className="w-3 h-3" /> Helpful ({review.helpful})</button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )
                )}

                {activeTab === 'about' && (
                    <div className="space-y-6">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                            <h3 className="font-medium text-white mb-4">Verification Status</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="w-4 h-4 text-emerald-400" /></div>
                                        <span className="text-white">Email Verified</span>
                                    </div>
                                    <span className="text-sm text-emerald-400">Verified</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.verificationLevel !== 'none' ? 'bg-emerald-500/20' : 'bg-zinc-800'}`}>
                                            {user.verificationLevel !== 'none' ? <Check className="w-4 h-4 text-emerald-400" /> : <div className="w-2 h-2 bg-zinc-600 rounded-full" />}
                                        </div>
                                        <span className={user.verificationLevel !== 'none' ? 'text-white' : 'text-zinc-500'}>Phone Verified</span>
                                    </div>
                                    <span className={`text-sm ${user.verificationLevel !== 'none' ? 'text-emerald-400' : 'text-zinc-500'}`}>{user.verificationLevel !== 'none' ? 'Verified' : 'Not verified'}</span>
                                </div>
                            </div>
                        </div>
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                            <h3 className="font-medium text-white mb-4">Performance</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center"><span className="text-zinc-400">Response Rate</span><span className="text-white font-medium">{user.stats.responseRate}%</span></div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full" style={{ width: `${user.stats.responseRate}%` }} /></div>
                                <div className="flex justify-between items-center mt-4"><span className="text-zinc-400">Completion Rate</span><span className="text-white font-medium">{user.stats.completionRate}%</span></div>
                                <div className="h-2 bg-zinc-800 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${user.stats.completionRate}%` }} /></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function BadgePill({ badge }: { badge: string }) {
    const config: Record<string, { label: string; color: string }> = {
        verified_id: { label: 'ID Verified', color: 'bg-emerald-500/20 text-emerald-400' },
        top_rated: { label: 'Top Rated', color: 'bg-amber-500/20 text-amber-400' },
        fast_shipper: { label: 'Fast Shipper', color: 'bg-blue-500/20 text-blue-400' },
        power_seller: { label: 'Power Seller', color: 'bg-purple-500/20 text-purple-400' },
        responsive: { label: 'Responsive', color: 'bg-cyan-500/20 text-cyan-400' },
        local_meetup: { label: 'Local Meetup', color: 'bg-rose-500/20 text-rose-400' },
    };
    const c = config[badge] || { label: badge, color: 'bg-zinc-700 text-zinc-300' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${c.color}`}>{c.label}</span>;
}
