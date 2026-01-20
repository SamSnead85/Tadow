import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Marketplace configurations
const marketplaces = [
    { name: 'Amazon', type: 'retail', baseUrl: 'https://amazon.com', color: '#FF9900' },
    { name: 'eBay', type: 'auction', baseUrl: 'https://ebay.com', color: '#E53238' },
    { name: 'Craigslist', type: 'classifieds', baseUrl: 'https://craigslist.org', color: '#5A2D82' },
    { name: 'Facebook Marketplace', type: 'p2p', baseUrl: 'https://facebook.com/marketplace', color: '#1877F2' },
    { name: 'Walmart', type: 'retail', baseUrl: 'https://walmart.com', color: '#0071CE' },
    { name: 'Best Buy', type: 'retail', baseUrl: 'https://bestbuy.com', color: '#0046BE' },
    { name: 'Swappa', type: 'p2p', baseUrl: 'https://swappa.com', color: '#00B67A' },
];

// Categories
const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '💻' },
    { name: 'Laptops', slug: 'laptops', icon: '💻' },
    { name: 'Phones', slug: 'phones', icon: '📱' },
    { name: 'TVs', slug: 'tvs', icon: '📺' },
    { name: 'Gaming', slug: 'gaming', icon: '🎮' },
    { name: 'Home & Garden', slug: 'home-garden', icon: '🏠' },
    { name: 'Furniture', slug: 'furniture', icon: '🛋️' },
    { name: 'Fashion', slug: 'fashion', icon: '👕' },
    { name: 'Automotive', slug: 'automotive', icon: '🚗' },
    { name: 'Sports', slug: 'sports', icon: '⚽' },
];

