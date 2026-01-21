/**
 * AI Assistant Service - Conversational Shopping Intelligence
 * 
 * Powers the conversational AI interface for deal discovery.
 * Integrates with OpenAI/Claude for natural language understanding.
 */

import { aggregationPipeline, ProcessedDeal } from './index';

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    deals?: ProcessedDeal[];
}

export interface ChatContext {
    sessionId: string;
    messages: ChatMessage[];
    preferences: UserPreferences;
    lastQuery?: string;
}

export interface UserPreferences {
    favoriteCategories?: string[];
    priceRange?: { min: number; max: number };
    favoriteRetailers?: string[];
    avoidRetailers?: string[];
}

export interface AssistantResponse {
    message: string;
    deals: ProcessedDeal[];
    suggestedQuestions: string[];
    action?: 'search' | 'compare' | 'alert' | 'info';
}

export class AIAssistant {
    private systemPrompt = `You are Tadow, an AI shopping assistant that helps users find the best deals on electronics and tech products. You are:
- Knowledgeable about product features, specifications, and value
- Honest about deal quality - you tell users when to buy and when to wait
- Concise but informative
- Focused on saving users money

When responding:
1. Acknowledge the user's request
2. Share relevant deal insights
3. Provide specific product recommendations when available
4. Suggest when to buy vs wait based on price history
5. Ask clarifying questions if needed

You have access to real-time deal data, price history, and AI-powered deal scoring.`;

    /**
     * Process user message and generate response
     */
    async chat(message: string, context?: ChatContext): Promise<AssistantResponse> {
        // Parse user intent
        const intent = this.parseIntent(message);

        let response: AssistantResponse;

        switch (intent.type) {
            case 'search':
                response = await this.handleSearch(intent.query, intent.category, context);
                break;
            case 'compare':
                response = await this.handleCompare(intent.products);
                break;
            case 'price_check':
                response = await this.handlePriceCheck(intent.product);
                break;
            case 'recommendation':
                response = await this.handleRecommendation(intent.requirements, context);
                break;
            case 'deal_alert':
                response = await this.handleDealAlert(intent.product, intent.targetPrice);
                break;
            default:
                response = await this.handleGeneral(message, context);
        }

        return response;
    }

    /**
     * Parse user intent from natural language
     */
    private parseIntent(message: string): {
        type: 'search' | 'compare' | 'price_check' | 'recommendation' | 'deal_alert' | 'general';
        query?: string;
        category?: string;
        products?: string[];
        product?: string;
        requirements?: string;
        targetPrice?: number;
    } {
        const lower = message.toLowerCase();

        // Search intent
        if (lower.includes('find') || lower.includes('search') || lower.includes('looking for') || lower.includes('show me')) {
            const query = message.replace(/^(find|search for|looking for|show me)\s*/i, '').trim();
            return { type: 'search', query, category: this.extractCategory(lower) };
        }

        // Compare intent
        if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus') || lower.includes('difference between')) {
            return { type: 'compare', products: this.extractProducts(message) };
        }

        // Price check intent
        if (lower.includes('price') && (lower.includes('check') || lower.includes('history') || lower.includes('trend'))) {
            return { type: 'price_check', product: this.extractProduct(message) };
        }

        // Recommendation intent
        if (lower.includes('recommend') || lower.includes('suggest') || lower.includes('best') || lower.includes('should i buy')) {
            return { type: 'recommendation', requirements: message };
        }

        // Deal alert intent
        if (lower.includes('alert') || lower.includes('notify') || lower.includes('when') && lower.includes('drops')) {
            const priceMatch = message.match(/\$(\d+)/);
            return {
                type: 'deal_alert',
                product: this.extractProduct(message),
                targetPrice: priceMatch ? parseInt(priceMatch[1]) : undefined,
            };
        }

