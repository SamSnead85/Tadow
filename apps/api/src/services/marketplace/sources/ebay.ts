/**
 * eBay Browse API Integration
 * Official API for searching eBay listings
 * Requires API key from https://developer.ebay.com
 */

import { BaseFetcher } from '../fetcher';
import type { RawDeal, FetchResult, DealCondition } from '../types';

const EBAY_API_BASE = 'https://api.ebay.com/buy/browse/v1';

// Condition mapping from eBay to our format
const CONDITION_MAP: Record<string, DealCondition> = {
    'NEW': 'new',
    'LIKE_NEW': 'like_new',
    'NEW_OTHER': 'like_new',
    'NEW_WITH_DEFECTS': 'like_new',
    'CERTIFIED_REFURBISHED': 'refurbished',
    'EXCELLENT_REFURBISHED': 'refurbished',
    'VERY_GOOD_REFURBISHED': 'refurbished',
    'GOOD_REFURBISHED': 'refurbished',
    'SELLER_REFURBISHED': 'refurbished',
    'USED_EXCELLENT': 'used',
    'USED_VERY_GOOD': 'used',
    'USED_GOOD': 'used',
    'USED_ACCEPTABLE': 'used',
    'FOR_PARTS_OR_NOT_WORKING': 'for_parts'
};

interface EbayItem {
    itemId: string;
    title: string;
    price: { value: string; currency: string };
    image?: { imageUrl: string };
    condition: string;
    conditionId: string;
    itemWebUrl: string;
    seller: {
        username: string;
        feedbackPercentage: string;
        feedbackScore: number;
    };
    itemLocation?: { city: string; stateOrProvince: string };
    shippingOptions?: Array<{ shippingCost: { value: string } }>;
    marketingPrice?: { originalPrice: { value: string } };
    buyingOptions?: string[];
}

export class EbayFetcher extends BaseFetcher {
    private accessToken: string | null = null;
    private tokenExpiry: Date | null = null;

    constructor() {
        super({
            name: 'ebay',
            enabled: true,
            apiKey: process.env.EBAY_APP_ID,
            rateLimit: {
                requestsPerMinute: 50,
                requestsPerDay: 5000
            },
            categories: ['laptops', 'phones', 'tvs', 'gaming', 'audio', 'cameras'],
            fetchInterval: 30,
            priority: 9
        });
    }

    private async getAccessToken(): Promise<string> {
        // Check if we have a valid token
        if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
            return this.accessToken;
        }

        const appId = process.env.EBAY_APP_ID;
        const appSecret = process.env.EBAY_APP_SECRET;

        if (!appId || !appSecret) {
            throw new Error('eBay API credentials not configured');
        }

        const credentials = Buffer.from(`${appId}:${appSecret}`).toString('base64');

        const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`
            },
            body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope'
        });

        if (!response.ok) {
            throw new Error(`eBay auth failed: ${response.status}`);
        }

        const data = await response.json() as { access_token: string; expires_in: number };
        this.accessToken = data.access_token;
        this.tokenExpiry = new Date(Date.now() + (data.expires_in - 60) * 1000);

        return this.accessToken!;
    }

    async fetchDeals(category?: string): Promise<FetchResult> {
        const startTime = Date.now();

        // Check if API is configured
        if (!process.env.EBAY_APP_ID) {
            return this.createResult([], startTime, 'eBay API not configured - set EBAY_APP_ID');
        }

        try {
            const deals = await this.rateLimitedFetch(async () => {
                const token = await this.getAccessToken();

                // Build category-specific search
                const categoryQueries: Record<string, string> = {
                    laptops: 'laptop OR macbook OR thinkpad',
                    phones: 'iphone OR samsung galaxy OR pixel phone',
                    tvs: 'smart tv OR oled tv OR 4k tv',
                    gaming: 'playstation OR xbox OR nintendo switch',
                    audio: 'headphones OR airpods OR speaker',
                    cameras: 'camera OR gopro OR lens'
                };

                const query = category && categoryQueries[category]
                    ? categoryQueries[category]
                    : 'electronics';

                const params = new URLSearchParams({
                    q: query,
                    limit: '50',
                    filter: 'buyingOptions:{FIXED_PRICE},conditions:{NEW|LIKE_NEW|CERTIFIED_REFURBISHED}',
                    sort: '-price'
                });

                const response = await fetch(`${EBAY_API_BASE}/item_summary/search?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`eBay API error: ${response.status}`);
                }

                const data = await response.json() as { itemSummaries?: EbayItem[] };
                return this.parseItems(data.itemSummaries || []);
            });

            return this.createResult(deals, startTime);
        } catch (error) {
            return this.createResult([], startTime, (error as Error).message);
        }
    }

    async searchDeals(query: string): Promise<FetchResult> {
        const startTime = Date.now();

        if (!process.env.EBAY_APP_ID) {
            return this.createResult([], startTime, 'eBay API not configured');
        }

        try {
            const deals = await this.rateLimitedFetch(async () => {
                const token = await this.getAccessToken();

                const params = new URLSearchParams({
                    q: query,
                    limit: '50',
                    sort: 'price'
                });

                const response = await fetch(`${EBAY_API_BASE}/item_summary/search?${params}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US'
                    }
                });

                if (!response.ok) {
                    throw new Error(`eBay search failed: ${response.status}`);
                }

                const data = await response.json() as { itemSummaries?: EbayItem[] };
                return this.parseItems(data.itemSummaries || []);
            });

            return this.createResult(deals, startTime);
        } catch (error) {
            return this.createResult([], startTime, (error as Error).message);
        }
    }

    private parseItems(items: EbayItem[]): RawDeal[] {
        return items.map(item => {
            const currentPrice = parseFloat(item.price.value);
            const originalPrice = item.marketingPrice
                ? parseFloat(item.marketingPrice.originalPrice.value)
                : undefined;

            return {
                sourceId: `ebay-${item.itemId}`,
                source: 'ebay' as const,
                sourceUrl: item.itemWebUrl,
                title: item.title,
                imageUrl: item.image?.imageUrl,
                currentPrice,
                originalPrice,
                currency: item.price.currency,
                condition: CONDITION_MAP[item.condition] || 'used',
                sellerName: item.seller.username,
                sellerRating: parseFloat(item.seller.feedbackPercentage) / 20, // Convert to 0-5
                sellerReviews: item.seller.feedbackScore,
                isVerifiedSeller: item.seller.feedbackScore > 100,
                location: item.itemLocation ? {
                    city: item.itemLocation.city,
                    state: item.itemLocation.stateOrProvince
                } : undefined,
                postedAt: new Date()
            };
        });
    }
}

export const ebayFetcher = new EbayFetcher();
