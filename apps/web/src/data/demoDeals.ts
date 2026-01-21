/**
 * Demo Tech Deals Database
 * Realistic product data simulating aggregation from major retailers
 * (Amazon, Best Buy, Walmart, Target, Apple, etc.)
 */

export interface TechDeal {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    originalPrice: number;
    currentPrice: number;
    discountPercent: number;
    category: string;
    brand: string;
    condition: string;
    dealScore: number;
    aiVerdict: string;
    priceVsAverage: number;
    isHot: boolean;
    isFeatured: boolean;
    isAllTimeLow: boolean;
    allTimeLowPrice: number;
    historicHighPrice: number;
    pricePrediction: 'rising' | 'falling' | 'stable';
    priceDropPercent30d: number;
    fakeReviewRisk: number;
    reviewQualityScore: number;
    verifiedPurchasePercent: number;
    city: string;
    state: string;
    externalUrl: string;
    views: number;
    saves: number;
    postedAt: string;
    sellerName: string;
    sellerRating: number;
    sellerReviews: number;
    isVerifiedSeller: boolean;
    specs?: Record<string, string>;
    marketplace: {
        id: string;
        name: string;
        color: string;
        baseUrl: string;
    };
    priceHistory: Array<{ price: number; recordedAt: string }>;
}

// Major marketplace configurations
const MARKETPLACES = {
    amazon: { id: 'amazon', name: 'Amazon', color: '#FF9900', baseUrl: 'https://amazon.com' },
    bestbuy: { id: 'bestbuy', name: 'Best Buy', color: '#0046BE', baseUrl: 'https://bestbuy.com' },
    walmart: { id: 'walmart', name: 'Walmart', color: '#0071CE', baseUrl: 'https://walmart.com' },
    target: { id: 'target', name: 'Target', color: '#CC0000', baseUrl: 'https://target.com' },
    apple: { id: 'apple', name: 'Apple Store', color: '#555555', baseUrl: 'https://apple.com' },
    newegg: { id: 'newegg', name: 'Newegg', color: '#F7941D', baseUrl: 'https://newegg.com' },
    bh: { id: 'bh', name: 'B&H Photo', color: '#2B2B2B', baseUrl: 'https://bhphotovideo.com' },
};

// Generate price history for last 30 days
function generatePriceHistory(currentPrice: number, volatility = 0.15): Array<{ price: number; recordedAt: string }> {
    const history = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
        const date = new Date(now - i * 24 * 60 * 60 * 1000);
        const variance = 1 + (Math.random() - 0.5) * volatility;
        const historicPrice = Math.round(currentPrice * variance);
        history.push({
            price: i === 0 ? currentPrice : historicPrice,
            recordedAt: date.toISOString(),
        });
    }
    return history;
}

