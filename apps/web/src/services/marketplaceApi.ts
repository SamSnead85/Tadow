// Tadow Marketplace API Service
// Connects to real marketplace APIs for live pricing and product data

// API Configuration - Set via environment variables
export const API_CONFIG = {
    amazon: {
        affiliateTag: import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'tadow-20',
        apiEndpoint: import.meta.env.VITE_AMAZON_API_ENDPOINT || '/api/amazon',
    },
    bestbuy: {
        apiKey: import.meta.env.VITE_BESTBUY_API_KEY || '',
        apiEndpoint: 'https://api.bestbuy.com/v1',
    },
    walmart: {
        apiKey: import.meta.env.VITE_WALMART_API_KEY || '',
        apiEndpoint: 'https://developer.api.walmart.com/api-proxy/service',
    },
    rapidapi: {
        key: import.meta.env.VITE_RAPIDAPI_KEY || '',
        amazonHost: 'real-time-amazon-data.p.rapidapi.com',
    }
};

export interface LiveProduct {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    currentPrice: number;
    originalPrice: number;
    discountPercent: number;
    productUrl: string;
    marketplace: string;
    rating: number;
    reviewCount: number;
    inStock: boolean;
    prime?: boolean;
    specs?: Record<string, string>;
}

export interface SearchFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    brand?: string;
    minRating?: number;
    // Needs-based filters
    useCase?: string;         // gaming, work, creative, casual
    portability?: string;     // ultraportable, portable, desktop-replacement
    performance?: string;     // entry, mid-range, high-end, professional
    screenSize?: string;      // small, medium, large
    budget?: string;          // budget, mid-range, premium, unlimited
}

// Search Amazon via RapidAPI (Real-Time Amazon Data API)
export async function searchAmazon(
    query: string,
    filters?: SearchFilters
): Promise<LiveProduct[]> {
    const { rapidapi } = API_CONFIG;

    if (!rapidapi.key) {
        console.warn('RapidAPI key not configured, using demo data');
        return [];
    }

    try {
        const params = new URLSearchParams({
            query,
            country: 'US',
            page: '1',
        });

        if (filters?.minPrice) params.append('min_price', filters.minPrice.toString());
        if (filters?.maxPrice) params.append('max_price', filters.maxPrice.toString());

        const response = await fetch(
            `https://${rapidapi.amazonHost}/search?${params}`,
            {
                headers: {
                    'X-RapidAPI-Key': rapidapi.key,
                    'X-RapidAPI-Host': rapidapi.amazonHost,
                },
            }
        );

        if (!response.ok) throw new Error('Amazon API request failed');

        const data = await response.json();

        return data.data.products.map((product: any) => ({
            id: product.asin,
            title: product.product_title,
            description: product.product_description || '',
            imageUrl: product.product_photo,
            currentPrice: parseFloat(product.product_price?.replace(/[^0-9.]/g, '') || '0'),
            originalPrice: parseFloat(product.product_original_price?.replace(/[^0-9.]/g, '') || '0'),
            discountPercent: parseInt(product.product_star_rating || '0'),
            productUrl: `https://www.amazon.com/dp/${product.asin}?tag=${API_CONFIG.amazon.affiliateTag}`,
            marketplace: 'Amazon',
            rating: parseFloat(product.product_star_rating || '0'),
            reviewCount: parseInt(product.product_num_ratings?.replace(/,/g, '') || '0'),
            inStock: product.is_available,
            prime: product.is_prime,
        }));
    } catch (error) {
        console.error('Amazon search failed:', error);
        return [];
    }
}

