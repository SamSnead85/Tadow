/**
 * AI Scoring Service
 * Calculates deal quality scores based on multiple factors
 */

import type { NormalizedDeal } from './types';

interface AIScore {
    overall: number;          // 0-100
    priceScore: number;       // 0-100
    sellerScore: number;      // 0-100
    timingScore: number;      // 0-100
    verdict: string;
    reasons: string[];
}

export function calculateAIScore(deal: NormalizedDeal): AIScore {
    const reasons: string[] = [];

    // Price Score (40% weight)
    let priceScore = 50;

    if (deal.discount >= 50) {
        priceScore = 95;
        reasons.push(`Exceptional ${deal.discount}% discount`);
    } else if (deal.discount >= 30) {
        priceScore = 85;
        reasons.push(`Strong ${deal.discount}% discount`);
    } else if (deal.discount >= 20) {
        priceScore = 75;
        reasons.push(`Good ${deal.discount}% savings`);
    } else if (deal.discount >= 10) {
        priceScore = 65;
        reasons.push(`Modest ${deal.discount}% discount`);
    } else if (deal.discount > 0) {
        priceScore = 55;
    }

    // All-time low check
    if (deal.isAllTimeLow) {
        priceScore = Math.min(100, priceScore + 10);
        reasons.push('All-time lowest price!');
    }

    // Seller Score (30% weight)
    let sellerScore = 50;

    if (deal.seller.verified) {
        sellerScore += 15;
        reasons.push('Verified seller');
    }

    if (deal.seller.rating >= 4.8) {
        sellerScore += 25;
        reasons.push(`Excellent ${deal.seller.rating.toFixed(1)}★ rating`);
    } else if (deal.seller.rating >= 4.5) {
        sellerScore += 20;
    } else if (deal.seller.rating >= 4.0) {
        sellerScore += 10;
    } else if (deal.seller.rating < 3.5 && deal.seller.rating > 0) {
        sellerScore -= 15;
        reasons.push('Lower seller rating - buy with caution');
    }

    if (deal.seller.reviews > 1000) {
        sellerScore += 10;
        reasons.push(`${deal.seller.reviews.toLocaleString()} reviews`);
    } else if (deal.seller.reviews > 100) {
        sellerScore += 5;
    }

    sellerScore = Math.min(100, Math.max(0, sellerScore));

    // Timing Score (20% weight)
    let timingScore = 50;

    const hoursOld = (Date.now() - deal.postedAt.getTime()) / (1000 * 60 * 60);

    if (hoursOld < 1) {
        timingScore = 95;
        reasons.push('Just posted - act fast!');
    } else if (hoursOld < 6) {
        timingScore = 85;
        reasons.push('Fresh deal');
    } else if (hoursOld < 24) {
        timingScore = 70;
    } else if (hoursOld > 72) {
        timingScore = 40;
        reasons.push('Deal may be expired');
    }

    // Community Score (10% weight) - from deal aggregators
    let communityScore = 50;

    if (deal.popularity.score > 100) {
        communityScore = 90;
        reasons.push('Highly rated by community');
    } else if (deal.popularity.score > 50) {
        communityScore = 75;
    } else if (deal.popularity.score > 10) {
        communityScore = 60;
    }

    // Calculate overall
    const overall = Math.round(
        priceScore * 0.40 +
        sellerScore * 0.30 +
        timingScore * 0.20 +
        communityScore * 0.10
    );

    // Generate verdict
    let verdict: string;
    if (overall >= 90) {
        verdict = 'Exceptional Deal';
    } else if (overall >= 80) {
        verdict = 'Great Deal';
    } else if (overall >= 70) {
        verdict = 'Good Value';
    } else if (overall >= 60) {
        verdict = 'Fair Price';
    } else if (overall >= 50) {
        verdict = 'Average';
    } else {
        verdict = 'Below Average';
    }

    return {
        overall,
        priceScore,
        sellerScore,
        timingScore,
        verdict,
        reasons: reasons.slice(0, 4) // Limit to top 4 reasons
    };
}

export function enhanceDealsWithScores(deals: NormalizedDeal[]): NormalizedDeal[] {
    return deals.map(deal => ({
        ...deal,
        aiScore: calculateAIScore(deal)
    }));
}

// Detect potential fake deal patterns
export function detectSuspiciousDeals(deals: NormalizedDeal[]): NormalizedDeal[] {
    return deals.map(deal => {
        const suspiciousFlags: string[] = [];

        // Too good to be true pricing
        if (deal.discount > 80 && deal.currentPrice < 50) {
            suspiciousFlags.push('Unusually high discount');
        }

        // New seller with amazing deal
        if (deal.seller.reviews < 10 && deal.discount > 50) {
            suspiciousFlags.push('New seller with steep discount');
        }

        // Local marketplace with premium item
        if ((deal.source === 'craigslist' || deal.source === 'facebook') &&
            deal.currentPrice > 500 && deal.condition === 'new') {
            suspiciousFlags.push('High-value item on local marketplace');
        }

        if (suspiciousFlags.length > 0 && deal.aiScore) {
            return {
                ...deal,
                aiScore: {
                    ...deal.aiScore,
                    reasons: [...deal.aiScore.reasons, `⚠️ ${suspiciousFlags[0]}`]
                }
            };
        }

        return deal;
    });
}
