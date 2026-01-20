/**
 * Deal Normalizer
 * Transforms raw deals from various sources into unified format
 */

import { v4 as uuidv4 } from 'uuid';
import type { RawDeal, NormalizedDeal, DealCategory, DealCondition } from './types';

const CONDITION_LABELS: Record<DealCondition, string> = {
    new: 'Brand New',
    like_new: 'Like New',
    refurbished: 'Refurbished',
    used: 'Used',
    for_parts: 'For Parts'
};

export function normalizeDeal(raw: RawDeal): NormalizedDeal {
    const now = new Date();

    // Calculate discount percentage
    const originalPrice = raw.originalPrice || raw.currentPrice;
    const discount = originalPrice > 0
        ? Math.round(((originalPrice - raw.currentPrice) / originalPrice) * 100)
        : 0;

    // Calculate popularity score from community signals
    const upvotes = raw.upvotes || 0;
    const downvotes = raw.downvotes || 0;
    const comments = raw.commentCount || 0;
    const popularityScore = upvotes - downvotes + (comments * 0.5);

    // Infer category from title if not provided
    const category = inferCategory(raw.title);

    return {
        id: uuidv4(),
        sourceId: raw.sourceId,
        source: raw.source,
        sourceUrl: raw.sourceUrl,

        title: cleanTitle(raw.title),
        description: raw.description || '',
        category,
        imageUrl: raw.imageUrl || getPlaceholderImage(category),
        images: raw.images || (raw.imageUrl ? [raw.imageUrl] : []),

        currentPrice: raw.currentPrice,
        originalPrice,
        discount: Math.max(0, discount),
        currency: raw.currency || 'USD',

        condition: raw.condition || 'new',
        conditionLabel: CONDITION_LABELS[raw.condition || 'new'],

        inStock: raw.inStock !== false,
        quantity: raw.quantity ?? null,

        seller: {
            name: raw.sellerName || 'Unknown Seller',
            rating: raw.sellerRating ?? 0,
            reviews: raw.sellerReviews ?? 0,
            verified: raw.isVerifiedSeller ?? false
        },

        location: raw.location ? {
            city: raw.location.city || '',
            state: raw.location.state || '',
            distance: undefined // Calculated when user location is known
        } : null,

        postedAt: raw.postedAt || now,
        expiresAt: raw.expiresAt || null,
        fetchedAt: now,

        popularity: {
            upvotes,
            downvotes,
            comments,
            score: popularityScore
        },

        couponCode: raw.couponCode || null,
        promoDetails: raw.promoDetails || null
    };
}

export function normalizeDeals(rawDeals: RawDeal[]): NormalizedDeal[] {
    return rawDeals
        .map(normalizeDeal)
        .filter(deal => deal.currentPrice > 0) // Remove invalid prices
        .sort((a, b) => b.discount - a.discount); // Sort by discount
}

function cleanTitle(title: string): string {
    return title
        .trim()
        .replace(/\s+/g, ' ')           // Multiple spaces to single
        .replace(/[^\w\s\-.,()&]/g, '') // Remove special chars
        .substring(0, 200);             // Limit length
}

function inferCategory(title: string): DealCategory {
    const titleLower = title.toLowerCase();

    const patterns: [DealCategory, string[]][] = [
        ['laptops', ['laptop', 'notebook', 'macbook', 'chromebook', 'thinkpad', 'dell xps', 'surface laptop']],
        ['phones', ['phone', 'iphone', 'galaxy s', 'pixel', 'smartphone', 'oneplus']],
        ['tvs', ['tv', 'television', 'oled', 'qled', '4k tv', '8k tv', 'smart tv']],
        ['gaming', ['xbox', 'playstation', 'ps5', 'ps4', 'nintendo', 'switch', 'gaming', 'rtx', 'gpu', 'graphics card']],
        ['audio', ['headphones', 'earbuds', 'speaker', 'soundbar', 'airpods', 'beats', 'bose', 'sony wh', 'audio']],
        ['wearables', ['apple watch', 'galaxy watch', 'fitbit', 'garmin', 'smartwatch', 'fitness tracker']],
        ['cameras', ['camera', 'dslr', 'mirrorless', 'gopro', 'lens', 'canon eos', 'sony a7']],
        ['computers', ['desktop', 'pc', 'imac', 'mac mini', 'mac studio', 'computer', 'workstation']],
        ['tablets', ['ipad', 'tablet', 'surface pro', 'galaxy tab']],
        ['accessories', ['case', 'charger', 'cable', 'adapter', 'keyboard', 'mouse', 'stand', 'dock']],
    ];

    for (const [category, keywords] of patterns) {
        if (keywords.some(k => titleLower.includes(k))) {
            return category;
        }
    }

    return 'other';
}

function getPlaceholderImage(category: DealCategory): string {
    const placeholders: Record<DealCategory, string> = {
        laptops: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
        phones: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
        tvs: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400',
        gaming: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400',
        audio: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
        wearables: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
        cameras: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400',
        computers: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400',
        tablets: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400',
        accessories: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=400',
        other: 'https://images.unsplash.com/photo-1491933382434-500287f9b54b?w=400'
    };

    return placeholders[category] || placeholders.other;
}

// Merge duplicate deals from different sources
export function deduplicateDeals(deals: NormalizedDeal[]): NormalizedDeal[] {
    const seen = new Map<string, NormalizedDeal>();

    for (const deal of deals) {
        // Create a fingerprint based on title similarity
        const fingerprint = createFingerprint(deal.title);

        const existing = seen.get(fingerprint);
        if (existing) {
            // Keep the one with lower price
            if (deal.currentPrice < existing.currentPrice) {
                seen.set(fingerprint, deal);
            }
        } else {
            seen.set(fingerprint, deal);
        }
    }

    return Array.from(seen.values());
}

function createFingerprint(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .slice(0, 5)
        .sort()
        .join('-');
}
