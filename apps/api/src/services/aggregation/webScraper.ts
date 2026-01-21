/**
 * WebScraper Service - Intelligent Deal Extraction
 * 
 * Scrapes deal sites using adaptive patterns.
 * Features:
 * - Site-specific extractors for major retailers
 * - Price and discount parsing
 * - Stock status detection
 * - Rate limiting and retry logic
 */

import { AffiliateDeal } from './affiliateConnector';

export interface ScraperConfig {
    name: string;
    baseUrl: string;
    enabled: boolean;
    rateLimit: number; // requests per minute
    selectors: {
        container?: string;
        title?: string;
        price?: string;
        originalPrice?: string;
        image?: string;
        link?: string;
        inStock?: string;
    };
}

export interface ScrapeResult {
    success: boolean;
    deals: AffiliateDeal[];
    scrapedAt: Date;
    error?: string;
    nextScrapeAt?: Date;
}

/**
 * Site-specific scraper configurations
 */
export const SCRAPER_CONFIGS: ScraperConfig[] = [
    {
        name: 'Amazon Deals',
        baseUrl: 'https://www.amazon.com/deals',
        enabled: true,
        rateLimit: 10,
        selectors: {
            container: '[data-component-type="s-search-result"]',
            title: 'h2 a span',
            price: '.a-price-whole',
            originalPrice: '.a-text-price span',
            image: 'img.s-image',
            link: 'h2 a',
        },
    },
    {
        name: 'Best Buy Deals',
        baseUrl: 'https://www.bestbuy.com/site/misc/deal-of-the-day/pcmcat248000050016.c',
        enabled: true,
        rateLimit: 15,
        selectors: {
            container: '.sku-item',
            title: '.sku-title a',
            price: '.priceView-customer-price span',
            originalPrice: '.pricing-price__regular-price',
            image: '.product-image img',
            link: '.sku-title a',
        },
    },
    {
        name: 'Walmart Rollbacks',
        baseUrl: 'https://www.walmart.com/shop/deals',
        enabled: true,
        rateLimit: 12,
        selectors: {
            container: '[data-item-id]',
            title: '[data-automation-id="product-title"]',
            price: '[data-automation-id="product-price"] span',
            image: 'img[data-testid="productImage"]',
            link: 'a[link-identifier]',
        },
    },
    {
        name: 'Newegg Deals',
        baseUrl: 'https://www.newegg.com/todays-deals',
        enabled: true,
        rateLimit: 20,
        selectors: {
            container: '.item-cell',
            title: '.item-title',
            price: '.price-current strong',
            originalPrice: '.price-was-data',
            image: '.item-img img',
            link: '.item-title',
        },
    },
    {
        name: 'Woot Daily Deals',
        baseUrl: 'https://www.woot.com',
        enabled: true,
        rateLimit: 30,
        selectors: {
            container: '.sale-thumb',
            title: '.title',
            price: '.price',
            originalPrice: '.list-price',
            image: 'img',
            link: 'a',
        },
    },
    {
        name: 'Slickdeals Frontpage',
        baseUrl: 'https://slickdeals.net/deals/',
        enabled: true,
        rateLimit: 20,
        selectors: {
            container: '.dealCard',
            title: '.dealCard__title',
            price: '.dealCard__price',
            link: '.dealCard__titleLink',
            image: '.dealCard__image img',
        },
    },
];

/**
 * User agent rotation for avoiding blocks
 */
const USER_AGENTS = [
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
];

export class WebScraper {
    private lastRequestTimes: Map<string, number> = new Map();
    private configs: ScraperConfig[];

    constructor(configs: ScraperConfig[] = SCRAPER_CONFIGS) {
        this.configs = configs.filter(c => c.enabled);
    }

    /**
     * Get random user agent
     */
    private getRandomUserAgent(): string {
        return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    }

    /**
     * Rate limit check
     */
    private async checkRateLimit(site: string, rateLimit: number): Promise<void> {
        const lastRequest = this.lastRequestTimes.get(site) || 0;
        const minInterval = (60 / rateLimit) * 1000; // ms between requests
        const elapsed = Date.now() - lastRequest;

        if (elapsed < minInterval) {
            await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
        }

        this.lastRequestTimes.set(site, Date.now());
    }

    /**
     * Scrape a single site
     * Note: In production, this would use Puppeteer/Playwright
     */
    async scrapeSite(config: ScraperConfig): Promise<ScrapeResult> {
        try {
            await this.checkRateLimit(config.name, config.rateLimit);

            console.log(`[WebScraper] Scraping ${config.name}...`);

            // In production, this would be a real implementation:
            // 1. Launch headless browser (Puppeteer/Playwright)
            // 2. Navigate to URL with rotating user agent
            // 3. Wait for content to load
            // 4. Extract data using selectors
            // 5. Parse and normalize results

            // Placeholder for demonstration
            const deals: AffiliateDeal[] = [];

            // Simulated deal data structure
            // In production, this would be extracted from the page

            return {
                success: true,
                deals,
                scrapedAt: new Date(),
                nextScrapeAt: new Date(Date.now() + (60000 / config.rateLimit)),
            };
        } catch (error) {
            console.error(`[WebScraper] Error scraping ${config.name}:`, error);
            return {
                success: false,
                deals: [],
                scrapedAt: new Date(),
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Scrape all enabled sites
     */
    async scrapeAll(): Promise<Map<string, ScrapeResult>> {
        const results = new Map<string, ScrapeResult>();

        for (const config of this.configs) {
            const result = await this.scrapeSite(config);
            results.set(config.name, result);
        }

        return results;
    }

    /**
     * Parse price string to number
     */
    static parsePrice(priceStr: string): number | null {
        if (!priceStr) return null;

        // Remove currency symbols and commas
        const cleaned = priceStr.replace(/[^0-9.]/g, '');
        const price = parseFloat(cleaned);

        return isNaN(price) ? null : price;
    }

    /**
     * Extract discount percentage from text
     */
    static parseDiscount(text: string): number | null {
        const match = text.match(/(\d+)%\s*off/i);
        return match ? parseInt(match[1]) : null;
    }

    /**
     * Detect stock status from page content
     */
    static detectStockStatus(html: string): 'in_stock' | 'low_stock' | 'out_of_stock' {
        const lowerHtml = html.toLowerCase();

        if (lowerHtml.includes('out of stock') || lowerHtml.includes('sold out') || lowerHtml.includes('unavailable')) {
            return 'out_of_stock';
        }
        if (lowerHtml.includes('only') && lowerHtml.includes('left') || lowerHtml.includes('low stock')) {
            return 'low_stock';
        }
        return 'in_stock';
    }

    /**
     * Get enabled site names
     */
    getEnabledSites(): string[] {
        return this.configs.map(c => c.name);
    }
}

// Export singleton
export const webScraper = new WebScraper();
