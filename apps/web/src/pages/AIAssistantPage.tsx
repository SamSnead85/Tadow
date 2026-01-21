import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Send, Bot, User } from 'lucide-react';
import { showcaseDeals, collections } from '../data/showcaseDeals';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    deals?: typeof showcaseDeals;
}

const suggestedPrompts = [
    { icon: '💻', text: 'Find me a laptop under $1000' },
    { icon: '🎧', text: 'Best noise-canceling headphones' },
    { icon: '📱', text: 'Deals on iPhone or Samsung' },
    { icon: '🎮', text: 'Gaming console bundles' },
];

export function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: text,
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking and searching
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Simple keyword matching for demo
        const query = text.toLowerCase();
        let matchedDeals = showcaseDeals;

        if (query.includes('laptop')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Laptops');
        } else if (query.includes('headphone') || query.includes('audio') || query.includes('airpod')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Audio');
        } else if (query.includes('phone') || query.includes('iphone') || query.includes('samsung')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Phones');
        } else if (query.includes('gaming') || query.includes('console') || query.includes('playstation') || query.includes('xbox')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Gaming');
        } else if (query.includes('tv') || query.includes('oled')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'TVs');
        } else if (query.includes('under') && query.includes('1000')) {
            matchedDeals = showcaseDeals.filter(d => d.currentPrice < 1000);
        } else if (query.includes('best') || query.includes('top')) {
            matchedDeals = showcaseDeals.filter(d => d.dealScore >= 90);
        }

        const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: matchedDeals.length > 0
                ? `I found ${matchedDeals.length} deals matching your request! Here are the top picks:`
                : "I couldn't find exact matches, but here are some popular deals you might like:",
            deals: matchedDeals.slice(0, 4),
        };

        setIsTyping(false);
        setMessages(prev => [...prev, assistantMessage]);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col">
            {/* Header */}
            <div className="border-b border-zinc-800">
                <div className="container-wide py-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30">
                            <Sparkles className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">AI Deal Assistant</h1>
                            <p className="text-sm text-zinc-500">Powered by AI • Ask me anything about deals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-auto">
                <div className="container-wide py-6">
                    {messages.length === 0 ? (
                        /* Empty State */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                                <Bot className="w-10 h-10 text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">How can I help you today?</h2>
                            <p className="text-zinc-400 max-w-md mx-auto mb-8">
                                I can help you find the best deals, compare prices, and discover products that match your needs.
                            </p>

                            {/* Suggested Prompts */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mb-12">
                                {suggestedPrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSend(prompt.text)}
                                        className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left hover:bg-zinc-800 hover:border-amber-500/30 transition-all group"
                                    >
                                        <span className="text-2xl mb-2 block">{prompt.icon}</span>
                                        <span className="text-sm text-zinc-400 group-hover:text-white">{prompt.text}</span>
                                    </button>
                                ))}
                            </div>

                            {/* Quick Collections */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wide">Curated Collections</h3>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {collections.slice(0, 4).map((collection) => (
                                        <Link
                                            key={collection.id}
                                            to="/deals"
                                            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full hover:border-amber-500/50 transition-colors"
                                        >
                                            <span>{collection.icon}</span>
                                            <span className="text-white text-sm">{collection.name}</span>
                                            <span className="text-xs text-zinc-500">({collection.deals.length})</span>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Messages */
                        <div className="space-y-6">
                            <AnimatePresence initial={false}>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
                                    >
                                        {message.role === 'assistant' && (
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                                                <Bot className="w-4 h-4 text-zinc-900" />
                                            </div>
                                        )}
                                        <div className={`max-w-2xl ${message.role === 'user' ? 'order-1' : ''}`}>
                                            <div className={`p-4 rounded-2xl ${message.role === 'user'
                                                ? 'bg-amber-500 text-zinc-900'
                                                : 'bg-zinc-800/50 text-white'
                                                }`}>
                                                {message.content}
                                            </div>

                                            {/* Deal Cards */}
                                            {message.deals && message.deals.length > 0 && (
                                                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {message.deals.map((deal) => (
                                                        <Link
                                                            key={deal.id}
                                                            to={`/deal/${deal.id}`}
                                                            className="p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-colors flex gap-3"
                                                        >
                                                            <img
                                                                src={deal.imageUrl}
                                                                alt={deal.title}
                                                                className="w-16 h-16 rounded-lg object-cover"
                                                            />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-sm font-medium text-white line-clamp-1">{deal.title}</h4>
                                                                <div className="flex items-baseline gap-2 mt-1">
                                                                    <span className="text-lg font-bold text-amber-400">${deal.currentPrice}</span>
                                                                    <span className="text-xs text-zinc-500 line-through">${deal.originalPrice}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 mt-1">
                                                                    <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                                                                        {deal.discountPercent}% off
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        {message.role === 'user' && (
                                            <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center flex-shrink-0">
                                                <User className="w-4 h-4 text-zinc-300" />
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Typing Indicator */}
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                                        <Bot className="w-4 h-4 text-zinc-900" />
                                    </div>
                                    <div className="px-4 py-3 bg-zinc-800/50 rounded-2xl">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-lg">
                <div className="container-wide py-4">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask about deals, products, or get recommendations..."
                            className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim()}
                            className="btn-primary px-6 disabled:opacity-50"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
