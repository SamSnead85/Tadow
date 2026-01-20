/**
 * DealNews Integration
 * Fetches deals from DealNews RSS feeds by category
 */

import { BaseFetcher } from '../fetcher';
import type { RawDeal, FetchResult, DealCategory } from '../types';

const DEALNEWS_FEEDS: Record<string, string> = {
    laptops: 'https://www.dealnews.com/rss/c196/Laptops/',
    phones: 'https://www.dealnews.com/rss/c474/Cell-Phones/',
    tvs: 'https://www.dealnews.com/rss/c41/TVs/',
    gaming: 'https://www.dealnews.com/rss/c39/Video-Games/',
    audio: 'https://www.dealnews.com/rss/c475/Headphones/',
    computers: 'https://www.dealnews.com/rss/c38/Computers/',
    tablets: 'https://www.dealnews.com/rss/c495/Tablets/',
    all: 'https://www.dealnews.com/rss/todays-edition/'
};

export class DealNewsFetcher extends BaseFetcher {
    constructor() {
        super({
            name: 'dealnews',
            enabled: true,
            rateLimit: {
                requestsPerMinute: 10,
                requestsPerDay: 1000
            },
            categories: ['laptops', 'phones', 'tvs', 'gaming', 'audio', 'computers', 'tablets'],
            fetchInterval: 30, // Every 30 minutes
            priority: 8
        });
    }

    async fetchDeals(category?: string): Promise<FetchResult> {
        const startTime = Date.now();

        try {
            const feedUrl = category && DEALNEWS_FEEDS[category]
                ? DEALNEWS_FEEDS[category]
                : DEALNEWS_FEEDS.all;

            const deals = await this.rateLimitedFetch(async () => {
                const response = await fetch(feedUrl, {
                    headers: {
                        'User-Agent': 'Verity Deal Aggregator/1.0'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const xml = await response.text();
                return this.parseRSS(xml);
            });

            return this.createResult(deals, startTime);
        } catch (error) {
            return this.createResult([], startTime, (error as Error).message);
        }
    }

    async searchDeals(query: string): Promise<FetchResult> {
        // DealNews doesn't have a search RSS, fetch all and filter
        const result = await this.fetchDeals();
        const queryLower = query.toLowerCase();

        const filtered = result.deals.filter(deal =>
            deal.title.toLowerCase().includes(queryLower) ||
            (deal.description?.toLowerCase().includes(queryLower))
        );

        return {
            ...result,
            deals: filtered
        };
    }

    async fetchAllCategories(): Promise<FetchResult> {
        const startTime = Date.now();
        const allDeals: RawDeal[] = [];
        const errors: string[] = [];

        // Fetch from multiple category feeds in parallel
        const categories = ['laptops', 'phones', 'tvs', 'gaming', 'audio'];

        const results = await Promise.allSettled(
            categories.map(cat => this.fetchDeals(cat))
        );

        for (const result of results) {
            if (result.status === 'fulfilled') {
                allDeals.push(...result.value.deals);
            } else {
                errors.push(result.reason.message);
            }
        }

        // Deduplicate by URL
        const uniqueDeals = Array.from(
            new Map(allDeals.map(d => [d.sourceUrl, d])).values()
        );

        return this.createResult(
            uniqueDeals,
            startTime,
            errors.length > 0 ? errors.join('; ') : undefined
        );
    }

    private parseRSS(xml: string): RawDeal[] {
        const deals: RawDeal[] = [];

        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null) {
            const itemXml = match[1];

            const title = this.extractTag(itemXml, 'title');
            const link = this.extractTag(itemXml, 'link');
            const description = this.extractTag(itemXml, 'description');
            const pubDate = this.extractTag(itemXml, 'pubDate');

            // DealNews format: "Product Name for $XX at Store"
            const priceMatch = title.match(/\$[\d,]+\.?\d*/);
            const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0;

            // Extract "was $X" or "list $X" for original price
            const originalMatch = (title + ' ' + description).match(
                /(?:was|list|reg|msrp|orig)\s*\$[\d,]+\.?\d*/i
            );
            const originalPrice = originalMatch
                ? this.parsePrice(originalMatch[0])
                : undefined;

            // Extract store from "at Store" pattern
            const storeMatch = title.match(/\bat\s+([A-Za-z][A-Za-z\s&'.]+?)(?:\.|,|$)/i);
            const store = storeMatch ? storeMatch[1].trim() : 'Unknown';

            // Extract coupon codes
            const couponMatch = (title + ' ' + description).match(
                /(?:code|coupon)[:\s]+["']?([A-Z0-9]+)["']?/i
            );
            const couponCode = couponMatch ? couponMatch[1] : undefined;

            // Extract image from description
            const imageMatch = description.match(/src=["']([^"']+)["']/);
            const imageUrl = imageMatch ? imageMatch[1] : undefined;

            if (title && link && price > 0) {
                deals.push({
                    sourceId: this.generateId(link),
                    source: 'dealnews',
                    sourceUrl: link,
                    title: this.cleanHtml(title),
                    description: this.cleanHtml(description),
                    imageUrl,
                    currentPrice: price,
                    originalPrice,
                    currency: 'USD',
                    condition: 'new',
                    sellerName: store,
                    isVerifiedSeller: true,
                    postedAt: pubDate ? new Date(pubDate) : new Date(),
                    couponCode,
                    promoDetails: couponCode ? `Use code: ${couponCode}` : undefined
                });
            }
        }

        return deals;
    }

    private extractTag(xml: string, tag: string): string {
        const regex = new RegExp(
            `<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`,
            'i'
        );
        const match = xml.match(regex);
        return match ? match[1].trim() : '';
    }

    private cleanHtml(text: string): string {
        return text
            .replace(/<[^>]+>/g, '')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ')
            .trim();
    }

    private generateId(url: string): string {
        const match = url.match(/\/(\d+)\//);
        return match ? `dn-${match[1]}` : `dn-${Date.now()}`;
    }
}

export const dealNewsFetcher = new DealNewsFetcher();
