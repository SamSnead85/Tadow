/**
 * AI Chat Widget Component
 * 
 * Floating chat widget for conversational deal discovery.
 * Features:
 * - Persistent chat bubble (bottom-right)
 * - Conversational UI with message bubbles
 * - Deal cards embedded in responses
 * - Quick action buttons
 * - Smooth animations
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Sparkles,
    Mic,
    ArrowRight,
} from 'lucide-react';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    deals?: DealCard[];
    suggestions?: string[];
}

interface DealCard {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    discount?: number;
    image?: string;
    score: number;
    verdict: string;
    url?: string;
}

const INITIAL_MESSAGE: ChatMessage = {
    id: 'welcome',
    role: 'assistant',
    content: `Hey! I'm **Tadow** 🔥 your AI shopping assistant. I help you find the best deals and know exactly when to buy. What are you looking for today?`,
    timestamp: new Date(),
    suggestions: [
        'Find gaming laptop under $1500',
        'Best AirPods deal today?',
        'Compare iPhone 15 vs Samsung S24',
        'Is it a good time to buy a TV?',
    ],
};

const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewMessage, setHasNewMessage] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Handle keyboard shortcut (Cmd/Ctrl + K)
    useEffect(() => {
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleSend = async (message?: string) => {
        const text = message || inputValue.trim();
        if (!text || isLoading) return;

        // Add user message
        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        // Simulate AI response (in production, this calls the backend)
        setTimeout(() => {
            const response = generateMockResponse(text);
            setMessages(prev => [...prev, response]);
            setIsLoading(false);
        }, 1000 + Math.random() * 1000);
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        handleSend(suggestion);
    };

    return (
        <>
            {/* Chat Bubble Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={() => {
                            setIsOpen(true);
                            setHasNewMessage(false);
                        }}
                        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform group"
                        style={{
                            background: 'linear-gradient(135deg, #D4A857 0%, #F5D78E 100%)',
                            boxShadow: '0 0 30px rgba(212, 168, 87, 0.4)',
                        }}
                    >
                        <MessageCircle className="w-6 h-6 text-zinc-900" />
                        {hasNewMessage && (
                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                        )}
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-zinc-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            Chat with AI (⌘K)
                        </span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        className="fixed bottom-6 right-6 z-50 w-[420px] h-[600px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-6rem)] flex flex-col rounded-2xl overflow-hidden shadow-2xl"
                        style={{
                            background: 'rgba(17, 17, 20, 0.98)',
                            backdropFilter: 'blur(40px)',
                            border: '1px solid rgba(212, 168, 87, 0.15)',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 60px rgba(212, 168, 87, 0.1)',
                        }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800/60">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #D4A857 0%, #F5D78E 100%)' }}>
                                    <Sparkles className="w-5 h-5 text-zinc-900" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-white">Tadow AI</h3>
                                    <p className="text-xs text-emerald-400 flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                        Online • Ready to help
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
                            {messages.map((msg) => (
                                <MessageBubble
                                    key={msg.id}
                                    message={msg}
                                    onSuggestionClick={handleSuggestionClick}
                                />
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <div className="flex items-center gap-2 text-zinc-400">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <span className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                    <span className="text-sm">Tadow is thinking...</span>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-zinc-800/60">
                            <div className="flex items-center gap-2">
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Ask about deals..."
                                        className="w-full px-4 py-3 pr-12 bg-zinc-900/60 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                                    />
                                    <button
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-amber-400 transition-colors"
                                        title="Voice input (coming soon)"
                                    >
                                        <Mic className="w-5 h-5" />
                                    </button>
                                </div>
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="mt-2 text-xs text-zinc-500 text-center">
                                Powered by AI • ⌘K to toggle
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

/**
 * Message Bubble Component
 */
