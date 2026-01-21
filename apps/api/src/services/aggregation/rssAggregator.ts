/**
 * RSS Feed Aggregator - Deal Feed Collection
 * 
 * Aggregates deals from RSS feeds across major deal sites.
 * Features:
 * - Multi-feed subscription
 * - Automatic parsing and normalization
 * - Deduplication
 * - Scheduled polling
 */

import { AffiliateDeal } from './affiliateConnector';

export interface RSSFeedConfig {
    name: string;
    url: string;
    category?: string;
    enabled: boolean;
    pollIntervalMinutes: number;
}

export interface FeedItem {
    title: string;
    link: string;
    description?: string;
    pubDate?: Date;
    category?: string;
    author?: string;
}

export interface FeedResult {
    feed: string;
    success: boolean;
    items: FeedItem[];
    fetchedAt: Date;
    error?: string;
}

/**
 * RSS feed configurations for major deal sites
 */
export const RSS_FEEDS: RSSFeedConfig[] = [
    {
        name: 'Slickdeals Frontpage',
        url: 'https://slickdeals.net/newsearch.php?mode=frontpage&searcharea=deals&searchin=first&rss=1',
        enabled: true,
        pollIntervalMinutes: 10,
    },
    {
        name: 'Slickdeals Hot',
        url: 'https://slickdeals.net/newsearch.php?mode=popdeals&searcharea=deals&searchin=first&rss=1',
        enabled: true,
        pollIntervalMinutes: 15,
    },
    {
        name: 'DealNews All',
        url: 'https://www.dealnews.com/rss/',
        enabled: true,
        pollIntervalMinutes: 10,
    },
    {
        name: 'DealNews Electronics',
        url: 'https://www.dealnews.com/c69/Electronics/rss/',
        category: 'electronics',
        enabled: true,
        pollIntervalMinutes: 15,
    },
    {
        name: 'DealNews Computers',
        url: 'https://www.dealnews.com/c3/Computers/rss/',
        category: 'computers',
        enabled: true,
        pollIntervalMinutes: 15,
    },
    {
        name: 'TechBargains',
        url: 'https://www.techbargains.com/rss.xml',
        category: 'electronics',
        enabled: true,
        pollIntervalMinutes: 20,
    },
    {
        name: 'Reddit BuildAPCSales',
        url: 'https://www.reddit.com/r/buildapcsales/.rss',
        category: 'computers',
        enabled: true,
        pollIntervalMinutes: 5,
    },
    {
        name: 'Reddit GameDeals',
        url: 'https://www.reddit.com/r/GameDeals/.rss',
        category: 'gaming',
        enabled: true,
        pollIntervalMinutes: 5,
    },
    {
        name: 'Woot RSS',
        url: 'https://www.woot.com/feed/rss',
        enabled: true,
        pollIntervalMinutes: 30,
    },
    {
        name: 'Newegg Deals',
        url: 'https://www.newegg.com/Product/RSS.aspx?Submit=RSSDailyDeals&Depa=1',
        category: 'electronics',
        enabled: true,
        pollIntervalMinutes: 30,
    },
];

export class RSSAggregator {
    private feeds: RSSFeedConfig[];
    private lastFetchTimes: Map<string, Date> = new Map();
    private seenItems: Set<string> = new Set(); // For deduplication

    constructor(feeds: RSSFeedConfig[] = RSS_FEEDS) {
        this.feeds = feeds.filter(f => f.enabled);
    }

