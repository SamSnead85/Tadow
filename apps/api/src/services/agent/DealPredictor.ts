/**
 * Deal Predictor - Price Forecasting & Buy Recommendations
 * 
 * AI-powered predictions for future prices, stock availability,
 * and "buy now vs wait" recommendations.
 */

interface PricePoint {
    price: number;
    date: Date;
}

interface PricePrediction {
    dealId: string;
    currentPrice: number;
    // Predicted prices
    predictedPrice7d: number;
    predictedPrice30d: number;
    predictedPrice90d: number;
    // Confidence levels (0-1)
    confidence7d: number;
    confidence30d: number;
    confidence90d: number;
    // Direction
    trend: 'rising' | 'falling' | 'stable';
    trendStrength: number; // 0-1
    // Recommendation
    recommendation: 'buy_now' | 'wait' | 'risky' | 'uncertain';
    recommendationReasons: string[];
    // Risk assessment
    sellOutRisk: 'low' | 'medium' | 'high';
    sellOutProbability: number;
    // Historical accuracy
    modelAccuracy: number;
    // Timing
    bestBuyWindow: { start: Date; end: Date } | null;
    nextPriceDrop: { date: Date; expectedPrice: number } | null;
}

interface SeasonalPattern {
    month: number;
    priceMultiplier: number; // 1.0 = average, <1 = cheaper, >1 = expensive
    description: string;
}

interface CategorySeasonality {
    category: string;
    patterns: SeasonalPattern[];
    bestMonths: number[];
    worstMonths: number[];
}

export class DealPredictor {
    // Known seasonal patterns
    private static SEASONAL_PATTERNS: CategorySeasonality[] = [
        {
            category: 'Electronics',
            patterns: [
                { month: 1, priceMultiplier: 0.85, description: 'Post-holiday clearance' },
                { month: 2, priceMultiplier: 0.90, description: 'Presidents Day sales' },
                { month: 3, priceMultiplier: 0.95, description: 'Normal pricing' },
                { month: 4, priceMultiplier: 0.95, description: 'Normal pricing' },
                { month: 5, priceMultiplier: 0.88, description: 'Memorial Day sales' },
                { month: 6, priceMultiplier: 0.92, description: 'Father\'s Day deals' },
                { month: 7, priceMultiplier: 0.87, description: 'Prime Day/Summer sales' },
                { month: 8, priceMultiplier: 0.90, description: 'Back to school' },
                { month: 9, priceMultiplier: 0.95, description: 'New model launches' },
                { month: 10, priceMultiplier: 1.00, description: 'Pre-holiday buildup' },
                { month: 11, priceMultiplier: 0.75, description: 'Black Friday/Cyber Monday' },
                { month: 12, priceMultiplier: 0.88, description: 'Holiday sales' },
            ],
            bestMonths: [11, 7, 1],
            worstMonths: [10, 9],
        },
        {
            category: 'Laptops',
            patterns: [
                { month: 1, priceMultiplier: 0.82, description: 'CES announcements, old models discounted' },
                { month: 7, priceMultiplier: 0.85, description: 'Back to school begins' },
                { month: 8, priceMultiplier: 0.88, description: 'Peak back to school' },
                { month: 11, priceMultiplier: 0.78, description: 'Black Friday best prices' },
            ],
            bestMonths: [11, 1, 7],
            worstMonths: [10, 3],
        },
        {
            category: 'Gaming',
            patterns: [
                { month: 6, priceMultiplier: 0.88, description: 'E3/Summer Game Fest deals' },
                { month: 11, priceMultiplier: 0.80, description: 'Black Friday bundles' },
                { month: 12, priceMultiplier: 0.90, description: 'Holiday bundles' },
            ],
            bestMonths: [11, 6, 12],
            worstMonths: [9, 10],
        },
        {
            category: 'TVs',
            patterns: [
                { month: 1, priceMultiplier: 0.80, description: 'Post-Super Bowl clearance coming' },
                { month: 2, priceMultiplier: 0.75, description: 'Super Bowl TV deals' },
                { month: 11, priceMultiplier: 0.78, description: 'Black Friday best prices' },
            ],
            bestMonths: [2, 11, 1],
            worstMonths: [3, 4, 9],
        },
    ];

    // Model accuracy tracking (simulated historical accuracy)
    private modelAccuracy = 0.82;

