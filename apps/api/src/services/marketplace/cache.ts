/**
 * In-Memory Cache for Deal Data
 * Provides fast reads with TTL-based expiration
 */

import type { CacheEntry } from './types';

export class DealCache {
    private cache: Map<string, CacheEntry<unknown>> = new Map();
    private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

    constructor(defaultTTLMs?: number) {
        if (defaultTTLMs) {
            this.defaultTTL = defaultTTLMs;
        }

        // Cleanup expired entries every minute
        setInterval(() => this.cleanup(), 60 * 1000);
    }

    set<T>(key: string, data: T, ttlMs?: number): void {
        const now = new Date();
        const expiresAt = new Date(now.getTime() + (ttlMs || this.defaultTTL));

        this.cache.set(key, {
            data,
            cachedAt: now,
            expiresAt,
            hits: 0
        });
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key);

        if (!entry) {
            return null;
        }

        // Check expiration
        if (new Date() > entry.expiresAt) {
            this.cache.delete(key);
            return null;
        }

        // Increment hit counter
        entry.hits++;

        return entry.data as T;
    }

    has(key: string): boolean {
        const entry = this.cache.get(key);
        if (!entry) return false;

        if (new Date() > entry.expiresAt) {
            this.cache.delete(key);
            return false;
        }

        return true;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    // Remove entries matching a pattern
    invalidate(pattern: string | RegExp): number {
        let count = 0;
        const regex = typeof pattern === 'string'
            ? new RegExp(pattern)
            : pattern;

        for (const key of this.cache.keys()) {
            if (regex.test(key)) {
                this.cache.delete(key);
                count++;
            }
        }

        return count;
    }

    private cleanup(): void {
        const now = new Date();
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                this.cache.delete(key);
            }
        }
    }

    // Stats for monitoring
    getStats(): {
        size: number;
        keys: string[];
        totalHits: number;
        oldestEntry: Date | null;
    } {
        let totalHits = 0;
        let oldestEntry: Date | null = null;

        for (const entry of this.cache.values()) {
            totalHits += entry.hits;
            if (!oldestEntry || entry.cachedAt < oldestEntry) {
                oldestEntry = entry.cachedAt;
            }
        }

        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys()),
            totalHits,
            oldestEntry
        };
    }
}

// Singleton instance
export const dealCache = new DealCache();

// Cache key generators
export const cacheKeys = {
    deals: (source: string) => `deals:${source}`,
    deal: (id: string) => `deal:${id}`,
    search: (query: string, filters: string) => `search:${query}:${filters}`,
    hotDeals: () => 'hot-deals',
    categories: () => 'categories',
    priceHistory: (productId: string) => `price-history:${productId}`,
};
