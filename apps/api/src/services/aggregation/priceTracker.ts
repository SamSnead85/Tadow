/**
 * PriceTracker Service - Real-Time Price Intelligence
 * 
 * Tracks price history, detects drops, and predicts future pricing.
 * Provides CamelCamelCamel/Keepa-like functionality.
 */

interface PriceRecord {
    price: number;
    recordedAt: Date;
    source?: string;
}

interface PriceStats {
    current: number;
    average30d: number;
    average90d: number;
    lowest: number;
    lowestDate: Date | null;
    highest: number;
    highestDate: Date | null;
    priceChangePercent30d: number;
    priceChangePercent7d: number;
    isAtAllTimeLow: boolean;
    buyRecommendation: 'buy_now' | 'good_price' | 'wait' | 'avoid';
    confidence: number; // 0-100
}

interface PricePrediction {
    predictedDirection: 'up' | 'down' | 'stable';
    predictedChangePercent: number;
    confidence: number;
    reasoning: string;
    suggestedWaitDays: number;
}

export class PriceTracker {
    /**
     * Analyze price history and generate stats
     */
    public analyzeHistory(currentPrice: number, history: PriceRecord[]): PriceStats {
        if (history.length === 0) {
            return {
                current: currentPrice,
                average30d: currentPrice,
                average90d: currentPrice,
                lowest: currentPrice,
                lowestDate: null,
                highest: currentPrice,
                highestDate: null,
                priceChangePercent30d: 0,
                priceChangePercent7d: 0,
                isAtAllTimeLow: true,
                buyRecommendation: 'wait', // Not enough data
                confidence: 20,
            };
        }

        const now = new Date();
        const day30Ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const day90Ago = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        const day7Ago = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

        const history30d = history.filter(h => h.recordedAt >= day30Ago);
        const history90d = history.filter(h => h.recordedAt >= day90Ago);
        const history7d = history.filter(h => h.recordedAt >= day7Ago);

        const prices = history.map(h => h.price);
        const prices30d = history30d.map(h => h.price);
        const prices90d = history90d.map(h => h.price);
        const prices7d = history7d.map(h => h.price);

        const lowest = Math.min(...prices);
        const highest = Math.max(...prices);
        const lowestRecord = history.find(h => h.price === lowest);
        const highestRecord = history.find(h => h.price === highest);

        const average30d = prices30d.length > 0
            ? prices30d.reduce((a, b) => a + b, 0) / prices30d.length
            : currentPrice;
        const average90d = prices90d.length > 0
            ? prices90d.reduce((a, b) => a + b, 0) / prices90d.length
            : currentPrice;

        const oldest30d = prices30d.length > 0 ? prices30d[0] : currentPrice;
        const oldest7d = prices7d.length > 0 ? prices7d[0] : currentPrice;

        const priceChangePercent30d = ((currentPrice - oldest30d) / oldest30d) * 100;
        const priceChangePercent7d = ((currentPrice - oldest7d) / oldest7d) * 100;

        const isAtAllTimeLow = currentPrice <= lowest * 1.02; // Within 2% of lowest

        // Calculate buy recommendation
        const buyRecommendation = this.getBuyRecommendation(
            currentPrice,
            average30d,
            lowest,
            isAtAllTimeLow
        );

        // Confidence based on data points
        const confidence = Math.min(100, 20 + history.length * 5);

        return {
            current: currentPrice,
            average30d,
            average90d,
            lowest,
            lowestDate: lowestRecord?.recordedAt ?? null,
            highest,
            highestDate: highestRecord?.recordedAt ?? null,
            priceChangePercent30d,
            priceChangePercent7d,
            isAtAllTimeLow,
            buyRecommendation,
            confidence,
        };
    }