    /**
     * Fetch and parse a single RSS feed
     */
    async fetchFeed(config: RSSFeedConfig): Promise<FeedResult> {
        try {
            console.log(`[RSSAggregator] Fetching ${config.name}...`);

            // In production, use a proper RSS parser like 'rss-parser' or 'feedparser'
            // This is a simplified implementation

            const response = await fetch(config.url, {
                headers: {
                    'User-Agent': 'Tadow Deal Aggregator/1.0',
                    'Accept': 'application/rss+xml, application/xml, text/xml',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const text = await response.text();
            const items = this.parseRSSText(text, config);

            this.lastFetchTimes.set(config.name, new Date());

            return {
                feed: config.name,
                success: true,
                items,
                fetchedAt: new Date(),
            };
        } catch (error) {
            console.error(`[RSSAggregator] Error fetching ${config.name}:`, error);
            return {
                feed: config.name,
                success: false,
                items: [],
                fetchedAt: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Parse RSS XML text
     * Note: In production, use a proper XML parser
     */
    private parseRSSText(text: string, config: RSSFeedConfig): FeedItem[] {
        const items: FeedItem[] = [];

        // Simple regex-based parsing (use proper parser in production)
        const itemMatches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);

        for (const match of itemMatches) {
            const itemXml = match[1];

            const title = this.extractTag(itemXml, 'title');
            const link = this.extractTag(itemXml, 'link');
            const description = this.extractTag(itemXml, 'description');
            const pubDate = this.extractTag(itemXml, 'pubDate');

            if (title && link) {
                // Deduplication check
                const itemId = `${config.name}:${link}`;
                if (!this.seenItems.has(itemId)) {
                    this.seenItems.add(itemId);
                    items.push({
                        title: this.decodeHtmlEntities(title),
                        link,
                        description: description ? this.decodeHtmlEntities(description) : undefined,
                        pubDate: pubDate ? new Date(pubDate) : undefined,
                        category: config.category,
                    });
                }
            }
        }

        return items;
    }

    /**
     * Extract content from XML tag
     */
    private extractTag(xml: string, tag: string): string | null {
        const match = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
        if (match) {
            // Handle CDATA
            return match[1].replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
        }
        return null;
    }

    /**
     * Decode HTML entities
     */
    private decodeHtmlEntities(text: string): string {
        return text
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'")
            .replace(/&nbsp;/g, ' ');
    }

    /**
     * Check if feed needs refresh
     */
    needsRefresh(feedName: string): boolean {
        const config = this.feeds.find(f => f.name === feedName);
        if (!config) return false;

        const lastFetch = this.lastFetchTimes.get(feedName);
        if (!lastFetch) return true;

        const elapsed = Date.now() - lastFetch.getTime();
        return elapsed > config.pollIntervalMinutes * 60 * 1000;
    }

    /**
     * Fetch all feeds that need refresh
     */
    async fetchAllDue(): Promise<FeedResult[]> {
        const results: FeedResult[] = [];

        for (const config of this.feeds) {
            if (this.needsRefresh(config.name)) {
                const result = await this.fetchFeed(config);
                results.push(result);
            }
        }

        return results;
    }

    /**
     * Fetch all feeds regardless of schedule
     */
    async fetchAll(): Promise<FeedResult[]> {
        const results: FeedResult[] = [];

        for (const config of this.feeds) {
            const result = await this.fetchFeed(config);
            results.push(result);
            // Small delay between feeds to be nice to servers
            await new Promise(resolve => setTimeout(resolve, 500));
        }

        return results;
    }

    /**
     * Convert feed items to affiliate deal format
     */
    feedItemsToDeal(items: FeedItem[], source: string): AffiliateDeal[] {
        return items.map(item => ({
            externalId: Buffer.from(item.link).toString('base64').slice(0, 20),
            title: item.title,
            description: item.description,
            currentPrice: 0, // Would be extracted from description/title
            currency: 'USD',
            affiliateUrl: item.link,
            merchant: source,
            category: item.category || 'electronics',
            condition: 'new' as const,
            inStock: true,
            source: `rss:${source}`,
            fetchedAt: new Date(),
        }));
    }

    /**
     * Get all enabled feed names
     */
    getEnabledFeeds(): string[] {
        return this.feeds.map(f => f.name);
    }

    /**
     * Get feed statistics
     */
    getStats(): { total: number; lastFetchTimes: Record<string, string> } {
        const lastFetchTimes: Record<string, string> = {};
        for (const [name, date] of this.lastFetchTimes) {
            lastFetchTimes[name] = date.toISOString();
        }
        return {
            total: this.seenItems.size,
            lastFetchTimes,
        };
    }

    /**
     * Clear seen items cache (for memory management)
     */
    clearCache(): void {
        this.seenItems.clear();
    }
}

// Export singleton
export const rssAggregator = new RSSAggregator();