    /**
     * Generate price prediction for a deal
     */
    async predictPrice(deal: {
        id: string;
        title: string;
        category: string;
        brand: string;
        currentPrice: number;
        originalPrice: number;
        priceHistory?: PricePoint[];
        dealScore: number;
        isAllTimeLow: boolean;
        views?: number;
    }): Promise<PricePrediction> {
        const now = new Date();

        // Analyze price history
        const historyAnalysis = this.analyzePriceHistory(deal.priceHistory || []);

        // Get seasonal factors
        const seasonality = this.getSeasonalFactor(deal.category);

        // Calculate trend
        const trend = this.calculateTrend(historyAnalysis, seasonality);

        // Predict future prices
        const predicted7d = this.predictFuturePrice(deal.currentPrice, 7, trend, seasonality);
        const predicted30d = this.predictFuturePrice(deal.currentPrice, 30, trend, seasonality);
        const predicted90d = this.predictFuturePrice(deal.currentPrice, 90, trend, seasonality);

        // Calculate sellout risk
        const sellOutRisk = this.calculateSellOutRisk(deal);

        // Generate recommendation
        const recommendation = this.generateRecommendation(
            deal,
            trend,
            predicted30d,
            sellOutRisk,
            seasonality
        );

        // Find best buy window
        const bestBuyWindow = this.findBestBuyWindow(deal.category, seasonality);

        // Predict next price drop
        const nextPriceDrop = this.predictNextPriceDrop(
            deal.currentPrice,
            historyAnalysis.averageDropPercent,
            seasonality
        );

        return {
            dealId: deal.id,
            currentPrice: deal.currentPrice,
            predictedPrice7d: predicted7d.price,
            predictedPrice30d: predicted30d.price,
            predictedPrice90d: predicted90d.price,
            confidence7d: predicted7d.confidence,
            confidence30d: predicted30d.confidence,
            confidence90d: predicted90d.confidence,
            trend: trend.direction,
            trendStrength: trend.strength,
            recommendation: recommendation.type,
            recommendationReasons: recommendation.reasons,
            sellOutRisk: sellOutRisk.level,
            sellOutProbability: sellOutRisk.probability,
            modelAccuracy: this.modelAccuracy,
            bestBuyWindow,
            nextPriceDrop,
        };
    }

