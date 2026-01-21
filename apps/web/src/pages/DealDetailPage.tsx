import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Heart, Share2, Bell, MapPin, Star, Shield, Zap, TrendingDown, Eye, Bookmark, ChevronRight } from 'lucide-react';
import { DealScore, DealCard, PriceHistoryChart } from '../components/Deals';
import { Skeleton } from '../components/Skeleton';

interface PriceHistoryPoint {
    price: number;
    recordedAt: string;
}

interface Deal {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    originalPrice: number;
    currentPrice: number;
    discountPercent: number;
    category: string;
    brand: string;
    condition: string;
    dealScore: number;
    aiVerdict: string;
    priceVsAverage: number;
    isHot: boolean;
    isFeatured: boolean;
    isAllTimeLow: boolean;
    allTimeLowPrice: number;
    historicHighPrice: number;
    pricePrediction: string;
    priceDropPercent30d: number;
    fakeReviewRisk: number;
    reviewQualityScore: number;
    verifiedPurchasePercent: number;
    city: string;
    state: string;
    externalUrl: string;
    views: number;
    saves: number;
    postedAt: string;
    sellerName: string;
    sellerRating: number;
    sellerReviews: number;
    isVerifiedSeller: boolean;
    marketplace: {
        id: string;
        name: string;
        color: string;
        baseUrl: string;
    };
    priceHistory: PriceHistoryPoint[];
}