// Deal templates with AI scoring
const dealTemplates = [
    // === HOT DEALS (Featured) ===
    {
        title: 'Apple MacBook Pro 14" M3 Pro - Factory Sealed',
        description: 'Brand new, never opened. M3 Pro chip, 18GB RAM, 512GB SSD. Space Black.',
        originalPrice: 1999,
        currentPrice: 1649,
        category: 'Laptops',
        brand: 'Apple',
        condition: 'new',
        marketplace: 'eBay',
        dealScore: 92,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -18,
        isHot: true,
        isFeatured: true,
        sellerRating: 4.9,
        sellerReviews: 2341,
        isVerifiedSeller: true,
        // New AI Intelligence fields
        isAllTimeLow: true,
        allTimeLowPrice: 1649,
        historicHighPrice: 2199,
        pricePrediction: 'buy_now',
        priceDropPercent30d: 15,
        fakeReviewRisk: 8,
        reviewQualityScore: 94,
        verifiedPurchasePercent: 87,
    },
    {
        title: 'Sony 65" A95L QD-OLED 4K TV - Open Box',
        description: 'Store return, perfect condition. Full warranty. Best TV of 2024.',
        originalPrice: 2798,
        currentPrice: 1899,
        category: 'TVs',
        brand: 'Sony',
        condition: 'like-new',
        marketplace: 'Best Buy',
        dealScore: 95,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -32,
        isHot: true,
        isFeatured: true,
        sellerRating: 4.8,
        isVerifiedSeller: true,
        // AI Intelligence
        isAllTimeLow: true,
        allTimeLowPrice: 1899,
        historicHighPrice: 2998,
        pricePrediction: 'buy_now',
        priceDropPercent30d: 22,
        fakeReviewRisk: 5,
        reviewQualityScore: 96,
        verifiedPurchasePercent: 92,
    },
    {
        title: 'PS5 Slim + 2 Controllers + 3 Games Bundle',
        description: 'Console barely used. Includes Spider-Man 2, God of War, and Horizon.',
        originalPrice: 650,
        currentPrice: 385,
        category: 'Gaming',
        brand: 'Sony',
        condition: 'like-new',
        marketplace: 'Facebook Marketplace',
        city: 'Tampa',
        state: 'FL',
        dealScore: 89,
        aiVerdict: 'Great Value',
        priceVsAverage: -25,
        isHot: true,
        sellerRating: 5.0,
        // AI Intelligence
        pricePrediction: 'buy_now',
        fakeReviewRisk: 12,
        reviewQualityScore: 85,
    },

    // === ELECTRONICS ===
    {
        title: 'Dell XPS 15 (2024) - i9/32GB/1TB RTX 4060',
        description: 'Selling my work laptop. Excellent condition, original box and charger included.',
        originalPrice: 2499,
        currentPrice: 1750,
        category: 'Laptops',
        brand: 'Dell',
        condition: 'used',
        marketplace: 'Craigslist',
        city: 'Austin',
        state: 'TX',
        dealScore: 85,
        aiVerdict: 'Great Value',
        priceVsAverage: -22,
        sellerRating: null,
    },
    {
        title: 'iPhone 15 Pro Max 256GB Natural Titanium',
        description: 'Unlocked, AppleCare+ until 2026. Mint condition, no scratches.',
        originalPrice: 1199,
        currentPrice: 899,
        category: 'Phones',
        brand: 'Apple',
        condition: 'like-new',
        marketplace: 'Swappa',
        dealScore: 88,
        aiVerdict: 'Great Value',
        priceVsAverage: -15,
        sellerRating: 4.9,
        sellerReviews: 156,
        isVerifiedSeller: true,
    },
    {
        title: 'Samsung Galaxy S24 Ultra 512GB - Factory Refurbished',
        description: 'Samsung Certified Renewed. 1 year warranty. S Pen included.',
        originalPrice: 1419,
        currentPrice: 949,
        category: 'Phones',
        brand: 'Samsung',
        condition: 'refurbished',
        marketplace: 'Amazon',
        dealScore: 82,
        aiVerdict: 'Great Value',
        priceVsAverage: -20,
        sellerRating: 4.6,
        sellerReviews: 892,
        isVerifiedSeller: true,
    },
    {
        title: 'LG C4 55" OLED 4K Smart TV',
        description: 'New in box. 2024 model with gaming features.',
        originalPrice: 1499,
        currentPrice: 1196,
        category: 'TVs',
        brand: 'LG',
        condition: 'new',
        marketplace: 'Walmart',
        dealScore: 78,
        aiVerdict: 'Fair Price',
        priceVsAverage: -8,
        sellerRating: 4.7,
        isVerifiedSeller: true,
    },
    {
        title: 'AirPods Pro 2 USB-C - Sealed Box',
        description: 'Brand new, sealed. Will ship same day.',
        originalPrice: 249,
        currentPrice: 189,
        category: 'Electronics',
        brand: 'Apple',
        condition: 'new',
        marketplace: 'eBay',
        dealScore: 86,
        aiVerdict: 'Great Value',
        priceVsAverage: -12,
        sellerRating: 4.8,
        sellerReviews: 3421,
        isVerifiedSeller: true,
    },
    {
        title: 'Nintendo Switch OLED White + Games',
        description: 'Includes Zelda TOTK, Mario Kart 8, and carrying case. Barely used.',
        originalPrice: 450,
        currentPrice: 299,
        category: 'Gaming',
        brand: 'Nintendo',
        condition: 'like-new',
        marketplace: 'Facebook Marketplace',
        city: 'Miami',
        state: 'FL',
        dealScore: 91,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -28,
        isHot: true,
        sellerRating: 4.5,
    },
    {
        title: 'Bose QuietComfort Ultra Headphones',
        description: 'Factory sealed. Black color.',
        originalPrice: 429,
        currentPrice: 329,
        category: 'Electronics',
        brand: 'Bose',
        condition: 'new',
        marketplace: 'Amazon',
        dealScore: 80,
        aiVerdict: 'Great Value',
        priceVsAverage: -10,
        sellerRating: 4.7,
        sellerReviews: 12847,
        isVerifiedSeller: true,
    },

    // === HOME & GARDEN ===
    {
        title: 'Herman Miller Aeron Chair - Size B',
        description: 'Refurbished by authorized dealer. 12 year warranty. Fully loaded.',
        originalPrice: 1895,
        currentPrice: 795,
        category: 'Furniture',
        brand: 'Herman Miller',
        condition: 'refurbished',
        marketplace: 'eBay',
        dealScore: 93,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -35,
        isHot: true,
        isFeatured: true,
        sellerRating: 4.9,
        sellerReviews: 5621,
        isVerifiedSeller: true,
    },
    {
        title: 'Dyson V15 Detect Cordless Vacuum',
        description: 'Barely used, all attachments included. Moving sale.',
        originalPrice: 749,
        currentPrice: 425,
        category: 'Home & Garden',
        brand: 'Dyson',
        condition: 'like-new',
        marketplace: 'Facebook Marketplace',
        city: 'San Francisco',
        state: 'CA',
        dealScore: 88,
        aiVerdict: 'Great Value',
        priceVsAverage: -30,
        sellerRating: 5.0,
    },
    {
        title: 'West Elm Andes Sofa - Dove Gray',
        description: '3-seater, excellent condition. Pet-free home.',
        originalPrice: 2199,
        currentPrice: 850,
        category: 'Furniture',
        brand: 'West Elm',
        condition: 'used',
        marketplace: 'Craigslist',
        city: 'Brooklyn',
        state: 'NY',
        dealScore: 85,
        aiVerdict: 'Great Value',
        priceVsAverage: -45,
        sellerRating: null,
    },
    {
        title: 'Roomba j7+ Self-Emptying Robot Vacuum',
        description: 'Factory renewed with 1 year warranty.',
        originalPrice: 799,
        currentPrice: 449,
        category: 'Home & Garden',
        brand: 'iRobot',
        condition: 'refurbished',
        marketplace: 'Amazon',
        dealScore: 81,
        aiVerdict: 'Great Value',
        priceVsAverage: -25,
        sellerRating: 4.5,
        sellerReviews: 2341,
        isVerifiedSeller: true,
    },

    // === GAMING ===
    {
        title: 'Xbox Series X Bundle + Game Pass Ultimate 12mo',
        description: 'Console + controller + 12 months GPU. New sealed.',
        originalPrice: 680,
        currentPrice: 499,
        category: 'Gaming',
        brand: 'Microsoft',
        condition: 'new',
        marketplace: 'Walmart',
        dealScore: 84,
        aiVerdict: 'Great Value',
        priceVsAverage: -15,
        sellerRating: 4.7,
        isVerifiedSeller: true,
    },
    {
        title: 'Steam Deck OLED 512GB - Like New',
        description: 'Played for a week, not for me. Comes with case and charger.',
        originalPrice: 549,
        currentPrice: 425,
        category: 'Gaming',
        brand: 'Valve',
        condition: 'like-new',
        marketplace: 'Swappa',
        dealScore: 87,
        aiVerdict: 'Great Value',
        priceVsAverage: -18,
        sellerRating: 4.8,
        sellerReviews: 89,
        isVerifiedSeller: true,
    },
    {
        title: 'NVIDIA RTX 4080 Super Founders Edition',
        description: 'Used for 3 months. Original box, receipt. Upgrading to 5000 series.',
        originalPrice: 999,
        currentPrice: 749,
        category: 'Electronics',
        brand: 'NVIDIA',
        condition: 'used',
        marketplace: 'eBay',
        dealScore: 83,
        aiVerdict: 'Great Value',
        priceVsAverage: -16,
        sellerRating: 4.9,
        sellerReviews: 412,
        isVerifiedSeller: true,
    },

    // === FASHION ===
    {
        title: 'Canada Goose Expedition Parka - Men\'s XL',
        description: 'Authentic, purchased from Nordstrom. Worn twice.',
        originalPrice: 1495,
        currentPrice: 650,
        category: 'Fashion',
        brand: 'Canada Goose',
        condition: 'like-new',
        marketplace: 'eBay',
        dealScore: 90,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -42,
        isHot: true,
        sellerRating: 4.7,
        sellerReviews: 234,
    },

    // === AUTOMOTIVE ===
    {
        title: 'Michelin Pilot Sport 4S Tires (Set of 4) 255/35R19',
        description: 'New in box. Wrong size for my car.',
        originalPrice: 1200,
        currentPrice: 850,
        category: 'Automotive',
        brand: 'Michelin',
        condition: 'new',
        marketplace: 'Facebook Marketplace',
        city: 'Chicago',
        state: 'IL',
        dealScore: 79,
        aiVerdict: 'Fair Price',
        priceVsAverage: -15,
        sellerRating: 4.5,
    },

    // === MORE LAPTOPS ===
    {
        title: 'ASUS ROG Zephyrus G14 (2024) Ryzen 9/RTX 4070',
        description: 'Gaming laptop in white. 6 months old, warranty active.',
        originalPrice: 1899,
        currentPrice: 1399,
        category: 'Laptops',
        brand: 'ASUS',
        condition: 'like-new',
        marketplace: 'Swappa',
        dealScore: 87,
        aiVerdict: 'Great Value',
        priceVsAverage: -20,
        sellerRating: 4.8,
        sellerReviews: 67,
        isVerifiedSeller: true,
    },
    {
        title: 'ThinkPad X1 Carbon Gen 11 - Enterprise Surplus',
        description: 'IT refresh sale. i7/32GB/512GB. Windows 11 Pro. Like new.',
        originalPrice: 2149,
        currentPrice: 899,
        category: 'Laptops',
        brand: 'Lenovo',
        condition: 'refurbished',
        marketplace: 'eBay',
        dealScore: 94,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -52,
        isHot: true,
        isFeatured: true,
        sellerRating: 4.9,
        sellerReviews: 8923,
        isVerifiedSeller: true,
    },
    {
        title: 'Framework Laptop 16 - DIY Edition',
        description: 'Barebones kit. Ryzen 9 mainboard included. Build your own.',
        originalPrice: 1299,
        currentPrice: 1149,
        category: 'Laptops',
        brand: 'Framework',
        condition: 'new',
        marketplace: 'Amazon',
        dealScore: 75,
        aiVerdict: 'Fair Price',
        priceVsAverage: -5,
        sellerRating: 4.6,
        sellerReviews: 341,
        isVerifiedSeller: true,
    },

    // === LOCAL DEALS ===
    {
        title: 'Standing Desk Electric 60x30 - White',
        description: 'Moving, must sell this weekend. Works perfectly.',
        originalPrice: 599,
        currentPrice: 150,
        category: 'Furniture',
        brand: 'Uplift',
        condition: 'used',
        marketplace: 'Craigslist',
        city: 'Denver',
        state: 'CO',
        dealScore: 96,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -70,
        isHot: true,
        sellerRating: null,
    },
    {
        title: 'Peloton Bike+ with Accessories',
        description: 'Includes mat, weights, shoes (size 10). Low miles.',
        originalPrice: 2495,
        currentPrice: 850,
        category: 'Sports',
        brand: 'Peloton',
        condition: 'used',
        marketplace: 'Facebook Marketplace',
        city: 'Los Angeles',
        state: 'CA',
        dealScore: 91,
        aiVerdict: 'Incredible Deal',
        priceVsAverage: -55,
        isHot: true,
        sellerRating: 5.0,
    },
];

