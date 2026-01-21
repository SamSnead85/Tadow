/**
 * DealScorer Service - AI-Powered Deal Quality Scoring
 * 
 * Scores deals on a 0-100 scale based on:
 * - Price History Analysis (30%)
 * - Discount Percentage (20%)
 * - Product Quality & Reviews (20%)
 * - Deal Freshness & Availability (15%)
 * - Retailer Trustworthiness (10%)
 * - User Engagement (5%)
 */

interface DealData {
    id: string;
    title: string;
    currentPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    category: string;
    brand?: string;
    marketplace: string;
    sellerRating?: number;
    reviewScore?: number;
    reviewCount?: number;
    daysOnMarket?: number;
    priceHistory?: PricePoint[];
    isAllTimeLow?: boolean;
    stockLevel?: 'in_stock' | 'low_stock' | 'out_of_stock';
    views?: number;
    saves?: number;
}

interface PricePoint {
    price: number;
    date: Date;
}

interface ScoringResult {
    totalScore: number;
    verdict: 'incredible' | 'great' | 'good' | 'fair' | 'poor';
    verdictText: string;
    breakdown: ScoreBreakdown;
    insights: string[];
    recommendation: 'buy_now' | 'wait' | 'skip';
}

interface ScoreBreakdown {
    priceHistory: number;
    discount: number;
    productQuality: number;
    freshness: number;
    retailerTrust: number;
    engagement: number;
}

// Retailer trust scores (1-100)
const RETAILER_TRUST_SCORES: Record<string, number> = {
    'amazon': 95,
    'bestbuy': 92,
    'walmart': 90,
    'target': 88,
    'costco': 95,
    'newegg': 85,
    'bhphoto': 92,
    'apple': 98,
    'samsung': 90,
    'dell': 85,
    'hp': 82,
    'ebay': 70, // Variable, depends on seller
    'facebook marketplace': 50,
    'craigslist': 40,
    'offerup': 55,
    'swappa': 75,
    'woot': 85,
    'default': 60,
};

// Category-specific discount thresholds (what counts as a "good deal")
const CATEGORY_DISCOUNT_THRESHOLDS: Record<string, { great: number; good: number }> = {
    'electronics': { great: 25, good: 15 },
    'laptops': { great: 20, good: 12 },
    'smartphones': { great: 15, good: 10 },
    'audio': { great: 30, good: 20 },
    'appliances': { great: 25, good: 15 },
    'gaming': { great: 20, good: 12 },
    'tvs': { great: 25, good: 15 },
    'clothing': { great: 50, good: 30 },
    'shoes': { great: 40, good: 25 },
    'default': { great: 30, good: 18 },
};

export class DealScorer {
    /**
     * Calculate comprehensive deal score
     */
    public scoreDeal(deal: DealData): ScoringResult {
        const breakdown: ScoreBreakdown = {
            priceHistory: this.scorePriceHistory(deal),
            discount: this.scoreDiscount(deal),
            productQuality: this.scoreProductQuality(deal),
            freshness: this.scoreFreshness(deal),
            retailerTrust: this.scoreRetailerTrust(deal),
            engagement: this.scoreEngagement(deal),
        };

        // Weighted total
        const totalScore = Math.round(
            breakdown.priceHistory * 0.30 +
            breakdown.discount * 0.20 +
            breakdown.productQuality * 0.20 +
            breakdown.freshness * 0.15 +
            breakdown.retailerTrust * 0.10 +
            breakdown.engagement * 0.05
        );

        const verdict = this.getVerdict(totalScore);
        const insights = this.generateInsights(deal, breakdown);
        const recommendation = this.getRecommendation(totalScore, deal);

        return {
            totalScore,
            verdict: verdict.type,
            verdictText: verdict.text,
            breakdown,
            insights,
            recommendation,
        };
    }

