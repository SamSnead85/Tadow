/**
 * Verity Marketplace Integration - Unified Types
 * All marketplace sources normalize to these interfaces
 */

export type MarketplaceSource =
    | 'amazon'
    | 'ebay'
    | 'bestbuy'
    | 'walmart'
    | 'target'
    | 'newegg'
    | 'slickdeals'
    | 'dealnews'
    | 'techbargains'
    | 'craigslist'
    | 'facebook'
    | 'offerup';

export type DealCondition = 'new' | 'like_new' | 'refurbished' | 'used' | 'for_parts';

export type DealCategory =
    | 'laptops'
    | 'phones'
    | 'tvs'
    | 'gaming'
    | 'audio'
    | 'wearables'
    | 'cameras'
    | 'computers'
    | 'tablets'
    | 'accessories'
    | 'other';

export interface RawDeal {
    // Source identification
    sourceId: string;           // Unique ID from source
    source: MarketplaceSource;
    sourceUrl: string;          // Link to original listing

    // Product info
    title: string;
    description?: string;
    imageUrl?: string;
    images?: string[];

    // Pricing
    currentPrice: number;
    originalPrice?: number;
    currency: string;

    // Condition & availability
    condition: DealCondition;
    inStock?: boolean;
    quantity?: number;

    // Seller info
    sellerName?: string;
    sellerRating?: number;      // 0-5 scale
    sellerReviews?: number;
    isVerifiedSeller?: boolean;

    // Location (for local deals)
    location?: {
        city?: string;
        state?: string;
        zip?: string;
        lat?: number;
        lng?: number;
    };

    // Timing
    postedAt?: Date;
    expiresAt?: Date;

    // Community signals (from deal aggregators)
    upvotes?: number;
    downvotes?: number;
    commentCount?: number;

    // Coupon/promo
    couponCode?: string;
    promoDetails?: string;

    // Raw data for debugging
    rawData?: Record<string, unknown>;
}

export interface NormalizedDeal {
    id: string;                 // Generated UUID
    sourceId: string;
    source: MarketplaceSource;
    sourceUrl: string;

    // Product
    title: string;
    description: string;
    category: DealCategory;
    imageUrl: string;
    images: string[];

    // Pricing
    currentPrice: number;
    originalPrice: number;
    discount: number;           // Percentage (0-100)
    currency: string;

    // Condition
    condition: DealCondition;
    conditionLabel: string;     // Human readable

    // Availability
    inStock: boolean;
    quantity: number | null;

    // Seller
    seller: {
        name: string;
        rating: number;
        reviews: number;
        verified: boolean;
    };

    // Location
    location: {
        city: string;
        state: string;
        distance?: number;        // Miles from user
    } | null;

    // Timing
    postedAt: Date;
    expiresAt: Date | null;
    fetchedAt: Date;

    // Community
    popularity: {
        upvotes: number;
        downvotes: number;
        comments: number;
        score: number;            // Calculated engagement score
    };

    // Promos
    couponCode: string | null;
    promoDetails: string | null;

    // AI Scoring (computed later)
    aiScore?: {
        overall: number;          // 0-100
        priceScore: number;
        sellerScore: number;
        timingScore: number;
        verdict: string;
        reasons: string[];
    };

    // Price history
    priceHistory?: {
        date: Date;
        price: number;
    }[];
    allTimeLow?: number;
    isAllTimeLow?: boolean;
}

export interface FetchResult {
    source: MarketplaceSource;
    deals: RawDeal[];
    fetchedAt: Date;
    duration: number;           // ms
    success: boolean;
    error?: string;
    rateLimit?: {
        remaining: number;
        resetAt: Date;
    };
}

export interface SourceConfig {
    name: MarketplaceSource;
    enabled: boolean;
    apiKey?: string;
    rateLimit: {
        requestsPerMinute: number;
        requestsPerDay: number;
    };
    categories: DealCategory[];
    fetchInterval: number;      // Minutes between fetches
    priority: number;           // Higher = fetch first
}

export interface CacheEntry<T> {
    data: T;
    cachedAt: Date;
    expiresAt: Date;
    hits: number;
}