// Image URLs for deals
const getImageUrl = (category: string, brand: string) => {
    const images: Record<string, string> = {
        'Laptops-Apple': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600',
        'Laptops-Dell': 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600',
        'Laptops-ASUS': 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600',
        'Laptops-Lenovo': 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600',
        'Laptops-Framework': 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600',
        'TVs-Sony': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600',
        'TVs-LG': 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600',
        'Phones-Apple': 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600',
        'Phones-Samsung': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600',
        'Gaming-Sony': 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600',
        'Gaming-Nintendo': 'https://images.unsplash.com/photo-1585184394271-4c0a47dc59c9?w=600',
        'Gaming-Microsoft': 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=600',
        'Gaming-Valve': 'https://images.unsplash.com/photo-1640955014216-75201056c829?w=600',
        'Electronics-Apple': 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600',
        'Electronics-Bose': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        'Electronics-NVIDIA': 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=600',
        'Furniture-Herman Miller': 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600',
        'Furniture-West Elm': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600',
        'Furniture-Uplift': 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=600',
        'Home & Garden-Dyson': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600',
        'Home & Garden-iRobot': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        'Fashion-Canada Goose': 'https://images.unsplash.com/photo-1544923246-77307dd628b8?w=600',
        'Automotive-Michelin': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
        'Sports-Peloton': 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=600',
    };
    return images[`${category}-${brand}`] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600';
};

