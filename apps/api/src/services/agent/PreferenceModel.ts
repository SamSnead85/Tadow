/**
 * User Preference Model
 * 
 * Learns user shopping preferences from behavior to enable
 * autonomous deal hunting and personalized recommendations.
 */

interface UserPreference {
    userId: string;
    // Category preferences with affinity scores (0-1)
    categoryAffinities: Map<string, number>;
    // Brand preferences with affinity scores
    brandAffinities: Map<string, number>;
    // Price sensitivity (0=price insensitive, 1=very price sensitive)
    priceSensitivity: number;
    // Preferred price ranges by category
    priceRanges: Map<string, { min: number; max: number }>;
    // Deal score threshold (minimum score to notify)
    dealScoreThreshold: number;
    // Preferred notification times
    notificationPreferences: NotificationPreferences;
    // Shopping patterns
    shoppingPatterns: ShoppingPatterns;
    // Last updated
    updatedAt: Date;
}

interface NotificationPreferences {
    email: boolean;
    push: boolean;
    sms: boolean;
    frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
    quietHoursStart?: string; // "22:00"
    quietHoursEnd?: string;   // "08:00"
}

interface ShoppingPatterns {
    preferredDayOfWeek: number[];  // 0-6
    preferredTimeOfDay: string[];  // "morning", "afternoon", "evening"
    averageTimeBetweenPurchases: number; // days
    averageSpendPerPurchase: number;
    impulseBuyerScore: number;     // 0-1
}

interface UserActivity {
    type: 'view' | 'save' | 'click' | 'purchase' | 'dismiss' | 'search';
    dealId?: string;
    category?: string;
    brand?: string;
    price?: number;
    query?: string;
    timestamp: Date;
}

interface LearnedPreference {
    key: string;
    value: number;
    confidence: number;
    sampleSize: number;
}

export class PreferenceModel {
    private preferences: Map<string, UserPreference> = new Map();
    private activityBuffer: Map<string, UserActivity[]> = new Map();

    // Decay factor for older activities (older = less weight)
    private static DECAY_RATE = 0.95;
    // Minimum activities before making predictions
    private static MIN_ACTIVITIES = 5;
    // Maximum activities to consider
    private static MAX_HISTORY = 1000;

    /**
     * Initialize or get user preferences
     */
    async getPreferences(userId: string): Promise<UserPreference> {
        if (!this.preferences.has(userId)) {
            // Load from database or create default
            this.preferences.set(userId, this.createDefaultPreferences(userId));
        }
        return this.preferences.get(userId)!;
    }

    /**
     * Create default preferences for new users
     */
    private createDefaultPreferences(userId: string): UserPreference {
        return {
            userId,
            categoryAffinities: new Map(),
            brandAffinities: new Map(),
            priceSensitivity: 0.5,
            priceRanges: new Map(),
            dealScoreThreshold: 75,
            notificationPreferences: {
                email: true,
                push: true,
                sms: false,
                frequency: 'instant',
            },
            shoppingPatterns: {
                preferredDayOfWeek: [0, 1, 2, 3, 4, 5, 6],
                preferredTimeOfDay: ['morning', 'afternoon', 'evening'],
                averageTimeBetweenPurchases: 30,
                averageSpendPerPurchase: 100,
                impulseBuyerScore: 0.5,
            },
            updatedAt: new Date(),
        };
    }

    /**
     * Record user activity for learning
     */
    async recordActivity(userId: string, activity: UserActivity): Promise<void> {
        if (!this.activityBuffer.has(userId)) {
            this.activityBuffer.set(userId, []);
        }

        const buffer = this.activityBuffer.get(userId)!;
        buffer.push({ ...activity, timestamp: new Date() });

        // Trim old activities
        if (buffer.length > PreferenceModel.MAX_HISTORY) {
            buffer.shift();
        }

        // Re-learn preferences after significant activity
        if (buffer.length % 10 === 0) {
            await this.learnPreferences(userId);
        }
    }

    /**
     * Learn preferences from activity history
     */
    async learnPreferences(userId: string): Promise<void> {
        const activities = this.activityBuffer.get(userId) || [];
        if (activities.length < PreferenceModel.MIN_ACTIVITIES) return;

        const prefs = await this.getPreferences(userId);

        // Learn category affinities
        prefs.categoryAffinities = this.learnAffinities(
            activities.filter(a => a.category),
            'category'
        );

        // Learn brand affinities
        prefs.brandAffinities = this.learnAffinities(
            activities.filter(a => a.brand),
            'brand'
        );

        // Learn price sensitivity
        prefs.priceSensitivity = this.learnPriceSensitivity(activities);

        // Learn price ranges by category
        prefs.priceRanges = this.learnPriceRanges(activities);

        // Learn shopping patterns
        prefs.shoppingPatterns = this.learnShoppingPatterns(activities);

        prefs.updatedAt = new Date();
    }

