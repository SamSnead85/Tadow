import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Send, Sparkles, Bot, User, TrendingDown, Target,
    ShoppingCart, BarChart3, ArrowRight, Lightbulb
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    deals?: SuggestedDeal[];
}

interface SuggestedDeal {
    id: string;
    title: string;
    price: number;
    originalPrice: number;
    discount: number;
    verdict: string;
    imageUrl: string;
}

const suggestedPrompts = [
    { icon: Target, text: 'Find me a gaming laptop under $1000' },
    { icon: TrendingDown, text: 'What are the best deals right now?' },
    { icon: ShoppingCart, text: 'Is the MacBook Pro M3 worth it?' },
    { icon: BarChart3, text: 'When is the best time to buy a TV?' },
];

const mockDeals: SuggestedDeal[] = [
    {
        id: '1',
        title: 'ASUS ROG Strix G16 Gaming Laptop',
        price: 899,
        originalPrice: 1299,
        discount: 31,
        verdict: 'Great Deal',
        imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=200',
    },
    {
        id: '2',
        title: 'Lenovo Legion 5 Pro RTX 4060',
        price: 949,
        originalPrice: 1199,
        discount: 21,
        verdict: 'Good Value',
        imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200',
    },
];

export function HomePage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: getAIResponse(messageText),
                deals: messageText.toLowerCase().includes('laptop') || messageText.toLowerCase().includes('gaming')
                    ? mockDeals
                    : undefined,
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const getAIResponse = (query: string): string => {
        if (query.toLowerCase().includes('laptop') || query.toLowerCase().includes('gaming')) {
            return "I found some excellent gaming laptops within your budget! Here are my top recommendations based on price-to-performance ratio, review analysis, and current market trends:";
        }
        if (query.toLowerCase().includes('best deals')) {
            return "Right now, the hottest deals are in gaming laptops (up to 40% off), 4K TVs (Black Friday pricing), and refurbished MacBooks. I'm seeing prices 15-30% below historical averages.";
        }
        if (query.toLowerCase().includes('macbook')) {
            return "The MacBook Pro M3 is an excellent machine! Current prices are about 8% above the historical low. I'd recommend waiting 2-3 weeks for potential price drops, or check the refurbished section for 15-20% savings with full warranty.";
        }
        if (query.toLowerCase().includes('tv')) {
            return "TV prices typically drop 20-30% during Black Friday, Super Bowl week, and Amazon Prime Day. Current prices are fair, but if you can wait until February, you'll likely see better deals on last year's models.";
        }
        return "I can help you find the best deals! Tell me what you're looking for, your budget, and any specific requirements. I'll analyze prices across 7 marketplaces to find you the best options.";
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950">
            <div className="container-wide py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    {messages.length === 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            {/* AI Avatar */}
                            <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                className="relative w-20 h-20 mx-auto mb-6"
                            >
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 blur-xl opacity-50" />
                                <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                    <Sparkles className="w-10 h-10 text-white" />
                                </div>
                            </motion.div>

                            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                                AI Deal Assistant
                            </h1>
                            <p className="text-zinc-400 text-lg max-w-lg mx-auto mb-12">
                                Ask me anything about tech deals, pricing trends, or product recommendations.
                                I analyze data from 7+ marketplaces in real-time.
                            </p>

                            {/* Suggested Prompts */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                {suggestedPrompts.map((prompt, i) => (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                        onClick={() => handleSend(prompt.text)}
                                        className="flex items-center gap-3 p-4 bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-violet-500/30 rounded-xl text-left transition-all group"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                                            <prompt.icon className="w-5 h-5 text-violet-400" />
                                        </div>
                                        <span className="text-zinc-300 text-sm">{prompt.text}</span>
                                        <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto group-hover:text-violet-400 group-hover:translate-x-1 transition-all" />
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Messages */}
                    {messages.length > 0 && (
                        <div className="space-y-6 py-8">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        {/* Avatar */}
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${message.role === 'user'
                                            ? 'bg-emerald-500/20'
                                            : 'bg-gradient-to-br from-violet-500 to-indigo-600'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <User className="w-5 h-5 text-emerald-400" />
                                            ) : (
                                                <Bot className="w-5 h-5 text-white" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                                            <div className={`inline-block p-4 rounded-2xl max-w-xl ${message.role === 'user'
                                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-white'
                                                : 'bg-zinc-900 border border-zinc-800 text-zinc-300'
                                                }`}>
                                                {message.content}
                                            </div>

                                            {/* Deal Cards */}
                                            {message.deals && (
                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {message.deals.map((deal) => (
                                                        <Link
                                                            key={deal.id}
                                                            to={`/deal/${deal.id}`}
                                                            className="flex gap-3 p-3 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 rounded-xl transition-all group"
                                                        >
                                                            <img
                                                                src={deal.imageUrl}
                                                                alt={deal.title}
                                                                className="w-16 h-16 rounded-lg object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-white text-sm font-medium line-clamp-2 group-hover:text-emerald-300 transition-colors">
                                                                    {deal.title}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-emerald-400 font-bold">${deal.price}</span>
                                                                    <span className="text-zinc-500 text-sm line-through">${deal.originalPrice}</span>
                                                                    <span className="badge badge-savings text-xs">-{deal.discount}%</span>
                                                                </div>
                                                                <span className="text-violet-400 text-xs">{deal.verdict}</span>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex items-center gap-1 p-4 bg-zinc-900 border border-zinc-800 rounded-2xl">
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}

                    {/* Input */}
                    <div className="sticky bottom-4 mt-8">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-violet-500/20 via-indigo-500/20 to-cyan-500/20 blur-xl opacity-50" />
                            <div className="relative flex items-center gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-2xl">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask about deals, prices, or products..."
                                    rows={1}
                                    className="flex-1 bg-transparent text-white placeholder:text-zinc-500 resize-none outline-none text-sm"
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim()}
                                    className="btn-ai px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                    Send
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-zinc-600 text-xs mt-3">
                            <Lightbulb className="w-3 h-3 inline mr-1" />
                            Tip: Ask about specific products, price trends, or when to buy
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
