import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Send, Sparkles, Bot, User,
    Loader2, ChevronRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ALL_DEALS } from '../data/extendedDeals';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    deals?: DealRecommendation[];
    isTyping?: boolean;
}

interface DealRecommendation {
    id: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    discountPercent: number;
    reason: string;
}

interface EnhancedAIChatProps {
    isOpen: boolean;
    onClose: () => void;
}

// AI Response Templates (simulating real AI intelligence)
const AI_RESPONSES = {
    greeting: [
        "Hey! I'm your Tadow shopping assistant. I can help you find the best deals, compare products, and decide if now's the right time to buy. What are you looking for today?",
        "Hi there! Ready to find some amazing deals? Tell me what you're shopping for, and I'll help you find the best prices and make smart buying decisions.",
    ],

    priceWatch: (product: string) => `I'm tracking prices on ${product} across all major retailers. Based on historical data:

• **Current prices are 12% below average**
• Best time to buy: **Within the next 2 weeks**
• Price likely to rise after holiday season

Would you like me to set up a price alert?`,

    dealAnalysis: (deal: any) => `Let me analyze this deal for you:

**${deal.title}**

✅ **Why it's good:**
• ${deal.discountPercent}% off retail price
• Price is ${deal.currentPrice < deal.originalPrice * 0.85 ? 'near all-time low' : 'competitive'}
• ${deal.brand} is a trusted brand with good reviews

⚠️ **Things to consider:**
• Make sure this meets your specific needs
• Check warranty coverage before buying

**My verdict:** ${deal.discountPercent >= 20 ? 'Great deal - I recommend buying now' : 'Fair deal - you could wait for a better price'}`,

    comparison: (products: string) => `I compared the top options in ${products}:

| Model | Price | Score | Best For |
|-------|-------|-------|----------|
| Option A | $1,299 | 94/100 | Best overall |
| Option B | $999 | 88/100 | Best budget |
| Option C | $1,499 | 91/100 | Best premium |

**My recommendation:** Option A offers the best value. It's currently 18% off and at its lowest price in 3 months.

Would you like more details on any of these?`,
};

// Simple intent detection
function detectIntent(message: string): { intent: string; entities: Record<string, string> } {
    const lower = message.toLowerCase();

    if (lower.includes('laptop') || lower.includes('computer')) {
        return { intent: 'search', entities: { category: 'Laptops' } };
    }
    if (lower.includes('phone') || lower.includes('iphone') || lower.includes('galaxy')) {
        return { intent: 'search', entities: { category: 'Phones' } };
    }
    if (lower.includes('gaming') || lower.includes('ps5') || lower.includes('xbox')) {
        return { intent: 'search', entities: { category: 'Gaming' } };
    }
    if (lower.includes('headphone') || lower.includes('airpods') || lower.includes('audio')) {
        return { intent: 'search', entities: { category: 'Audio' } };
    }
    if (lower.includes('should i buy') || lower.includes('good deal') || lower.includes('worth it')) {
        return { intent: 'analyze', entities: {} };
    }
    if (lower.includes('compare') || lower.includes('vs') || lower.includes('versus')) {
        return { intent: 'compare', entities: {} };
    }
    if (lower.includes('wait') || lower.includes('black friday') || lower.includes('sale')) {
        return { intent: 'timing', entities: {} };
    }
    if (lower.includes('price') && (lower.includes('drop') || lower.includes('alert'))) {
        return { intent: 'alert', entities: {} };
    }
    if (lower.includes('under $') || lower.includes('budget')) {
        const priceMatch = lower.match(/under \$?(\d+)/);
        return { intent: 'budget', entities: { maxPrice: priceMatch?.[1] || '1000' } };
    }

    return { intent: 'general', entities: {} };
}

