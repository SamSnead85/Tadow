// Tadow Escrow & Transaction Service
// Secure payment handling with buyer protection

import { Order, OrderStatus, Dispute, DisputeReason, Listing } from '../types/marketplace';
import { VerifiedUser } from '../types/marketplace';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const ORDERS_KEY = 'tadow_orders';
const DISPUTES_KEY = 'tadow_disputes';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PLATFORM FEES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PLATFORM_FEE_PERCENT = 5; // 5% platform fee
export const ESCROW_HOLD_DAYS = 3; // Days to hold funds after delivery

export function calculateFees(price: number, shippingCost: number = 0): {
    subtotal: number;
    platformFee: number;
    total: number;
    sellerReceives: number;
} {
    const subtotal = price + shippingCost;
    const platformFee = Math.round(price * (PLATFORM_FEE_PERCENT / 100) * 100) / 100;
    const total = subtotal + platformFee;
    const sellerReceives = price - platformFee;

    return { subtotal, platformFee, total, sellerReceives };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ORDER MANAGEMENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getOrders(): Order[] {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getOrderById(id: string): Order | null {
    return getOrders().find(o => o.id === id) || null;
}

export function getUserOrders(userId: string, type: 'buyer' | 'seller'): Order[] {
    const orders = getOrders();
    return type === 'buyer'
        ? orders.filter(o => o.buyerId === userId)
        : orders.filter(o => o.sellerId === userId);
}

export function createOrder(
    listing: Listing,
    buyer: VerifiedUser,
    paymentMethod: string
): Order {
    const fees = calculateFees(listing.price, listing.shipping?.cost || 0);

    const order: Order = {
        id: `order-${Date.now()}`,
        listingId: listing.id,
        sellerId: listing.sellerId,
        buyerId: buyer.id,
        status: 'payment_held',
        price: listing.price,
        shippingCost: listing.shipping?.cost || 0,
        platformFee: fees.platformFee,
        totalAmount: fees.total,
        paymentMethod,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    const orders = getOrders();
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    return order;
}

export function updateOrderStatus(orderId: string, status: OrderStatus, updates?: Partial<Order>): void {
    const orders = getOrders();
    const index = orders.findIndex(o => o.id === orderId);

    if (index !== -1) {
        orders[index] = {
            ...orders[index],
            ...updates,
            status,
            updatedAt: new Date(),
        };

        // Set escrow release date when delivered
        if (status === 'delivered' && !orders[index].escrowReleaseDate) {
            const releaseDate = new Date();
            releaseDate.setDate(releaseDate.getDate() + ESCROW_HOLD_DAYS);
            orders[index].escrowReleaseDate = releaseDate;
        }

        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
}

export function addTrackingInfo(
    orderId: string,
    trackingNumber: string,
    carrier: string,
    estimatedDelivery?: Date
): void {
    updateOrderStatus(orderId, 'shipped', {
        shipping: {
            trackingNumber,
            carrier,
            estimatedDelivery,
        },
    });
}

export function confirmDelivery(orderId: string): void {
    updateOrderStatus(orderId, 'delivered', {
        shipping: {
            ...getOrderById(orderId)?.shipping,
            deliveredAt: new Date(),
        },
    });
}

export function completeOrder(orderId: string): void {
    updateOrderStatus(orderId, 'completed');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ESCROW PROTECTION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export interface EscrowStatus {
    isProtected: boolean;
    status: 'held' | 'release_pending' | 'released' | 'disputed';
    releaseDate?: Date;
    daysRemaining?: number;
    message: string;
}

export function getEscrowStatus(order: Order): EscrowStatus {
    if (order.status === 'disputed') {
        return {
            isProtected: true,
            status: 'disputed',
            message: 'Funds held pending dispute resolution',
        };
    }

    if (order.status === 'completed') {
        return {
            isProtected: false,
            status: 'released',
            message: 'Funds released to seller',
        };
    }

    if (order.status === 'delivered' && order.escrowReleaseDate) {
        const now = new Date();
        const releaseDate = new Date(order.escrowReleaseDate);
        const daysRemaining = Math.ceil((releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysRemaining <= 0) {
            return {
                isProtected: false,
                status: 'release_pending',
                releaseDate,
                daysRemaining: 0,
                message: 'Funds ready for release',
            };
        }

        return {
            isProtected: true,
            status: 'held',
            releaseDate,
            daysRemaining,
            message: `Funds protected for ${daysRemaining} more day${daysRemaining === 1 ? '' : 's'}`,
        };
    }

    return {
        isProtected: true,
        status: 'held',
        message: 'Funds held in escrow until delivery confirmed',
    };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DISPUTE HANDLING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getDisputes(): Dispute[] {
    try {
        return JSON.parse(localStorage.getItem(DISPUTES_KEY) || '[]');
    } catch {
        return [];
    }
}

export function createDispute(
    orderId: string,
    initiatorId: string,
    reason: DisputeReason,
    description: string,
    evidence: string[] = []
): Dispute {
    const dispute: Dispute = {
        id: `dispute-${Date.now()}`,
        orderId,
        initiatorId,
        reason,
        description,
        evidence,
        status: 'open',
        createdAt: new Date(),
    };

    const disputes = getDisputes();
    disputes.push(dispute);
    localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));

    // Update order status
    updateOrderStatus(orderId, 'disputed');

    return dispute;
}

export function resolveDispute(
    disputeId: string,
    outcome: 'refund_full' | 'refund_partial' | 'no_refund' | 'return_required',
    amount?: number
): void {
    const disputes = getDisputes();
    const index = disputes.findIndex(d => d.id === disputeId);

    if (index !== -1) {
        disputes[index] = {
            ...disputes[index],
            status: 'resolved',
            resolution: {
                outcome,
                amount,
                resolvedBy: 'support',
                resolvedAt: new Date(),
            },
        };
        localStorage.setItem(DISPUTES_KEY, JSON.stringify(disputes));

        // Update order based on outcome
        const orderStatus: OrderStatus = outcome === 'refund_full' ? 'refunded' : 'completed';
        updateOrderStatus(disputes[index].orderId, orderStatus);
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BUYER PROTECTION FEATURES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const BUYER_PROTECTIONS = [
    {
        title: 'Money-Back Guarantee',
        description: "If your item doesn't arrive or isn't as described, we'll refund you.",
        icon: '💰',
    },
    {
        title: 'Secure Payments',
        description: 'Your payment is held safely until you confirm receipt.',
        icon: '🔒',
    },
    {
        title: 'Verified Sellers',
        description: 'All sellers go through our trust verification process.',
        icon: '✅',
    },
    {
        title: '24/7 Support',
        description: "Our team is here to help with any issues.",
        icon: '🛟',
    },
];