    /**
     * Learn affinities from activities with time decay
     */
    private learnAffinities(
        activities: UserActivity[],
        key: 'category' | 'brand'
    ): Map<string, number> {
        const scores = new Map<string, { weighted: number; count: number }>();
        const now = Date.now();

        // Weight by recency and action type
        const actionWeights = {
            purchase: 1.0,
            save: 0.7,
            click: 0.4,
            view: 0.2,
            search: 0.3,
            dismiss: -0.3,
        };

        activities.forEach(activity => {
            const value = activity[key];
            if (!value) return;

            // Calculate time decay
            const ageInDays = (now - activity.timestamp.getTime()) / (1000 * 60 * 60 * 24);
            const decay = Math.pow(PreferenceModel.DECAY_RATE, ageInDays);

            // Get action weight
            const weight = actionWeights[activity.type] * decay;

            if (!scores.has(value)) {
                scores.set(value, { weighted: 0, count: 0 });
            }

            const current = scores.get(value)!;
            current.weighted += weight;
            current.count += 1;
        });

        // Normalize to 0-1 scale
        const affinities = new Map<string, number>();
        const maxScore = Math.max(...Array.from(scores.values()).map(s => s.weighted));

        scores.forEach((score, key) => {
            affinities.set(key, Math.max(0, Math.min(1, score.weighted / (maxScore || 1))));
        });

        return affinities;
    }

    /**
     * Learn price sensitivity from purchase behavior
     */
    private learnPriceSensitivity(activities: UserActivity[]): number {
        const purchases = activities.filter(a => a.type === 'purchase' && a.price);
        const saves = activities.filter(a => a.type === 'save' && a.price);

        if (purchases.length < 2) return 0.5;

        // Users who wait for deals are more price sensitive
        const avgSavePrice = saves.length > 0
            ? saves.reduce((acc, s) => acc + (s.price || 0), 0) / saves.length
            : 0;
        const avgPurchasePrice = purchases.reduce((acc, p) => acc + (p.price || 0), 0) / purchases.length;

        // If users save more expensive items but buy cheaper, they're price sensitive
        if (avgSavePrice > avgPurchasePrice * 1.5) return 0.8;
        if (avgSavePrice > avgPurchasePrice) return 0.6;

        return 0.4;
    }

    /**
     * Learn price ranges by category
     */
    private learnPriceRanges(activities: UserActivity[]): Map<string, { min: number; max: number }> {
        const ranges = new Map<string, { min: number; max: number }>();
        const pricesByCategory = new Map<string, number[]>();

        activities
            .filter(a => a.category && a.price && ['purchase', 'save', 'click'].includes(a.type))
            .forEach(a => {
                if (!pricesByCategory.has(a.category!)) {
                    pricesByCategory.set(a.category!, []);
                }
                pricesByCategory.get(a.category!)!.push(a.price!);
            });

        pricesByCategory.forEach((prices, category) => {
            if (prices.length < 2) return;

            prices.sort((a, b) => a - b);
            // Use 10th and 90th percentile to avoid outliers
            const p10 = prices[Math.floor(prices.length * 0.1)];
            const p90 = prices[Math.floor(prices.length * 0.9)];

            ranges.set(category, { min: p10, max: p90 });
        });

        return ranges;
    }

    /**
     * Learn shopping patterns
     */
    private learnShoppingPatterns(activities: UserActivity[]): ShoppingPatterns {
        const purchases = activities.filter(a => a.type === 'purchase');

        // Preferred days
        const dayFreq = new Array(7).fill(0);
        // Preferred times
        const timeFreq = { morning: 0, afternoon: 0, evening: 0 };

        activities.forEach(a => {
            const day = a.timestamp.getDay();
            const hour = a.timestamp.getHours();

            dayFreq[day]++;

            if (hour >= 6 && hour < 12) timeFreq.morning++;
            else if (hour >= 12 && hour < 18) timeFreq.afternoon++;
            else timeFreq.evening++;
        });

        // Find preferred days (above average)
        const avgDayFreq = dayFreq.reduce((a, b) => a + b, 0) / 7;
        const preferredDays = dayFreq
            .map((freq, day) => ({ day, freq }))
            .filter(d => d.freq > avgDayFreq * 0.8)
            .map(d => d.day);

        // Find preferred times
        const totalTimeFreq = Object.values(timeFreq).reduce((a, b) => a + b, 0) || 1;
        const preferredTimes = Object.entries(timeFreq)
            .filter(([_, freq]) => freq / totalTimeFreq > 0.2)
            .map(([time]) => time);

        // Calculate purchase patterns
        const purchaseTimes = purchases.map(p => p.timestamp.getTime()).sort();
        const gaps = purchaseTimes.slice(1).map((t, i) => t - purchaseTimes[i]);
        const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 30 * 24 * 60 * 60 * 1000;

        const avgSpend = purchases.length > 0
            ? purchases.reduce((acc, p) => acc + (p.price || 0), 0) / purchases.length
            : 100;

        // Impulse buyer score: quick decisions, high variance in categories
        const uniqueCategories = new Set(activities.map(a => a.category)).size;
        const impulseBuyerScore = Math.min(1, uniqueCategories / 10);

        return {
            preferredDayOfWeek: preferredDays.length > 0 ? preferredDays : [0, 1, 2, 3, 4, 5, 6],
            preferredTimeOfDay: preferredTimes.length > 0 ? preferredTimes : ['morning', 'afternoon', 'evening'],
            averageTimeBetweenPurchases: avgGap / (24 * 60 * 60 * 1000),
            averageSpendPerPurchase: avgSpend,
            impulseBuyerScore,
        };
    }

