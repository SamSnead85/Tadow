/**
 * Slickdeals Integration
 * Fetches deals from Slickdeals RSS feed and parses deal details
 */

import { BaseFetcher } from '../fetcher';
import type { RawDeal, FetchResult, SourceConfig } from '../types';

const SLICKDEALS_RSS = 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1';
const SLICKDEALS_SEARCH = 'https://slickdeals.net/newsearch.php?q=';

export class SlickdealsFetcher extends BaseFetcher {
    constructor() {
        super({
            name: 'slickdeals',
            enabled: true,
            rateLimit: {
                requestsPerMinute: 10,
                requestsPerDay: 1000
            },
            categories: ['laptops', 'phones', 'tvs', 'gaming', 'audio'],
            fetchInterval: 15, // Every 15 minutes
            priority: 10
        });
    }

    async fetchDeals(): Promise<FetchResult> {
        const startTime = Date.now();

        try {
            const deals = await this.rateLimitedFetch(async () => {
                const response = await fetch(SLICKDEALS_RSS, {
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
        const startTime = Date.now();

        try {
            const deals = await this.rateLimitedFetch(async () => {
                const url = `${SLICKDEALS_SEARCH}${encodeURIComponent(query)}&searcharea=deals&searchin=first&rss=1`;

                const response = await fetch(url, {
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

    private parseRSS(xml: string): RawDeal[] {
        const deals: RawDeal[] = [];

        // Parse RSS items using regex (works in Node.js without DOM parser)
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null) {
            const itemXml = match[1];

            const title = this.extractTag(itemXml, 'title');
            const link = this.extractTag(itemXml, 'link');
            const description = this.extractTag(itemXml, 'description');
            const pubDate = this.extractTag(itemXml, 'pubDate');

            // Extract price from title or description
            const priceMatch = (title + ' ' + description).match(/\$[\d,]+\.?\d*/);
            const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0;

            // Extract original price (often in "was $X" format)
            const originalMatch = description.match(/(?:was|reg(?:ular)?\.?|orig(?:inal)?\.?)\s*\$[\d,]+\.?\d*/i);
            const originalPrice = originalMatch ? this.parsePrice(originalMatch[0]) : undefined;

            // Extract store name
            const storeMatch = description.match(/(?:at|from|via)\s+([A-Za-z\s]+?)(?:\.|,|\s*-|\s*\[)/i);
            const store = storeMatch ? storeMatch[1].trim() : 'Unknown Store';

            // Extract image from description
            const imageMatch = description.match(/src=["']([^"']+)["']/);
            const imageUrl = imageMatch ? imageMatch[1] : undefined;

            // Extract thumbs up count (popularity)
            const thumbsMatch = description.match(/(\d+)\s*thumb/i);
            const upvotes = thumbsMatch ? parseInt(thumbsMatch[1]) : 0;

            if (title && link && price > 0) {
                deals.push({
                    sourceId: this.generateId(link),
                    source: 'slickdeals',
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
                    upvotes,
                    commentCount: 0
                });
            }
        }

        return deals;
    }

    private extractTag(xml: string, tag: string): string {
        const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`, 'i');
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
        // Extract deal ID from URL
        const match = url.match(/\/(\d+)\//);
        return match ? `sd-${match[1]}` : `sd-${Date.now()}`;
    }
}

export const slickdealsFetcher = new SlickdealsFetcher();
