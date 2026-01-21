/**
 * Shopping Agent - Autonomous Deal Hunter
 * 
 * AI agent that continuously monitors deals and proactively
 * finds matches for users based on their preferences.
 */

import { preferenceModel } from './PreferenceModel';

interface AgentConfig {
    userId: string;
    // Agent aggressiveness (0=passive, 1=aggressive)
    aggressiveness: number;
    // Whether agent can auto-purchase
    canAutoPurchase: boolean;
    // Maximum auto-purchase amount
    maxAutoPurchaseAmount: number;
    // Active deal hunts
    activeHunts: DealHunt[];
    // Agent status
    status: 'active' | 'paused' | 'sleeping';
    // Stats
    stats: AgentStats;
}

interface DealHunt {
    id: string;
    query: string;
    category?: string;
    brand?: string;
    maxPrice: number;
    minDealScore: number;
    targetDiscount?: number;
    status: 'hunting' | 'found' | 'expired' | 'purchased';
    createdAt: Date;
    expiresAt?: Date;
    foundDeals: FoundDeal[];
}

interface FoundDeal {
    dealId: string;
    title: string;
    price: number;
    originalPrice: number;
    discountPercent: number;
    dealScore: number;
    matchScore: number;
    reasons: string[];
    foundAt: Date;
    notifiedAt?: Date;
    userAction?: 'viewed' | 'saved' | 'purchased' | 'dismissed';
}

interface AgentStats {
    totalDealsFound: number;
    totalSavings: number;
    totalPurchases: number;
    averageMatchScore: number;
    lastRunAt: Date;
    runsLast24h: number;
    dealsFoundLast24h: number;
}

interface AgentActivity {
    type: 'hunt_started' | 'deals_found' | 'alert_sent' | 'user_action' | 'run_completed';
    timestamp: Date;
    huntId?: string;
    dealCount?: number;
    message: string;
    metadata?: Record<string, any>;
}

interface Deal {
    id: string;
    title: string;
    category: string;
    brand: string;
    currentPrice: number;
    originalPrice: number;
    discountPercent: number;
    dealScore: number;
    marketplace: string;
    imageUrl?: string;
    externalUrl?: string;
}

export class ShoppingAgent {
    private agents: Map<string, AgentConfig> = new Map();
    private activityLog: Map<string, AgentActivity[]> = new Map();
    private isRunning = false;
    private runInterval: NodeJS.Timeout | null = null;

    // Run every 15 minutes by default
    private static RUN_INTERVAL_MS = 15 * 60 * 1000;
    // Maximum deals to return per hunt
    private static MAX_DEALS_PER_HUNT = 10;
    // Activity log limit
    private static MAX_ACTIVITY_LOG = 100;

    /**
     * Initialize agent for a user
     */
    async initializeAgent(userId: string): Promise<AgentConfig> {
        if (!this.agents.has(userId)) {
            this.agents.set(userId, {
                userId,
                aggressiveness: 0.5,
                canAutoPurchase: false,
                maxAutoPurchaseAmount: 0,
                activeHunts: [],
                status: 'active',
                stats: {
                    totalDealsFound: 0,
                    totalSavings: 0,
                    totalPurchases: 0,
                    averageMatchScore: 0,
                    lastRunAt: new Date(),
                    runsLast24h: 0,
                    dealsFoundLast24h: 0,
                },
            });
            this.activityLog.set(userId, []);
        }
        return this.agents.get(userId)!;
    }

