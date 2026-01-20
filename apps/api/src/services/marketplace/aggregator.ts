/**
 * Marketplace Aggregator
 * Central service that coordinates all marketplace sources
 */

import type { NormalizedDeal, FetchResult, MarketplaceSource, DealCategory } from './types';
import { normalizeDeals, deduplicateDeals } from './normalizer';
import { enhanceDealsWithScores, detectSuspiciousDeals } from './scoring';
import { dealCache, cacheKeys } from './cache';
import { slickdealsFetcher } from './sources/slickdeals';
import { dealNewsFetcher } from './sources/dealnews';
import { ebayFetcher } from './sources/ebay';
import { craigslistFetcher } from './sources/craigslist';

interface AggregatorOptions {
    sources?: MarketplaceSource[];
    category?: DealCategory;
    limit?: number;
    useCache?: boolean;
    city?: string;
}

interface AggregatorResult {
    deals: NormalizedDeal[];
    sources: {
        name: MarketplaceSource;
        count: number;
        success: boolean;
        error?: string;
    }[];
    totalFetched: number;
    totalAfterDedup: number;
    fetchTime: number;
    cached: boolean;
}

class MarketplaceAggregator {
    private fetchers = {
        slickdeals: slickdealsFetcher,
        dealnews: dealNewsFetcher,
        ebay: ebayFetcher,
        craigslist: craigslistFetcher
    };

    private defaultSources: MarketplaceSource[] = [
        'slickdeals',
        'dealnews',
        'craigslist'
        // 'ebay' requires API key
    ];

    async fetchDeals(options: AggregatorOptions = {}): Promise<AggregatorResult> {
        const startTime = Date.now();
        const {
            sources = this.defaultSources,
            category,
            limit = 100,
            useCache = true,
            city
        } = options;

        // Check cache first
        const cacheKey = `${cacheKeys.deals(sources.join('-'))}:${category || 'all'}:${city || 'all'}`;

        if (useCache) {
            const cached = dealCache.get<AggregatorResult>(cacheKey);
            if (cached) {
                return { ...cached, cached: true };
            }
        }

        // Fetch from all sources in parallel
        const fetchPromises: Promise<FetchResult>[] = [];
        const sourceNames: MarketplaceSource[] = [];

        for (const source of sources) {
            const fetcher = this.fetchers[source as keyof typeof this.fetchers];
            if (fetcher) {
                if (source === 'craigslist') {
                    fetchPromises.push(
                        city
                            ? craigslistFetcher.fetchDeals(category, city)
                            : craigslistFetcher.fetchMultipleCities(category || 'laptops')
                    );
                } else {
                    fetchPromises.push(fetcher.fetchDeals(category));
                }
                sourceNames.push(source);
            }
        }

        const results = await Promise.allSettled(fetchPromises);

        // Collect all deals and source status
        const allRawDeals: FetchResult['deals'] = [];
        const sourceStatus: AggregatorResult['sources'] = [];

        results.forEach((result, index) => {
            const sourceName = sourceNames[index];

            if (result.status === 'fulfilled') {
                const fetchResult = result.value;
                allRawDeals.push(...fetchResult.deals);
                sourceStatus.push({
                    name: sourceName,
                    count: fetchResult.deals.length,
                    success: fetchResult.success,
                    error: fetchResult.error
                });
            } else {
                sourceStatus.push({
                    name: sourceName,
                    count: 0,
                    success: false,
                    error: result.reason?.message || 'Unknown error'
                });
            }
        });

        // Normalize all deals to unified format
        let normalizedDeals = normalizeDeals(allRawDeals);

        // Deduplicate across sources
        normalizedDeals = deduplicateDeals(normalizedDeals);

        // Add AI scores
        normalizedDeals = enhanceDealsWithScores(normalizedDeals);

        // Flag suspicious deals
        normalizedDeals = detectSuspiciousDeals(normalizedDeals);

        // Sort by AI score
        normalizedDeals.sort((a, b) => (b.aiScore?.overall || 0) - (a.aiScore?.overall || 0));

        // Apply limit
        const limitedDeals = normalizedDeals.slice(0, limit);

        const aggregatorResult: AggregatorResult = {
            deals: limitedDeals,
            sources: sourceStatus,
            totalFetched: allRawDeals.length,
            totalAfterDedup: normalizedDeals.length,
            fetchTime: Date.now() - startTime,
            cached: false
        };

        // Cache the result
        if (useCache) {
            dealCache.set(cacheKey, aggregatorResult, 5 * 60 * 1000); // 5 minutes
        }

        return aggregatorResult;
    }

