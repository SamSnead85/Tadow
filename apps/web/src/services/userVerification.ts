// Tadow AI User Verification Service
// Identity verification, trust scoring, and fraud detection

import { VerifiedUser, VerificationLevel, UserBadge, Listing, Review } from '../types/marketplace';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORAGE KEYS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const USERS_KEY = 'tadow_users';
const CURRENT_USER_KEY = 'tadow_current_user';
const LISTINGS_KEY = 'tadow_listings';
const REVIEWS_KEY = 'tadow_reviews';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getCurrentUser(): VerifiedUser | null {
    try {
        const data = localStorage.getItem(CURRENT_USER_KEY);
        return data ? JSON.parse(data) : null;
    } catch {
        return null;
    }
}

export function setCurrentUser(user: VerifiedUser): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));

    // Also save to users list
    const users = getAllUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
        users[index] = user;
    } else {
        users.push(user);
    }
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getAllUsers(): VerifiedUser[] {
    try {
        return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getUserById(id: string): VerifiedUser | null {
    return getAllUsers().find(u => u.id === id) || null;
}

export function createUser(email: string, displayName: string): VerifiedUser {
    const user: VerifiedUser = {
        id: `user-${Date.now()}`,
        email,
        displayName,
        verificationLevel: 'email',
        trustScore: 50,
        transactionCount: 0,
        memberSince: new Date(),
        lastActive: new Date(),
        badges: [],
        stats: {
            totalSales: 0,
            totalPurchases: 0,
            averageRating: 0,
            responseRate: 100,
            responseTime: 0,
            completionRate: 100,
        },
    };

    setCurrentUser(user);
    return user;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// VERIFICATION LEVELS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface VerificationRequirements {
    level: VerificationLevel;
    requirements: string[];
    benefits: string[];
    trustBonus: number;
}

export const VERIFICATION_LEVELS: VerificationRequirements[] = [
    {
        level: 'email',
        requirements: ['Confirm email address'],
        benefits: ['Create listings', 'Contact sellers'],
        trustBonus: 10,
    },
    {
        level: 'phone',
        requirements: ['Add phone number', 'Verify via SMS code'],
        benefits: ['Make offers', 'Faster support'],
        trustBonus: 15,
    },
    {
        level: 'id_verified',
        requirements: ['Upload government ID', 'Take live selfie', 'AI face matching'],
        benefits: ['Higher trust score', 'Verified badge', 'Higher limits'],
        trustBonus: 25,
    },
    {
        level: 'trusted_seller',
        requirements: ['Complete 10+ sales', 'Maintain 4.5+ rating', 'Zero disputes'],
        benefits: ['Power seller badge', 'Priority placement', 'Lower fees'],
        trustBonus: 25,
    },
];

export function getVerificationProgress(user: VerifiedUser): {
    currentLevel: VerificationLevel;
    nextLevel: VerificationLevel | null;
    progress: number;
} {
    const levels: VerificationLevel[] = ['none', 'email', 'phone', 'id_verified', 'trusted_seller'];
    const currentIndex = levels.indexOf(user.verificationLevel);

    return {
        currentLevel: user.verificationLevel,
        nextLevel: currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null,
        progress: ((currentIndex + 1) / levels.length) * 100,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRUST SCORE CALCULATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface TrustScoreBreakdown {
    overall: number;
    factors: {
        verification: number;      // 0-25 points
        transactionHistory: number; // 0-25 points
        reviews: number;           // 0-25 points
        behavior: number;          // 0-25 points
    };
    riskFlags: string[];
    recommendation: 'safe' | 'caution' | 'high_risk';
}

export function calculateTrustScore(user: VerifiedUser, reviews: Review[] = []): TrustScoreBreakdown {
    const factors = {
        verification: 0,
        transactionHistory: 0,
        reviews: 0,
        behavior: 0,
    };
    const riskFlags: string[] = [];

    // Verification score (0-25)
    const verificationPoints: Record<VerificationLevel, number> = {
        'none': 0,
        'email': 5,
        'phone': 12,
        'id_verified': 20,
        'trusted_seller': 25,
    };
    factors.verification = verificationPoints[user.verificationLevel];

    // Transaction history (0-25)
    const txCount = user.transactionCount;
    if (txCount >= 100) factors.transactionHistory = 25;
    else if (txCount >= 50) factors.transactionHistory = 20;
    else if (txCount >= 20) factors.transactionHistory = 15;
    else if (txCount >= 10) factors.transactionHistory = 10;
    else if (txCount >= 5) factors.transactionHistory = 5;
    else factors.transactionHistory = Math.min(txCount, 2);

    // New account flag
    const daysSinceJoin = Math.floor((Date.now() - new Date(user.memberSince).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceJoin < 7 && txCount === 0) {
        riskFlags.push('New account with no history');
    }

    // Review score (0-25)
    const userReviews = reviews.filter(r => r.revieweeId === user.id);
    if (userReviews.length > 0) {
        const avgRating = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
        factors.reviews = Math.round((avgRating / 5) * 25);

        // Check for negative reviews
        const negativeReviews = userReviews.filter(r => r.rating <= 2);
        if (negativeReviews.length >= 3) {
            riskFlags.push('Multiple negative reviews');
        }
    } else {
        factors.reviews = 10; // Neutral for new users
    }

    // Behavior score (0-25)
    factors.behavior = 15; // Base score

    if (user.stats.responseRate >= 90) factors.behavior += 5;
    if (user.stats.responseTime <= 60) factors.behavior += 3;
    if (user.stats.completionRate >= 95) factors.behavior += 2;

    factors.behavior = Math.min(factors.behavior, 25);

    // Calculate overall
    const overall = factors.verification + factors.transactionHistory + factors.reviews + factors.behavior;

    // Determine recommendation
    let recommendation: TrustScoreBreakdown['recommendation'] = 'safe';
    if (overall < 40 || riskFlags.length >= 2) {
        recommendation = 'high_risk';
    } else if (overall < 60 || riskFlags.length >= 1) {
        recommendation = 'caution';
    }

    return { overall, factors, riskFlags, recommendation };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// AI LISTING VERIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface ListingVerificationResult {
    overallScore: number;
    imageAuthenticity: number;
    priceReasonableness: number;
    descriptionQuality: number;
    flags: string[];
    approved: boolean;
    suggestions: string[];
}

export function verifyListing(listing: Partial<Listing>): ListingVerificationResult {
    const flags: string[] = [];
    const suggestions: string[] = [];
    let imageScore = 80;
    let priceScore = 80;
    let descriptionScore = 80;

    // Image checks
    if (!listing.images || listing.images.length === 0) {
        imageScore = 0;
        flags.push('No images provided');
        suggestions.push('Add at least 3 high-quality photos');
    } else if (listing.images.length < 3) {
        imageScore = 60;
        suggestions.push('Add more photos for better buyer confidence');
    }

    // Price checks
    if (listing.price !== undefined) {
        if (listing.price === 0 && listing.pricingType !== 'free') {
            priceScore = 40;
            flags.push('Price cannot be zero for non-free items');
        }
        if (listing.price > 10000) {
            suggestions.push('High-value items may require additional verification');
        }
        if (listing.originalRetailPrice && listing.price > listing.originalRetailPrice * 1.5) {
            priceScore = 50;
            flags.push('Price significantly above retail');
        }
    }

    // Description checks
    const descLength = listing.description?.length || 0;
    if (descLength < 50) {
        descriptionScore = 40;
        flags.push('Description too short');
        suggestions.push('Add more details about condition, features, and any defects');
    } else if (descLength < 150) {
        descriptionScore = 60;
        suggestions.push('Consider adding more details');
    }

    // Title checks
    if (!listing.title || listing.title.length < 10) {
        flags.push('Title too short');
        suggestions.push('Use a descriptive title with brand and model');
    }

    // Spam detection
    const spamPatterns = ['FAST MONEY', 'GET RICH', 'GUARANTEED', 'ACT NOW'];
    const upperTitle = (listing.title || '').toUpperCase();
    if (spamPatterns.some(p => upperTitle.includes(p))) {
        flags.push('Possible spam content detected');
        descriptionScore = 20;
    }

    const overallScore = Math.round((imageScore + priceScore + descriptionScore) / 3);

    return {
        overallScore,
        imageAuthenticity: imageScore,
        priceReasonableness: priceScore,
        descriptionQuality: descriptionScore,
        flags,
        approved: flags.length === 0 && overallScore >= 60,
        suggestions,
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BADGE ELIGIBILITY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function checkBadgeEligibility(user: VerifiedUser): UserBadge[] {
    const eligible: UserBadge[] = [];

    if (user.verificationLevel === 'id_verified' || user.verificationLevel === 'trusted_seller') {
        eligible.push('verified_id');
    }

    if (user.stats.averageRating >= 4.8 && user.stats.totalSales >= 50) {
        eligible.push('top_rated');
    }

    if (user.stats.totalSales >= 100) {
        eligible.push('power_seller');
    }

    if (user.stats.totalPurchases >= 10 && user.stats.averageRating >= 4.5) {
        eligible.push('trusted_buyer');
    }

    if (user.stats.responseTime <= 60 && user.stats.responseRate >= 95) {
        eligible.push('responsive');
    }

    return eligible;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTINGS STORAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getListings(): Listing[] {
    try {
        return JSON.parse(localStorage.getItem(LISTINGS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveListing(listing: Listing): void {
    const listings = getListings();
    const index = listings.findIndex(l => l.id === listing.id);

    if (index >= 0) {
        listings[index] = listing;
    } else {
        listings.push(listing);
    }

    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

export function getListingById(id: string): Listing | null {
    return getListings().find(l => l.id === id) || null;
}

export function getUserListings(userId: string): Listing[] {
    return getListings().filter(l => l.sellerId === userId);
}

export function deleteListing(id: string): void {
    const listings = getListings().filter(l => l.id !== id);
    localStorage.setItem(LISTINGS_KEY, JSON.stringify(listings));
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEWS STORAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getReviews(): Review[] {
    try {
        return JSON.parse(localStorage.getItem(REVIEWS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function saveReview(review: Review): void {
    const reviews = getReviews();
    reviews.push(review);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(reviews));
}

export function getUserReviews(userId: string): Review[] {
    return getReviews().filter(r => r.revieweeId === userId);
}