    /**
     * Analyze historical price data
     */
    private analyzePriceHistory(history: PricePoint[]): {
        volatility: number;
        averageDropPercent: number;
        averageDropFrequency: number;
        lowestPrice: number;
        highestPrice: number;
        priceRange: number;
    } {
        if (history.length < 2) {
            return {
                volatility: 0.1,
                averageDropPercent: 10,
                averageDropFrequency: 30,
                lowestPrice: history[0]?.price || 0,
                highestPrice: history[0]?.price || 0,
                priceRange: 0,
            };
        }

        const prices = history.map(h => h.price);
        const lowestPrice = Math.min(...prices);
        const highestPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        // Calculate volatility (standard deviation / mean)
        const variance = prices.reduce((acc, p) => acc + Math.pow(p - avgPrice, 2), 0) / prices.length;
        const volatility = Math.sqrt(variance) / avgPrice;

        // Calculate average drop
        let drops: number[] = [];
        for (let i = 1; i < prices.length; i++) {
            if (prices[i] < prices[i - 1]) {
                drops.push((prices[i - 1] - prices[i]) / prices[i - 1] * 100);
            }
        }
        const averageDropPercent = drops.length > 0
            ? drops.reduce((a, b) => a + b, 0) / drops.length
            : 10;

        // Calculate drop frequency (days between drops)
        const dropIndices = history
            .map((h, i) => ({ h, i }))
            .filter(({ h, i }) => i > 0 && h.price < history[i - 1].price)
            .map(({ i }) => i);

        let averageDropFrequency = 30;
        if (dropIndices.length >= 2) {
            const daysBetweenDrops = dropIndices
                .slice(1)
                .map((idx, i) => {
                    const prevDate = history[dropIndices[i]].date;
                    const currDate = history[idx].date;
                    return (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
                });
            averageDropFrequency = daysBetweenDrops.reduce((a, b) => a + b, 0) / daysBetweenDrops.length;
        }

        return {
            volatility,
            averageDropPercent,
            averageDropFrequency,
            lowestPrice,
            highestPrice,
            priceRange: highestPrice - lowestPrice,
        };
    }

    /**
     * Get seasonal factor for a category
     */
    private getSeasonalFactor(category: string): {
        currentMultiplier: number;
        nextMonthMultiplier: number;
        in3MonthsMultiplier: number;
        isBestMonth: boolean;
        nearBestMonth: boolean;
        seasonality: CategorySeasonality | null;
    } {
        const now = new Date();
        const currentMonth = now.getMonth() + 1;
        const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
        const in3Months = ((currentMonth + 2) % 12) + 1;

        // Find category-specific patterns or use default
        const seasonality = DealPredictor.SEASONAL_PATTERNS.find(
            s => s.category.toLowerCase() === category.toLowerCase()
        ) || DealPredictor.SEASONAL_PATTERNS[0]; // Default to Electronics

        const currentPattern = seasonality.patterns.find(p => p.month === currentMonth);
        const nextPattern = seasonality.patterns.find(p => p.month === nextMonth);
        const future3Pattern = seasonality.patterns.find(p => p.month === in3Months);

        return {
            currentMultiplier: currentPattern?.priceMultiplier || 1.0,
            nextMonthMultiplier: nextPattern?.priceMultiplier || 1.0,
            in3MonthsMultiplier: future3Pattern?.priceMultiplier || 1.0,
            isBestMonth: seasonality.bestMonths.includes(currentMonth),
            nearBestMonth: seasonality.bestMonths.includes(nextMonth),
            seasonality,
        };
    }

    /**
     * Calculate price trend
     */
    private calculateTrend(
        history: ReturnType<typeof this.analyzePriceHistory>,
        seasonality: ReturnType<typeof this.getSeasonalFactor>
    ): { direction: 'rising' | 'falling' | 'stable'; strength: number } {
        // If currently in a good buying month and next month is worse
        if (seasonality.currentMultiplier < 0.9 && seasonality.nextMonthMultiplier > seasonality.currentMultiplier) {
            return { direction: 'rising', strength: 0.7 };
        }

        // If next month is much better
        if (seasonality.nextMonthMultiplier < seasonality.currentMultiplier * 0.95) {
            return { direction: 'falling', strength: 0.6 };
        }

        // High volatility = unstable
        if (history.volatility > 0.2) {
            return { direction: 'falling', strength: 0.3 };
        }

        return { direction: 'stable', strength: 0.5 };
    }

    /**
     * Predict future price
     */
    private predictFuturePrice(
        currentPrice: number,
        daysAhead: number,
        trend: { direction: 'rising' | 'falling' | 'stable'; strength: number },
        seasonality: ReturnType<typeof this.getSeasonalFactor>
    ): { price: number; confidence: number } {
        let priceMultiplier = 1.0;

        // Apply trend
        if (trend.direction === 'falling') {
            priceMultiplier -= trend.strength * 0.1 * (daysAhead / 30);
        } else if (trend.direction === 'rising') {
            priceMultiplier += trend.strength * 0.1 * (daysAhead / 30);
        }

        // Apply seasonality
        if (daysAhead <= 30) {
            priceMultiplier *= seasonality.nextMonthMultiplier / seasonality.currentMultiplier;
        } else {
            priceMultiplier *= seasonality.in3MonthsMultiplier / seasonality.currentMultiplier;
        }

        // Confidence decreases with time
        const baseConfidence = 0.85;
        const confidence = Math.max(0.3, baseConfidence - (daysAhead / 200));

        return {
            price: Math.round(currentPrice * priceMultiplier * 100) / 100,
            confidence,
        };
    }

    /**
     * Calculate sellout risk
     */
    private calculateSellOutRisk(deal: {
        dealScore: number;
        isAllTimeLow: boolean;
        views?: number;
    }): { level: 'low' | 'medium' | 'high'; probability: number } {
        let riskScore = 0;

        // High deal score = higher demand
        if (deal.dealScore >= 90) riskScore += 0.3;
        else if (deal.dealScore >= 80) riskScore += 0.2;

        // All-time low = higher demand
        if (deal.isAllTimeLow) riskScore += 0.25;

        // High views = higher demand
        if (deal.views && deal.views > 5000) riskScore += 0.25;
        else if (deal.views && deal.views > 1000) riskScore += 0.15;

        // Classify risk level
        let level: 'low' | 'medium' | 'high';
        if (riskScore >= 0.6) level = 'high';
        else if (riskScore >= 0.3) level = 'medium';
        else level = 'low';

        return { level, probability: Math.min(0.95, riskScore) };
    }

    /**
     * Generate buy recommendation
     */
    private generateRecommendation(
        deal: { currentPrice: number; dealScore: number; isAllTimeLow: boolean },
        trend: { direction: 'rising' | 'falling' | 'stable'; strength: number },
        predicted30d: { price: number; confidence: number },
        sellOutRisk: { level: 'low' | 'medium' | 'high'; probability: number },
        seasonality: ReturnType<typeof this.getSeasonalFactor>
    ): { type: 'buy_now' | 'wait' | 'risky' | 'uncertain'; reasons: string[] } {
        const reasons: string[] = [];
        let buyNowScore = 0;

        // All-time low = strong buy signal
        if (deal.isAllTimeLow) {
            buyNowScore += 0.35;
            reasons.push('🎯 This is an ALL-TIME LOW price');
        }

        // High deal score
        if (deal.dealScore >= 90) {
            buyNowScore += 0.25;
            reasons.push('⭐ Exceptional deal score (90+)');
        }

        // In a good buying month
        if (seasonality.isBestMonth) {
            buyNowScore += 0.2;
            reasons.push('📅 This is historically one of the best months to buy');
        } else if (!seasonality.nearBestMonth) {
            buyNowScore -= 0.1;
        }

        // Price expected to rise
        if (trend.direction === 'rising') {
            buyNowScore += 0.2;
            reasons.push('📈 Price expected to increase soon');
        } else if (trend.direction === 'falling' && trend.strength > 0.5) {
            buyNowScore -= 0.2;
            reasons.push('📉 Price may drop further');
        }

        // Sell out risk
        if (sellOutRisk.level === 'high') {
            buyNowScore += 0.2;
            reasons.push('⚠️ High sell-out risk - popular item');
        }

        // Future price prediction
        if (predicted30d.price > deal.currentPrice * 1.05) {
            buyNowScore += 0.15;
            reasons.push(`💰 Price predicted to be ${Math.round((predicted30d.price / deal.currentPrice - 1) * 100)}% higher in 30 days`);
        } else if (predicted30d.price < deal.currentPrice * 0.95) {
            buyNowScore -= 0.15;
            reasons.push(`⏳ Price may drop ${Math.round((1 - predicted30d.price / deal.currentPrice) * 100)}% in 30 days`);
        }

        // Determine recommendation
        let type: 'buy_now' | 'wait' | 'risky' | 'uncertain';
        if (buyNowScore >= 0.6) {
            type = 'buy_now';
            reasons.unshift('✅ RECOMMENDED: Buy Now');
        } else if (buyNowScore <= 0.2) {
            type = 'wait';
            reasons.unshift('⏳ RECOMMENDED: Wait for Better Price');
        } else if (sellOutRisk.level === 'high' && buyNowScore < 0.5) {
            type = 'risky';
            reasons.unshift('⚡ DECISION: Buy Soon or Risk Missing Out');
        } else {
            type = 'uncertain';
            reasons.unshift('🤔 UNCERTAIN: Could go either way');
        }

        return { type, reasons };
    }

    /**
     * Find the best buying window
     */
    private findBestBuyWindow(
        category: string,
        seasonality: ReturnType<typeof this.getSeasonalFactor>
    ): { start: Date; end: Date } | null {
        if (!seasonality.seasonality) return null;

        const now = new Date();
        const currentMonth = now.getMonth() + 1;

        // Find next best month
        const sortedMonths = [...seasonality.seasonality.bestMonths].sort((a, b) => {
            const distA = a >= currentMonth ? a - currentMonth : 12 - currentMonth + a;
            const distB = b >= currentMonth ? b - currentMonth : 12 - currentMonth + b;
            return distA - distB;
        });

        const nextBestMonth = sortedMonths[0];
        if (nextBestMonth === currentMonth) {
            // Current month is best - buy now window
            const start = now;
            const end = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of month
            return { start, end };
        }

        // Calculate start of next best month
        let year = now.getFullYear();
        if (nextBestMonth < currentMonth) year++;

        const start = new Date(year, nextBestMonth - 1, 1);
        const end = new Date(year, nextBestMonth, 0);

        return { start, end };
    }

    /**
     * Predict next price drop
     */
    private predictNextPriceDrop(
        currentPrice: number,
        avgDropPercent: number,
        seasonality: ReturnType<typeof this.getSeasonalFactor>
    ): { date: Date; expectedPrice: number } | null {
        // If we're already in a great month, expect rise
        if (seasonality.isBestMonth) return null;

        // Find next month with lower multiplier
        if (seasonality.nextMonthMultiplier < seasonality.currentMultiplier) {
            const now = new Date();
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 15);
            const expectedDrop = (1 - seasonality.nextMonthMultiplier / seasonality.currentMultiplier);
            const expectedPrice = Math.round(currentPrice * (1 - expectedDrop) * 100) / 100;

            return { date: nextMonth, expectedPrice };
        }

        return null;
    }

    /**
     * Batch predict for multiple deals
     */
    async predictBatch(deals: Parameters<typeof this.predictPrice>[0][]): Promise<PricePrediction[]> {
        return Promise.all(deals.map(deal => this.predictPrice(deal)));
    }

    /**
     * Get "Buy Now vs Wait" summary
     */
    getBuyOrWaitSummary(prediction: PricePrediction): string {
        const emoji = {
            buy_now: '🟢',
            wait: '🟡',
            risky: '🟠',
            uncertain: '⚪',
        };

        return `${emoji[prediction.recommendation]} ${prediction.recommendationReasons[0]}`;
    }
}

// Singleton instance
export const dealPredictor = new DealPredictor();