export const DEMO_DEALS: TechDeal[] = [
    // ===================
    // LAPTOPS
    // ===================
    {
        id: 'deal_macbook_pro_14',
        title: 'Apple MacBook Pro 14" M3 Pro (2024) - 18GB RAM, 512GB SSD',
        description: 'The most powerful MacBook Pro yet. Featuring the M3 Pro chip with 12-core CPU and 18-core GPU, delivering incredible performance for demanding workflows. Stunning Liquid Retina XDR display with ProMotion technology.',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=800',
        originalPrice: 1999,
        currentPrice: 1749,
        discountPercent: 13,
        category: 'Laptops',
        brand: 'Apple',
        condition: 'New',
        dealScore: 92,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -12,
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        allTimeLowPrice: 1749,
        historicHighPrice: 2199,
        pricePrediction: 'stable',
        priceDropPercent30d: 8,
        fakeReviewRisk: 5,
        reviewQualityScore: 96,
        verifiedPurchasePercent: 89,
        city: 'San Francisco',
        state: 'CA',
        externalUrl: 'https://amazon.com/dp/macbook-pro',
        views: 12847,
        saves: 1234,
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Amazon',
        sellerRating: 4.8,
        sellerReviews: 2847291,
        isVerifiedSeller: true,
        specs: {
            'Processor': 'Apple M3 Pro (12-core CPU, 18-core GPU)',
            'Memory': '18GB Unified Memory',
            'Storage': '512GB SSD',
            'Display': '14.2" Liquid Retina XDR',
            'Battery': 'Up to 17 hours',
        },
        marketplace: MARKETPLACES.amazon,
        priceHistory: generatePriceHistory(1749),
    },
    {
        id: 'deal_dell_xps_15',
        title: 'Dell XPS 15 (2024) - Intel Core Ultra 7, 32GB RAM, 1TB SSD',
        description: 'Premium Windows laptop with stunning 15.6" OLED 3.5K display, Intel Core Ultra 7 processor, and all-day battery life. Perfect for creative professionals.',
        imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=800',
        originalPrice: 1899,
        currentPrice: 1499,
        discountPercent: 21,
        category: 'Laptops',
        brand: 'Dell',
        condition: 'New',
        dealScore: 88,
        aiVerdict: 'Great Deal',
        priceVsAverage: -18,
        isHot: true,
        isFeatured: false,
        isAllTimeLow: false,
        allTimeLowPrice: 1449,
        historicHighPrice: 1999,
        pricePrediction: 'falling',
        priceDropPercent30d: 15,
        fakeReviewRisk: 8,
        reviewQualityScore: 91,
        verifiedPurchasePercent: 85,
        city: 'Austin',
        state: 'TX',
        externalUrl: 'https://bestbuy.com/dell-xps-15',
        views: 8934,
        saves: 876,
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Best Buy',
        sellerRating: 4.7,
        sellerReviews: 1847293,
        isVerifiedSeller: true,
        specs: {
            'Processor': 'Intel Core Ultra 7 155H',
            'Memory': '32GB DDR5',
            'Storage': '1TB NVMe SSD',
            'Display': '15.6" OLED 3.5K',
            'Graphics': 'Intel Arc Graphics',
        },
        marketplace: MARKETPLACES.bestbuy,
        priceHistory: generatePriceHistory(1499),
    },

    // ===================
    // SMARTPHONES
    // ===================
    {
        id: 'deal_iphone_15_pro_max',
        title: 'Apple iPhone 15 Pro Max 256GB - Natural Titanium (Unlocked)',
        description: 'The most advanced iPhone ever. Featuring titanium design, A17 Pro chip, and the most powerful iPhone camera system yet. 5x optical zoom and 4K Cinematic mode.',
        imageUrl: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',
        originalPrice: 1199,
        currentPrice: 1049,
        discountPercent: 13,
        category: 'Phones',
        brand: 'Apple',
        condition: 'New',
        dealScore: 90,
        aiVerdict: 'Excellent Deal',
        priceVsAverage: -10,
        isHot: true,
        isFeatured: true,
        isAllTimeLow: false,
        allTimeLowPrice: 999,
        historicHighPrice: 1299,
        pricePrediction: 'stable',
        priceDropPercent30d: 5,
        fakeReviewRisk: 3,
        reviewQualityScore: 98,
        verifiedPurchasePercent: 92,
        city: 'New York',
        state: 'NY',
        externalUrl: 'https://apple.com/iphone-15-pro-max',
        views: 45892,
        saves: 4521,
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Apple Store',
        sellerRating: 4.9,
        sellerReviews: 5234892,
        isVerifiedSeller: true,
        specs: {
            'Processor': 'A17 Pro chip',
            'Storage': '256GB',
            'Display': '6.7" Super Retina XDR',
            'Camera': '48MP main + 12MP ultrawide + 12MP 5x telephoto',
            'Battery': 'Up to 29 hours video playback',
        },
        marketplace: MARKETPLACES.apple,
        priceHistory: generatePriceHistory(1049),
    },
    {
        id: 'deal_galaxy_s24_ultra',
        title: 'Samsung Galaxy S24 Ultra 512GB - Titanium Black (Unlocked)',
        description: 'AI-powered smartphone with Galaxy AI features, 200MP camera, and S Pen included. Titanium frame for ultimate durability.',
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
        originalPrice: 1419,
        currentPrice: 1149,
        discountPercent: 19,
        category: 'Phones',
        brand: 'Samsung',
        condition: 'New',
        dealScore: 87,
        aiVerdict: 'Great Value',
        priceVsAverage: -15,
        isHot: true,
        isFeatured: false,
        isAllTimeLow: true,
        allTimeLowPrice: 1149,
        historicHighPrice: 1499,
        pricePrediction: 'falling',
        priceDropPercent30d: 12,
        fakeReviewRisk: 6,
        reviewQualityScore: 93,
        verifiedPurchasePercent: 87,
        city: 'Seattle',
        state: 'WA',
        externalUrl: 'https://amazon.com/samsung-s24-ultra',
        views: 32145,
        saves: 2987,
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Amazon',
        sellerRating: 4.8,
        sellerReviews: 2847291,
        isVerifiedSeller: true,
        specs: {
            'Processor': 'Snapdragon 8 Gen 3',
            'Memory': '12GB RAM',
            'Storage': '512GB',
            'Display': '6.8" Dynamic AMOLED 2X',
            'Camera': '200MP + 12MP + 50MP + 10MP',
        },
        marketplace: MARKETPLACES.amazon,
        priceHistory: generatePriceHistory(1149),
    },

    // ===================
    // GAMING
    // ===================
    {
        id: 'deal_ps5_slim',
        title: 'Sony PlayStation 5 Slim Digital Edition Console',
        description: 'Experience lightning-fast loading, deeper immersion with haptic feedback, adaptive triggers, and stunning 4K graphics.',
        imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800',
        originalPrice: 449,
        currentPrice: 399,
        discountPercent: 11,
        category: 'Gaming',
        brand: 'Sony',
        condition: 'New',
        dealScore: 85,
        aiVerdict: 'Good Deal',
        priceVsAverage: -8,
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        allTimeLowPrice: 379,
        historicHighPrice: 499,
        pricePrediction: 'stable',
        priceDropPercent30d: 3,
        fakeReviewRisk: 4,
        reviewQualityScore: 95,
        verifiedPurchasePercent: 91,
        city: 'Los Angeles',
        state: 'CA',
        externalUrl: 'https://target.com/ps5-slim',
        views: 28934,
        saves: 2156,
        postedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Target',
        sellerRating: 4.6,
        sellerReviews: 987234,
        isVerifiedSeller: true,
        specs: {
            'Storage': '1TB SSD',
            'Resolution': 'Up to 4K @ 120Hz',
            'Ray Tracing': 'Hardware-accelerated',
            'Audio': '3D Tempest Audio',
        },
        marketplace: MARKETPLACES.target,
        priceHistory: generatePriceHistory(399),
    },
    {
        id: 'deal_nintendo_switch_oled',
        title: 'Nintendo Switch OLED Model - White Joy-Con',
        description: 'Vibrant 7-inch OLED screen, enhanced audio, wide adjustable stand, and 64GB internal storage.',
        imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800',
        originalPrice: 349,
        currentPrice: 299,
        discountPercent: 14,
        category: 'Gaming',
        brand: 'Nintendo',
        condition: 'New',
        dealScore: 83,
        aiVerdict: 'Fair Deal',
        priceVsAverage: -6,
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        allTimeLowPrice: 279,
        historicHighPrice: 399,
        pricePrediction: 'stable',
        priceDropPercent30d: 5,
        fakeReviewRisk: 7,
        reviewQualityScore: 90,
        verifiedPurchasePercent: 86,
        city: 'Chicago',
        state: 'IL',
        externalUrl: 'https://walmart.com/nintendo-switch',
        views: 15678,
        saves: 1234,
        postedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Walmart',
        sellerRating: 4.5,
        sellerReviews: 1234567,
        isVerifiedSeller: true,
        marketplace: MARKETPLACES.walmart,
        priceHistory: generatePriceHistory(299),
    },

    // ===================
    // AUDIO
    // ===================
    {
        id: 'deal_airpods_pro_2',
        title: 'Apple AirPods Pro (2nd Gen) with MagSafe Charging Case (USB-C)',
        description: 'Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio, and up to 2x more noise cancellation than the previous generation.',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800',
        originalPrice: 249,
        currentPrice: 189,
        discountPercent: 24,
        category: 'Audio',
        brand: 'Apple',
        condition: 'New',
        dealScore: 94,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -20,
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        allTimeLowPrice: 189,
        historicHighPrice: 279,
        pricePrediction: 'rising',
        priceDropPercent30d: 18,
        fakeReviewRisk: 4,
        reviewQualityScore: 97,
        verifiedPurchasePercent: 93,
        city: 'Miami',
        state: 'FL',
        externalUrl: 'https://amazon.com/airpods-pro-2',
        views: 67234,
        saves: 7891,
        postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Amazon',
        sellerRating: 4.8,
        sellerReviews: 2847291,
        isVerifiedSeller: true,
        specs: {
            'Chip': 'H2 chip',
            'ANC': 'Active Noise Cancellation',
            'Battery': '6 hours (30 hours with case)',
            'Connectivity': 'Bluetooth 5.3',
        },
        marketplace: MARKETPLACES.amazon,
        priceHistory: generatePriceHistory(189),
    },
    {
        id: 'deal_sony_wh1000xm5',
        title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones - Black',
        description: 'Industry-leading noise cancellation with 8 microphones, 30-hour battery life, and ultra-comfortable design with soft-fit leather.',
        imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
        originalPrice: 399,
        currentPrice: 298,
        discountPercent: 25,
        category: 'Audio',
        brand: 'Sony',
        condition: 'New',
        dealScore: 91,
        aiVerdict: 'Excellent Deal',
        priceVsAverage: -22,
        isHot: true,
        isFeatured: false,
        isAllTimeLow: false,
        allTimeLowPrice: 278,
        historicHighPrice: 449,
        pricePrediction: 'stable',
        priceDropPercent30d: 12,
        fakeReviewRisk: 5,
        reviewQualityScore: 94,
        verifiedPurchasePercent: 88,
        city: 'Denver',
        state: 'CO',
        externalUrl: 'https://bestbuy.com/sony-wh1000xm5',
        views: 34521,
        saves: 3456,
        postedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Best Buy',
        sellerRating: 4.7,
        sellerReviews: 1847293,
        isVerifiedSeller: true,
        marketplace: MARKETPLACES.bestbuy,
        priceHistory: generatePriceHistory(298),
    },

    // ===================
    // TABLETS
    // ===================
    {
        id: 'deal_ipad_pro_m4',
        title: 'Apple iPad Pro 11" M4 (2024) - 256GB, Wi-Fi, Space Black',
        description: 'The thinnest Apple product ever. M4 chip delivers outrageous performance, Ultra Retina XDR display with tandem OLED technology.',
        imageUrl: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800',
        originalPrice: 999,
        currentPrice: 899,
        discountPercent: 10,
        category: 'Tablets',
        brand: 'Apple',
        condition: 'New',
        dealScore: 86,
        aiVerdict: 'Good Deal',
        priceVsAverage: -8,
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        allTimeLowPrice: 849,
        historicHighPrice: 1099,
        pricePrediction: 'falling',
        priceDropPercent30d: 6,
        fakeReviewRisk: 3,
        reviewQualityScore: 98,
        verifiedPurchasePercent: 94,
        city: 'Portland',
        state: 'OR',
        externalUrl: 'https://apple.com/ipad-pro',
        views: 21345,
        saves: 1987,
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Apple Store',
        sellerRating: 4.9,
        sellerReviews: 5234892,
        isVerifiedSeller: true,
        specs: {
            'Processor': 'Apple M4 chip',
            'Display': '11" Ultra Retina XDR (OLED)',
            'Storage': '256GB',
            'Face ID': 'Yes',
            'Apple Pencil': 'Pro support',
        },
        marketplace: MARKETPLACES.apple,
        priceHistory: generatePriceHistory(899),
    },

    // ===================
    // TVs
    // ===================
    {
        id: 'deal_lg_oled_c4',
        title: 'LG 65" Class C4 Series OLED evo 4K Smart TV (2024)',
        description: 'Perfect blacks, infinite contrast, and α9 AI Processor Gen7 for an unparalleled viewing experience. Dolby Vision IQ and Dolby Atmos.',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800',
        originalPrice: 2499,
        currentPrice: 1796,
        discountPercent: 28,
        category: 'TVs',
        brand: 'LG',
        condition: 'New',
        dealScore: 93,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -25,
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        allTimeLowPrice: 1796,
        historicHighPrice: 2799,
        pricePrediction: 'stable',
        priceDropPercent30d: 20,
        fakeReviewRisk: 6,
        reviewQualityScore: 92,
        verifiedPurchasePercent: 84,
        city: 'Dallas',
        state: 'TX',
        externalUrl: 'https://bestbuy.com/lg-oled-c4',
        views: 18976,
        saves: 2345,
        postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        sellerName: 'Best Buy',
        sellerRating: 4.7,
        sellerReviews: 1847293,
        isVerifiedSeller: true,
        marketplace: MARKETPLACES.bestbuy,
        priceHistory: generatePriceHistory(1796),
    },
];

// Helper to get deal by ID
export function getDealById(id: string): TechDeal | undefined {
    return DEMO_DEALS.find(deal => deal.id === id);
}

// Helper to get similar deals
export function getSimilarDeals(deal: TechDeal, limit = 4): TechDeal[] {
    return DEMO_DEALS
        .filter(d => d.id !== deal.id && (d.category === deal.category || d.brand === deal.brand))
        .slice(0, limit);
}

// Helper to get hot deals
export function getHotDeals(limit = 6): TechDeal[] {
    return DEMO_DEALS.filter(d => d.isHot).slice(0, limit);
}

// Helper to get all-time low deals
export function getAllTimeLowDeals(limit = 6): TechDeal[] {
    return DEMO_DEALS.filter(d => d.isAllTimeLow).slice(0, limit);
}