// Search Best Buy API
export async function searchBestBuy(
    query: string,
    filters?: SearchFilters
): Promise<LiveProduct[]> {
    const { bestbuy } = API_CONFIG;

    if (!bestbuy.apiKey) {
        console.warn('Best Buy API key not configured');
        return [];
    }

    try {
        let searchQuery = `(search=${encodeURIComponent(query)})`;

        if (filters?.category) {
            searchQuery += `&categoryPath.name=${filters.category}*`;
        }
        if (filters?.minPrice) {
            searchQuery += `&salePrice>=${filters.minPrice}`;
        }
        if (filters?.maxPrice) {
            searchQuery += `&salePrice<=${filters.maxPrice}`;
        }

        const response = await fetch(
            `${bestbuy.apiEndpoint}/products${searchQuery}?apiKey=${bestbuy.apiKey}&format=json&show=sku,name,shortDescription,image,salePrice,regularPrice,percentSavings,url,customerReviewAverage,customerReviewCount,onlineAvailability`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!response.ok) throw new Error('Best Buy API request failed');

        const data = await response.json();

        return data.products.map((product: any) => ({
            id: product.sku.toString(),
            title: product.name,
            description: product.shortDescription || '',
            imageUrl: product.image,
            currentPrice: product.salePrice,
            originalPrice: product.regularPrice,
            discountPercent: Math.round(product.percentSavings || 0),
            productUrl: product.url,
            marketplace: 'Best Buy',
            rating: product.customerReviewAverage || 0,
            reviewCount: product.customerReviewCount || 0,
            inStock: product.onlineAvailability,
        }));
    } catch (error) {
        console.error('Best Buy search failed:', error);
        return [];
    }
}

// Generate affiliate URL for any marketplace
export function generateAffiliateUrl(
    marketplace: string,
    productId: string,
    productTitle: string
): string {
    const encodedTitle = encodeURIComponent(productTitle);

    switch (marketplace.toLowerCase()) {
        case 'amazon':
            return `https://www.amazon.com/dp/${productId}?tag=${API_CONFIG.amazon.affiliateTag}`;
        case 'best buy':
        case 'bestbuy':
            return `https://www.bestbuy.com/site/-/${productId}.p`;
        case 'walmart':
            return `https://www.walmart.com/ip/${productId}`;
        case 'newegg':
            return `https://www.newegg.com/p/${productId}`;
        case 'target':
            return `https://www.target.com/p/-/A-${productId}`;
        case 'dell':
            return `https://www.dell.com/en-us/search/${encodedTitle}`;
        case 'apple':
            return `https://www.apple.com/shop/product/${productId}`;
        default:
            return `https://www.google.com/search?q=${encodedTitle}+buy`;
    }
}

// AI-powered needs analysis to recommend specs
export interface UserNeeds {
    useCase: 'gaming' | 'work' | 'creative' | 'casual' | 'student';
    budget: 'budget' | 'mid-range' | 'premium' | 'unlimited';
    portability: 'ultraportable' | 'portable' | 'desktop-replacement';
    priority: 'performance' | 'battery' | 'display' | 'value';
}

export function getRecommendedSpecs(needs: UserNeeds, category: string): SearchFilters {
    if (category === 'Laptops') {
        const specs: SearchFilters = {};

        // Budget mapping
        switch (needs.budget) {
            case 'budget':
                specs.minPrice = 300;
                specs.maxPrice = 600;
                break;
            case 'mid-range':
                specs.minPrice = 600;
                specs.maxPrice = 1200;
                break;
            case 'premium':
                specs.minPrice = 1200;
                specs.maxPrice = 2500;
                break;
            case 'unlimited':
                specs.minPrice = 1500;
                break;
        }

        // Use case influences search terms
        specs.useCase = needs.useCase;
        specs.performance = needs.useCase === 'gaming' ? 'high-end' :
            needs.useCase === 'creative' ? 'professional' : 'mid-range';

        return specs;
    }

    // Default filters
    return {
        minPrice: needs.budget === 'budget' ? 0 : needs.budget === 'mid-range' ? 200 : 500,
        maxPrice: needs.budget === 'budget' ? 300 : needs.budget === 'mid-range' ? 800 : undefined,
    };
}

// Aggregate search across multiple marketplaces
export async function searchAllMarketplaces(
    query: string,
    filters?: SearchFilters
): Promise<LiveProduct[]> {
    const results = await Promise.allSettled([
        searchAmazon(query, filters),
        searchBestBuy(query, filters),
    ]);

    const allProducts: LiveProduct[] = [];

    results.forEach((result) => {
        if (result.status === 'fulfilled') {
            allProducts.push(...result.value);
        }
    });

    // Sort by price
    return allProducts.sort((a, b) => a.currentPrice - b.currentPrice);
}
