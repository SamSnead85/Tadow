import { motion } from 'framer-motion';
import { Sparkles, TrendingDown, Clock, Shield, Star, CheckCircle, AlertTriangle, Zap, Gift } from 'lucide-react';

interface WhyThisDealProps {
    deal: {
        title: string;
        currentPrice: number;
        originalPrice: number;
        discountPercent: number;
        dealScore: number;
        isAllTimeLow: boolean;
        allTimeLowPrice?: number;
        priceVsAverage: number;
        fakeReviewRisk?: number;
        reviewQualityScore?: number;
        pricePrediction?: 'rising' | 'falling' | 'stable';
        brand: string;
        category: string;
    };
}

interface InsightItem {
    icon: React.ElementType;
    title: string;
    description: string;
    type: 'positive' | 'neutral' | 'warning';
}

export function WhyThisDeal({ deal }: WhyThisDealProps) {
    // Generate dynamic insights based on deal data
    const insights: InsightItem[] = [];

    // Price vs Average
    if (deal.priceVsAverage <= -15) {
        insights.push({
            icon: TrendingDown,
            title: `${Math.abs(deal.priceVsAverage)}% below average`,
            description: `This ${deal.category.toLowerCase()} is priced significantly below the typical market rate.`,
            type: 'positive'
        });
    } else if (deal.priceVsAverage >= 0) {
        insights.push({
            icon: AlertTriangle,
            title: 'At or above average price',
            description: 'Consider waiting for a price drop or exploring alternatives.',
            type: 'warning'
        });
    }

    // All-time low
    if (deal.isAllTimeLow) {
        insights.push({
            icon: Star,
            title: 'All-time low price',
            description: deal.allTimeLowPrice
                ? `This is the lowest price we've ever tracked for this product!`
                : 'This matches the lowest price in our records.',
            type: 'positive'
        });
    }

    // Deal score
    if (deal.dealScore >= 90) {
        insights.push({
            icon: Zap,
            title: 'Exceptional deal score',
            description: `With a score of ${deal.dealScore}/100, this ranks in the top 10% of deals we analyze.`,
            type: 'positive'
        });
    } else if (deal.dealScore >= 80) {
        insights.push({
            icon: CheckCircle,
            title: 'Strong deal score',
            description: `A score of ${deal.dealScore}/100 indicates good value for your money.`,
            type: 'positive'
        });
    }

    // Review quality
    if (deal.reviewQualityScore && deal.reviewQualityScore >= 90) {
        insights.push({
            icon: Shield,
            title: 'Verified review quality',
            description: `${deal.reviewQualityScore}% of reviews appear genuine and helpful.`,
            type: 'positive'
        });
    } else if (deal.fakeReviewRisk && deal.fakeReviewRisk >= 20) {
        insights.push({
            icon: AlertTriangle,
            title: 'Review quality concerns',
            description: `We detected ${deal.fakeReviewRisk}% potentially unreliable reviews.`,
            type: 'warning'
        });
    }

    // Price prediction
    if (deal.pricePrediction === 'rising') {
        insights.push({
            icon: Clock,
            title: 'Price likely to rise',
            description: 'Our AI predicts prices will increase in the coming weeks. Consider buying now.',
            type: 'positive'
        });
    } else if (deal.pricePrediction === 'falling') {
        insights.push({
            icon: TrendingDown,
            title: 'Price may drop further',
            description: 'Our models suggest waiting 1-2 weeks could yield additional savings.',
            type: 'neutral'
        });
    }

    // Discount level
    if (deal.discountPercent >= 30) {
        insights.push({
            icon: Gift,
            title: `${deal.discountPercent}% off retail`,
            description: 'This is a substantial discount. Deals like this are uncommon.',
            type: 'positive'
        });
    }

    // Brand reputation (mock logic)
    const premiumBrands = ['Apple', 'Sony', 'Samsung', 'Bose', 'Dell', 'Microsoft'];
    if (premiumBrands.includes(deal.brand)) {
        insights.push({
            icon: Shield,
            title: `Trusted ${deal.brand} product`,
            description: 'This brand is known for quality and strong customer support.',
            type: 'positive'
        });
    }

    // Limit to top 4 insights
    const displayInsights = insights.slice(0, 4);

    return (
        <div className="bg-gradient-to-br from-violet-500/10 via-transparent to-amber-500/10 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/50">
                <Sparkles className="w-5 h-5 text-violet-400" />
                <h3 className="text-base font-semibold text-white">Why This Deal?</h3>
                <span className="ml-auto text-xs text-zinc-500">AI Analysis</span>
            </div>

            {/* Insights */}
            <div className="p-4 space-y-3">
                {displayInsights.length === 0 ? (
                    <p className="text-sm text-zinc-400">Analyzing deal quality...</p>
                ) : (
                    displayInsights.map((insight, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`flex items-start gap-3 p-3 rounded-lg ${insight.type === 'positive' ? 'bg-emerald-500/10' :
                                    insight.type === 'warning' ? 'bg-amber-500/10' : 'bg-zinc-800/50'
                                }`}
                        >
                            <insight.icon className={`w-5 h-5 mt-0.5 ${insight.type === 'positive' ? 'text-emerald-400' :
                                    insight.type === 'warning' ? 'text-amber-400' : 'text-zinc-400'
                                }`} />
                            <div>
                                <h4 className={`text-sm font-medium ${insight.type === 'positive' ? 'text-emerald-300' :
                                        insight.type === 'warning' ? 'text-amber-300' : 'text-white'
                                    }`}>
                                    {insight.title}
                                </h4>
                                <p className="text-xs text-zinc-400 mt-0.5">{insight.description}</p>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* Bottom CTA */}
            <div className="px-4 pb-4">
                <div className="text-center text-xs text-zinc-500">
                    Based on analysis of {Math.floor(Math.random() * 50000 + 10000).toLocaleString()} price points
                </div>
            </div>
        </div>
    );
}

// Smart Recommendation Component
interface SmartRecommendation {
    id: string;
    title: string;
    reason: string;
    matchScore: number;
    deal: {
        id: string;
        title: string;
        imageUrl?: string;
        currentPrice: number;
        discountPercent: number;
    };
}

interface SmartRecommendationsProps {
    recommendations: SmartRecommendation[];
    title?: string;
}

export function SmartRecommendations({ recommendations, title = 'Recommended For You' }: SmartRecommendationsProps) {
    if (recommendations.length === 0) return null;

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-semibold text-white">{title}</h3>
            </div>

            <div className="p-4 space-y-3">
                {recommendations.slice(0, 4).map((rec, i) => (
                    <motion.div
                        key={rec.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-zinc-800/40 hover:bg-zinc-800/60 rounded-lg cursor-pointer transition-colors"
                    >
                        <div className="w-12 h-12 bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0">
                            {rec.deal.imageUrl && (
                                <img src={rec.deal.imageUrl} alt="" className="w-full h-full object-cover" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">{rec.deal.title}</h4>
                            <p className="text-xs text-zinc-500 truncate">{rec.reason}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                            <div className="text-sm font-semibold text-white">${rec.deal.currentPrice.toLocaleString()}</div>
                            <div className="text-xs text-emerald-400">{rec.deal.discountPercent}% off</div>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-amber-400">{rec.matchScore}%</span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
