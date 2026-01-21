import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    ArrowLeft, Heart, Share2, Flag,
    MapPin, Truck, MessageSquare, ChevronLeft, ChevronRight,
    Check, X, AlertCircle
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { getListingById, getUserById, getListings, getCurrentUser } from '../services/userVerification';
import { SellerCard } from '../components/TrustBadge';
import { ReviewsList } from '../components/ReviewSystem';
import { initializeSeedData } from '../data/seedData';

initializeSeedData();

export default function ListingDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [listing, setListing] = useState<Listing | null>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [liked, setLiked] = useState(false);
    const [showOfferModal, setShowOfferModal] = useState(false);
    const [similarListings, setSimilarListings] = useState<Listing[]>([]);

    const currentUser = getCurrentUser();

    useEffect(() => {
        if (id) {
            const found = getListingById(id);
            setListing(found);

            if (found) {
                // Get similar listings
                const similar = getListings()
                    .filter(l => l.category === found.category && l.id !== found.id && l.status === 'active')
                    .slice(0, 4);
                setSimilarListings(similar);
            }
        }
    }, [id]);

    if (!listing) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl text-white mb-2">Listing not found</h1>
                    <button onClick={() => navigate(-1)} className="text-amber-400">Go back</button>
                </div>
            </div>
        );
    }

    const seller = getUserById(listing.sellerId);
    const discount = listing.originalPrice
        ? Math.round((1 - listing.price / listing.originalPrice) * 100)
        : 0;
    const isOwnListing = currentUser?.id === listing.sellerId;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: listing.title,
                url: window.location.href,
            });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="bg-zinc-900/50 border-b border-zinc-800 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-zinc-400 hover:text-white flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setLiked(!liked)}
                                className={`p-2 rounded-full ${liked ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}
                            >
                                <Heart className={`w-5 h-5 ${liked ? 'fill-red-400' : ''}`} />
                            </button>
                            <button onClick={handleShare} className="p-2 rounded-full bg-zinc-800 text-zinc-400">
                                <Share2 className="w-5 h-5" />
                            </button>
                            <button className="p-2 rounded-full bg-zinc-800 text-zinc-400">
                                <Flag className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Image Gallery */}
                    <div>
                        <div className="relative aspect-square bg-zinc-800 rounded-xl overflow-hidden">
                            {listing.images && listing.images.length > 0 ? (
                                <>
                                    <motion.img
                                        key={currentImageIndex}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        src={listing.images[currentImageIndex]}
                                        alt={listing.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {listing.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={() => setCurrentImageIndex(i => (i === 0 ? listing.images!.length - 1 : i - 1))}
                                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/80 rounded-full text-white"
                                            >
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => setCurrentImageIndex(i => (i === listing.images!.length - 1 ? 0 : i + 1))}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-zinc-900/80 rounded-full text-white"
                                            >
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                                    No images
                                </div>
                            )}
                            {discount > 0 && (
                                <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white font-bold rounded-lg">
                                    -{discount}% OFF
                                </span>
                            )}
                        </div>

                        {/* Thumbnails */}
                        {listing.images && listing.images.length > 1 && (
                            <div className="flex gap-2 mt-4 overflow-x-auto">
                                {listing.images.map((img, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCurrentImageIndex(i)}
                                        className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${i === currentImageIndex ? 'border-amber-500' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Details */}
                    <div>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <span className="text-sm text-amber-400 font-medium">{listing.category}</span>
                                <h1 className="text-2xl font-bold text-white mt-1">{listing.title}</h1>
                            </div>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline gap-3 mb-6">
                            <span className="text-4xl font-bold text-amber-400">${listing.price}</span>
                            {listing.originalPrice && (
                                <span className="text-xl text-zinc-500 line-through">${listing.originalPrice}</span>
                            )}
                        </div>

                        {/* Condition & Shipping */}
                        <div className="flex flex-wrap gap-3 mb-6">
                            <span className="px-3 py-1.5 bg-zinc-800 rounded-lg text-sm text-white">
                                {listing.condition.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
                            </span>
                            {listing.shipping?.type === 'local_only' ? (
                                <span className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm flex items-center gap-1">
                                    <MapPin className="w-4 h-4" /> Local Pickup Only
                                </span>
                            ) : (
                                <span className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm flex items-center gap-1">
                                    <Truck className="w-4 h-4" />
                                    {listing.shipping?.cost === 0 ? 'Free Shipping' : `Ships for $${listing.shipping?.cost}`}
                                </span>
                            )}
                        </div>

                        {/* AI Verification */}
                        {listing.aiVerification && (
                            <div className={`p-4 rounded-xl mb-6 ${listing.aiVerification.approved
                                ? 'bg-emerald-500/10 border border-emerald-500/30'
                                : 'bg-amber-500/10 border border-amber-500/30'
                                }`}>
                                <div className="flex items-center gap-2 mb-2">
                                    {listing.aiVerification.approved ? (
                                        <Check className="w-5 h-5 text-emerald-400" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5 text-amber-400" />
                                    )}
                                    <span className={`font-medium ${listing.aiVerification.approved ? 'text-emerald-400' : 'text-amber-400'
                                        }`}>
                                        AI Verified - {listing.aiVerification.score}% Confidence
                                    </span>
                                </div>
                                <p className="text-sm text-zinc-400">
                                    This listing has been analyzed by our AI for authenticity and pricing.
                                </p>
                            </div>
                        )}

                        {/* Description */}
                        <div className="mb-6">
                            <h3 className="font-semibold text-white mb-2">Description</h3>
                            <p className="text-zinc-400 whitespace-pre-line">{listing.description}</p>
                        </div>

                        {/* Actions */}
                        {!isOwnListing && (
                            <div className="flex gap-3 mb-6">
                                <Link
                                    to={`/checkout/${listing.id}`}
                                    className="flex-1 btn-primary py-3 text-center"
                                >
                                    Buy Now - ${listing.price}
                                </Link>
                                <button
                                    onClick={() => setShowOfferModal(true)}
                                    className="flex-1 py-3 border border-amber-500 text-amber-400 rounded-xl hover:bg-amber-500/10"
                                >
                                    Make Offer
                                </button>
                            </div>
                        )}

                        {isOwnListing && (
                            <div className="p-4 bg-zinc-800/50 rounded-xl mb-6">
                                <p className="text-zinc-400 text-sm">This is your listing</p>
                                <div className="flex gap-3 mt-3">
                                    <button className="flex-1 py-2 text-sm bg-zinc-700 text-white rounded-lg">
                                        Edit Listing
                                    </button>
                                    <button className="flex-1 py-2 text-sm border border-red-500 text-red-400 rounded-lg">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Message Seller */}
                        {!isOwnListing && (
                            <button className="w-full py-3 border border-zinc-700 text-zinc-400 rounded-xl hover:border-zinc-600 flex items-center justify-center gap-2 mb-6">
                                <MessageSquare className="w-5 h-5" />
                                Message Seller
                            </button>
                        )}

                        {/* Seller Info */}
                        {seller && <SellerCard seller={seller} />}
                    </div>
                </div>

                {/* Seller Reviews */}
                {seller && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-white mb-6">Seller Reviews</h2>
                        <ReviewsList userId={seller.id} />
                    </div>
                )}

                {/* Similar Listings */}
                {similarListings.length > 0 && (
                    <div className="mt-12">
                        <h2 className="text-xl font-bold text-white mb-6">Similar Listings</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {similarListings.map(l => (
                                <Link key={l.id} to={`/listing/${l.id}`}>
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700">
                                        <div className="aspect-square bg-zinc-800">
                                            {l.images?.[0] && (
                                                <img src={l.images[0]} alt={l.title} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="p-3">
                                            <h3 className="text-sm text-white line-clamp-1">{l.title}</h3>
                                            <p className="text-amber-400 font-bold">${l.price}</p>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Offer Modal */}
            {showOfferModal && (
                <OfferModal
                    listing={listing}
                    onClose={() => setShowOfferModal(false)}
                />
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFER MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function OfferModal({ listing, onClose }: { listing: Listing; onClose: () => void }) {
    const [amount, setAmount] = useState(Math.round(listing.price * 0.9));
    const [message, setMessage] = useState('');
    const minOffer = listing.minimumOffer || Math.round(listing.price * 0.5);

    const handleSubmit = () => {
        // In production, this would create an offer
        console.log('Submitting offer:', { amount, message });
        onClose();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-white">Make an Offer</h2>
                    <button onClick={onClose} className="text-zinc-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl mb-6">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-zinc-700">
                        {listing.images?.[0] && (
                            <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                        )}
                    </div>
                    <div>
                        <h3 className="text-white font-medium line-clamp-1">{listing.title}</h3>
                        <p className="text-amber-400 font-bold">${listing.price}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-sm text-zinc-400 mb-2">Your Offer</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500">$</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={e => setAmount(Number(e.target.value))}
                            min={minOffer}
                            max={listing.price}
                            className="w-full pl-8 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-2xl font-bold text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                    {amount < minOffer && (
                        <p className="text-red-400 text-sm mt-1">Minimum offer is ${minOffer}</p>
                    )}
                </div>

                <div className="flex gap-2 mb-4">
                    {[0.75, 0.85, 0.9].map(pct => (
                        <button
                            key={pct}
                            onClick={() => setAmount(Math.round(listing.price * pct))}
                            className="flex-1 py-2 bg-zinc-800 text-zinc-400 rounded-lg text-sm hover:bg-zinc-700"
                        >
                            ${Math.round(listing.price * pct)}
                        </button>
                    ))}
                </div>

                <div className="mb-6">
                    <label className="block text-sm text-zinc-400 mb-2">Message (optional)</label>
                    <textarea
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        placeholder="Add a message to your offer..."
                        rows={2}
                        className="w-full p-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:border-amber-500 focus:outline-none resize-none"
                    />
                </div>

                <button
                    onClick={handleSubmit}
                    disabled={amount < minOffer}
                    className="w-full btn-primary py-3 disabled:opacity-50"
                >
                    Send Offer - ${amount}
                </button>

                <p className="text-xs text-zinc-500 text-center mt-4">
                    Offers expire in 24 hours. Seller will be notified.
                </p>
            </motion.div>
        </motion.div>
    );
}