async function main() {
    console.log('🌱 Seeding Verity Deal Aggregator...\n');

    // Clear existing data
    await prisma.wishlistItem.deleteMany();
    await prisma.dealPriceHistory.deleteMany();
    await prisma.deal.deleteMany();
    await prisma.marketplace.deleteMany();
    await prisma.category.deleteMany();
    await prisma.price.deleteMany();
    await prisma.review.deleteMany();
    await prisma.product.deleteMany();
    await prisma.user.deleteMany();

    // Create marketplaces
    console.log('📦 Creating marketplaces...');
    const createdMarketplaces: Record<string, string> = {};
    for (const mp of marketplaces) {
        const created = await prisma.marketplace.create({ data: mp });
        createdMarketplaces[mp.name] = created.id;
        console.log(`  ✓ ${mp.name}`);
    }

    // Create categories
    console.log('\n📂 Creating categories...');
    for (const cat of categories) {
        await prisma.category.create({ data: cat });
        console.log(`  ✓ ${cat.name}`);
    }

    // Create deals
    console.log('\n🔥 Creating deals...');
    for (const deal of dealTemplates) {
        const marketplaceId = createdMarketplaces[deal.marketplace];
        if (!marketplaceId) continue;

        const discountPercent = deal.originalPrice
            ? Math.round((1 - deal.currentPrice / deal.originalPrice) * 100)
            : null;

        const createdDeal = await prisma.deal.create({
            data: {
                title: deal.title,
                description: deal.description,
                imageUrl: getImageUrl(deal.category, deal.brand || ''),
                originalPrice: deal.originalPrice,
                currentPrice: deal.currentPrice,
                discountPercent,
                marketplaceId,
                externalUrl: `https://example.com/deal/${Date.now()}`,
                city: deal.city || null,
                state: deal.state || null,
                condition: deal.condition,
                category: deal.category,
                brand: deal.brand,
                dealScore: deal.dealScore,
                aiVerdict: deal.aiVerdict,
                priceVsAverage: deal.priceVsAverage,
                isHot: deal.isHot || false,
                isFeatured: deal.isFeatured || false,
                sellerName: deal.sellerRating ? 'Verified Seller' : null,
                sellerRating: deal.sellerRating,
                sellerReviews: deal.sellerReviews || null,
                isVerifiedSeller: deal.isVerifiedSeller || false,
                postedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
                // AI Intelligence fields
                isAllTimeLow: (deal as any).isAllTimeLow || false,
                allTimeLowPrice: (deal as any).allTimeLowPrice || null,
                historicHighPrice: (deal as any).historicHighPrice || null,
                pricePrediction: (deal as any).pricePrediction || null,
                priceDropPercent30d: (deal as any).priceDropPercent30d || null,
                fakeReviewRisk: (deal as any).fakeReviewRisk || Math.floor(Math.random() * 30), // Default random 0-30
                reviewQualityScore: (deal as any).reviewQualityScore || Math.floor(70 + Math.random() * 25), // Default 70-95
                verifiedPurchasePercent: (deal as any).verifiedPurchasePercent || Math.floor(60 + Math.random() * 35), // Default 60-95
            },
        });

        // Generate price history for this deal
        const priceHistoryEntries = [];
        let historicPrice = deal.originalPrice || deal.currentPrice * 1.2;
        for (let i = 30; i >= 0; i -= 3) {
            const variance = (Math.random() - 0.5) * 0.1; // ±5% variance
            const dayPrice = i === 0 ? deal.currentPrice : historicPrice * (1 + variance - (30 - i) * 0.005);
            priceHistoryEntries.push({
                dealId: createdDeal.id,
                price: Math.round(dayPrice * 100) / 100,
                recordedAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
            });
        }
        await prisma.dealPriceHistory.createMany({ data: priceHistoryEntries });
        console.log(`  ✓ ${deal.title.substring(0, 50)}...`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`   - ${marketplaces.length} marketplaces`);
    console.log(`   - ${categories.length} categories`);
    console.log(`   - ${dealTemplates.length} deals`);
}

main()
    .catch((e) => {
        console.error('❌ Seed error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
