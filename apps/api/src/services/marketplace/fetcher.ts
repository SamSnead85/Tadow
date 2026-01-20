/**
 * Base Fetcher Class
 * Handles rate limiting, retries, and error handling for all sources
 */

import type { MarketplaceSource, RawDeal, FetchResult, SourceConfig } from './types';

export abstract class BaseFetcher {
    protected config: SourceConfig;
    private requestCount: number = 0;
    private dailyRequestCount: number = 0;
    private lastRequestTime: number = 0;
    private dailyResetTime: number = Date.now();

    constructor(config: SourceConfig) {
        this.config = config;

        // Reset daily counter at midnight
        this.scheduleDailyReset();
    }

    private scheduleDailyReset(): void {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const msUntilMidnight = tomorrow.getTime() - now.getTime();

        setTimeout(() => {
            this.dailyRequestCount = 0;
            this.dailyResetTime = Date.now();
            this.scheduleDailyReset();
        }, msUntilMidnight);
    }

    protected async rateLimitedFetch<T>(
        fetchFn: () => Promise<T>,
        retries: number = 3
    ): Promise<T> {
        // Check daily limit
        if (this.dailyRequestCount >= this.config.rateLimit.requestsPerDay) {
            throw new Error(`Daily rate limit exceeded for ${this.config.name}`);
        }

        // Calculate delay for rate limiting
        const minInterval = 60000 / this.config.rateLimit.requestsPerMinute;
        const timeSinceLastRequest = Date.now() - this.lastRequestTime;

        if (timeSinceLastRequest < minInterval) {
            await this.delay(minInterval - timeSinceLastRequest);
        }

        // Execute with retry logic
        let lastError: Error | null = null;

        for (let attempt = 0; attempt < retries; attempt++) {
            try {
                this.lastRequestTime = Date.now();
                this.requestCount++;
                this.dailyRequestCount++;

                return await fetchFn();
            } catch (error) {
                lastError = error as Error;
                console.error(`[${this.config.name}] Attempt ${attempt + 1} failed:`, error);

                // Exponential backoff
                if (attempt < retries - 1) {
                    await this.delay(Math.pow(2, attempt) * 1000);
                }
            }
        }

        throw lastError;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Abstract methods to implement in each source
    abstract fetchDeals(category?: string): Promise<FetchResult>;
    abstract searchDeals(query: string): Promise<FetchResult>;

    // Helper to create consistent fetch results
    protected createResult(
        deals: RawDeal[],
        startTime: number,
        error?: string
    ): FetchResult {
        return {
            source: this.config.name,
            deals,
            fetchedAt: new Date(),
            duration: Date.now() - startTime,
            success: !error,
            error,
            rateLimit: {
                remaining: this.config.rateLimit.requestsPerDay - this.dailyRequestCount,
                resetAt: new Date(this.dailyResetTime + 24 * 60 * 60 * 1000)
            }
        };
    }

    // Parse common price formats
    protected parsePrice(priceString: string): number {
        if (!priceString) return 0;

        // Remove currency symbols and commas
        const cleaned = priceString
            .replace(/[^0-9.,]/g, '')
            .replace(/,/g, '');

        return parseFloat(cleaned) || 0;
    }

    // Extract product category from title/description
    protected inferCategory(title: string): string {
        const titleLower = title.toLowerCase();

        const categoryPatterns: Record<string, string[]> = {
            laptops: ['laptop', 'notebook', 'macbook', 'chromebook', 'thinkpad'],
            phones: ['phone', 'iphone', 'samsung galaxy', 'pixel', 'smartphone'],
            tvs: ['tv', 'television', 'oled', 'qled', 'monitor', '4k', '8k'],
            gaming: ['xbox', 'playstation', 'ps5', 'ps4', 'nintendo', 'switch', 'gaming console', 'rtx', 'gpu'],
            audio: ['headphones', 'earbuds', 'speaker', 'soundbar', 'airpods', 'audio'],
            wearables: ['watch', 'fitbit', 'garmin', 'tracker', 'smartwatch'],
            cameras: ['camera', 'dslr', 'mirrorless', 'gopro', 'lens'],
            computers: ['desktop', 'pc', 'imac', 'mac mini', 'computer'],
            tablets: ['tablet', 'ipad', 'surface', 'galaxy tab'],
            accessories: ['case', 'charger', 'cable', 'adapter', 'keyboard', 'mouse'],
        };

        for (const [category, patterns] of Object.entries(categoryPatterns)) {
            if (patterns.some(p => titleLower.includes(p))) {
                return category;
            }
        }

        return 'other';
    }

    // Get stats for monitoring
    getStats(): {
        source: MarketplaceSource;
        enabled: boolean;
        requestsToday: number;
        remainingToday: number;
    } {
        return {
            source: this.config.name,
            enabled: this.config.enabled,
            requestsToday: this.dailyRequestCount,
            remainingToday: this.config.rateLimit.requestsPerDay - this.dailyRequestCount
        };
    }
}
