// Tadow Seed Data - Demo Listings, Users, and Reviews
// Populates the marketplace with realistic content

import { Listing, Review, VerifiedUser } from '../types/marketplace';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO USERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DEMO_USERS: VerifiedUser[] = [
    {
        id: 'user_sarah',
        email: 'sarah.chen@example.com',
        displayName: 'Sarah Chen',
        verificationLevel: 'trusted_seller',
        trustScore: 98,
        transactionCount: 246,
        memberSince: new Date('2024-01-15'),
        lastActive: new Date('2026-01-20'),
        location: { city: 'San Francisco', state: 'CA', country: 'US' },
        badges: ['verified_id', 'top_rated', 'fast_shipper', 'power_seller'],
        stats: { totalSales: 234, totalPurchases: 12, averageRating: 4.9, responseRate: 99, responseTime: 15, completionRate: 100 },
    },
    {
        id: 'user_mike',
        email: 'mike.johnson@example.com',
        displayName: 'Mike Johnson',
        verificationLevel: 'id_verified',
        trustScore: 85,
        transactionCount: 53,
        memberSince: new Date('2024-06-20'),
        lastActive: new Date('2026-01-19'),
        location: { city: 'Austin', state: 'TX', country: 'US' },
        badges: ['verified_id', 'responsive'],
        stats: { totalSales: 45, totalPurchases: 8, averageRating: 4.7, responseRate: 95, responseTime: 30, completionRate: 98 },
    },
    {
        id: 'user_emma',
        email: 'emma.wilson@example.com',
        displayName: 'Emma Wilson',
        verificationLevel: 'id_verified',
        trustScore: 92,
        transactionCount: 179,
        memberSince: new Date('2024-03-10'),
        lastActive: new Date('2026-01-20'),
        location: { city: 'New York', state: 'NY', country: 'US' },
        badges: ['verified_id', 'top_rated', 'fast_shipper'],
        stats: { totalSales: 156, totalPurchases: 23, averageRating: 4.8, responseRate: 97, responseTime: 20, completionRate: 99 },
    },
    {
        id: 'user_james',
        email: 'james.tech@example.com',
        displayName: 'James Tech',
        verificationLevel: 'phone',
        trustScore: 72,
        transactionCount: 23,
        memberSince: new Date('2024-09-01'),
        lastActive: new Date('2026-01-18'),
        location: { city: 'Seattle', state: 'WA', country: 'US' },
        badges: ['responsive', 'local_meetup'],
        stats: { totalSales: 18, totalPurchases: 5, averageRating: 4.5, responseRate: 88, responseTime: 45, completionRate: 94 },
    },
    {
        id: 'user_lisa',
        email: 'lisa.gamer@example.com',
        displayName: 'Lisa Gaming',
        verificationLevel: 'trusted_seller',
        trustScore: 95,
        transactionCount: 357,
        memberSince: new Date('2023-11-05'),
        lastActive: new Date('2026-01-20'),
        location: { city: 'Los Angeles', state: 'CA', country: 'US' },
        badges: ['verified_id', 'top_rated', 'power_seller'],
        stats: { totalSales: 312, totalPurchases: 45, averageRating: 4.9, responseRate: 98, responseTime: 10, completionRate: 100 },
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO LISTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DEMO_LISTINGS: Listing[] = [
    {
        id: 'listing_1',
        sellerId: 'user_sarah',
        title: 'MacBook Pro 14" M3 Pro - Like New',
        description: 'Barely used MacBook Pro 14" with M3 Pro chip. Includes original box, charger, and AppleCare+ until 2026.',
        category: 'Computers & Laptops',
        condition: 'like_new',
        price: 1899,
        originalPrice: 2499,
        pricingType: 'negotiable',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=600', 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600'],
        shipping: { type: 'both', cost: 0 },
        status: 'active',
        views: 342,
        saves: 28,
        aiVerification: { approved: true, score: 95, flags: [], suggestions: [] },
        createdAt: new Date('2026-01-18'),
        updatedAt: new Date('2026-01-18'),
    },
    {
        id: 'listing_2',
        sellerId: 'user_mike',
        title: 'Sony WH-1000XM5 Headphones',
        description: 'Sony WH-1000XM5 wireless noise-canceling headphones. Black, excellent condition. Includes case and cable.',
        category: 'Audio & Headphones',
        condition: 'excellent',
        price: 249,
        originalPrice: 399,
        pricingType: 'fixed',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600'],
        shipping: { type: 'ship', cost: 8 },
        status: 'active',
        views: 156,
        saves: 12,
        aiVerification: { approved: true, score: 88, flags: [] },
        createdAt: new Date('2026-01-17'),
        updatedAt: new Date('2026-01-17'),
    },
    {
        id: 'listing_3',
        sellerId: 'user_emma',
        title: 'iPhone 15 Pro Max 256GB - Titanium',
        description: 'iPhone 15 Pro Max in Natural Titanium. Unlocked, works with all carriers. Battery health 98%.',
        category: 'Electronics',
        condition: 'like_new',
        price: 899,
        originalPrice: 1199,
        pricingType: 'negotiable',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=600'],
        shipping: { type: 'both', cost: 12 },
        status: 'active',
        views: 523,
        saves: 45,
        aiVerification: { approved: true, score: 92, flags: [] },
        createdAt: new Date('2026-01-19'),
        updatedAt: new Date('2026-01-19'),
    },
    {
        id: 'listing_4',
        sellerId: 'user_lisa',
        title: 'PS5 Slim + 5 Games Bundle',
        description: 'PlayStation 5 Slim disc edition with 5 top games: Spider-Man 2, God of War, Horizon, GT7, R&C.',
        category: 'Gaming',
        condition: 'excellent',
        price: 449,
        originalPrice: 650,
        pricingType: 'negotiable',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600'],
        shipping: { type: 'local_only' },
        status: 'active',
        views: 289,
        saves: 34,
        aiVerification: { approved: true, score: 90, flags: [] },
        createdAt: new Date('2026-01-16'),
        updatedAt: new Date('2026-01-16'),
    },
    {
        id: 'listing_5',
        sellerId: 'user_james',
        title: 'Herman Miller Aeron Chair',
        description: 'Size B Herman Miller Aeron chair. Fully loaded with PostureFit SL. Some wear on armrests.',
        category: 'Other',
        condition: 'good',
        price: 650,
        originalPrice: 1395,
        pricingType: 'negotiable',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600'],
        shipping: { type: 'local_only' },
        status: 'active',
        views: 178,
        saves: 22,
        aiVerification: { approved: true, score: 85, flags: ['Condition matches description'] },
        createdAt: new Date('2026-01-15'),
        updatedAt: new Date('2026-01-15'),
    },
    {
        id: 'listing_6',
        sellerId: 'user_sarah',
        title: 'Apple Watch Ultra 2 - Ti Band',
        description: 'Apple Watch Ultra 2 with extra bands. Perfect for outdoor activities. Includes charger and box.',
        category: 'Wearables',
        condition: 'like_new',
        price: 649,
        originalPrice: 799,
        pricingType: 'fixed',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600'],
        shipping: { type: 'ship', cost: 0 },
        status: 'active',
        views: 234,
        saves: 19,
        aiVerification: { approved: true, score: 94, flags: [] },
        createdAt: new Date('2026-01-20'),
        updatedAt: new Date('2026-01-20'),
    },
    {
        id: 'listing_7',
        sellerId: 'user_emma',
        title: 'LG C3 65" OLED TV',
        description: '65-inch LG C3 OLED TV, 2023 model. Perfect for gaming and movies. Wall mounted.',
        category: 'Electronics',
        condition: 'excellent',
        price: 1199,
        originalPrice: 1799,
        pricingType: 'negotiable',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600'],
        shipping: { type: 'local_only' },
        status: 'active',
        views: 445,
        saves: 38,
        aiVerification: { approved: true, score: 89, flags: [] },
        createdAt: new Date('2026-01-14'),
        updatedAt: new Date('2026-01-14'),
    },
    {
        id: 'listing_8',
        sellerId: 'user_lisa',
        title: 'Nintendo Switch OLED + Games',
        description: 'White Nintendo Switch OLED with Zelda TotK, Mario Kart 8, and Animal Crossing. Pro Controller.',
        category: 'Gaming',
        condition: 'like_new',
        price: 329,
        originalPrice: 450,
        pricingType: 'fixed',
        quantity: 1,
        images: ['https://images.unsplash.com/photo-1617096200347-cb04ae810b1d?w=600'],
        shipping: { type: 'both', cost: 10 },
        status: 'active',
        views: 312,
        saves: 41,
        aiVerification: { approved: true, score: 93, flags: [] },
        createdAt: new Date('2026-01-19'),
        updatedAt: new Date('2026-01-19'),
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO REVIEWS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const DEMO_REVIEWS: Review[] = [
    {
        id: 'review_1',
        orderId: 'order_demo_1',
        reviewerId: 'user_mike',
        revieweeId: 'user_sarah',
        type: 'buyer_to_seller',
        rating: 5,
        title: 'Amazing seller!',
        comment: 'Sarah shipped the MacBook within hours and it arrived in perfect condition. Exactly as described!',
        helpful: 24,
        reported: false,
        aiSentiment: { score: 0.95, authenticity: 98, flags: [] },
        createdAt: new Date('2026-01-10'),
    },
    {
        id: 'review_2',
        orderId: 'order_demo_2',
        reviewerId: 'user_emma',
        revieweeId: 'user_sarah',
        type: 'buyer_to_seller',
        rating: 5,
        title: 'Fast shipping, great communication',
        comment: 'Excellent transaction. Sarah answered all my questions quickly. Highly recommend!',
        helpful: 18,
        reported: false,
        aspects: { accuracy: 5, communication: 5, shipping: 5 },
        aiSentiment: { score: 0.92, authenticity: 96, flags: [] },
        createdAt: new Date('2026-01-08'),
    },
    {
        id: 'review_3',
        orderId: 'order_demo_3',
        reviewerId: 'user_james',
        revieweeId: 'user_lisa',
        type: 'buyer_to_seller',
        rating: 4,
        title: 'Good deal, minor delay',
        comment: 'Great price on the PS5 bundle. Took a day longer than expected to ship but everything works.',
        helpful: 8,
        reported: false,
        aspects: { accuracy: 5, communication: 4, shipping: 3 },
        aiSentiment: { score: 0.7, authenticity: 94, flags: [] },
        createdAt: new Date('2026-01-12'),
    },
];

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const SEED_INITIALIZED_KEY = 'tadow_seed_initialized';

export function initializeSeedData(): boolean {
    if (localStorage.getItem(SEED_INITIALIZED_KEY)) {
        return false;
    }

    const existingUsers = JSON.parse(localStorage.getItem('tadow_users') || '[]');
    const mergedUsers = [...existingUsers, ...DEMO_USERS.filter(u => !existingUsers.find((e: VerifiedUser) => e.id === u.id))];
    localStorage.setItem('tadow_users', JSON.stringify(mergedUsers));

    const existingListings = JSON.parse(localStorage.getItem('tadow_listings') || '[]');
    const mergedListings = [...existingListings, ...DEMO_LISTINGS.filter(l => !existingListings.find((e: Listing) => e.id === l.id))];
    localStorage.setItem('tadow_listings', JSON.stringify(mergedListings));

    const existingReviews = JSON.parse(localStorage.getItem('tadow_reviews') || '[]');
    const mergedReviews = [...existingReviews, ...DEMO_REVIEWS.filter(r => !existingReviews.find((e: Review) => e.id === r.id))];
    localStorage.setItem('tadow_reviews', JSON.stringify(mergedReviews));

    localStorage.setItem(SEED_INITIALIZED_KEY, 'true');

    console.log('🌱 Tadow seed data initialized:', {
        users: DEMO_USERS.length,
        listings: DEMO_LISTINGS.length,
        reviews: DEMO_REVIEWS.length,
    });

    return true;
}

export function resetSeedData(): void {
    localStorage.removeItem(SEED_INITIALIZED_KEY);
    localStorage.removeItem('tadow_users');
    localStorage.removeItem('tadow_listings');
    localStorage.removeItem('tadow_reviews');
    initializeSeedData();
}
