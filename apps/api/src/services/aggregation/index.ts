/**
 * Aggregation Services - Deal Intelligence Engine
 * 
 * Central export for all deal aggregation services:
 * - DealScorer: AI-powered deal quality scoring
 * - PriceTracker: Price history and prediction
 * - AffiliateConnector: Multi-network API integration
 * - DealNormalizer: Data normalization and deduplication
 * - AIAssistant: Conversational shopping intelligence
 * - WebScraper: Intelligent deal extraction
 * - RSSAggregator: Feed collection
 * - JobScheduler: Continuous processing
 * - DealSubmission: User-generated content
 */

export { DealScorer, dealScorer } from './dealScorer';
export { PriceTracker, priceTracker } from './priceTracker';
export {
    AffiliateManager,
    affiliateManager,
    AmazonConnector,
    RakutenConnector,
    CJConnector,
    EbayConnector,
    WalmartConnector,
    BestBuyConnector,
    type AffiliateConfig,
    type AffiliateDeal,
} from './affiliateConnector';
export { DealNormalizer, dealNormalizer, type NormalizedDeal } from './dealNormalizer';
export { AIAssistant, aiAssistant, type ChatMessage, type AssistantResponse } from './aiAssistant';
export { WebScraper, webScraper, SCRAPER_CONFIGS } from './webScraper';
export { RSSAggregator, rssAggregator, RSS_FEEDS } from './rssAggregator';
export { JobScheduler, jobScheduler } from './jobScheduler';
export { DealSubmissionService, dealSubmissionService, type DealSubmission, type UserStats } from './dealSubmission';

/**
 * Aggregation Pipeline - Orchestrates the full deal processing flow
 */
import { affiliateManager, AffiliateDeal } from './affiliateConnector';
import { dealNormalizer, NormalizedDeal } from './dealNormalizer';
import { dealScorer } from './dealScorer';
import { priceTracker } from './priceTracker';

export interface ProcessedDeal extends NormalizedDeal {
    aiScore: number;
    aiVerdict: string;
    recommendation: 'buy_now' | 'wait' | 'skip';
    insights: string[];
    priceStats?: {
        isAtAllTimeLow: boolean;
        buyRecommendation: string;
    };
}

export class AggregationPipeline {
    /**
     * Full pipeline: Fetch → Normalize → Score → Enrich
     */
    async processDeals(query?: string, category?: string): Promise<ProcessedDeal[]> {
        console.log('[AggregationPipeline] Starting deal processing...');

        // 1. Fetch from all affiliate networks
        let rawDeals: AffiliateDeal[];
        if (query) {
            rawDeals = await affiliateManager.searchAllNetworks(query, category);
        } else {
            rawDeals = await affiliateManager.getAllHotDeals();
        }
        console.log(`[AggregationPipeline] Fetched ${rawDeals.length} raw deals`);

        // 2. Normalize all deals
        const normalizedDeals = rawDeals.map(deal => dealNormalizer.normalize(deal));
        console.log(`[AggregationPipeline] Normalized ${normalizedDeals.length} deals`);

        // 3. Deduplicate
        const uniqueDeals = dealNormalizer.deduplicateDeals(normalizedDeals);
        console.log(`[AggregationPipeline] ${uniqueDeals.length} unique deals after deduplication`);

        // 4. Score and enrich each deal
        const processedDeals: ProcessedDeal[] = uniqueDeals.map(deal => {
            const scoreResult = dealScorer.scoreDeal({
                id: deal.id,
                title: deal.normalizedTitle,
                currentPrice: deal.currentPrice,
                originalPrice: deal.originalPrice,
                discountPercent: deal.discountPercent,
                category: deal.category,
                brand: deal.brand,
                marketplace: deal.marketplace,
                reviewScore: deal.rating,
                reviewCount: deal.reviewCount,
            });

            return {
                ...deal,
                aiScore: scoreResult.totalScore,
                aiVerdict: scoreResult.verdictText,
                recommendation: scoreResult.recommendation,
                insights: scoreResult.insights,
            };
        });

        // 5. Sort by AI score
        processedDeals.sort((a, b) => b.aiScore - a.aiScore);

        console.log(`[AggregationPipeline] Processed ${processedDeals.length} deals`);
        return processedDeals;
    }

    /**
     * Get top deals across all categories
     */
    async getTopDeals(limit: number = 20): Promise<ProcessedDeal[]> {
        const allDeals = await this.processDeals();
        return allDeals.slice(0, limit);
    }

    /**
     * Search for deals
     */
    async searchDeals(query: string, category?: string): Promise<ProcessedDeal[]> {
        return this.processDeals(query, category);
    }

    /**
     * Get deals by category
     */
    async getDealsByCategory(category: string): Promise<ProcessedDeal[]> {
        const allDeals = await this.processDeals();
        return allDeals.filter(deal =>
            deal.category.toLowerCase().includes(category.toLowerCase())
        );
    }
}

// Export singleton pipeline
export const aggregationPipeline = new AggregationPipeline();
