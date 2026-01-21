/**
 * DealNormalizer Service - Data Normalization & Deduplication
 * 
 * Standardizes deal data from multiple sources:
 * - Normalizes product titles
 * - Extracts key attributes
 * - Detects duplicates using fuzzy matching
 * - Enriches with additional data
 */

import { AffiliateDeal } from './affiliateConnector';

export interface NormalizedDeal {
    id: string;
    normalizedTitle: string;
    originalTitle: string;
    description?: string;

    // Pricing
    currentPrice: number;
    originalPrice?: number;
    discountPercent?: number;
    currency: string;

    // Product info
    brand: string;
    model?: string;
    category: string;
    subcategory?: string;
    condition: 'new' | 'used' | 'refurbished' | 'like-new';

    // Source
    marketplace: string;
    affiliateUrl: string;
    externalId: string;
    imageUrl?: string;

    // Quality signals
    rating?: number;
    reviewCount?: number;
    inStock: boolean;

    // Metadata
    fetchedAt: Date;
    normalizedAt: Date;
    fingerprint: string; // For deduplication
}

interface BrandInfo {
    canonical: string;
    aliases: string[];
}

export class DealNormalizer {
    // Brand normalization map
    private readonly brands: BrandInfo[] = [
        { canonical: 'Apple', aliases: ['APPLE', 'apple inc', 'apple computer'] },
        { canonical: 'Samsung', aliases: ['SAMSUNG', 'samsung electronics'] },
        { canonical: 'Sony', aliases: ['SONY', 'sony corporation'] },
        { canonical: 'LG', aliases: ['LG Electronics', 'lg electronics'] },
        { canonical: 'Microsoft', aliases: ['MICROSOFT', 'microsoft corporation'] },
        { canonical: 'Dell', aliases: ['DELL', 'dell technologies'] },
        { canonical: 'HP', aliases: ['Hewlett-Packard', 'Hewlett Packard', 'hp inc'] },
        { canonical: 'Lenovo', aliases: ['LENOVO'] },
        { canonical: 'ASUS', aliases: ['Asus', 'ASUSTek'] },
        { canonical: 'Bose', aliases: ['BOSE', 'bose corporation'] },
        { canonical: 'JBL', aliases: ['jbl', 'JBL by Harman'] },
        { canonical: 'Beats', aliases: ['Beats by Dr. Dre', 'beats by dre'] },
        { canonical: 'Nintendo', aliases: ['NINTENDO'] },
        { canonical: 'Dyson', aliases: ['DYSON'] },
        { canonical: 'Google', aliases: ['GOOGLE', 'google llc'] },
        { canonical: 'Amazon', aliases: ['AMAZON', 'amazon basics', 'amazonbasics'] },
    ];

    // Category normalization map
    private readonly categoryMap: Record<string, string> = {
        'laptops': 'Electronics > Computers > Laptops',
        'laptop': 'Electronics > Computers > Laptops',
        'notebooks': 'Electronics > Computers > Laptops',
        'desktops': 'Electronics > Computers > Desktops',
        'desktop': 'Electronics > Computers > Desktops',
        'phones': 'Electronics > Phones > Smartphones',
        'smartphones': 'Electronics > Phones > Smartphones',
        'cell phones': 'Electronics > Phones > Smartphones',
        'mobile phones': 'Electronics > Phones > Smartphones',
        'tablets': 'Electronics > Tablets',
        'headphones': 'Electronics > Audio > Headphones',
        'earbuds': 'Electronics > Audio > Earbuds',
        'speakers': 'Electronics > Audio > Speakers',
        'tvs': 'Electronics > TVs',
        'television': 'Electronics > TVs',
        'monitors': 'Electronics > Computers > Monitors',
        'gaming': 'Electronics > Gaming',
        'video games': 'Electronics > Gaming > Games',
        'consoles': 'Electronics > Gaming > Consoles',
        'cameras': 'Electronics > Cameras',
        'smart home': 'Electronics > Smart Home',
        'wearables': 'Electronics > Wearables',
        'smartwatch': 'Electronics > Wearables > Smartwatches',
    };

