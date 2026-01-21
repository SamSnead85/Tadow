// Expanded showcase deals library - 50+ premium curated products
// Organized by category for better filtering

export interface ShowcaseDeal {
    id: string;
    title: string;
    description: string;
    imageUrl: string;
    currentPrice: number;
    originalPrice: number;
    discount: number;
    discountPercent: number;
    category: string;
    brand: string;
    condition: string;
    conditionLabel: string;
    dealScore: number;
    aiVerdict: string;
    pricePrediction?: 'rising' | 'falling' | 'stable';
    priceHistory?: number[];
    isHot: boolean;
    isFeatured: boolean;
    isAllTimeLow: boolean;
    sellerName: string;
    sellerRating: number;
    sellerReviews: number;
    isVerifiedSeller: boolean;
    marketplace: { id: string; name: string; color: string; };
    // NEW: Purchase and specs fields (optional for backward compatibility)
    productUrl?: string;
    specs?: {
        ram?: string;
        storage?: string;
        screenSize?: string;
        processor?: string;
        battery?: string;
        weight?: string;
        resolution?: string;
        [key: string]: string | undefined;
    };
}

// Helper to generate purchase URLs based on marketplace and product title
export function getProductUrl(deal: ShowcaseDeal): string {
    if (deal.productUrl) return deal.productUrl;

    const searchTitle = encodeURIComponent(deal.title);

    switch (deal.marketplace.id) {
        case 'amazon':
            return `https://www.amazon.com/s?k=${searchTitle}&tag=tadow-20`;
        case 'bestbuy':
            return `https://www.bestbuy.com/site/searchpage.jsp?st=${searchTitle}`;
        case 'walmart':
            return `https://www.walmart.com/search?q=${searchTitle}`;
        case 'newegg':
            return `https://www.newegg.com/p/pl?d=${searchTitle}`;
        case 'dell':
            return `https://www.dell.com/en-us/search/${searchTitle}`;
        case 'apple':
            return `https://www.apple.com/shop/buy-${deal.category.toLowerCase()}`;
        case 'homedepot':
            return `https://www.homedepot.com/s/${searchTitle}`;
        default:
            return `https://www.google.com/search?q=${searchTitle}+buy`;
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LAPTOPS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const laptops: ShowcaseDeal[] = [
    {
        id: 'laptop-1',
        title: 'Apple MacBook Air M3 15" - 256GB SSD, 8GB RAM',
        description: 'Latest M3 chip with incredible performance and all-day battery life. Perfect for professionals.',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        currentPrice: 1099,
        originalPrice: 1299,
        discount: 200,
        discountPercent: 15,
        category: 'Laptops',
        brand: 'Apple',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 94,
        aiVerdict: 'Exceptional deal on latest M3 MacBook',
        pricePrediction: 'stable',
        priceHistory: [1299, 1249, 1199, 1099],
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Apple Store',
        sellerRating: 4.9,
        sellerReviews: 25420,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'laptop-2',
        title: 'Dell XPS 15 OLED - Intel i7, 32GB RAM, 1TB SSD',
        description: 'Stunning 3.5K OLED display with premium build quality.',
        imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',
        currentPrice: 1449,
        originalPrice: 1899,
        discount: 450,
        discountPercent: 24,
        category: 'Laptops',
        brand: 'Dell',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 91,
        aiVerdict: 'Best price on premium XPS 15',
        pricePrediction: 'falling',
        priceHistory: [1899, 1799, 1599, 1449],
        isHot: true,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'Dell Direct',
        sellerRating: 4.7,
        sellerReviews: 18300,
        isVerifiedSeller: true,
        marketplace: { id: 'dell', name: 'Dell', color: '#007DB8' }
    },
    {
        id: 'laptop-3',
        title: 'Lenovo ThinkPad X1 Carbon Gen 11 - i7, 16GB, 512GB',
        description: 'Business ultrabook with legendary keyboard and all-day battery.',
        imageUrl: 'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600',
        currentPrice: 1199,
        originalPrice: 1599,
        discount: 400,
        discountPercent: 25,
        category: 'Laptops',
        brand: 'Lenovo',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 88,
        aiVerdict: 'Solid business laptop deal',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'Lenovo',
        sellerRating: 4.6,
        sellerReviews: 12400,
        isVerifiedSeller: true,
        marketplace: { id: 'lenovo', name: 'Lenovo', color: '#E2231A' }
    },
    {
        id: 'laptop-4',
        title: 'ASUS ROG Zephyrus G14 - RTX 4060, Ryzen 9',
        description: 'Compact gaming powerhouse with AniMe Matrix display.',
        imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600',
        currentPrice: 1299,
        originalPrice: 1599,
        discount: 300,
        discountPercent: 19,
        category: 'Laptops',
        brand: 'ASUS',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 89,
        aiVerdict: 'Great gaming laptop value',
        pricePrediction: 'falling',
        isHot: true,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Best Buy',
        sellerRating: 4.8,
        sellerReviews: 8900,
        isVerifiedSeller: true,
        marketplace: { id: 'bestbuy', name: 'Best Buy', color: '#0046BE' }
    },
    {
        id: 'laptop-5',
        title: 'HP Spectre x360 14" 2-in-1 - OLED, i7, 16GB',
        description: 'Premium convertible with gem-cut design and OLED touch display.',
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600',
        currentPrice: 1149,
        originalPrice: 1499,
        discount: 350,
        discountPercent: 23,
        category: 'Laptops',
        brand: 'HP',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 86,
        aiVerdict: 'Great 2-in-1 convertible deal',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'HP Store',
        sellerRating: 4.5,
        sellerReviews: 6700,
        isVerifiedSeller: true,
        marketplace: { id: 'hp', name: 'HP', color: '#0096D6' }
    },
    {
        id: 'laptop-6',
        title: 'Microsoft Surface Laptop 5 - i5, 8GB, 256GB',
        description: 'Sleek and lightweight with premium Alcantara finish.',
        imageUrl: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600',
        currentPrice: 799,
        originalPrice: 999,
        discount: 200,
        discountPercent: 20,
        category: 'Laptops',
        brand: 'Microsoft',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 84,
        aiVerdict: 'Good entry Surface deal',
        pricePrediction: 'falling',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: true,
        sellerName: 'Microsoft',
        sellerRating: 4.7,
        sellerReviews: 9200,
        isVerifiedSeller: true,
        marketplace: { id: 'microsoft', name: 'Microsoft', color: '#00A4EF' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PHONES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const phones: ShowcaseDeal[] = [
    {
        id: 'phone-1',
        title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
        description: 'Premium titanium design with A17 Pro chip and 5x optical zoom.',
        imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        currentPrice: 1049,
        originalPrice: 1199,
        discount: 150,
        discountPercent: 13,
        category: 'Phones',
        brand: 'Apple',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 87,
        aiVerdict: 'Best carrier-free price',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'Apple',
        sellerRating: 4.9,
        sellerReviews: 38000,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'phone-2',
        title: 'Samsung Galaxy S24 Ultra 256GB - Titanium Black',
        description: 'AI-powered flagship with S Pen and 200MP camera.',
        imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600',
        currentPrice: 999,
        originalPrice: 1299,
        discount: 300,
        discountPercent: 23,
        category: 'Phones',
        brand: 'Samsung',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 92,
        aiVerdict: 'Great S24 Ultra discount',
        pricePrediction: 'falling',
        priceHistory: [1299, 1199, 1099, 999],
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Samsung',
        sellerRating: 4.8,
        sellerReviews: 22000,
        isVerifiedSeller: true,
        marketplace: { id: 'samsung', name: 'Samsung', color: '#1428A0' }
    },
    {
        id: 'phone-3',
        title: 'Google Pixel 8 Pro 128GB - Obsidian',
        description: 'Pure Google experience with 7 years of updates.',
        imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600',
        currentPrice: 749,
        originalPrice: 999,
        discount: 250,
        discountPercent: 25,
        category: 'Phones',
        brand: 'Google',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 90,
        aiVerdict: 'Best Pixel 8 Pro price yet',
        pricePrediction: 'falling',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Google Store',
        sellerRating: 4.7,
        sellerReviews: 15600,
        isVerifiedSeller: true,
        marketplace: { id: 'google', name: 'Google', color: '#4285F4' }
    },
    {
        id: 'phone-4',
        title: 'OnePlus 12 256GB - Flowy Emerald',
        description: 'Flagship killer with Snapdragon 8 Gen 3 and 100W charging.',
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600',
        currentPrice: 699,
        originalPrice: 899,
        discount: 200,
        discountPercent: 22,
        category: 'Phones',
        brand: 'OnePlus',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 88,
        aiVerdict: 'Great flagship alternative',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'OnePlus',
        sellerRating: 4.6,
        sellerReviews: 8900,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'phone-5',
        title: 'iPhone 14 128GB - Midnight (Refurbished)',
        description: 'Apple Certified Refurbished with full warranty.',
        imageUrl: 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=600',
        currentPrice: 549,
        originalPrice: 799,
        discount: 250,
        discountPercent: 31,
        category: 'Phones',
        brand: 'Apple',
        condition: 'refurbished',
        conditionLabel: 'Certified Refurbished',
        dealScore: 85,
        aiVerdict: 'Excellent refurb value',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Apple',
        sellerRating: 4.9,
        sellerReviews: 45000,
        isVerifiedSeller: true,
        marketplace: { id: 'apple', name: 'Apple', color: '#A2AAAD' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TVs
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const tvs: ShowcaseDeal[] = [
    {
        id: 'tv-1',
        title: 'Samsung 65" OLED 4K Smart TV - S95D Series',
        description: 'Stunning OLED display with AI-powered picture quality.',
        imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=600',
        currentPrice: 1799,
        originalPrice: 2499,
        discount: 700,
        discountPercent: 28,
        category: 'TVs',
        brand: 'Samsung',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 96,
        aiVerdict: 'All-time low price!',
        pricePrediction: 'rising',
        priceHistory: [2499, 2299, 1999, 1799],
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Samsung',
        sellerRating: 4.7,
        sellerReviews: 8900,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'tv-2',
        title: 'LG 77" C4 OLED evo 4K Smart TV',
        description: 'Perfect blacks and infinite contrast with webOS 24.',
        imageUrl: 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=600',
        currentPrice: 2299,
        originalPrice: 2999,
        discount: 700,
        discountPercent: 23,
        category: 'TVs',
        brand: 'LG',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 93,
        aiVerdict: 'Premium OLED at great price',
        pricePrediction: 'stable',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'LG Electronics',
        sellerRating: 4.8,
        sellerReviews: 12300,
        isVerifiedSeller: true,
        marketplace: { id: 'bestbuy', name: 'Best Buy', color: '#0046BE' }
    },
    {
        id: 'tv-3',
        title: 'Sony 55" A95L QD-OLED 4K Google TV',
        description: 'Reference-grade picture with Cognitive Processor XR.',
        imageUrl: 'https://images.unsplash.com/photo-1558888401-3cc1de77652d?w=600',
        currentPrice: 1999,
        originalPrice: 2799,
        discount: 800,
        discountPercent: 29,
        category: 'TVs',
        brand: 'Sony',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 94,
        aiVerdict: 'Best Sony OLED discount',
        pricePrediction: 'falling',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Sony',
        sellerRating: 4.8,
        sellerReviews: 7600,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'tv-4',
        title: 'TCL 65" QM8 4K Mini LED Google TV',
        description: 'Incredible brightness and local dimming at budget price.',
        imageUrl: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600',
        currentPrice: 799,
        originalPrice: 1199,
        discount: 400,
        discountPercent: 33,
        category: 'TVs',
        brand: 'TCL',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 91,
        aiVerdict: 'Best budget Mini LED',
        pricePrediction: 'stable',
        isHot: true,
        isFeatured: false,
        isAllTimeLow: true,
        sellerName: 'TCL',
        sellerRating: 4.5,
        sellerReviews: 5400,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GAMING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const gaming: ShowcaseDeal[] = [
    {
        id: 'gaming-1',
        title: 'PlayStation 5 Slim Console + Spider-Man 2 Bundle',
        description: 'Next-gen gaming with exclusive Spider-Man 2 game included.',
        imageUrl: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600',
        currentPrice: 449,
        originalPrice: 569,
        discount: 120,
        discountPercent: 21,
        category: 'Gaming',
        brand: 'Sony',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 89,
        aiVerdict: 'Rare bundle discount',
        pricePrediction: 'rising',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'PlayStation',
        sellerRating: 4.9,
        sellerReviews: 45000,
        isVerifiedSeller: true,
        marketplace: { id: 'walmart', name: 'Walmart', color: '#0071DC' }
    },
    {
        id: 'gaming-2',
        title: 'Xbox Series X 1TB Console',
        description: '12 teraflops of power for true 4K gaming.',
        imageUrl: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600',
        currentPrice: 449,
        originalPrice: 499,
        discount: 50,
        discountPercent: 10,
        category: 'Gaming',
        brand: 'Microsoft',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 82,
        aiVerdict: 'Standard Xbox deal',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Microsoft',
        sellerRating: 4.8,
        sellerReviews: 32000,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'gaming-3',
        title: 'Nintendo Switch OLED - White Joy-Con',
        description: 'Vibrant 7-inch OLED screen with enhanced audio.',
        imageUrl: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600',
        currentPrice: 299,
        originalPrice: 349,
        discount: 50,
        discountPercent: 14,
        category: 'Gaming',
        brand: 'Nintendo',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 85,
        aiVerdict: 'Good Switch OLED price',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Nintendo',
        sellerRating: 4.9,
        sellerReviews: 28000,
        isVerifiedSeller: true,
        marketplace: { id: 'target', name: 'Target', color: '#CC0000' }
    },
    {
        id: 'gaming-4',
        title: 'Steam Deck OLED 512GB',
        description: 'Portable PC gaming with stunning HDR OLED display.',
        imageUrl: 'https://images.unsplash.com/photo-1640955014216-75201056c829?w=600',
        currentPrice: 549,
        originalPrice: 549,
        discount: 0,
        discountPercent: 0,
        category: 'Gaming',
        brand: 'Valve',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 80,
        aiVerdict: 'In stock and ready to ship',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Steam',
        sellerRating: 4.7,
        sellerReviews: 8900,
        isVerifiedSeller: true,
        marketplace: { id: 'steam', name: 'Steam', color: '#1B2838' }
    },
    {
        id: 'gaming-5',
        title: 'Meta Quest 3 128GB VR Headset',
        description: 'Mixed reality gaming with full-color passthrough.',
        imageUrl: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?w=600',
        currentPrice: 449,
        originalPrice: 499,
        discount: 50,
        discountPercent: 10,
        category: 'Gaming',
        brand: 'Meta',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 83,
        aiVerdict: 'Entry VR at good price',
        pricePrediction: 'falling',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Meta',
        sellerRating: 4.5,
        sellerReviews: 15600,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AUDIO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const audio: ShowcaseDeal[] = [
    {
        id: 'audio-1',
        title: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
        description: 'Industry-leading noise cancellation with exceptional sound quality.',
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        currentPrice: 298,
        originalPrice: 399,
        discount: 101,
        discountPercent: 25,
        category: 'Audio',
        brand: 'Sony',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 91,
        aiVerdict: 'Best price in 3 months',
        pricePrediction: 'rising',
        priceHistory: [399, 379, 349, 298],
        isHot: true,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'Sony Direct',
        sellerRating: 4.8,
        sellerReviews: 15200,
        isVerifiedSeller: true,
        marketplace: { id: 'bestbuy', name: 'Best Buy', color: '#0046BE' }
    },
    {
        id: 'audio-2',
        title: 'Apple AirPods Pro 2nd Gen with USB-C',
        description: 'Adaptive audio with personalized spatial sound.',
        imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600',
        currentPrice: 189,
        originalPrice: 249,
        discount: 60,
        discountPercent: 24,
        category: 'Audio',
        brand: 'Apple',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 90,
        aiVerdict: 'Lowest AirPods Pro price',
        pricePrediction: 'stable',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Apple',
        sellerRating: 4.9,
        sellerReviews: 52000,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'audio-3',
        title: 'Bose QuietComfort Ultra Headphones',
        description: 'Immersive audio with world-class noise cancellation.',
        imageUrl: 'https://images.unsplash.com/photo-1545127398-14699f92334b?w=600',
        currentPrice: 349,
        originalPrice: 429,
        discount: 80,
        discountPercent: 19,
        category: 'Audio',
        brand: 'Bose',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 86,
        aiVerdict: 'Good Bose premium deal',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Bose',
        sellerRating: 4.7,
        sellerReviews: 11400,
        isVerifiedSeller: true,
        marketplace: { id: 'bose', name: 'Bose', color: '#000000' }
    },
    {
        id: 'audio-4',
        title: 'Sonos Era 300 Spatial Audio Speaker',
        description: 'Dolby Atmos spatial audio in a compact speaker.',
        imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
        currentPrice: 399,
        originalPrice: 449,
        discount: 50,
        discountPercent: 11,
        category: 'Audio',
        brand: 'Sonos',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 82,
        aiVerdict: 'Rare Sonos discount',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Sonos',
        sellerRating: 4.8,
        sellerReviews: 6800,
        isVerifiedSeller: true,
        marketplace: { id: 'sonos', name: 'Sonos', color: '#000000' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ELECTRONICS / GPUs / MONITORS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const electronics: ShowcaseDeal[] = [
    {
        id: 'electronics-1',
        title: 'NVIDIA GeForce RTX 4080 Super Gaming GPU',
        description: 'Ultimate gaming performance with DLSS 3 and ray tracing.',
        imageUrl: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600',
        currentPrice: 899,
        originalPrice: 1199,
        discount: 300,
        discountPercent: 25,
        category: 'Electronics',
        brand: 'NVIDIA',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 93,
        aiVerdict: 'Price just dropped!',
        pricePrediction: 'falling',
        priceHistory: [1199, 1099, 999, 899],
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'NVIDIA',
        sellerRating: 4.8,
        sellerReviews: 12500,
        isVerifiedSeller: true,
        marketplace: { id: 'newegg', name: 'Newegg', color: '#F7531D' }
    },
    {
        id: 'electronics-2',
        title: 'LG UltraGear 27" 4K 144Hz Gaming Monitor',
        description: '1ms response time with HDMI 2.1 for next-gen consoles.',
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600',
        currentPrice: 549,
        originalPrice: 799,
        discount: 250,
        discountPercent: 31,
        category: 'Electronics',
        brand: 'LG',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 92,
        aiVerdict: 'Lowest price ever seen',
        pricePrediction: 'rising',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'LG Electronics',
        sellerRating: 4.6,
        sellerReviews: 7800,
        isVerifiedSeller: true,
        marketplace: { id: 'bestbuy', name: 'Best Buy', color: '#0046BE' }
    },
    {
        id: 'electronics-3',
        title: 'DJI Mini 4 Pro Drone with RC Controller',
        description: 'Compact drone with 4K/60fps video and 48MP photos.',
        imageUrl: 'https://images.unsplash.com/photo-1507582020474-9a35b7d455d9?w=600',
        currentPrice: 659,
        originalPrice: 799,
        discount: 140,
        discountPercent: 18,
        category: 'Electronics',
        brand: 'DJI',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 85,
        aiVerdict: 'Great entry-point for 4K drones',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'DJI Store',
        sellerRating: 4.7,
        sellerReviews: 5400,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'electronics-4',
        title: 'Samsung 990 Pro 2TB NVMe SSD',
        description: 'Blazing fast PCIe 4.0 SSD for gaming and content creation.',
        imageUrl: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600',
        currentPrice: 149,
        originalPrice: 239,
        discount: 90,
        discountPercent: 38,
        category: 'Electronics',
        brand: 'Samsung',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 94,
        aiVerdict: 'Exceptional SSD value',
        pricePrediction: 'falling',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Samsung',
        sellerRating: 4.9,
        sellerReviews: 18200,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'electronics-5',
        title: 'Logitech G Pro X Superlight 2 Wireless Gaming Mouse',
        description: 'Ultra-lightweight 60g design with HERO 2 sensor.',
        imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600',
        currentPrice: 139,
        originalPrice: 159,
        discount: 20,
        discountPercent: 13,
        category: 'Electronics',
        brand: 'Logitech',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 81,
        aiVerdict: 'Good pro mouse deal',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Logitech',
        sellerRating: 4.7,
        sellerReviews: 9200,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SMART HOME
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const smartHome: ShowcaseDeal[] = [
    {
        id: 'smarthome-1',
        title: 'Apple HomePod 2nd Generation',
        description: 'Room-filling sound with spatial audio and Siri.',
        imageUrl: 'https://images.unsplash.com/photo-1558089687-f282ffcbc126?w=600',
        currentPrice: 249,
        originalPrice: 299,
        discount: 50,
        discountPercent: 17,
        category: 'Smart Home',
        brand: 'Apple',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 84,
        aiVerdict: 'Good HomePod discount',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Apple',
        sellerRating: 4.8,
        sellerReviews: 8700,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'smarthome-2',
        title: 'Google Nest Hub Max 10" Smart Display',
        description: 'Large smart display with camera for video calls.',
        imageUrl: 'https://images.unsplash.com/photo-1543512214-318c7553f230?w=600',
        currentPrice: 179,
        originalPrice: 229,
        discount: 50,
        discountPercent: 22,
        category: 'Smart Home',
        brand: 'Google',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 86,
        aiVerdict: 'Great smart display value',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Google',
        sellerRating: 4.6,
        sellerReviews: 12300,
        isVerifiedSeller: true,
        marketplace: { id: 'google', name: 'Google', color: '#4285F4' }
    },
    {
        id: 'smarthome-3',
        title: 'Ring Video Doorbell Pro 2 + Chime Bundle',
        description: '3D motion detection with Head to Toe HD+ video.',
        imageUrl: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600',
        currentPrice: 199,
        originalPrice: 279,
        discount: 80,
        discountPercent: 29,
        category: 'Smart Home',
        brand: 'Ring',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 88,
        aiVerdict: 'Great security bundle',
        pricePrediction: 'stable',
        isHot: true,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Amazon',
        sellerRating: 4.5,
        sellerReviews: 28000,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// WEARABLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const wearables: ShowcaseDeal[] = [
    {
        id: 'wearable-1',
        title: 'Apple Watch Series 9 45mm GPS',
        description: 'Brightest display ever with S9 chip and double tap.',
        imageUrl: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
        currentPrice: 349,
        originalPrice: 429,
        discount: 80,
        discountPercent: 19,
        category: 'Wearables',
        brand: 'Apple',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 87,
        aiVerdict: 'Good Series 9 discount',
        pricePrediction: 'falling',
        isHot: false,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'Apple',
        sellerRating: 4.9,
        sellerReviews: 34000,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'wearable-2',
        title: 'Samsung Galaxy Watch 6 Classic 47mm',
        description: 'Rotating bezel with comprehensive health tracking.',
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        currentPrice: 299,
        originalPrice: 429,
        discount: 130,
        discountPercent: 30,
        category: 'Wearables',
        brand: 'Samsung',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 91,
        aiVerdict: 'Best Galaxy Watch price',
        pricePrediction: 'stable',
        isHot: true,
        isFeatured: true,
        isAllTimeLow: true,
        sellerName: 'Samsung',
        sellerRating: 4.7,
        sellerReviews: 16500,
        isVerifiedSeller: true,
        marketplace: { id: 'samsung', name: 'Samsung', color: '#1428A0' }
    },
    {
        id: 'wearable-3',
        title: 'Oura Ring Gen 3 Heritage - Size 10',
        description: 'Premium health ring with sleep and activity tracking.',
        imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600',
        currentPrice: 249,
        originalPrice: 299,
        discount: 50,
        discountPercent: 17,
        category: 'Wearables',
        brand: 'Oura',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 83,
        aiVerdict: 'Good Oura entry price',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Oura',
        sellerRating: 4.4,
        sellerReviews: 4500,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CAMERAS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const cameras: ShowcaseDeal[] = [
    {
        id: 'camera-1',
        title: 'Sony Alpha A7 IV Full-Frame Mirrorless Camera',
        description: '33MP sensor with 759 phase-detection AF points.',
        imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600',
        currentPrice: 2198,
        originalPrice: 2499,
        discount: 301,
        discountPercent: 12,
        category: 'Cameras',
        brand: 'Sony',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 85,
        aiVerdict: 'Good A7 IV price',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: true,
        isAllTimeLow: false,
        sellerName: 'Sony',
        sellerRating: 4.8,
        sellerReviews: 6800,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    },
    {
        id: 'camera-2',
        title: 'Canon EOS R6 Mark II Body Only',
        description: '24.2MP full-frame sensor with 40fps continuous shooting.',
        imageUrl: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=600',
        currentPrice: 2299,
        originalPrice: 2499,
        discount: 200,
        discountPercent: 8,
        category: 'Cameras',
        brand: 'Canon',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 81,
        aiVerdict: 'Fair Canon discount',
        pricePrediction: 'stable',
        isHot: false,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'Canon',
        sellerRating: 4.8,
        sellerReviews: 5200,
        isVerifiedSeller: true,
        marketplace: { id: 'bhphoto', name: 'B&H Photo', color: '#0066CC' }
    },
    {
        id: 'camera-3',
        title: 'GoPro HERO12 Black + Handler Bundle',
        description: '5.3K video with HyperSmooth 6.0 stabilization.',
        imageUrl: 'https://images.unsplash.com/photo-1564466809058-bf4114d55352?w=600',
        currentPrice: 349,
        originalPrice: 449,
        discount: 100,
        discountPercent: 22,
        category: 'Cameras',
        brand: 'GoPro',
        condition: 'new',
        conditionLabel: 'Brand New',
        dealScore: 88,
        aiVerdict: 'Great action cam bundle',
        pricePrediction: 'stable',
        isHot: true,
        isFeatured: false,
        isAllTimeLow: false,
        sellerName: 'GoPro',
        sellerRating: 4.6,
        sellerReviews: 18900,
        isVerifiedSeller: true,
        marketplace: { id: 'amazon', name: 'Amazon', color: '#FF9900' }
    }
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMBINED EXPORTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// All 50+ showcase deals combined
export const showcaseDeals: ShowcaseDeal[] = [
    ...laptops,
    ...phones,
    ...tvs,
    ...gaming,
    ...audio,
    ...electronics,
    ...smartHome,
    ...wearables,
    ...cameras
];

// Curated collections
export const collections = [
    {
        id: 'prime-picks',
        name: 'Prime Picks',
        description: 'Editor-curated deals with the highest savings',
        icon: '🏆',
        deals: showcaseDeals.filter(d => d.dealScore >= 90)
    },
    {
        id: 'all-time-lows',
        name: 'All-Time Lows',
        description: 'Prices at their lowest point ever',
        icon: '📉',
        deals: showcaseDeals.filter(d => d.isAllTimeLow)
    },
    {
        id: 'hot-today',
        name: 'Hot Today',
        description: 'Trending deals with high engagement',
        icon: '🔥',
        deals: showcaseDeals.filter(d => d.isHot)
    },
    {
        id: 'price-dropping',
        name: 'Price Dropping',
        description: 'Items with falling price predictions',
        icon: '⬇️',
        deals: showcaseDeals.filter(d => d.pricePrediction === 'falling')
    },
    {
        id: 'buy-now',
        name: 'Buy Now',
        description: 'Prices expected to rise soon',
        icon: '⚡',
        deals: showcaseDeals.filter(d => d.pricePrediction === 'rising')
    }
];

// Deal categories with curated items
export const dealCategories = [
    { name: 'Laptops', icon: '💻', count: laptops.length, trending: true },
    { name: 'Phones', icon: '📱', count: phones.length, trending: true },
    { name: 'TVs', icon: '📺', count: tvs.length, trending: false },
    { name: 'Gaming', icon: '🎮', count: gaming.length, trending: true },
    { name: 'Audio', icon: '🎧', count: audio.length, trending: false },
    { name: 'Electronics', icon: '🔌', count: electronics.length, trending: true },
    { name: 'Smart Home', icon: '🏠', count: smartHome.length, trending: true },
    { name: 'Wearables', icon: '⌚', count: wearables.length, trending: false },
    { name: 'Cameras', icon: '📷', count: cameras.length, trending: false }
];

// Get deals by category
export function getDealsByCategory(category: string): ShowcaseDeal[] {
    return showcaseDeals.filter(d => d.category.toLowerCase() === category.toLowerCase());
}

// Get featured deals (for Deal of the Day rotation)
export function getFeaturedDeals(): ShowcaseDeal[] {
    return showcaseDeals.filter(d => d.isFeatured).slice(0, 5);
}

// Get deals with price predictions
export function getDealsWithPredictions(): ShowcaseDeal[] {
    return showcaseDeals.filter(d => d.pricePrediction);
}