    /**
     * Check if a deal matches user preferences
     */
    async matchesDeal(
        userId: string,
        deal: {
            category: string;
            brand: string;
            price: number;
            dealScore: number;
        }
    ): Promise<{ matches: boolean; confidence: number; reasons: string[] }> {
        const prefs = await this.getPreferences(userId);
        const reasons: string[] = [];
        let score = 0;
        let maxScore = 0;

        // Category match
        maxScore += 30;
        const categoryAffinity = prefs.categoryAffinities.get(deal.category) || 0;
        if (categoryAffinity > 0.5) {
            score += 30 * categoryAffinity;
            reasons.push(`Strong interest in ${deal.category}`);
        } else if (categoryAffinity > 0.2) {
            score += 15 * categoryAffinity;
            reasons.push(`Some interest in ${deal.category}`);
        }

        // Brand match
        maxScore += 20;
        const brandAffinity = prefs.brandAffinities.get(deal.brand) || 0;
        if (brandAffinity > 0.5) {
            score += 20 * brandAffinity;
            reasons.push(`Favorite brand: ${deal.brand}`);
        }

        // Price range match
        maxScore += 25;
        const priceRange = prefs.priceRanges.get(deal.category);
        if (priceRange) {
            if (deal.price >= priceRange.min && deal.price <= priceRange.max) {
                score += 25;
                reasons.push('Within your typical price range');
            } else if (deal.price < priceRange.min) {
                score += 20;
                reasons.push('Below your typical spend - great value!');
            }
        }

        // Deal score threshold
        maxScore += 25;
        if (deal.dealScore >= prefs.dealScoreThreshold) {
            score += 25;
            reasons.push(`Deal score ${deal.dealScore} meets your threshold`);
        }

        const confidence = maxScore > 0 ? score / maxScore : 0;

        return {
            matches: confidence >= 0.5,
            confidence,
            reasons,
        };
    }

    /**
     * Get top categories for a user
     */
    async getTopCategories(userId: string, limit = 5): Promise<string[]> {
        const prefs = await this.getPreferences(userId);
        return Array.from(prefs.categoryAffinities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([category]) => category);
    }

    /**
     * Get suggested searches based on preferences
     */
    async getSuggestedSearches(userId: string): Promise<string[]> {
        const prefs = await this.getPreferences(userId);
        const suggestions: string[] = [];

        // Top categories
        const topCategories = Array.from(prefs.categoryAffinities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // Top brands
        const topBrands = Array.from(prefs.brandAffinities.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3);

        // Combine into search suggestions
        topCategories.forEach(([cat]) => suggestions.push(cat));
        topBrands.forEach(([brand]) => suggestions.push(brand));

        // Category + brand combinations
        if (topCategories.length > 0 && topBrands.length > 0) {
            suggestions.push(`${topBrands[0][0]} ${topCategories[0][0]}`);
        }

        return [...new Set(suggestions)].slice(0, 6);
    }

    /**
     * Export preferences for storage
     */
    exportPreferences(userId: string): object | null {
        const prefs = this.preferences.get(userId);
        if (!prefs) return null;

        return {
            ...prefs,
            categoryAffinities: Object.fromEntries(prefs.categoryAffinities),
            brandAffinities: Object.fromEntries(prefs.brandAffinities),
            priceRanges: Object.fromEntries(prefs.priceRanges),
        };
    }

    /**
     * Import preferences from storage
     */
    importPreferences(userId: string, data: any): void {
        const prefs: UserPreference = {
            ...data,
            categoryAffinities: new Map(Object.entries(data.categoryAffinities || {})),
            brandAffinities: new Map(Object.entries(data.brandAffinities || {})),
            priceRanges: new Map(Object.entries(data.priceRanges || {})),
            updatedAt: new Date(data.updatedAt),
        };
        this.preferences.set(userId, prefs);
    }
}

// Singleton instance
export const preferenceModel = new PreferenceModel();