    /**
     * Normalize an affiliate deal into standardized format
     */
    public normalize(deal: AffiliateDeal): NormalizedDeal {
        const normalizedTitle = this.normalizeTitle(deal.title);
        const brand = this.extractBrand(deal.title, deal.brand);
        const model = this.extractModel(deal.title);
        const category = this.normalizeCategory(deal.category);
        const discountPercent = this.calculateDiscount(deal.currentPrice, deal.originalPrice);
        const fingerprint = this.generateFingerprint(normalizedTitle, brand, model);

        return {
            id: this.generateId(),
            normalizedTitle,
            originalTitle: deal.title,
            description: deal.description,
            currentPrice: deal.currentPrice,
            originalPrice: deal.originalPrice,
            discountPercent,
            currency: deal.currency || 'USD',
            brand,
            model,
            category: category.split(' > ')[0],
            subcategory: category.includes(' > ') ? category : undefined,
            condition: deal.condition,
            marketplace: this.normalizeMarketplace(deal.merchant),
            affiliateUrl: deal.affiliateUrl,
            externalId: deal.externalId,
            imageUrl: deal.imageUrl,
            rating: deal.rating,
            reviewCount: deal.reviewCount,
            inStock: deal.inStock,
            fetchedAt: deal.fetchedAt,
            normalizedAt: new Date(),
            fingerprint,
        };
    }

    /**
     * Normalize product title
     * - Remove promotional text
     * - Standardize formatting
     * - Remove excessive punctuation
     */
    private normalizeTitle(title: string): string {
        let normalized = title
            // Remove promotional prefixes
            .replace(/^(NEW|SALE|HOT|LIMITED|EXCLUSIVE)[\s\-:]+/gi, '')
            // Remove promotional suffixes
            .replace(/[\s\-]+(?:sale|deal|offer|promo|discount|clearance)$/gi, '')
            // Remove bracketed promotional text
            .replace(/\[(.*?)\]/g, '')
            .replace(/\((sale|deal|offer|promo|new|save \d+%?)\)/gi, '')
            // Remove multiple spaces
            .replace(/\s+/g, ' ')
            // Trim
            .trim();

        // Capitalize first letter of each word
        normalized = normalized
            .split(' ')
            .map(word => {
                // Keep acronyms uppercase
                if (word === word.toUpperCase() && word.length <= 5) {
                    return word;
                }
                return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
            })
            .join(' ');

        return normalized;
    }

    /**
     * Extract and normalize brand name
     */
    private extractBrand(title: string, providedBrand?: string): string {
        // First try provided brand
        if (providedBrand) {
            const normalized = this.normalizeBrandName(providedBrand);
            if (normalized) return normalized;
        }

        // Try to extract from title
        const words = title.split(/[\s\-]+/);
        for (const word of words) {
            const normalized = this.normalizeBrandName(word);
            if (normalized) return normalized;
        }

        return 'Unknown';
    }

    /**
     * Normalize brand name to canonical form
     */
    private normalizeBrandName(name: string): string | null {
        const lower = name.toLowerCase();

        for (const brand of this.brands) {
            if (brand.canonical.toLowerCase() === lower) {
                return brand.canonical;
            }
            for (const alias of brand.aliases) {
                if (alias.toLowerCase() === lower) {
                    return brand.canonical;
                }
            }
        }

        // Return capitalized if it looks like a brand (starts with capital, short)
        if (name.length <= 15 && /^[A-Z]/.test(name)) {
            return name;
        }

        return null;
    }

    /**
     * Extract model number from title
     */
    private extractModel(title: string): string | undefined {
        // Common model patterns
        const patterns = [
            /(?:model|mod)[:\s]*([A-Z0-9\-]+)/i,
            /([A-Z]{1,3}\d{2,5}[A-Z0-9\-]*)/,
            /(\d{3,5}[A-Z]{1,3})/,
        ];

        for (const pattern of patterns) {
            const match = title.match(pattern);
            if (match) {
                return match[1];
            }
        }

        return undefined;
    }