        return { type: 'general' };
    }

    /**
     * Extract category from message
     */
    private extractCategory(message: string): string | undefined {
        const categories = [
            'laptop', 'laptops', 'computer', 'computers',
            'phone', 'phones', 'smartphone', 'smartphones',
            'headphone', 'headphones', 'earbuds', 'audio',
            'tv', 'tvs', 'television',
            'gaming', 'console', 'playstation', 'xbox', 'nintendo',
            'tablet', 'tablets', 'ipad',
            'camera', 'cameras',
            'smartwatch', 'watch', 'wearable',
        ];

        for (const cat of categories) {
            if (message.includes(cat)) {
                return cat;
            }
        }
        return undefined;
    }

    /**
     * Extract product name from message
     */
    private extractProduct(message: string): string {
        // Remove common phrases
        return message
            .replace(/^(find|search|check|price|history|trend|for|the|a|an)\s+/gi, '')
            .replace(/\s*(price|deal|discount|alert|notify)\s*$/gi, '')
            .trim();
    }

    /**
     * Extract multiple products for comparison
     */
    private extractProducts(message: string): string[] {
        // Split by "vs", "versus", "and", "or", "compared to"
        const parts = message.split(/\s+(?:vs|versus|and|or|compared to|with)\s+/i);
        return parts.map(p => this.extractProduct(p)).filter(Boolean);
    }

    /**
     * Handle search requests
     */
    private async handleSearch(query?: string, category?: string, context?: ChatContext): Promise<AssistantResponse> {
        const searchQuery = query || category || 'electronics';
        const deals = await aggregationPipeline.searchDeals(searchQuery, category);

        const topDeals = deals.slice(0, 5);

        let message = this.generateSearchResponse(searchQuery, topDeals);

        return {
            message,
            deals: topDeals,
            suggestedQuestions: [
                `Tell me more about the ${topDeals[0]?.brand} deal`,
                'Show me cheaper options',
                'Compare the top 2 deals',
                'Set a price alert for this product',
            ],
            action: 'search',
        };
    }

    /**
     * Generate natural language search response
     */
    private generateSearchResponse(query: string, deals: ProcessedDeal[]): string {
        if (deals.length === 0) {
            return `I couldn't find any deals matching "${query}" right now. Would you like me to set up an alert when deals become available?`;
        }

        const topDeal = deals[0];
        const savings = topDeal.discountPercent ? `${topDeal.discountPercent}% off` : 'great price';

        let response = `I found ${deals.length} deals for "${query}". `;
        response += `\n\n**Top Pick:** ${topDeal.normalizedTitle} at **$${topDeal.currentPrice}** (${savings})`;
        response += `\n\n🎯 **AI Score:** ${topDeal.aiScore}/100 - ${topDeal.aiVerdict}`;

        if (topDeal.insights.length > 0) {
            response += `\n\n${topDeal.insights[0]}`;
        }

        if (topDeal.recommendation === 'buy_now') {
            response += `\n\n💡 **My recommendation:** Buy now! This is an excellent deal.`;
        } else if (topDeal.recommendation === 'wait') {
            response += `\n\n💡 **My recommendation:** Consider waiting - I expect better prices soon.`;
        }

        return response;
    }

    /**
     * Handle comparison requests
     */
    private async handleCompare(products?: string[]): Promise<AssistantResponse> {
        if (!products || products.length < 2) {
            return {
                message: 'What products would you like me to compare? Just tell me the names.',
                deals: [],
                suggestedQuestions: [
                    'Compare iPhone 15 vs Samsung S24',
                    'Compare MacBook Air vs Dell XPS',
                    'Compare AirPods Pro vs Sony WF-1000XM5',
                ],
                action: 'compare',
            };
        }

        // Search for each product
        const dealSets = await Promise.all(
            products.map(p => aggregationPipeline.searchDeals(p))
        );

        const topDeals = dealSets.map(deals => deals[0]).filter(Boolean);

        let message = `## Comparison: ${products.join(' vs ')}\n\n`;

        for (const deal of topDeals) {
            message += `### ${deal.normalizedTitle}\n`;
            message += `- **Price:** $${deal.currentPrice}`;
            if (deal.discountPercent) message += ` (${deal.discountPercent}% off)`;
            message += `\n- **AI Score:** ${deal.aiScore}/100\n`;
            message += `- **Verdict:** ${deal.aiVerdict}\n\n`;
        }

        if (topDeals.length >= 2) {
            const winner = topDeals.reduce((a, b) => a.aiScore > b.aiScore ? a : b);
            message += `\n🏆 **Best Value:** ${winner.brand} ${winner.model || ''} with a score of ${winner.aiScore}/100`;
        }

        return {
            message,
            deals: topDeals,
            suggestedQuestions: [
                `Tell me more about the ${topDeals[0]?.brand}`,
                'Which has better reviews?',
                'Show me price history',
            ],
            action: 'compare',
        };
    }

    /**
     * Handle price check requests
     */
    private async handlePriceCheck(product?: string): Promise<AssistantResponse> {
        if (!product) {
            return {
                message: 'Which product would you like me to check the price history for?',
                deals: [],
                suggestedQuestions: [
                    'Check price history for MacBook Pro',
                    'Is this a good time to buy a TV?',
                    'What\'s the price trend for AirPods?',
                ],
                action: 'info',
            };
        }

        const deals = await aggregationPipeline.searchDeals(product);
        const topDeal = deals[0];

        if (!topDeal) {
            return {
                message: `I couldn't find price data for "${product}". Try being more specific?`,
                deals: [],
                suggestedQuestions: [],
                action: 'info',
            };
        }

        const message = `## Price Analysis: ${topDeal.normalizedTitle}\n\n` +
            `**Current Price:** $${topDeal.currentPrice}\n` +
            `**AI Score:** ${topDeal.aiScore}/100 - ${topDeal.aiVerdict}\n\n` +
            (topDeal.insights.length > 0 ? topDeal.insights.join('\n') : '');

        return {
            message,
            deals: [topDeal],
            suggestedQuestions: [
                'Set a price alert',
                'Show me alternatives',
                'Compare with similar products',
            ],
            action: 'info',
        };
    }

    /**
     * Handle recommendation requests
     */
    private async handleRecommendation(requirements?: string, context?: ChatContext): Promise<AssistantResponse> {
        // Extract budget if mentioned
        const budgetMatch = requirements?.match(/\$(\d+)/);
        const budget = budgetMatch ? parseInt(budgetMatch[1]) : undefined;

        // Extract category
        const category = requirements ? this.extractCategory(requirements.toLowerCase()) : undefined;

        let deals = await aggregationPipeline.getTopDeals(10);

        // Filter by category if specified
        if (category) {
            deals = deals.filter(d => d.category.toLowerCase().includes(category));
        }

        // Filter by budget if specified
        if (budget) {
            deals = deals.filter(d => d.currentPrice <= budget);
        }

        const recommendations = deals.slice(0, 3);

        let message = `Based on your requirements, here are my top recommendations:\n\n`;

        recommendations.forEach((deal, i) => {
            message += `**${i + 1}. ${deal.normalizedTitle}**\n`;
            message += `   $${deal.currentPrice} | ${deal.aiVerdict}\n\n`;
        });

        if (recommendations.length === 0) {
            message = 'I need a bit more info to make good recommendations. What type of product are you looking for and what\'s your budget?';
        }

        return {
            message,
            deals: recommendations,
            suggestedQuestions: [
                'Tell me more about #1',
                'Show me something cheaper',
                'Compare these options',
            ],
            action: 'search',
        };
    }

    /**
     * Handle deal alert requests
     */
    private async handleDealAlert(product?: string, targetPrice?: number): Promise<AssistantResponse> {
        const message = targetPrice
            ? `I'll notify you when ${product || 'this product'} drops below $${targetPrice}. You'll get an alert via email or push notification.`
            : `What price would you like me to watch for? The current best price is around $${0}. I recommend setting an alert for 10-15% below that.`;

        return {
            message,
            deals: [],
            suggestedQuestions: [
                'Set alert at $500',
                'Alert me at all-time low',
                'Show me current best price',
            ],
            action: 'alert',
        };
    }

    /**
     * Handle general queries
     */
    private async handleGeneral(message: string, context?: ChatContext): Promise<AssistantResponse> {
        const topDeals = await aggregationPipeline.getTopDeals(5);

        return {
            message: `Hey! I'm Tadow, your AI shopping assistant. I can help you find the best deals on tech and electronics. Here are today's top deals, or you can ask me to search for something specific!`,
            deals: topDeals,
            suggestedQuestions: [
                'Find me a gaming laptop under $1500',
                'What\'s the best TV deal today?',
                'Compare AirPods Pro vs Galaxy Buds',
                'Is this a good time to buy a new iPhone?',
            ],
        };
    }
}

// Export singleton
export const aiAssistant = new AIAssistant();
