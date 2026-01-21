// Tadow Messaging Service
// Real-time chat and offer management between buyers and sellers

import { Conversation, Message, Offer } from '../types/marketplace';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STORAGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const CONVERSATIONS_KEY = 'tadow_conversations';
const MESSAGES_KEY = 'tadow_messages';
const OFFERS_KEY = 'tadow_offers';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONVERSATIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getConversations(): Conversation[] {
    try {
        return JSON.parse(localStorage.getItem(CONVERSATIONS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getUserConversations(userId: string): Conversation[] {
    return getConversations().filter(c => c.participants.includes(userId));
}

export function getConversationById(id: string): Conversation | null {
    return getConversations().find(c => c.id === id) || null;
}

export function getOrCreateConversation(
    participant1: string,
    participant2: string,
    listingId?: string
): Conversation {
    const conversations = getConversations();

    // Check for existing conversation about this listing
    const existing = conversations.find(c =>
        c.participants.includes(participant1) &&
        c.participants.includes(participant2) &&
        c.listingId === listingId
    );

    if (existing) return existing;

    // Create new conversation
    const conversation: Conversation = {
        id: `conv-${Date.now()}`,
        listingId,
        participants: [participant1, participant2],
        unreadCount: {
            [participant1]: 0,
            [participant2]: 0,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    conversations.push(conversation);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));

    return conversation;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MESSAGES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getMessages(): Message[] {
    try {
        return JSON.parse(localStorage.getItem(MESSAGES_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getConversationMessages(conversationId: string): Message[] {
    return getMessages()
        .filter(m => m.conversationId === conversationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: Message['type'] = 'text',
    offerId?: string
): Message {
    const messages = getMessages();
    const conversations = getConversations();

    const message: Message = {
        id: `msg-${Date.now()}`,
        conversationId,
        senderId,
        content,
        type,
        offerId,
        read: false,
        createdAt: new Date(),
    };

    messages.push(message);
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));

    // Update conversation
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
        const conv = conversations[convIndex];
        conv.lastMessage = message;
        conv.updatedAt = new Date();

        // Increment unread for other participants
        conv.participants.forEach(p => {
            if (p !== senderId) {
                conv.unreadCount[p] = (conv.unreadCount[p] || 0) + 1;
            }
        });

        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }

    return message;
}

export function markConversationRead(conversationId: string, userId: string): void {
    const conversations = getConversations();
    const messages = getMessages();

    // Mark conversation unread count
    const convIndex = conversations.findIndex(c => c.id === conversationId);
    if (convIndex !== -1) {
        conversations[convIndex].unreadCount[userId] = 0;
        localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
    }

    // Mark all messages as read
    let updated = false;
    messages.forEach(m => {
        if (m.conversationId === conversationId && m.senderId !== userId && !m.read) {
            m.read = true;
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    }
}

export function getTotalUnreadCount(userId: string): number {
    return getUserConversations(userId).reduce((sum, c) => sum + (c.unreadCount[userId] || 0), 0);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// OFFERS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function getOffers(): Offer[] {
    try {
        return JSON.parse(localStorage.getItem(OFFERS_KEY) || '[]');
    } catch {
        return [];
    }
}

export function getOfferById(id: string): Offer | null {
    return getOffers().find(o => o.id === id) || null;
}

export function getListingOffers(listingId: string): Offer[] {
    return getOffers().filter(o => o.listingId === listingId);
}

export function getUserOffers(userId: string, type: 'sent' | 'received'): Offer[] {
    return getOffers().filter(o =>
        type === 'sent' ? o.buyerId === userId : o.sellerId === userId
    );
}

export function createOffer(
    listingId: string,
    buyerId: string,
    sellerId: string,
    amount: number,
    message?: string,
    conversationId?: string
): Offer {
    const offers = getOffers();

    // Expire time: 24 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const offer: Offer = {
        id: `offer-${Date.now()}`,
        listingId,
        buyerId,
        sellerId,
        amount,
        message,
        status: 'pending',
        expiresAt,
        createdAt: new Date(),
    };

    offers.push(offer);
    localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));

    // Send system message to conversation
    if (conversationId) {
        sendMessage(
            conversationId,
            buyerId,
            `Made an offer: $${amount}`,
            'offer',
            offer.id
        );
    }

    return offer;
}

export function respondToOffer(
    offerId: string,
    response: 'accept' | 'decline' | 'counter',
    counterAmount?: number,
    conversationId?: string
): void {
    const offers = getOffers();
    const index = offers.findIndex(o => o.id === offerId);

    if (index !== -1) {
        const offer = offers[index];

        if (response === 'accept') {
            offer.status = 'accepted';
        } else if (response === 'decline') {
            offer.status = 'declined';
        } else if (response === 'counter' && counterAmount) {
            offer.status = 'countered';
            offer.counterAmount = counterAmount;
        }

        offer.respondedAt = new Date();
        localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));

        // Send system message
        if (conversationId) {
            const statusMsg = response === 'accept'
                ? `Offer accepted! 🎉`
                : response === 'decline'
                    ? 'Offer declined'
                    : `Counter offer: $${counterAmount}`;

            sendMessage(conversationId, offer.sellerId, statusMsg, 'system', offerId);
        }
    }
}

export function withdrawOffer(offerId: string): void {
    const offers = getOffers();
    const index = offers.findIndex(o => o.id === offerId);

    if (index !== -1) {
        offers[index].status = 'withdrawn';
        localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    }
}

// Check and expire old offers
export function expireOldOffers(): number {
    const offers = getOffers();
    const now = new Date();
    let expiredCount = 0;

    offers.forEach(offer => {
        if (offer.status === 'pending' && new Date(offer.expiresAt) < now) {
            offer.status = 'expired';
            expiredCount++;
        }
    });

    if (expiredCount > 0) {
        localStorage.setItem(OFFERS_KEY, JSON.stringify(offers));
    }

    return expiredCount;
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// QUICK RESPONSES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const QUICK_RESPONSES = {
    seller: [
        "Hi! Thanks for your interest. How can I help?",
        "Yes, it's still available!",
        "I can ship it today if you order now.",
        "The item is in excellent condition as described.",
        "I'm open to reasonable offers.",
        "Sorry, the price is firm.",
    ],
    buyer: [
        "Hi! Is this still available?",
        "What's the lowest you'll go?",
        "Can you provide more photos?",
        "Are there any defects I should know about?",
        "Where are you located?",
        "Can we meet locally?",
    ],
};
