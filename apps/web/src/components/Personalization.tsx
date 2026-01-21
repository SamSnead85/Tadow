import { useState, useEffect } from 'react';
import { ALL_DEALS } from '../data/extendedDeals';
import { getPreferences, getRecentlyViewed, getWatchlist } from '../services/userDataService';

// Personalization Types
interface UserProfile {
    favoriteCategories: string[];
    favoriteBrands: string[];
    priceRange: { min: number; max: number };
    dealPreferences: {
        preferHot: boolean;
        preferAllTimeLow: boolean;
        minDiscount: number;
    };
    browsingHistory: { category: string; count: number }[];
    purchaseHistory: { category: string; brand: string; price: number }[];
}

interface PersonalizedRecommendation {
    dealId: string;
    score: number;
    reason: string;
}

// Build user profile from behavior
function buildUserProfile(): UserProfile {
    const prefs = getPreferences();
    const recentlyViewed = getRecentlyViewed();
    const watchlist = getWatchlist();

    // Analyze browsing patterns
    const categoryCount: Record<string, number> = {};
    const brandCount: Record<string, number> = {};
    const prices: number[] = [];

    [...recentlyViewed, ...watchlist].forEach(item => {
        const deal = ALL_DEALS.find(d => d.id === item.dealId);
        if (deal) {
            categoryCount[deal.category] = (categoryCount[deal.category] || 0) + 1;
            brandCount[deal.brand] = (brandCount[deal.brand] || 0) + 1;
            prices.push(deal.currentPrice);
        }
    });

    // Sort by frequency
    const topCategories = Object.entries(categoryCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([cat]) => cat);

    const topBrands = Object.entries(brandCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([brand]) => brand);

    // Price range
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 500;

    return {
        favoriteCategories: topCategories.length ? topCategories : prefs.favoriteCategories || ['Laptops', 'Phones'],
        favoriteBrands: topBrands.length ? topBrands : prefs.favoriteBrands || ['Apple', 'Samsung'],
        priceRange: { min: avgPrice * 0.3, max: avgPrice * 2 },
        dealPreferences: {
            preferHot: true,
            preferAllTimeLow: true,
            minDiscount: 10,
        },
        browsingHistory: Object.entries(categoryCount).map(([category, count]) => ({ category, count })),
        purchaseHistory: [],
    };
}

// Score deals based on user profile
function scoreDeals(profile: UserProfile): PersonalizedRecommendation[] {
    return ALL_DEALS.map(deal => {
        let score = 0;
        const reasons: string[] = [];

        // Category match
        if (profile.favoriteCategories.includes(deal.category)) {
            score += 30;
            reasons.push('In your favorite category');
        }

        // Brand match
        if (profile.favoriteBrands.includes(deal.brand)) {
            score += 25;
            reasons.push('Brand you love');
        }

        // Price range match
        if (deal.currentPrice >= profile.priceRange.min && deal.currentPrice <= profile.priceRange.max) {
            score += 15;
            reasons.push('In your price range');
        }

        // Hot deal preference
        if (profile.dealPreferences.preferHot && deal.isHot) {
            score += 20;
            reasons.push('Hot deal');
        }

        // Discount preference
        if (deal.discountPercent >= profile.dealPreferences.minDiscount) {
            score += deal.discountPercent * 0.5;
            reasons.push(`${deal.discountPercent}% off`);
        }

        // Deal score boost
        score += (deal.dealScore || 80) * 0.1;

        return {
            dealId: deal.id,
            score,
            reason: reasons[0] || 'Great deal',
        };
    }).sort((a, b) => b.score - a.score);
}

// Personalization Hook
export function usePersonalization() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [recommendations, setRecommendations] = useState<PersonalizedRecommendation[]>([]);

    useEffect(() => {
        const userProfile = buildUserProfile();
        setProfile(userProfile);
        setRecommendations(scoreDeals(userProfile));
    }, []);

    const getTopRecommendations = (count: number = 10) => {
        return recommendations.slice(0, count).map(rec => ({
            ...rec,
            deal: ALL_DEALS.find(d => d.id === rec.dealId),
        }));
    };

    const getRecommendationsForCategory = (category: string, count: number = 5) => {
        const categoryDeals = ALL_DEALS.filter(d => d.category === category);
        return recommendations
            .filter(r => categoryDeals.some(d => d.id === r.dealId))
            .slice(0, count)
            .map(rec => ({
                ...rec,
                deal: categoryDeals.find(d => d.id === rec.dealId),
            }));
    };

    const getSimilarDeals = (dealId: string, count: number = 4) => {
        const deal = ALL_DEALS.find(d => d.id === dealId);
        if (!deal) return [];

        return ALL_DEALS
            .filter(d => d.id !== dealId && (d.category === deal.category || d.brand === deal.brand))
            .slice(0, count);
    };

    const getDealsYouMightLike = (count: number = 6) => {
        if (!profile) return [];

        return ALL_DEALS
            .filter(d =>
                profile.favoriteCategories.includes(d.category) ||
                profile.favoriteBrands.includes(d.brand)
            )
            .sort((a, b) => (b.dealScore || 80) - (a.dealScore || 80))
            .slice(0, count);
    };

    return {
        profile,
        recommendations: getTopRecommendations,
        similarDeals: getSimilarDeals,
        categoryRecommendations: getRecommendationsForCategory,
        dealsYouMightLike: getDealsYouMightLike,
    };
}

// Personalized Feed Component
export function PersonalizedFeed() {
    const { recommendations, profile } = usePersonalization();
    const topDeals = recommendations(8);

    if (!profile) return null;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-white">For You</h2>
                    <p className="text-sm text-zinc-400">
                        Based on your interest in {profile.favoriteCategories.slice(0, 2).join(' & ')}
                    </p>
                </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {topDeals.map(({ deal, reason, score }) => deal && (
                    <div
                        key={deal.id}
                        className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition-colors"
                    >
                        <div className="aspect-video bg-zinc-800 relative">
                            <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />
                            <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500/90 text-black text-xs font-medium rounded">
                                {reason}
                            </div>
                        </div>
                        <div className="p-3">
                            <h4 className="text-white font-medium text-sm line-clamp-1">{deal.title}</h4>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-amber-400 font-bold">${deal.currentPrice}</span>
                                <span className="text-zinc-500 line-through text-sm">${deal.originalPrice}</span>
                                <span className="text-emerald-400 text-sm">{deal.discountPercent}% off</span>
                            </div>
                            <div className="text-xs text-zinc-500 mt-1">Match score: {Math.round(score)}%</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// "Because You Viewed" Component
export function BecauseYouViewed({ dealId }: { dealId: string }) {
    const { similarDeals } = usePersonalization();
    const deals = similarDeals(dealId, 4);

    if (deals.length === 0) return null;

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3">Because you viewed this</h4>
            <div className="grid grid-cols-2 gap-3">
                {deals.map(deal => (
                    <div key={deal.id} className="flex items-center gap-2">
                        <img src={deal.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                            <div className="text-sm text-white truncate">{deal.title}</div>
                            <div className="text-sm text-amber-400">${deal.currentPrice}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default { usePersonalization, PersonalizedFeed, BecauseYouViewed };