export function DealDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [deal, setDeal] = useState<Deal | null>(null);
    const [similarDeals, setSimilarDeals] = useState<Deal[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLiked, setIsLiked] = useState(false);

    useEffect(() => {
        if (id) {
            fetchDeal();
        }
    }, [id]);

    const fetchDeal = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/deals/${id}`);
            const data = await res.json();
            setDeal(data.deal);
            setSimilarDeals(data.similarDeals || []);
        } catch (error) {
            console.error('Error fetching deal:', error);
        }
        setLoading(false);
    };

    const getPredictionBadge = (prediction: string) => {
        switch (prediction) {
            case 'buy_now':
                return { text: 'Buy Now', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', icon: '🎯' };
            case 'wait':
                return { text: 'Wait for Better Price', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '⏳' };
            default:
                return { text: 'Fair Price', color: 'bg-sky-500/20 text-sky-400 border-sky-500/30', icon: '👍' };
        }
    };

    const getReviewRiskBadge = (risk: number) => {
        if (risk <= 15) return { text: 'Authentic Reviews', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
        if (risk <= 40) return { text: 'Mostly Authentic', color: 'text-amber-400', bg: 'bg-amber-500/20' };
        return { text: 'Review Concerns', color: 'text-red-400', bg: 'bg-red-500/20' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 py-8">
                <div className="container-wide">
                    <Skeleton className="h-6 w-64 mb-6 rounded" />
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <Skeleton className="aspect-video rounded-2xl" />
                            <Skeleton className="h-48 rounded-2xl" />
                        </div>
                        <div className="space-y-6">
                            <Skeleton className="h-40 rounded-2xl" />
                            <Skeleton className="h-32 rounded-2xl" />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <span className="text-4xl">😕</span>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Deal Not Found</h2>
                    <p className="text-zinc-500 mb-4">This deal may have expired or been removed</p>
                    <Link to="/deals" className="btn-primary inline-flex">
                        Browse Deals
                    </Link>
                </div>
            </div>
        );
    }

    const prediction = getPredictionBadge(deal.pricePrediction);
    const reviewRisk = getReviewRiskBadge(deal.fakeReviewRisk);

    return (
        <div className="min-h-screen bg-zinc-900 py-8">
            <div className="container-wide">
                {/* Breadcrumb */}
                <nav className="mb-6">
                    <ol className="flex items-center gap-2 text-sm text-zinc-500">
                        <li>
                            <Link to="/deals" className="flex items-center gap-1 hover:text-white transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Deals
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4" />
                        <li>
                            <Link to={`/search?category=${deal.category}`} className="hover:text-white transition-colors">
                                {deal.category}
                            </Link>
                        </li>
                        <ChevronRight className="w-4 h-4" />
                        <li className="text-zinc-300 truncate max-w-xs">{deal.title}</li>
                    </ol>
                </nav>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Product Image & Basic Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="deal-card overflow-hidden"
                        >
                            <div className="aspect-video relative bg-zinc-800">
                                <img
                                    src={deal.imageUrl}
                                    alt={deal.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

                                {/* Badges */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {deal.isAllTimeLow && (
                                        <span className="badge badge-deal">
                                            <TrendingDown className="w-3 h-3" /> ALL-TIME LOW
                                        </span>
                                    )}
                                    {deal.isHot && (
                                        <span className="badge badge-hot">🔥 HOT</span>
                                    )}
                                </div>

                                {/* Quick Actions */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button
                                        onClick={() => setIsLiked(!isLiked)}
                                        className={`p-2 rounded-lg backdrop-blur-sm transition-colors ${isLiked ? 'bg-red-500/20 text-red-400' : 'bg-zinc-900/60 text-zinc-300 hover:text-white'
                                            }`}
                                    >
                                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                                    </button>
                                    <button className="p-2 bg-zinc-900/60 backdrop-blur-sm rounded-lg text-zinc-300 hover:text-white transition-colors">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="p-6">
                                {/* Meta */}
                                <div className="flex items-center gap-3 mb-4">
                                    <span className="badge badge-marketplace">{deal.marketplace.name}</span>
                                    <span className="badge badge-condition">{deal.condition}</span>
                                    {deal.city && deal.state && (
                                        <span className="flex items-center gap-1 text-sm text-zinc-500">
                                            <MapPin className="w-4 h-4" />
                                            {deal.city}, {deal.state}
                                        </span>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold text-white mb-3">{deal.title}</h1>
                                <p className="text-zinc-400 mb-6 leading-relaxed">{deal.description}</p>

                                {/* Price */}
                                <div className="flex items-baseline gap-4 mb-6">
                                    <span className="text-4xl font-bold text-white">
                                        ${deal.currentPrice.toLocaleString()}
                                    </span>
                                    {deal.originalPrice && deal.originalPrice > deal.currentPrice && (
                                        <>
                                            <span className="text-xl text-zinc-500 line-through">
                                                ${deal.originalPrice.toLocaleString()}
                                            </span>
                                            <span className="px-2 py-1 bg-emerald-500 text-zinc-900 text-sm font-bold rounded">
                                                -{deal.discountPercent}%
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* AI Prediction Banner */}
                                <div className={`p-4 rounded-xl border ${prediction.color} mb-6`}>
                                    <div className="flex items-center gap-3">
                                        <Zap className="w-5 h-5" />
                                        <div className="flex-1">
                                            <span className="font-semibold">{prediction.icon} {prediction.text}</span>
                                            {deal.priceVsAverage && (
                                                <span className="ml-2 opacity-75 text-sm">
                                                    {deal.priceVsAverage < 0 ? `${Math.abs(deal.priceVsAverage)}% below` : `${deal.priceVsAverage}% above`} market avg
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4">
                                    <a
                                        href={deal.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 btn-primary justify-center py-4 text-lg"
                                    >
                                        View on {deal.marketplace.name}
                                        <ExternalLink className="w-5 h-5" />
                                    </a>
                                    <button className="btn-secondary px-4">
                                        <Bell className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Price History Chart */}
                        {deal.priceHistory && deal.priceHistory.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="deal-card p-6"
                            >
                                <h2 className="text-lg font-semibold text-white mb-4">Price History</h2>
                                <PriceHistoryChart
                                    data={deal.priceHistory}
                                    currentPrice={deal.currentPrice}
                                    allTimeLow={deal.allTimeLowPrice}
                                    historicHigh={deal.historicHighPrice}
                                />
                                <div className="mt-4 flex justify-between text-sm text-zinc-500">
                                    <span>All-Time Low: <span className="text-emerald-400">${deal.allTimeLowPrice?.toLocaleString() || deal.currentPrice.toLocaleString()}</span></span>
                                    <span>Historic High: <span className="text-zinc-300">${deal.historicHighPrice?.toLocaleString() || deal.originalPrice?.toLocaleString()}</span></span>
                                </div>
                            </motion.div>
                        )}

                        {/* AI Review Intelligence */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="deal-card p-6"
                        >
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-5 h-5 text-sky-400" />
                                <h2 className="text-lg font-semibold text-white">AI Review Intelligence</h2>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center p-4 bg-zinc-800 rounded-xl">
                                    <div className="text-3xl font-bold text-white">{deal.reviewQualityScore || 85}</div>
                                    <div className="text-xs text-zinc-500 mt-1">Review Quality</div>
                                </div>
                                <div className={`text-center p-4 rounded-xl ${reviewRisk.bg}`}>
                                    <div className={`text-2xl font-bold ${reviewRisk.color}`}>
                                        {deal.fakeReviewRisk || 10}%
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">Fake Review Risk</div>
                                </div>
                                <div className="text-center p-4 bg-zinc-800 rounded-xl">
                                    <div className="text-3xl font-bold text-white">{deal.verifiedPurchasePercent || 75}%</div>
                                    <div className="text-xs text-zinc-500 mt-1">Verified Buyers</div>
                                </div>
                            </div>
                            <p className="mt-4 text-sm text-zinc-400">
                                <span className={reviewRisk.color}>{reviewRisk.text}</span> – Our AI analyzed seller patterns and review authenticity to assess trustworthiness.
                            </p>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Deal Score Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="deal-card p-6"
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold text-white">Tadow Score</h3>
                                <DealScore score={deal.dealScore} size="lg" />
                            </div>
                            <div className="text-lg font-semibold text-emerald-400 mb-2">{deal.aiVerdict}</div>
                            <p className="text-sm text-zinc-400">
                                Our AI analyzed pricing history, seller reputation, and market data to score this deal.
                            </p>
                        </motion.div>

                        {/* Seller Info */}
                        {deal.sellerName && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="deal-card p-6"
                            >
                                <h3 className="font-semibold text-white mb-4">Seller Information</h3>
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${deal.isVerifiedSeller ? 'bg-emerald-500/20' : 'bg-zinc-800'
                                        }`}>
                                        {deal.isVerifiedSeller ? (
                                            <Shield className="w-6 h-6 text-emerald-400" />
                                        ) : (
                                            <span className="text-xl">👤</span>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white flex items-center gap-2">
                                            {deal.sellerName}
                                            {deal.isVerifiedSeller && (
                                                <span className="text-xs px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Verified</span>
                                            )}
                                        </div>
                                        {deal.sellerRating && (
                                            <div className="text-sm text-zinc-500 flex items-center gap-1">
                                                <Star className="w-4 h-4 text-amber-400" />
                                                {deal.sellerRating} ({deal.sellerReviews?.toLocaleString()} reviews)
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="deal-card p-6"
                        >
                            <div className="grid grid-cols-2 gap-4 text-center">
                                <div className="p-3 bg-zinc-800 rounded-xl">
                                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                                        <Eye className="w-5 h-5 text-zinc-500" />
                                        {deal.views}
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">Views</div>
                                </div>
                                <div className="p-3 bg-zinc-800 rounded-xl">
                                    <div className="flex items-center justify-center gap-1 text-2xl font-bold text-white">
                                        <Bookmark className="w-5 h-5 text-zinc-500" />
                                        {deal.saves}
                                    </div>
                                    <div className="text-xs text-zinc-500 mt-1">Saves</div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Price Alert CTA */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 border border-dashed border-zinc-700 rounded-xl"
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Bell className="w-5 h-5 text-sky-400" />
                                <span className="font-medium text-white">Price Drop Alert</span>
                            </div>
                            <p className="text-sm text-zinc-500 mb-3">Get notified when this item's price drops</p>
                            <button className="w-full btn-secondary text-sm">
                                Set Alert
                            </button>
                        </motion.div>
                    </div>
                </div>

                {/* Similar Deals */}
                {similarDeals.length > 0 && (
                    <section className="mt-12">
                        <h2 className="text-xl font-semibold text-white mb-6">Similar Deals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {similarDeals.slice(0, 4).map((deal) => (
                                <DealCard key={deal.id} deal={deal} variant="compact" />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
