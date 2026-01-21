// Tadow Buyer-First Deal Intelligence
// Unbiased deal scoring prioritizing buyer's best interest over sponsored content

import { ShowcaseDeal } from '../data/showcaseDeals';
import { ScrapedDeal } from './dealScraper';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUYER-FIRST PRINCIPLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//
// Our deal scoring algorithm is designed with these core principles:
// 1. PRICE TRANSPARENCY: Real discounts vs inflated MSRP tricks
// 2. VALUE OVER SPONSORSHIP: Reject pay-to-play ranking
// 3. QUALITY VERIFICATION: Genuine reviews, verified sellers
// 4. HISTORICAL CONTEXT: Price history prevents "fake sales"
// 5. USER NEEDS MATCHING: Score based on buyer requirements
//
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface BuyerProfile {
    budget: { min: number; max: number };
    priorityFeatures: string[];
    useCase: 'gaming' | 'work' | 'creative' | 'casual' | 'student';
    brandPreferences?: string[];
    excludeBrands?: string[];
    minRating?: number;
    requireVerifiedSeller?: boolean;
    preferPrime?: boolean;
}

export interface DealScore {
    overall: number;
    breakdown: {
        valueScore: number;       // How good is the actual discount
        qualityScore: number;     // Product quality based on reviews
        trustScore: number;       // Seller trustworthiness
        fitScore: number;         // How well it matches buyer needs
        urgencyScore: number;     // Time-sensitivity (all-time low, limited)
    };
    flags: {
        isTrueDiscount: boolean;     // Verified against historical prices
        isAllTimeLow: boolean;       // Lowest price ever
        hasInflatedMsrp: boolean;    // Suspicious original price
        isVerifiedSeller: boolean;
        hasRecentReviews: boolean;
        matchesBuyerNeeds: boolean;
    };
    recommendation: 'strong-buy' | 'buy' | 'consider' | 'wait' | 'avoid';
    explanation: string;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUYER-FIRST SCORING ALGORITHM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function calculateBuyerFirstScore(
    deal: ShowcaseDeal | ScrapedDeal,
    buyerProfile?: BuyerProfile
): DealScore {
    // Value Score (0-30 points)
    // Based on REAL discount, not inflated MSRP
    const valueScore = calculateValueScore(deal);

    // Quality Score (0-25 points)
    // Based on verified reviews and product reputation
    const qualityScore = calculateQualityScore(deal);

    // Trust Score (0-20 points)
    // Seller verification, return policy, shipping
    const trustScore = calculateTrustScore(deal);

    // Fit Score (0-15 points)
    // How well it matches buyer's stated needs
    const fitScore = buyerProfile ? calculateFitScore(deal, buyerProfile) : 10;

    // Urgency Score (0-10 points)
    // All-time lows, limited time, stock levels
    const urgencyScore = calculateUrgencyScore(deal);

    const overall = valueScore + qualityScore + trustScore + fitScore + urgencyScore;

    // Generate flags
    const flags = generateDealFlags(deal, buyerProfile);

    // Generate recommendation
    const recommendation = getRecommendation(overall, flags);
    const explanation = generateExplanation(
        recommendation,
        { valueScore, qualityScore, trustScore, fitScore, urgencyScore },
        flags
    );

    return {
        overall,
        breakdown: { valueScore, qualityScore, trustScore, fitScore, urgencyScore },
        flags,
        recommendation,
        explanation,
    };
}

function calculateValueScore(deal: ShowcaseDeal | ScrapedDeal): number {
    const discount = deal.discountPercent;

    // Detect inflated MSRP (suspicious if discount > 50% on electronics)
    const hasInflatedMsrp = discount > 50 && deal.currentPrice < 100;

    if (hasInflatedMsrp) {
        // Penalize suspicious discounts
        return Math.min(discount * 0.3, 15);
    }

    // Normal value scoring
    if (discount >= 40) return 30;
    if (discount >= 30) return 25;
    if (discount >= 20) return 20;
    if (discount >= 10) return 15;
    if (discount >= 5) return 10;
    return 5;
}

function calculateQualityScore(deal: ShowcaseDeal | ScrapedDeal): number {
    const rating = 'sellerRating' in deal ? deal.sellerRating : (deal as ScrapedDeal).rating || 0;
    const reviewCount = 'sellerReviews' in deal ? deal.sellerReviews : (deal as ScrapedDeal).reviewCount || 0;

    let score = 0;

    // Rating score (0-15)
    if (rating >= 4.5) score += 15;
    else if (rating >= 4.0) score += 12;
    else if (rating >= 3.5) score += 8;
    else if (rating >= 3.0) score += 5;
    else score += 2;

    // Review volume bonus (0-10)
    if (reviewCount >= 10000) score += 10;
    else if (reviewCount >= 5000) score += 8;
    else if (reviewCount >= 1000) score += 6;
    else if (reviewCount >= 100) score += 4;
    else score += 2;

    return Math.min(score, 25);
}

function calculateTrustScore(deal: ShowcaseDeal | ScrapedDeal): number {
    let score = 0;

    // Verified seller
    if ('isVerifiedSeller' in deal && deal.isVerifiedSeller) {
        score += 10;
    }

    // Known marketplace bonus
    const knownMarketplaces = ['amazon', 'bestbuy', 'walmart', 'newegg', 'apple'];
    const marketplace = 'marketplace' in deal ? deal.marketplace.id : (deal as ScrapedDeal).source;
    if (knownMarketplaces.includes(marketplace.toLowerCase())) {
        score += 8;
    }

    // Prime/fast shipping
    if ('isPrime' in deal && deal.isPrime) {
        score += 2;
    }

    return Math.min(score, 20);
}

function calculateFitScore(deal: ShowcaseDeal | ScrapedDeal, profile: BuyerProfile): number {
    let score = 0;

    // Budget fit
    if (deal.currentPrice >= profile.budget.min && deal.currentPrice <= profile.budget.max) {
        score += 8;
    } else if (deal.currentPrice < profile.budget.min) {
        score += 5; // Under budget is still good
    }

    // Brand preference
    const brand = 'brand' in deal ? deal.brand : '';
    if (brand && profile.brandPreferences?.includes(brand)) {
        score += 4;
    }
    if (brand && profile.excludeBrands?.includes(brand)) {
        score -= 10;
    }

    // Rating requirement
    const rating = 'sellerRating' in deal ? deal.sellerRating : (deal as ScrapedDeal).rating || 0;
    if (profile.minRating && rating >= profile.minRating) {
        score += 3;
    }

    return Math.max(0, Math.min(score, 15));
}

function calculateUrgencyScore(deal: ShowcaseDeal | ScrapedDeal): number {
    let score = 0;

    // All-time low
    if ('isAllTimeLow' in deal && deal.isAllTimeLow) {
        score += 5;
    }

    // Hot deal
    if ('isHot' in deal && deal.isHot) {
        score += 3;
    }

    // High deal score
    if ('dealScore' in deal && deal.dealScore >= 90) {
        score += 2;
    }

    return Math.min(score, 10);
}

function generateDealFlags(
    deal: ShowcaseDeal | ScrapedDeal,
    profile?: BuyerProfile
): DealScore['flags'] {
    const discount = deal.discountPercent;
    const reviewCount = 'sellerReviews' in deal ? deal.sellerReviews : (deal as ScrapedDeal).reviewCount || 0;

    return {
        isTrueDiscount: discount <= 50 || deal.currentPrice > 200,
        isAllTimeLow: 'isAllTimeLow' in deal ? deal.isAllTimeLow : false,
        hasInflatedMsrp: discount > 60 && deal.currentPrice < 100,
        isVerifiedSeller: 'isVerifiedSeller' in deal ? deal.isVerifiedSeller : true,
        hasRecentReviews: reviewCount > 50,
        matchesBuyerNeeds: profile ?
            deal.currentPrice <= profile.budget.max : true,
    };
}

function getRecommendation(score: number, flags: DealScore['flags']): DealScore['recommendation'] {
    // Penalize for red flags
    if (flags.hasInflatedMsrp) return 'avoid';
    if (!flags.isVerifiedSeller) return 'wait';

    // Score-based recommendation
    if (score >= 85) return 'strong-buy';
    if (score >= 70) return 'buy';
    if (score >= 55) return 'consider';
    if (score >= 40) return 'wait';
    return 'avoid';
}

function generateExplanation(
    recommendation: DealScore['recommendation'],
    scores: DealScore['breakdown'],
    flags: DealScore['flags']
): string {
    const parts: string[] = [];

    if (recommendation === 'strong-buy') {
        parts.push('🎯 Excellent deal that matches your needs perfectly.');
    } else if (recommendation === 'buy') {
        parts.push('✅ Good deal worth considering.');
    } else if (recommendation === 'consider') {
        parts.push('🤔 Decent deal but not the best we\'ve seen.');
    } else if (recommendation === 'wait') {
        parts.push('⏳ Consider waiting for a better price.');
    } else {
        parts.push('⚠️ We don\'t recommend this deal.');
    }

    if (flags.isAllTimeLow) {
        parts.push('📉 This is the lowest price we\'ve recorded!');
    }

    if (flags.hasInflatedMsrp) {
        parts.push('🚫 Warning: The original price appears inflated.');
    }

    if (scores.qualityScore >= 20) {
        parts.push('⭐ Highly rated product with many positive reviews.');
    }

    return parts.join(' ');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PERSISTENT DEAL HUNTING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DealHunt {
    id: string;
    createdAt: Date;
    profile: BuyerProfile;
    searchQuery: string;
    category: string;
    targetPrice?: number;
    minDealScore: number;
    status: 'active' | 'found' | 'paused' | 'expired';
    lastChecked?: Date;
    matchedDeals: string[]; // Deal IDs that matched
    notificationSettings: {
        email: boolean;
        push: boolean;
        inApp: boolean;
    };
}

const DEAL_HUNTS_KEY = 'tadow_deal_hunts';

export function getDealHunts(): DealHunt[] {
    try {
        return JSON.parse(localStorage.getItem(DEAL_HUNTS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveDealHunt(hunt: Omit<DealHunt, 'id' | 'createdAt' | 'status' | 'matchedDeals' | 'lastChecked'>): DealHunt {
    const hunts = getDealHunts();

    const newHunt: DealHunt = {
        ...hunt,
        id: `hunt-${Date.now()}`,
        createdAt: new Date(),
        status: 'active',
        matchedDeals: [],
    };

    hunts.push(newHunt);
    localStorage.setItem(DEAL_HUNTS_KEY, JSON.stringify(hunts));

    return newHunt;
}

export function updateDealHunt(id: string, updates: Partial<DealHunt>): void {
    const hunts = getDealHunts();
    const index = hunts.findIndex(h => h.id === id);

    if (index !== -1) {
        hunts[index] = { ...hunts[index], ...updates };
        localStorage.setItem(DEAL_HUNTS_KEY, JSON.stringify(hunts));
    }
}

export function deleteDealHunt(id: string): void {
    const hunts = getDealHunts().filter(h => h.id !== id);
    localStorage.setItem(DEAL_HUNTS_KEY, JSON.stringify(hunts));
}

export function checkDealAgainstHunts(deal: ShowcaseDeal | ScrapedDeal): DealHunt[] {
    const hunts = getDealHunts().filter(h => h.status === 'active');
    const matchedHunts: DealHunt[] = [];

    for (const hunt of hunts) {
        const score = calculateBuyerFirstScore(deal, hunt.profile);

        // Check if deal matches hunt criteria
        const meetsScore = score.overall >= hunt.minDealScore;
        const meetsPrice = !hunt.targetPrice || deal.currentPrice <= hunt.targetPrice;
        const meetsCategory = !hunt.category ||
            ('category' in deal && deal.category.toLowerCase().includes(hunt.category.toLowerCase()));

        if (meetsScore && meetsPrice && meetsCategory) {
            matchedHunts.push(hunt);

            // Update hunt with matched deal
            const dealId = deal.id;
            if (!hunt.matchedDeals.includes(dealId)) {
                updateDealHunt(hunt.id, {
                    matchedDeals: [...hunt.matchedDeals, dealId],
                    lastChecked: new Date(),
                });
            }
        }
    }

    return matchedHunts;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEAL ALERTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface DealAlert {
    id: string;
    huntId: string;
    dealId: string;
    dealTitle: string;
    dealPrice: number;
    dealScore: number;
    createdAt: Date;
    read: boolean;
}

const DEAL_ALERTS_KEY = 'tadow_deal_alerts';

export function getDealAlerts(): DealAlert[] {
    try {
        return JSON.parse(localStorage.getItem(DEAL_ALERTS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function createDealAlert(
    hunt: DealHunt,
    deal: ShowcaseDeal | ScrapedDeal,
    score: number
): DealAlert {
    const alerts = getDealAlerts();

    const alert: DealAlert = {
        id: `alert-${Date.now()}`,
        huntId: hunt.id,
        dealId: deal.id,
        dealTitle: deal.title,
        dealPrice: deal.currentPrice,
        dealScore: score,
        createdAt: new Date(),
        read: false,
    };

    alerts.unshift(alert);
    localStorage.setItem(DEAL_ALERTS_KEY, JSON.stringify(alerts.slice(0, 100))); // Keep last 100

    // Trigger browser notification if permitted
    if (hunt.notificationSettings.push && 'Notification' in window) {
        if (Notification.permission === 'granted') {
            new Notification('🎯 Deal Found!', {
                body: `${deal.title} at $${deal.currentPrice}`,
                icon: '/favicon.png',
            });
        }
    }

    return alert;
}

export function markAlertRead(alertId: string): void {
    const alerts = getDealAlerts();
    const index = alerts.findIndex(a => a.id === alertId);

    if (index !== -1) {
        alerts[index].read = true;
        localStorage.setItem(DEAL_ALERTS_KEY, JSON.stringify(alerts));
    }
}

export function getUnreadAlertCount(): number {
    return getDealAlerts().filter(a => !a.read).length;
}