    /**
     * Create a new deal hunt
     */
    async createHunt(
        userId: string,
        hunt: Omit<DealHunt, 'id' | 'status' | 'createdAt' | 'foundDeals'>
    ): Promise<DealHunt> {
        const agent = await this.initializeAgent(userId);

        const newHunt: DealHunt = {
            ...hunt,
            id: `hunt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'hunting',
            createdAt: new Date(),
            foundDeals: [],
        };

        agent.activeHunts.push(newHunt);

        this.logActivity(userId, {
            type: 'hunt_started',
            timestamp: new Date(),
            huntId: newHunt.id,
            message: `Started hunting for: ${hunt.query}`,
            metadata: { maxPrice: hunt.maxPrice, minDealScore: hunt.minDealScore },
        });

        return newHunt;
    }

    /**
     * Run agent for a specific user
     */
    async runForUser(userId: string, allDeals: Deal[]): Promise<FoundDeal[]> {
        const agent = await this.initializeAgent(userId);
        if (agent.status !== 'active') return [];

        const foundDeals: FoundDeal[] = [];

        // 1. Run active hunts
        for (const hunt of agent.activeHunts.filter(h => h.status === 'hunting')) {
            const matches = await this.matchDealsToHunt(userId, hunt, allDeals);
            hunt.foundDeals.push(...matches);
            foundDeals.push(...matches);

            if (matches.length > 0) {
                this.logActivity(userId, {
                    type: 'deals_found',
                    timestamp: new Date(),
                    huntId: hunt.id,
                    dealCount: matches.length,
                    message: `Found ${matches.length} deals matching "${hunt.query}"`,
                });
            }
        }

        // 2. Preference-based proactive matching
        const proactiveMatches = await this.findProactiveMatches(userId, allDeals);
        foundDeals.push(...proactiveMatches);

        // 3. Update stats
        agent.stats.totalDealsFound += foundDeals.length;
        agent.stats.dealsFoundLast24h += foundDeals.length;
        agent.stats.lastRunAt = new Date();
        agent.stats.runsLast24h += 1;

        if (foundDeals.length > 0) {
            const avgMatch = foundDeals.reduce((acc, d) => acc + d.matchScore, 0) / foundDeals.length;
            agent.stats.averageMatchScore =
                (agent.stats.averageMatchScore + avgMatch) / 2;
        }

        this.logActivity(userId, {
            type: 'run_completed',
            timestamp: new Date(),
            dealCount: foundDeals.length,
            message: foundDeals.length > 0
                ? `Agent run complete: ${foundDeals.length} matches found`
                : 'Agent run complete: No new matches',
        });

        return foundDeals;
    }

    /**
     * Match deals to a specific hunt
     */
    private async matchDealsToHunt(
        userId: string,
        hunt: DealHunt,
        allDeals: Deal[]
    ): Promise<FoundDeal[]> {
        const matches: FoundDeal[] = [];
        const existingIds = new Set(hunt.foundDeals.map(d => d.dealId));

        for (const deal of allDeals) {
            // Skip already found deals
            if (existingIds.has(deal.id)) continue;

            // Basic filtering
            if (deal.currentPrice > hunt.maxPrice) continue;
            if (deal.dealScore < hunt.minDealScore) continue;
            if (hunt.category && deal.category !== hunt.category) continue;
            if (hunt.brand && deal.brand !== hunt.brand) continue;
            if (hunt.targetDiscount && deal.discountPercent < hunt.targetDiscount) continue;

            // Query matching (simple keyword match)
            const queryTerms = hunt.query.toLowerCase().split(/\s+/);
            const titleLower = deal.title.toLowerCase();
            const matchesQuery = queryTerms.every(term => titleLower.includes(term));
            if (!matchesQuery) continue;

            // Get preference match
            const prefMatch = await preferenceModel.matchesDeal(userId, {
                category: deal.category,
                brand: deal.brand,
                price: deal.currentPrice,
                dealScore: deal.dealScore,
            });

            // Calculate match score
            const matchScore = this.calculateMatchScore(deal, hunt, prefMatch.confidence);

            if (matchScore >= 0.6) {
                matches.push({
                    dealId: deal.id,
                    title: deal.title,
                    price: deal.currentPrice,
                    originalPrice: deal.originalPrice,
                    discountPercent: deal.discountPercent,
                    dealScore: deal.dealScore,
                    matchScore,
                    reasons: [
                        `Matches your hunt: "${hunt.query}"`,
                        ...prefMatch.reasons,
                    ],
                    foundAt: new Date(),
                });
            }
        }

        // Sort by match score and limit
        return matches
            .sort((a, b) => b.matchScore - a.matchScore)
            .slice(0, ShoppingAgent.MAX_DEALS_PER_HUNT);
    }

    /**
     * Find proactive matches based on user preferences
     */
    private async findProactiveMatches(
        userId: string,
        allDeals: Deal[]
    ): Promise<FoundDeal[]> {
        const matches: FoundDeal[] = [];
        const agent = this.agents.get(userId);
        if (!agent) return matches;

        // Get top categories user is interested in
        const topCategories = await preferenceModel.getTopCategories(userId);
        if (topCategories.length === 0) return matches;

        // Find exceptional deals in those categories
        const exceptionalDeals = allDeals.filter(deal =>
            topCategories.includes(deal.category) && deal.dealScore >= 85
        );

        for (const deal of exceptionalDeals) {
            const prefMatch = await preferenceModel.matchesDeal(userId, {
                category: deal.category,
                brand: deal.brand,
                price: deal.currentPrice,
                dealScore: deal.dealScore,
            });

            if (prefMatch.matches && prefMatch.confidence >= 0.7) {
                // Only include if agent is aggressive enough or deal is exceptional
                const threshold = 0.9 - (agent.aggressiveness * 0.3);
                if (prefMatch.confidence >= threshold || deal.dealScore >= 95) {
                    matches.push({
                        dealId: deal.id,
                        title: deal.title,
                        price: deal.currentPrice,
                        originalPrice: deal.originalPrice,
                        discountPercent: deal.discountPercent,
                        dealScore: deal.dealScore,
                        matchScore: prefMatch.confidence,
                        reasons: [
                            '🤖 AI thinks you\'ll love this!',
                            ...prefMatch.reasons,
                        ],
                        foundAt: new Date(),
                    });
                }
            }
        }

        return matches.slice(0, 5); // Limit proactive suggestions
    }

    /**
     * Calculate overall match score
     */
    private calculateMatchScore(
        deal: Deal,
        hunt: DealHunt,
        preferenceConfidence: number
    ): number {
        let score = 0;

        // Deal quality (40%)
        score += (deal.dealScore / 100) * 0.4;

        // Price match (20%)
        const priceRatio = 1 - (deal.currentPrice / hunt.maxPrice);
        score += Math.max(0, priceRatio) * 0.2;

        // Discount (20%)
        const discountScore = Math.min(deal.discountPercent / 50, 1);
        score += discountScore * 0.2;

        // Preference match (20%)
        score += preferenceConfidence * 0.2;

        return Math.min(1, score);
    }

    /**
     * Log agent activity
     */
    private logActivity(userId: string, activity: AgentActivity): void {
        if (!this.activityLog.has(userId)) {
            this.activityLog.set(userId, []);
        }

        const log = this.activityLog.get(userId)!;
        log.unshift(activity);

        // Trim log
        if (log.length > ShoppingAgent.MAX_ACTIVITY_LOG) {
            log.pop();
        }
    }

    /**
     * Get agent activity log
     */
    getActivityLog(userId: string, limit = 20): AgentActivity[] {
        return (this.activityLog.get(userId) || []).slice(0, limit);
    }

    /**
     * Get agent configuration
     */
    getAgent(userId: string): AgentConfig | undefined {
        return this.agents.get(userId);
    }

    /**
     * Update agent settings
     */
    async updateAgentSettings(
        userId: string,
        settings: Partial<Pick<AgentConfig, 'aggressiveness' | 'canAutoPurchase' | 'maxAutoPurchaseAmount' | 'status'>>
    ): Promise<AgentConfig> {
        const agent = await this.initializeAgent(userId);
        Object.assign(agent, settings);
        return agent;
    }

    /**
     * Pause a hunt
     */
    pauseHunt(userId: string, huntId: string): boolean {
        const agent = this.agents.get(userId);
        if (!agent) return false;

        const hunt = agent.activeHunts.find(h => h.id === huntId);
        if (hunt && hunt.status === 'hunting') {
            hunt.status = 'expired';
            return true;
        }
        return false;
    }

    /**
     * Record user action on a found deal
     */
    recordDealAction(
        userId: string,
        huntId: string,
        dealId: string,
        action: 'viewed' | 'saved' | 'purchased' | 'dismissed'
    ): void {
        const agent = this.agents.get(userId);
        if (!agent) return;

        const hunt = agent.activeHunts.find(h => h.id === huntId);
        if (!hunt) return;

        const deal = hunt.foundDeals.find(d => d.dealId === dealId);
        if (deal) {
            deal.userAction = action;

            this.logActivity(userId, {
                type: 'user_action',
                timestamp: new Date(),
                huntId,
                message: `User ${action} deal: ${deal.title}`,
                metadata: { dealId, action },
            });

            // Update stats for purchases
            if (action === 'purchased') {
                agent.stats.totalPurchases += 1;
                agent.stats.totalSavings += deal.originalPrice - deal.price;
            }
        }
    }

    /**
     * Get summary stats for a user
     */
    getStats(userId: string): AgentStats | null {
        return this.agents.get(userId)?.stats || null;
    }

    /**
     * Start global agent runner (for all users)
     */
    startGlobalRunner(getAllDeals: () => Promise<Deal[]>): void {
        if (this.isRunning) return;

        this.isRunning = true;
        console.log('🤖 Shopping Agent: Starting global runner...');

        this.runInterval = setInterval(async () => {
            const deals = await getAllDeals();

            for (const [userId] of this.agents) {
                try {
                    await this.runForUser(userId, deals);
                } catch (error) {
                    console.error(`Agent error for user ${userId}:`, error);
                }
            }
        }, ShoppingAgent.RUN_INTERVAL_MS);
    }

    /**
     * Stop global runner
     */
    stopGlobalRunner(): void {
        if (this.runInterval) {
            clearInterval(this.runInterval);
            this.runInterval = null;
        }
        this.isRunning = false;
    }
}

// Singleton instance
export const shoppingAgent = new ShoppingAgent();