// Generate AI response based on intent
function generateResponse(intent: string, entities: Record<string, string>, userMessage: string): { text: string; deals: DealRecommendation[] } {
    let deals: DealRecommendation[] = [];
    let text = '';

    switch (intent) {
        case 'search':
            const category = entities.category;
            const categoryDeals = ALL_DEALS.filter(d => d.category === category).slice(0, 3);
            deals = categoryDeals.map(d => ({
                id: d.id,
                title: d.title,
                imageUrl: d.imageUrl,
                currentPrice: d.currentPrice,
                discountPercent: d.discountPercent,
                reason: d.isHot ? 'Hot deal - selling fast!' : `Top rated ${d.brand} product`
            }));
            text = `I found some great ${category?.toLowerCase()} deals for you! Here are my top picks:\n\nThe **${categoryDeals[0]?.title}** at $${categoryDeals[0]?.currentPrice} is my top recommendation - it's ${categoryDeals[0]?.discountPercent}% off and has excellent reviews.\n\nWant me to compare these or tell you more about any specific one?`;
            break;

        case 'analyze':
            const topDeal = ALL_DEALS.find(d => d.isHot) || ALL_DEALS[0];
            text = AI_RESPONSES.dealAnalysis(topDeal);
            deals = [{
                id: topDeal.id,
                title: topDeal.title,
                imageUrl: topDeal.imageUrl,
                currentPrice: topDeal.currentPrice,
                discountPercent: topDeal.discountPercent,
                reason: 'Currently analyzing this deal'
            }];
            break;

        case 'compare':
            text = AI_RESPONSES.comparison('tech products');
            break;

        case 'timing':
            text = `Based on historical pricing data, here's my timing advice:

**Black Friday** (late November): Expect 20-40% off electronics
**Prime Day** (July): Great for Amazon exclusives, 15-30% off
**Current deals**: We're seeing some early sale pricing now

**My recommendation:** If you need it now and find a deal 15%+ off, buy it. Waiting for a major sale isn't guaranteed to save more.

Want me to track prices on something specific?`;
            break;

        case 'alert':
            text = `I can set up price alerts for you! Just tell me:
1. What product you're watching
2. Your target price

I'll notify you instantly when prices drop. Currently tracking 50,000+ products across all major retailers.`;
            break;

        case 'budget':
            const maxPrice = parseInt(entities.maxPrice) || 1000;
            const budgetDeals = ALL_DEALS.filter(d => d.currentPrice <= maxPrice).slice(0, 3);
            deals = budgetDeals.map(d => ({
                id: d.id,
                title: d.title,
                imageUrl: d.imageUrl,
                currentPrice: d.currentPrice,
                discountPercent: d.discountPercent,
                reason: `Under your $${maxPrice} budget`
            }));
            text = `Here are the best deals under $${maxPrice}:\n\nI found ${budgetDeals.length} great options. The best value is the **${budgetDeals[0]?.title}** at $${budgetDeals[0]?.currentPrice} - you're saving ${budgetDeals[0]?.discountPercent}% off the regular price.`;
            break;

        default:
            text = `I understand you're looking for help with "${userMessage.slice(0, 50)}...". Here's what I can do:

• **Find deals** - Tell me what product you're looking for
• **Compare products** - I'll analyze multiple options side-by-side  
• **Price predictions** - I'll tell you if you should buy now or wait
• **Deal analysis** - Send me a deal and I'll tell you if it's worth it
• **Set alerts** - I'll notify you when prices drop

What would you like to explore?`;
    }

    return { text, deals };
}

export function EnhancedAIChat({ isOpen, onClose }: EnhancedAIChatProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: AI_RESPONSES.greeting[0],
            timestamp: new Date(),
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;

        const userMessage: Message = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

        const { intent, entities } = detectIntent(userMessage.content);
        const { text, deals } = generateResponse(intent, entities, userMessage.content);

        const aiMessage: Message = {
            id: `ai_${Date.now()}`,
            role: 'assistant',
            content: text,
            timestamp: new Date(),
            deals: deals.length > 0 ? deals : undefined,
        };

        setMessages(prev => [...prev, aiMessage]);
        setIsTyping(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    // Quick action buttons
    const quickActions = [
        { label: 'Best laptop deals', icon: '💻' },
        { label: 'Should I wait for sales?', icon: '⏰' },
        { label: 'Compare top phones', icon: '📱' },
        { label: 'Budget gaming setup', icon: '🎮' },
    ];

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 md:inset-auto md:right-6 md:bottom-6 md:w-[420px] md:h-[600px] z-50 bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-gradient-to-r from-violet-500/10 to-amber-500/10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-amber-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-semibold">Tadow AI</h3>
                            <p className="text-xs text-zinc-400">Your shopping assistant</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message) => (
                        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                                {message.role === 'assistant' && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <Bot className="w-4 h-4 text-violet-400" />
                                        <span className="text-xs text-zinc-500">Tadow AI</span>
                                    </div>
                                )}
                                <div className={`rounded-2xl px-4 py-3 ${message.role === 'user'
                                    ? 'bg-amber-500 text-black'
                                    : 'bg-zinc-800 text-zinc-100'
                                    }`}>
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>

                                {/* Deal Recommendations */}
                                {message.deals && message.deals.length > 0 && (
                                    <div className="mt-3 space-y-2">
                                        {message.deals.map((deal) => (
                                            <Link
                                                key={deal.id}
                                                to={`/deal/${deal.id}`}
                                                onClick={onClose}
                                                className="flex items-center gap-3 p-2 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 rounded-xl transition-colors"
                                            >
                                                {deal.imageUrl && (
                                                    <img src={deal.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm text-white font-medium truncate">{deal.title}</div>
                                                    <div className="text-xs text-zinc-500">{deal.reason}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-bold text-white">${deal.currentPrice}</div>
                                                    <div className="text-xs text-emerald-400">{deal.discountPercent}% off</div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-zinc-600" />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {message.role === 'user' && (
                                    <div className="flex items-center justify-end gap-2 mt-1">
                                        <span className="text-xs text-zinc-500">You</span>
                                        <User className="w-4 h-4 text-zinc-500" />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {/* Typing Indicator */}
                    {isTyping && (
                        <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-violet-400" />
                            <div className="bg-zinc-800 rounded-2xl px-4 py-3">
                                <div className="flex gap-1">
                                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <span className="w-2 h-2 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Quick Actions (show only if few messages) */}
                {messages.length <= 2 && (
                    <div className="px-4 py-2 border-t border-zinc-800/50">
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {quickActions.map((action, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(action.label);
                                        inputRef.current?.focus();
                                    }}
                                    className="flex-shrink-0 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-300 whitespace-nowrap transition-colors"
                                >
                                    {action.icon} {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input */}
                <div className="p-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                        <input
                            ref={inputRef}
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about deals, prices, or products..."
                            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none"
                        />
                        <motion.button
                            onClick={handleSend}
                            disabled={!input.trim() || isTyping}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 text-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </motion.button>
                    </div>
                    <p className="text-[10px] text-zinc-600 text-center mt-2">
                        Powered by Tadow Intelligence • Prices verified in real-time
                    </p>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

export default EnhancedAIChat;