    /**
     * Predict future price movement
     * Uses simple trend analysis and seasonal patterns
     */
    public predictPrice(history: PriceRecord[], category?: string): PricePrediction {
        if (history.length < 7) {
            return {
                predictedDirection: 'stable',
                predictedChangePercent: 0,
                confidence: 10,
                reasoning: 'Insufficient price history for prediction',
                suggestedWaitDays: 0,
            };
        }

        // Analyze recent trend (last 7 days)
        const recent7d = history.slice(-7);
        const recentPrices = recent7d.map(h => h.price);
        const recentTrend = this.calculateTrend(recentPrices);

        // Analyze medium-term trend (last 30 days)
        const recent30d = history.slice(-30);
        const mediumPrices = recent30d.map(h => h.price);
        const mediumTrend = this.calculateTrend(mediumPrices);

        // Check for seasonal patterns (holiday sales, Prime Day, Black Friday)
        const seasonalFactor = this.getSeasonalFactor(category);

        // Calculate prediction
        let predictedDirection: 'up' | 'down' | 'stable';
        let predictedChangePercent: number;
        let confidence: number;
        let reasoning: string;
        let suggestedWaitDays: number;

        if (recentTrend < -2 && mediumTrend < -1) {
            // Consistent downward trend
            predictedDirection = 'down';
            predictedChangePercent = Math.abs(recentTrend) * 0.5;
            confidence = 60 + Math.min(20, history.length / 2);
            reasoning = 'Price has been consistently declining';
            suggestedWaitDays = 7;
        } else if (recentTrend > 2 && mediumTrend > 1) {
            // Consistent upward trend
            predictedDirection = 'up';
            predictedChangePercent = recentTrend * 0.5;
            confidence = 55 + Math.min(15, history.length / 2);
            reasoning = 'Price has been increasing - may want to buy soon';
            suggestedWaitDays = 0;
        } else if (seasonalFactor.approaching) {
            // Major sale event approaching
            predictedDirection = 'down';
            predictedChangePercent = seasonalFactor.expectedDiscount;
            confidence = 70;
            reasoning = `${seasonalFactor.event} is approaching - prices typically drop`;
            suggestedWaitDays = seasonalFactor.daysAway;
        } else {
            // Stable or mixed signals
            predictedDirection = 'stable';
            predictedChangePercent = 0;
            confidence = 40;
            reasoning = 'Price appears stable';
            suggestedWaitDays = 0;
        }

        return {
            predictedDirection,
            predictedChangePercent,
            confidence,
            reasoning,
            suggestedWaitDays,
        };
    }

    /**
     * Calculate price trend as percentage change per day
     */
    private calculateTrend(prices: number[]): number {
        if (prices.length < 2) return 0;

        const firstPrice = prices[0];
        const lastPrice = prices[prices.length - 1];
        const days = prices.length;

        return ((lastPrice - firstPrice) / firstPrice) * 100 / days;
    }

    /**
     * Check for approaching major sale events
     */
    private getSeasonalFactor(category?: string): {
        approaching: boolean;
        event: string;
        daysAway: number;
        expectedDiscount: number;
    } {
        const now = new Date();
        const month = now.getMonth();
        const day = now.getDate();

        // Major sale events (approximate dates)
        const saleEvents = [
            { name: 'Black Friday', month: 10, day: 25, window: 10, discount: 25 },
            { name: 'Cyber Monday', month: 10, day: 28, window: 7, discount: 20 },
            { name: 'Prime Day', month: 6, day: 15, window: 14, discount: 20 },
            { name: 'Memorial Day', month: 4, day: 25, window: 7, discount: 15 },
            { name: 'Labor Day', month: 8, day: 1, window: 7, discount: 15 },
        ];

        for (const event of saleEvents) {
            const eventDate = new Date(now.getFullYear(), event.month, event.day);
            const diffDays = Math.floor((eventDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));

            if (diffDays > 0 && diffDays <= event.window) {
                return {
                    approaching: true,
                    event: event.name,
                    daysAway: diffDays,
                    expectedDiscount: event.discount,
                };
            }
        }

        return {
            approaching: false,
            event: '',
            daysAway: 0,
            expectedDiscount: 0,
        };
    }

    /**
     * Get buy recommendation based on price analysis
     */
    private getBuyRecommendation(
        current: number,
        avg30d: number,
        lowest: number,
        isAtAllTimeLow: boolean
    ): 'buy_now' | 'good_price' | 'wait' | 'avoid' {
        if (isAtAllTimeLow) return 'buy_now';

        const vsAvg = ((current - avg30d) / avg30d) * 100;
        const vsLow = ((current - lowest) / lowest) * 100;

        if (vsAvg <= -15 && vsLow <= 5) return 'buy_now';
        if (vsAvg <= -5) return 'good_price';
        if (vsAvg <= 5) return 'wait';
        return 'avoid';
    }

    /**
     * Generate price chart data points for visualization
     */
    public generateChartData(history: PriceRecord[], days: number = 90): {
        labels: string[];
        prices: number[];
        average: number;
    } {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);

        const filtered = history.filter(h => h.recordedAt >= cutoff);
        const sorted = filtered.sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime());

        const labels = sorted.map(h => h.recordedAt.toISOString().split('T')[0]);
        const prices = sorted.map(h => h.price);
        const average = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

        return { labels, prices, average };
    }
}

// Export singleton instance
export const priceTracker = new PriceTracker();
