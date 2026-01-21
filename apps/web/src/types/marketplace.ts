// Tadow Marketplace Types
// Core type definitions for P2P buying and selling

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER & VERIFICATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type VerificationLevel = 'none' | 'email' | 'phone' | 'id_verified' | 'trusted_seller';

export type UserBadge =
    | 'verified_id'      // Passed ID verification
    | 'fast_shipper'     // Ships within 24 hours
    | 'top_rated'        // 4.8+ rating with 50+ sales
    | 'power_seller'     // High volume seller
    | 'trusted_buyer'    // 10+ successful purchases
    | 'responsive'       // Responds in < 1 hour
    | 'local_meetup';    // Available for local pickup

export interface VerifiedUser {
    id: string;
    email: string;
    displayName: string;
    avatar?: string;
    verificationLevel: VerificationLevel;
    trustScore: number; // 0-100
    transactionCount: number;
    memberSince: Date;
    lastActive: Date;
    badges: UserBadge[];
    location?: {
        city: string;
        state: string;
        country: string;
        coordinates?: { lat: number; lng: number };
    };
    stats: {
        totalSales: number;
        totalPurchases: number;
        averageRating: number;
        responseRate: number;
        responseTime: number; // in minutes
        completionRate: number;
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// LISTINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ListingCondition =
    | 'new'           // Brand new, sealed
    | 'like_new'      // Opened but unused
    | 'excellent'     // Minimal wear
    | 'good'          // Normal wear
    | 'fair'          // Visible wear
    | 'parts';        // For parts only

export type ListingStatus = 'draft' | 'active' | 'pending' | 'sold' | 'expired' | 'removed';

export type PricingType = 'fixed' | 'negotiable' | 'auction' | 'free';

export type ShippingType = 'ship' | 'local_only' | 'both';

export interface Listing {
    id: string;
    sellerId: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
    condition: ListingCondition;
    images: string[];
    price: number;
    originalRetailPrice?: number;
    pricingType: PricingType;
    minimumOffer?: number;
    shipping: {
        type: ShippingType;
        cost?: number;
        freeOver?: number;
        estimatedDays?: number;
        localPickupOnly?: boolean;
    };
    quantity: number;
    brand?: string;
    model?: string;
    specs?: Record<string, string>;
    status: ListingStatus;
    views: number;
    saves: number;
    createdAt: Date;
    updatedAt: Date;
    expiresAt?: Date;
    aiVerification?: {
        imageAuthenticity: number; // 0-100
        priceReasonableness: number;
        descriptionQuality: number;
        overallScore: number;
        flags: string[];
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRANSACTIONS & ORDERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type OrderStatus =
    | 'pending_payment'
    | 'payment_held'      // In escrow
    | 'shipped'
    | 'delivered'
    | 'completed'
    | 'disputed'
    | 'refunded'
    | 'cancelled';

export interface Order {
    id: string;
    listingId: string;
    sellerId: string;
    buyerId: string;
    status: OrderStatus;
    price: number;
    shippingCost: number;
    platformFee: number;
    totalAmount: number;
    paymentMethod: string;
    escrowReleaseDate?: Date;
    shipping?: {
        trackingNumber?: string;
        carrier?: string;
        estimatedDelivery?: Date;
        deliveredAt?: Date;
    };
    meetup?: {
        location: string;
        scheduledAt: Date;
        confirmed: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFERS & NEGOTIATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type OfferStatus = 'pending' | 'accepted' | 'declined' | 'countered' | 'expired' | 'withdrawn';

export interface Offer {
    id: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    message?: string;
    status: OfferStatus;
    counterAmount?: number;
    expiresAt: Date;
    createdAt: Date;
    respondedAt?: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEWS & RATINGS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Review {
    id: string;
    orderId: string;
    reviewerId: string;
    revieweeId: string;
    type: 'buyer_to_seller' | 'seller_to_buyer';
    rating: 1 | 2 | 3 | 4 | 5;
    title?: string;
    comment: string;
    images?: string[];
    aspects?: {
        accuracy: number;
        communication: number;
        shipping: number;
        packaging?: number;
    };
    response?: {
        comment: string;
        respondedAt: Date;
    };
    helpful: number;
    reported: boolean;
    aiSentiment?: {
        score: number; // -1 to 1
        authenticity: number; // 0-100
        flags: string[];
    };
    createdAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MESSAGING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface Conversation {
    id: string;
    listingId?: string;
    participants: string[];
    lastMessage?: Message;
    unreadCount: Record<string, number>;
    createdAt: Date;
    updatedAt: Date;
}

export interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    type: 'text' | 'image' | 'offer' | 'system';
    offerId?: string;
    read: boolean;
    createdAt: Date;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISPUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type DisputeReason =
    | 'not_as_described'
    | 'not_received'
    | 'damaged'
    | 'counterfeit'
    | 'wrong_item'
    | 'buyer_remorse'
    | 'other';

export type DisputeStatus = 'open' | 'under_review' | 'resolved' | 'escalated';

export interface Dispute {
    id: string;
    orderId: string;
    initiatorId: string;
    reason: DisputeReason;
    description: string;
    evidence: string[];
    status: DisputeStatus;
    resolution?: {
        outcome: 'refund_full' | 'refund_partial' | 'no_refund' | 'return_required';
        amount?: number;
        resolvedBy: 'auto' | 'support' | 'agreement';
        resolvedAt: Date;
    };
    createdAt: Date;
}
