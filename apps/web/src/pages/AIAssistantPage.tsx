import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Bot, Sparkles, TrendingDown, Clock, AlertCircle,
    ThumbsUp, ChevronRight, DollarSign, Target, Zap
} from 'lucide-react';
import { Listing } from '../types/marketplace';
import { DEMO_LISTINGS } from '../data/seedData';

interface AIInsight {
    type: 'price_trend' | 'deal_quality' | 'timing' | 'negotiation';
    title: string;
    description: string;
    confidence: number;
    actionable?: string;
}

export default function AIAssistantPage() {
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    const topDeals = [...DEMO_LISTINGS]
        .filter(l => l.originalPrice && l.originalPrice > l.price)
        .map(l => ({
            ...l,
            discount: Math.round(((l.originalPrice! - l.price) / l.originalPrice!) * 100),
            dealScore: calculateDealScore(l),
        }))
        .sort((a, b) => b.dealScore - a.dealScore)
        .slice(0, 5);

    const insights = generateInsights(selectedListing);

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl">
                        <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">AI Shopping Assistant</h1>
                        <p className="text-zinc-400 text-sm">Smart insights to help you buy smarter</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <InsightCard icon={<TrendingDown className="w-5 h-5" />} title="Price Drops" value="12" subtitle="in last 24h" color="text-green-400" />
                    <InsightCard icon={<Target className="w-5 h-5" />} title="Deal Score" value="87%" subtitle="avg quality" color="text-amber-400" />
                    <InsightCard icon={<Clock className="w-5 h-5" />} title="Best Time" value="Tue" subtitle="to buy" color="text-blue-400" />
                    <InsightCard icon={<Zap className="w-5 h-5" />} title="Hot Items" value="8" subtitle="trending" color="text-purple-400" />
                </div>

                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-amber-400" /> AI-Recommended Deals
                        </h2>
                        <Link to="/discover" className="text-amber-400 text-sm flex items-center gap-1">
                            View All <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="space-y-3">
                        {topDeals.map(deal => (
                            <motion.div key={deal.id} whileHover={{ x: 4 }}
                                className={`flex items-center gap-4 p-4 bg-zinc-900/50 border rounded-xl cursor-pointer ${selectedListing?.id === deal.id ? 'border-amber-500' : 'border-zinc-800 hover:border-zinc-700'}`}
                                onClick={() => setSelectedListing(deal)}>
                                <div className="w-16 h-16 bg-zinc-800 rounded-lg overflow-hidden">
                                    {deal.images?.[0] && <img src={deal.images[0]} alt="" className="w-full h-full object-cover" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{deal.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-lg font-bold text-white">${deal.price}</span>
                                        <span className="text-sm text-zinc-500 line-through">${deal.originalPrice}</span>
                                        <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 text-xs font-medium rounded">-{deal.discount}%</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-amber-400">{deal.dealScore}</div>
                                    <div className="text-xs text-zinc-500">Deal Score</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                <AnimatePresence>
                    {selectedListing && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Bot className="w-5 h-5 text-amber-400" /> AI Analysis: {selectedListing.title}
                            </h3>
                            <div className="space-y-4">
                                {insights.map((insight, i) => <AIInsightCard key={i} insight={insight} />)}
                            </div>
                            <div className="mt-6 flex gap-3">
                                <Link to={`/listing/${selectedListing.id}`} className="flex-1 py-3 bg-amber-500 text-zinc-900 font-medium rounded-lg text-center hover:bg-amber-400">View Listing</Link>
                                <button className="px-4 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700"><ThumbsUp className="w-5 h-5" /></button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function InsightCard({ icon, value, subtitle, color }: { icon: React.ReactNode; title: string; value: string; subtitle: string; color: string }) {
    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className={`${color} mb-2`}>{icon}</div>
            <div className="text-2xl font-bold text-white">{value}</div>
            <div className="text-xs text-zinc-500">{subtitle}</div>
        </div>
    );
}

function AIInsightCard({ insight }: { insight: AIInsight }) {
    const iconMap = { price_trend: <TrendingDown className="w-4 h-4" />, deal_quality: <Target className="w-4 h-4" />, timing: <Clock className="w-4 h-4" />, negotiation: <DollarSign className="w-4 h-4" /> };
    const colorMap = { price_trend: 'bg-green-500/20 text-green-400', deal_quality: 'bg-amber-500/20 text-amber-400', timing: 'bg-blue-500/20 text-blue-400', negotiation: 'bg-purple-500/20 text-purple-400' };
    return (
        <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${colorMap[insight.type]}`}>{iconMap[insight.type]}</div>
            <div className="flex-1">
                <div className="flex items-center justify-between">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    <span className="text-xs text-zinc-500">{insight.confidence}% confidence</span>
                </div>
                <p className="text-sm text-zinc-400 mt-1">{insight.description}</p>
                {insight.actionable && <p className="text-sm text-amber-400 mt-2 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{insight.actionable}</p>}
            </div>
        </div>
    );
}

function calculateDealScore(listing: Listing): number {
    let score = 50;
    if (listing.originalPrice) score += Math.min(((listing.originalPrice - listing.price) / listing.originalPrice) * 50, 25);
    if (listing.condition === 'new') score += 15;
    else if (listing.condition === 'like_new') score += 10;
    if (listing.aiVerification?.score && listing.aiVerification.score > 80) score += 10;
    return Math.min(Math.round(score), 99);
}

function generateInsights(listing: Listing | null): AIInsight[] {
    if (!listing) return [];
    const insights: AIInsight[] = [];
    if (listing.originalPrice && listing.originalPrice > listing.price) {
        const discount = Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100);
        insights.push({ type: 'price_trend', title: 'Below Market Price', description: `This item is ${discount}% below original price. Competitive deal.`, confidence: 92, actionable: discount > 20 ? 'Strong buy signal' : undefined });
    }
    insights.push({ type: 'deal_quality', title: 'Deal Quality', description: `AI score: ${listing.aiVerification?.score || 85}%. Authentic images.`, confidence: listing.aiVerification?.score || 85 });
    insights.push({ type: 'timing', title: 'Best Time to Buy', description: 'Similar items see 5-10% drops on weekends.', confidence: 78 });
    insights.push({ type: 'negotiation', title: 'Negotiation Tip', description: 'Try 5-10% below asking - historically successful.', confidence: 85, actionable: 'Send offer now' });
    return insights;
}