const MessageBubble = ({
    message,
    onSuggestionClick
}: {
    message: ChatMessage;
    onSuggestionClick: (s: string) => void;
}) => {
    const isUser = message.role === 'user';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
        >
            <div className={`max-w-[85%] ${isUser ? 'order-2' : ''}`}>
                {/* Message content */}
                <div
                    className={`px-4 py-3 rounded-2xl ${isUser
                        ? 'bg-amber-500 text-zinc-900 rounded-br-md'
                        : 'bg-zinc-800/60 text-white rounded-bl-md'
                        }`}
                >
                    <p className="text-sm whitespace-pre-wrap" dangerouslySetInnerHTML={{
                        __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                    }} />
                </div>

                {/* Deal cards */}
                {message.deals && message.deals.length > 0 && (
                    <div className="mt-3 space-y-2">
                        {message.deals.map((deal) => (
                            <MiniDealCard key={deal.id} deal={deal} />
                        ))}
                    </div>
                )}

                {/* Suggestions */}
                {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {message.suggestions.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => onSuggestionClick(s)}
                                className="px-3 py-1.5 text-xs rounded-full bg-zinc-800/60 text-zinc-300 hover:bg-zinc-700 hover:text-white transition-all border border-zinc-700/50"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Mini Deal Card (embedded in chat)
 */
const MiniDealCard = ({ deal }: { deal: DealCard }) => (
    <div className="p-3 bg-zinc-800/40 rounded-xl border border-zinc-700/50 hover:border-amber-500/30 transition-all cursor-pointer group">
        <div className="flex gap-3">
            {deal.image && (
                <div className="w-16 h-16 rounded-lg bg-zinc-700 overflow-hidden flex-shrink-0">
                    <img src={deal.image} alt={deal.title} className="w-full h-full object-cover" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-white truncate group-hover:text-amber-400 transition-colors">
                    {deal.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-lg font-bold text-white">${deal.price}</span>
                    {deal.originalPrice && (
                        <span className="text-sm text-zinc-500 line-through">${deal.originalPrice}</span>
                    )}
                    {deal.discount && (
                        <span className="px-1.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 rounded">
                            -{deal.discount}%
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-500/20 text-amber-400 rounded">
                        Score: {deal.score}/100
                    </span>
                    <span className="text-xs text-zinc-400">{deal.verdict}</span>
                </div>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 transition-colors self-center" />
        </div>
    </div>
);

/**
 * Generate mock AI response (replace with real API call)
 */
function generateMockResponse(userMessage: string): ChatMessage {
    const lower = userMessage.toLowerCase();

    // Gaming laptop response
    if (lower.includes('gaming laptop') || lower.includes('gaming')) {
        return {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: `Great choice! I found some killer gaming laptop deals for you. Here are my top picks based on AI analysis:`,
            timestamp: new Date(),
            deals: [
                {
                    id: '1',
                    title: 'ASUS ROG Zephyrus G14 (RTX 4060)',
                    price: 1299,
                    originalPrice: 1599,
                    discount: 19,
                    score: 92,
                    verdict: '🔥 Incredible Deal',
                    image: 'https://placehold.co/100x100/1a1a1a/gold?text=ROG',
                },
                {
                    id: '2',
                    title: 'Lenovo Legion Pro 5i (RTX 4070)',
                    price: 1449,
                    originalPrice: 1799,
                    discount: 19,
                    score: 88,
                    verdict: '⭐ Great Value',
                    image: 'https://placehold.co/100x100/1a1a1a/gold?text=Legion',
                },
            ],
            suggestions: ['Compare these two', 'Show me cheaper options', 'Price history for ROG'],
        };
    }

    // AirPods response
    if (lower.includes('airpods')) {
        return {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: `I found a fantastic AirPods deal! This is **15% below the average price** over the last 30 days. My recommendation: **Buy now!**`,
            timestamp: new Date(),
            deals: [
                {
                    id: '3',
                    title: 'Apple AirPods Pro (2nd Gen, USB-C)',
                    price: 189,
                    originalPrice: 249,
                    discount: 24,
                    score: 95,
                    verdict: '🔥 All-Time Low!',
                    image: 'https://placehold.co/100x100/1a1a1a/gold?text=AirPods',
                },
            ],
            suggestions: ['Set price alert', 'Compare with Galaxy Buds', 'Show more audio deals'],
        };
    }

    // Default response
    return {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: `I'm analyzing the best deals matching "${userMessage}". In the meantime, here are today's top recommendations:`,
        timestamp: new Date(),
        deals: [
            {
                id: '4',
                title: 'Sony WH-1000XM5 Headphones',
                price: 298,
                originalPrice: 399,
                discount: 25,
                score: 91,
                verdict: '⭐ Great Value',
                image: 'https://placehold.co/100x100/1a1a1a/gold?text=Sony',
            },
        ],
        suggestions: ['Be more specific', 'Show top deals', 'Set up deal alerts'],
    };
}

export default AIChatWidget;