    /**
     * Normalize category to standard hierarchy
     */
    private normalizeCategory(category: string): string {
        const lower = category.toLowerCase().trim();

        for (const [key, value] of Object.entries(this.categoryMap)) {
            if (lower.includes(key)) {
                return value;
            }
        }

        // Return original with proper casing
        return category.charAt(0).toUpperCase() + category.slice(1);
    }

    /**
     * Normalize marketplace name
     */
    private normalizeMarketplace(merchant: string): string {
        const lower = merchant.toLowerCase();

        const marketplaceMap: Record<string, string> = {
            'amazon.com': 'Amazon',
            'amazon': 'Amazon',
            'smile.amazon.com': 'Amazon',
            'walmart.com': 'Walmart',
            'walmart': 'Walmart',
            'bestbuy.com': 'Best Buy',
            'best buy': 'Best Buy',
            'target.com': 'Target',
            'target': 'Target',
            'ebay.com': 'eBay',
            'ebay': 'eBay',
            'newegg.com': 'Newegg',
            'newegg': 'Newegg',
            'b&h': 'B&H Photo',
            'bhphoto': 'B&H Photo',
            'costco': 'Costco',
            'costco.com': 'Costco',
        };

        for (const [key, value] of Object.entries(marketplaceMap)) {
            if (lower.includes(key)) {
                return value;
            }
        }

        return merchant;
    }

    /**
     * Calculate discount percentage
     */
    private calculateDiscount(currentPrice: number, originalPrice?: number): number | undefined {
        if (!originalPrice || originalPrice <= currentPrice) {
            return undefined;
        }
        return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
    }

    /**
     * Generate fingerprint for deduplication
     */
    private generateFingerprint(title: string, brand: string, model?: string): string {
        const parts = [
            brand.toLowerCase(),
            model?.toLowerCase() || '',
            // Extract key words from title
            title.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .split(/\s+/)
                .filter(w => w.length > 3)
                .slice(0, 5)
                .sort()
                .join('-'),
        ];
        return parts.filter(Boolean).join('::');
    }

    /**
     * Generate unique ID
     */
    private generateId(): string {
        return `deal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    /**
     * Check if two deals are duplicates
     */
    public areDuplicates(deal1: NormalizedDeal, deal2: NormalizedDeal): boolean {
        // Exact fingerprint match
        if (deal1.fingerprint === deal2.fingerprint) {
            return true;
        }

        // Same brand plus similar title
        if (deal1.brand === deal2.brand) {
            const similarity = this.calculateSimilarity(
                deal1.normalizedTitle,
                deal2.normalizedTitle
            );
            if (similarity > 0.85) {
                return true;
            }
        }

        return false;
    }

    /**
     * Calculate string similarity (Jaccard index)
     */
    private calculateSimilarity(str1: string, str2: string): number {
        const set1 = new Set(str1.toLowerCase().split(/\s+/));
        const set2 = new Set(str2.toLowerCase().split(/\s+/));

        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);

        return intersection.size / union.size;
    }

    /**
     * Deduplicate array of deals, keeping best version
     */
    public deduplicateDeals(deals: NormalizedDeal[]): NormalizedDeal[] {
        const uniqueDeals: NormalizedDeal[] = [];
        const seen = new Map<string, NormalizedDeal>();

        for (const deal of deals) {
            const existing = seen.get(deal.fingerprint);

            if (!existing) {
                seen.set(deal.fingerprint, deal);
                uniqueDeals.push(deal);
            } else {
                // Keep the deal with better price or more complete data
                if (deal.currentPrice < existing.currentPrice ||
                    (deal.rating && !existing.rating) ||
                    (deal.reviewCount && !existing.reviewCount)) {
                    seen.set(deal.fingerprint, deal);
                    const index = uniqueDeals.findIndex(d => d.fingerprint === existing.fingerprint);
                    if (index !== -1) {
                        uniqueDeals[index] = deal;
                    }
                }
            }
        }

        return uniqueDeals;
    }
}

// Export singleton
export const dealNormalizer = new DealNormalizer();
