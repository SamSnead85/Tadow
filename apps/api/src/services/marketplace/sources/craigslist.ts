/**
 * Craigslist RSS Integration
 * Fetches local deals from Craigslist by city and category
 */

import { BaseFetcher } from '../fetcher';
import type { RawDeal, FetchResult, DealCategory } from '../types';

// Major US cities with Craigslist
const CITIES = [
    { code: 'newyork', name: 'New York', state: 'NY' },
    { code: 'losangeles', name: 'Los Angeles', state: 'CA' },
    { code: 'chicago', name: 'Chicago', state: 'IL' },
    { code: 'sfbay', name: 'San Francisco', state: 'CA' },
    { code: 'seattle', name: 'Seattle', state: 'WA' },
    { code: 'austin', name: 'Austin', state: 'TX' },
    { code: 'miami', name: 'Miami', state: 'FL' },
    { code: 'boston', name: 'Boston', state: 'MA' },
    { code: 'denver', name: 'Denver', state: 'CO' },
    { code: 'atlanta', name: 'Atlanta', state: 'GA' },
    { code: 'tampa', name: 'Tampa', state: 'FL' }
];

// Craigslist category codes
const CATEGORY_MAP: Record<DealCategory, string> = {
    laptops: 'sya', // computers
    phones: 'moa', // cell phones
    tvs: 'ela', // electronics
    gaming: 'vga', // video gaming
    audio: 'ela', // electronics
    wearables: 'ela',
    cameras: 'pha', // photo/video
    computers: 'sya',
    tablets: 'moa',
    accessories: 'ela',
    other: 'sss' // all for sale
};

export class CraigslistFetcher extends BaseFetcher {
    private defaultCity = 'sfbay';

    constructor() {
        super({
            name: 'craigslist',
            enabled: true,
            rateLimit: {
                requestsPerMinute: 5, // Be gentle with Craigslist
                requestsPerDay: 500
            },
            categories: ['laptops', 'phones', 'tvs', 'gaming', 'audio', 'cameras'],
            fetchInterval: 60, // Every hour
            priority: 5
        });
    }

    async fetchDeals(category?: string, city?: string): Promise<FetchResult> {
        const startTime = Date.now();
        const cityCode = city || this.defaultCity;
        const categoryCode = CATEGORY_MAP[category as DealCategory] || 'sss';

        try {
            const deals = await this.rateLimitedFetch(async () => {
                const url = `https://${cityCode}.craigslist.org/search/${categoryCode}?format=rss`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Verity/1.0)'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Craigslist ${response.status}: ${response.statusText}`);
                }

                const xml = await response.text();
                return this.parseRSS(xml, cityCode);
            });

            return this.createResult(deals, startTime);
        } catch (error) {
            return this.createResult([], startTime, (error as Error).message);
        }
    }

    async searchDeals(query: string, city?: string): Promise<FetchResult> {
        const startTime = Date.now();
        const cityCode = city || this.defaultCity;

        try {
            const deals = await this.rateLimitedFetch(async () => {
                const url = `https://${cityCode}.craigslist.org/search/sss?query=${encodeURIComponent(query)}&format=rss`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; Verity/1.0)'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Craigslist search failed: ${response.status}`);
                }

                const xml = await response.text();
                return this.parseRSS(xml, cityCode);
            });

            return this.createResult(deals, startTime);
        } catch (error) {
            return this.createResult([], startTime, (error as Error).message);
        }
    }

    async fetchMultipleCities(category: string): Promise<FetchResult> {
        const startTime = Date.now();
        const allDeals: RawDeal[] = [];

        // Fetch from top 5 cities in parallel
        const citiesToFetch = CITIES.slice(0, 5);

        const results = await Promise.allSettled(
            citiesToFetch.map(city => this.fetchDeals(category, city.code))
        );

        for (const result of results) {
            if (result.status === 'fulfilled') {
                allDeals.push(...result.value.deals);
            }
        }

        // Sort by date, newest first
        allDeals.sort((a, b) => {
            const dateA = a.postedAt?.getTime() || 0;
            const dateB = b.postedAt?.getTime() || 0;
            return dateB - dateA;
        });

        return this.createResult(allDeals, startTime);
    }

    private parseRSS(xml: string, cityCode: string): RawDeal[] {
        const deals: RawDeal[] = [];
        const cityInfo = CITIES.find(c => c.code === cityCode) || { name: cityCode, state: '' };

        const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(xml)) !== null) {
            const itemXml = match[1];

            const title = this.extractTag(itemXml, 'title');
            const link = this.extractTag(itemXml, 'link');
            const description = this.extractTag(itemXml, 'description');
            const pubDate = this.extractTag(itemXml, 'dc:date') || this.extractTag(itemXml, 'pubDate');

            // Craigslist often has price in title: "iPhone 14 Pro - $800"
            const priceMatch = title.match(/\$[\d,]+/);
            const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0;

            // Extract image from enc:enclosure or description
            const imageMatch = itemXml.match(/resource="([^"]+)"/);
            const imageUrl = imageMatch ? imageMatch[1] : undefined;

            // Clean title (remove price)
            const cleanTitle = title.replace(/\s*[-–]\s*\$[\d,]+.*$/, '').trim();

            if (cleanTitle && link && price > 0) {
                deals.push({
                    sourceId: this.generateId(link),
                    source: 'craigslist',
                    sourceUrl: link,
                    title: cleanTitle,
                    description: this.cleanHtml(description || ''),
                    imageUrl,
                    currentPrice: price,
                    currency: 'USD',
                    condition: 'used', // Assume used for Craigslist
                    isVerifiedSeller: false,
                    location: {
                        city: cityInfo.name,
                        state: cityInfo.state
                    },
                    postedAt: pubDate ? new Date(pubDate) : new Date()
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
        const match = url.match(/\/(\d+)\.html/);
        return match ? `cl-${match[1]}` : `cl-${Date.now()}`;
    }

    // Get available cities
    static getCities(): typeof CITIES {
        return CITIES;
    }
}

export const craigslistFetcher = new CraigslistFetcher();