    /**
     * Score based on price history (30% weight)
     * Compares current price to historical prices
     */
    private scorePriceHistory(deal: DealData): number {
        if (!deal.priceHistory || deal.priceHistory.length === 0) {
            // No history, can't evaluate - return neutral score
            return 50;
        }

        const prices = deal.priceHistory.map(p => p.price);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Calculate how good this price is vs history
        let score = 50;

        // Bonus for being at or near all-time low
        if (deal.isAllTimeLow || deal.currentPrice <= minPrice * 1.02) {
            score += 35;
        } else if (deal.currentPrice <= minPrice * 1.05) {
            score += 25;
        } else if (deal.currentPrice <= avgPrice * 0.9) {
            score += 15;
        }

        // Penalty for being above average
        if (deal.currentPrice > avgPrice) {
            score -= Math.min(30, (deal.currentPrice / avgPrice - 1) * 100);
        }

        // Big penalty for being near historic high
        if (deal.currentPrice >= maxPrice * 0.95) {
            score -= 20;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Score based on discount percentage (20% weight)
     * Adjusts for category-specific norms
     */
    private scoreDiscount(deal: DealData): number {
        const discount = deal.discountPercent ||
            (deal.originalPrice ? ((deal.originalPrice - deal.currentPrice) / deal.originalPrice) * 100 : 0);

        if (discount <= 0) return 20; // No discount

        const thresholds = CATEGORY_DISCOUNT_THRESHOLDS[deal.category.toLowerCase()] ||
            CATEGORY_DISCOUNT_THRESHOLDS.default;

        if (discount >= thresholds.great * 1.5) return 100; // Exceptional
        if (discount >= thresholds.great) return 85;
        if (discount >= thresholds.good) return 70;
        if (discount >= thresholds.good * 0.5) return 50;

        return 35;
    }

    /**
     * Score based on product quality and reviews (20% weight)
     */
    private scoreProductQuality(deal: DealData): number {
        let score = 50; // Base score

        if (deal.reviewScore) {
            // 4.5+ stars is excellent, 4.0+ is good
            if (deal.reviewScore >= 4.5) score += 30;
            else if (deal.reviewScore >= 4.0) score += 20;
            else if (deal.reviewScore >= 3.5) score += 5;
            else if (deal.reviewScore < 3.0) score -= 20;
        }

        if (deal.reviewCount) {
            // More reviews = more confidence
            if (deal.reviewCount >= 1000) score += 15;
            else if (deal.reviewCount >= 500) score += 10;
            else if (deal.reviewCount >= 100) score += 5;
            else if (deal.reviewCount < 10) score -= 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Score based on deal freshness and availability (15% weight)
     */
    private scoreFreshness(deal: DealData): number {
        let score = 50;

        // Freshness bonus
        if (deal.daysOnMarket !== undefined) {
            if (deal.daysOnMarket <= 1) score += 30; // Just listed today
            else if (deal.daysOnMarket <= 3) score += 20;
            else if (deal.daysOnMarket <= 7) score += 10;
            else if (deal.daysOnMarket > 30) score -= 15;
        }

        // Stock status
        if (deal.stockLevel === 'low_stock') {
            score += 10; // Urgency bonus
        } else if (deal.stockLevel === 'out_of_stock') {
            score -= 40; // Major penalty
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Score based on retailer trustworthiness (10% weight)
     */
    private scoreRetailerTrust(deal: DealData): number {
        const marketplace = deal.marketplace.toLowerCase().replace(/[^a-z]/g, '');
        let baseScore = RETAILER_TRUST_SCORES[marketplace] || RETAILER_TRUST_SCORES.default;

        // Adjust for seller rating if available
        if (deal.sellerRating) {
            if (deal.sellerRating >= 4.5) baseScore += 5;
            else if (deal.sellerRating < 3.5) baseScore -= 15;
        }

        return Math.max(0, Math.min(100, baseScore));
    }

    /**
     * Score based on user engagement signals (5% weight)
     */
    private scoreEngagement(deal: DealData): number {
        let score = 50;

        // Views indicate interest
        if (deal.views && deal.views >= 1000) score += 20;
        else if (deal.views && deal.views >= 500) score += 10;

        // Saves indicate strong interest
        if (deal.saves && deal.saves >= 100) score += 25;
        else if (deal.saves && deal.saves >= 50) score += 15;
        else if (deal.saves && deal.saves >= 20) score += 5;

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Get human-readable verdict based on score
     */
    private getVerdict(score: number): { type: 'incredible' | 'great' | 'good' | 'fair' | 'poor'; text: string } {
        if (score >= 85) return { type: 'incredible', text: '🔥 Incredible Deal' };
        if (score >= 70) return { type: 'great', text: '⭐ Great Value' };
        if (score >= 55) return { type: 'good', text: '✓ Good Deal' };
        if (score >= 40) return { type: 'fair', text: '→ Fair Price' };
        return { type: 'poor', text: '⚠️ Consider Waiting' };
    }

    /**
     * Generate actionable insights for the user
     */
    private generateInsights(deal: DealData, breakdown: ScoreBreakdown): string[] {
        const insights: string[] = [];

        if (deal.isAllTimeLow) {
            insights.push('🏆 This is the lowest price we\'ve ever tracked!');
        }

        if (breakdown.priceHistory >= 80) {
            insights.push('📉 Price is significantly below average');
        } else if (breakdown.priceHistory <= 30) {
            insights.push('📈 Price is above historical average - consider waiting');
        }

        if (breakdown.discount >= 85) {
            insights.push(`💰 Exceptional ${deal.discountPercent?.toFixed(0)}% discount for this category`);
        }

        if (breakdown.productQuality >= 80) {
            insights.push('⭐ Highly rated product with excellent reviews');
        }

        if (deal.stockLevel === 'low_stock') {
            insights.push('⚡ Limited stock - may sell out soon');
        }

        if (breakdown.retailerTrust >= 90) {
            insights.push('🛡️ From a highly trusted retailer');
        } else if (breakdown.retailerTrust <= 50) {
            insights.push('⚠️ Verify seller reputation before purchasing');
        }

        return insights.slice(0, 4); // Max 4 insights
    }

    /**
     * Provide buy/wait recommendation
     */
    private getRecommendation(score: number, deal: DealData): 'buy_now' | 'wait' | 'skip' {
        if (score >= 75 || deal.isAllTimeLow) return 'buy_now';
        if (score >= 50) return 'wait';
        return 'skip';
    }
}

// Export singleton instance
export const dealScorer = new DealScorer();