    async search(query: string, options: AggregatorOptions = {}): Promise<AggregatorResult> {
        const startTime = Date.now();
        const {
            sources = this.defaultSources,
            limit = 50,
            useCache = true,
            city
        } = options;

        // Check cache
        const cacheKey = cacheKeys.search(query, sources.join('-'));

        if (useCache) {
            const cached = dealCache.get<AggregatorResult>(cacheKey);
            if (cached) {
                return { ...cached, cached: true };
            }
        }

        // Search all sources in parallel
        const searchPromises: Promise<FetchResult>[] = [];
        const sourceNames: MarketplaceSource[] = [];

        for (const source of sources) {
            const fetcher = this.fetchers[source as keyof typeof this.fetchers];
            if (fetcher) {
                if (source === 'craigslist') {
                    searchPromises.push(craigslistFetcher.searchDeals(query, city));
                } else {
                    searchPromises.push(fetcher.searchDeals(query));
                }
                sourceNames.push(source);
            }
        }

        const results = await Promise.allSettled(searchPromises);

        // Collect results
        const allRawDeals: FetchResult['deals'] = [];
        const sourceStatus: AggregatorResult['sources'] = [];

        results.forEach((result, index) => {
            const sourceName = sourceNames[index];

            if (result.status === 'fulfilled') {
                const fetchResult = result.value;
                allRawDeals.push(...fetchResult.deals);
                sourceStatus.push({
                    name: sourceName,
                    count: fetchResult.deals.length,
                    success: fetchResult.success,
                    error: fetchResult.error
                });
            } else {
                sourceStatus.push({
                    name: sourceName,
                    count: 0,
                    success: false,
                    error: result.reason?.message || 'Unknown error'
                });
            }
        });

        // Process deals
        let normalizedDeals = normalizeDeals(allRawDeals);
        normalizedDeals = deduplicateDeals(normalizedDeals);
        normalizedDeals = enhanceDealsWithScores(normalizedDeals);
        normalizedDeals = detectSuspiciousDeals(normalizedDeals);

        // Filter by query relevance
        const queryLower = query.toLowerCase();
        normalizedDeals = normalizedDeals.filter(deal =>
            deal.title.toLowerCase().includes(queryLower) ||
            deal.description.toLowerCase().includes(queryLower)
        );

        normalizedDeals.sort((a, b) => (b.aiScore?.overall || 0) - (a.aiScore?.overall || 0));

        const limitedDeals = normalizedDeals.slice(0, limit);

        const result: AggregatorResult = {
            deals: limitedDeals,
            sources: sourceStatus,
            totalFetched: allRawDeals.length,
            totalAfterDedup: normalizedDeals.length,
            fetchTime: Date.now() - startTime,
            cached: false
        };

        if (useCache) {
            dealCache.set(cacheKey, result, 3 * 60 * 1000); // 3 minutes for search
        }

        return result;
    }

    async getHotDeals(limit: number = 20): Promise<AggregatorResult> {
        const startTime = Date.now();

        // Check cache
        const cacheKey = cacheKeys.hotDeals();
        const cached = dealCache.get<AggregatorResult>(cacheKey);
        if (cached) {
            return { ...cached, cached: true };
        }

        // Fetch from deal aggregators (they curate hot deals)
        const result = await this.fetchDeals({
            sources: ['slickdeals', 'dealnews'],
            limit,
            useCache: false
        });

        // Filter to only deals with high scores
        const hotDeals = result.deals
            .filter(d => (d.aiScore?.overall || 0) >= 75)
            .slice(0, limit);

        const hotResult: AggregatorResult = {
            ...result,
            deals: hotDeals,
            fetchTime: Date.now() - startTime,
            cached: false
        };

        dealCache.set(cacheKey, hotResult, 5 * 60 * 1000);

        return hotResult;
    }

    // Get stats about all sources
    getSourceStats(): Record<string, unknown>[] {
        return Object.entries(this.fetchers).map(([name, fetcher]) => ({
            name,
            ...fetcher.getStats()
        }));
    }

    // Clear all caches
    clearCache(): void {
        dealCache.clear();
    }

    // Check if eBay is configured
    isEbayConfigured(): boolean {
        return !!process.env.EBAY_APP_ID;
    }
}

export const marketplaceAggregator = new MarketplaceAggregator();
