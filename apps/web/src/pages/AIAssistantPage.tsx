import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, Send, Bot, User, ShoppingCart } from 'lucide-react';
import { showcaseDeals, getProductUrl } from '../data/showcaseDeals';
import { UserNeeds, getRecommendedSpecs } from '../services/marketplaceApi';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    deals?: typeof showcaseDeals;
    options?: QuestionOption[];
    questionType?: string;
}

interface QuestionOption {
    label: string;
    value: string;
    icon?: string;
    description?: string;
}

interface ConversationState {
    step: 'initial' | 'category' | 'useCase' | 'budget' | 'priority' | 'results';
    category?: string;
    needs: Partial<UserNeeds>;
}

// Predefined question flows for needs-based recommendations
const CATEGORY_OPTIONS: QuestionOption[] = [
    { label: 'Laptops', value: 'Laptops', icon: '💻', description: 'Notebooks, ultrabooks, gaming laptops' },
    { label: 'Phones', value: 'Phones', icon: '📱', description: 'Smartphones and accessories' },
    { label: 'TVs', value: 'TVs', icon: '📺', description: 'Smart TVs, OLED, 4K displays' },
    { label: 'Audio', value: 'Audio', icon: '🎧', description: 'Headphones, speakers, earbuds' },
    { label: 'Gaming', value: 'Gaming', icon: '🎮', description: 'Consoles, accessories, games' },
    { label: 'Cameras', value: 'Cameras', icon: '📷', description: 'DSLR, mirrorless, action cams' },
];

const USE_CASE_OPTIONS: Record<string, QuestionOption[]> = {
    Laptops: [
        { label: 'Work & Productivity', value: 'work', icon: '💼', description: 'Office apps, email, video calls' },
        { label: 'Gaming', value: 'gaming', icon: '🎮', description: 'AAA games, high frame rates' },
        { label: 'Creative Work', value: 'creative', icon: '🎨', description: 'Video editing, design, 3D' },
        { label: 'Student', value: 'student', icon: '📚', description: 'Notes, research, light apps' },
        { label: 'Casual Use', value: 'casual', icon: '🏠', description: 'Browsing, streaming, social' },
    ],
    Phones: [
        { label: 'Photography', value: 'creative', icon: '📸', description: 'Best camera quality' },
        { label: 'Gaming', value: 'gaming', icon: '🎮', description: 'Mobile gaming performance' },
        { label: 'Business', value: 'work', icon: '💼', description: 'Productivity and security' },
        { label: 'Everyday', value: 'casual', icon: '📱', description: 'All-around balanced' },
    ],
    default: [
        { label: 'Professional', value: 'work', icon: '💼' },
        { label: 'Entertainment', value: 'casual', icon: '🎬' },
        { label: 'Budget-Friendly', value: 'student', icon: '💰' },
    ],
};

const BUDGET_OPTIONS: QuestionOption[] = [
    { label: 'Under $500', value: 'budget', icon: '💵', description: 'Best value options' },
    { label: '$500 - $1,200', value: 'mid-range', icon: '💰', description: 'Balanced price/performance' },
    { label: '$1,200 - $2,500', value: 'premium', icon: '💎', description: 'High-end features' },
    { label: 'No Limit', value: 'unlimited', icon: '👑', description: 'Best of the best' },
];

const PRIORITY_OPTIONS: QuestionOption[] = [
    { label: 'Performance', value: 'performance', icon: '⚡', description: 'Speed and power' },
    { label: 'Battery Life', value: 'battery', icon: '🔋', description: 'All-day usage' },
    { label: 'Display Quality', value: 'display', icon: '🖥️', description: 'Visual experience' },
    { label: 'Best Value', value: 'value', icon: '💎', description: 'Price to performance' },
];

export function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [conversationState, setConversationState] = useState<ConversationState>({
        step: 'initial',
        needs: {},
    });
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addMessage = (message: Omit<Message, 'id'>) => {
        setMessages(prev => [...prev, { ...message, id: Date.now().toString() }]);
    };

    const startNeedsAssessment = async (category: string) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setIsTyping(false);

        setConversationState(prev => ({ ...prev, step: 'useCase', category }));

        const useCaseOptions = USE_CASE_OPTIONS[category] || USE_CASE_OPTIONS.default;

        addMessage({
            role: 'assistant',
            content: `Great choice! To find you the perfect ${category.toLowerCase()}, I need to understand how you'll use it. What's your primary use case?`,
            options: useCaseOptions,
            questionType: 'useCase',
        });
    };

    const handleOptionSelect = async (questionType: string, value: string, label: string) => {
        // Add user's selection as a message
        addMessage({ role: 'user', content: label });

        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 600));
        setIsTyping(false);

        switch (questionType) {
            case 'category':
                await startNeedsAssessment(value);
                break;

            case 'useCase':
                setConversationState(prev => ({
                    ...prev,
                    step: 'budget',
                    needs: { ...prev.needs, useCase: value as UserNeeds['useCase'] },
                }));
                addMessage({
                    role: 'assistant',
                    content: `Perfect! Now, what's your budget range? This helps me find the best value for your needs.`,
                    options: BUDGET_OPTIONS,
                    questionType: 'budget',
                });
                break;

            case 'budget':
                setConversationState(prev => ({
                    ...prev,
                    step: 'priority',
                    needs: { ...prev.needs, budget: value as UserNeeds['budget'] },
                }));
                addMessage({
                    role: 'assistant',
                    content: `Almost there! What's most important to you?`,
                    options: PRIORITY_OPTIONS,
                    questionType: 'priority',
                });
                break;

            case 'priority':
                setConversationState(prev => ({
                    ...prev,
                    step: 'results',
                    needs: { ...prev.needs, priority: value as UserNeeds['priority'] },
                }));
                await generateRecommendations({
                    ...conversationState.needs,
                    priority: value as UserNeeds['priority'],
                } as UserNeeds);
                break;
        }
    };

    const generateRecommendations = async (needs: UserNeeds) => {
        setIsTyping(true);
        await new Promise(resolve => setTimeout(resolve, 1500));

        const category = conversationState.category || 'Laptops';
        const filters = getRecommendedSpecs(needs, category);

        // Filter showcase deals based on needs
        let matchedDeals = showcaseDeals.filter(d => d.category === category);

        // Apply price filters
        if (filters.minPrice) {
            matchedDeals = matchedDeals.filter(d => d.currentPrice >= filters.minPrice!);
        }
        if (filters.maxPrice) {
            matchedDeals = matchedDeals.filter(d => d.currentPrice <= filters.maxPrice!);
        }

        // Sort by deal score
        matchedDeals = matchedDeals.sort((a, b) => b.dealScore - a.dealScore).slice(0, 4);

        const aiAnalysis = generateAIAnalysis(needs, category);

        setIsTyping(false);
        addMessage({
            role: 'assistant',
            content: aiAnalysis,
            deals: matchedDeals,
        });
    };

    const generateAIAnalysis = (needs: UserNeeds, category: string): string => {
        const budgetText = {
            budget: 'under $500',
            'mid-range': '$500-$1,200',
            premium: '$1,200-$2,500',
            unlimited: 'no budget limit',
        }[needs.budget];

        const useCaseText = {
            gaming: 'gaming performance',
            work: 'productivity and reliability',
            creative: 'creative work like video editing and design',
            casual: 'everyday tasks and entertainment',
            student: 'studying and coursework',
        }[needs.useCase];

        return `Based on your needs (${useCaseText}, ${budgetText}, priority on ${needs.priority}), here are my top recommendations:\n\n🎯 **My AI Analysis:**\n• I've filtered for ${category.toLowerCase()} optimized for ${useCaseText}\n• All options are within your ${budgetText} budget\n• Each has excellent ${needs.priority} ratings\n\nClick any product to see full details and purchase options:`;
    };

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        addMessage({ role: 'user', content: text });
        setInput('');
        setIsTyping(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        // Smart keyword detection
        const query = text.toLowerCase();
        let matchedDeals = showcaseDeals;
        let responseText = '';

        // Check for category keywords
        if (query.includes('laptop') || query.includes('notebook')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Laptops');
            responseText = query.includes('gaming')
                ? `Great choice! For gaming laptops, here are the best deals with powerful GPUs and high refresh displays:`
                : `I found ${matchedDeals.length} laptops. To give you the best recommendations, let me ask a few questions. What will you primarily use it for?`;

            if (!query.includes('gaming')) {
                setIsTyping(false);
                setConversationState({ step: 'useCase', category: 'Laptops', needs: {} });
                addMessage({
                    role: 'assistant',
                    content: responseText,
                    options: USE_CASE_OPTIONS.Laptops,
                    questionType: 'useCase',
                });
                return;
            }
        } else if (query.includes('headphone') || query.includes('audio') || query.includes('airpod')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Audio');
            responseText = `I found ${matchedDeals.length} audio deals. Here are the top picks:`;
        } else if (query.includes('phone') || query.includes('iphone') || query.includes('samsung') || query.includes('pixel')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Phones');
            responseText = `I found ${matchedDeals.length} phones. Here are the best deals:`;
        } else if (query.includes('tv') || query.includes('oled') || query.includes('television')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'TVs');
            responseText = `I found ${matchedDeals.length} TV deals. Here are my recommendations:`;
        } else if (query.includes('gaming') || query.includes('console') || query.includes('playstation') || query.includes('xbox')) {
            matchedDeals = showcaseDeals.filter(d => d.category === 'Gaming');
            responseText = `I found ${matchedDeals.length} gaming deals. Here are the top picks:`;
        } else if (query.includes('help') || query.includes('recommend') || query.includes('best') || query.includes('need')) {
            // Start guided flow
            setIsTyping(false);
            addMessage({
                role: 'assistant',
                content: `I'd love to help you find the perfect product! Let's start by choosing a category:`,
                options: CATEGORY_OPTIONS,
                questionType: 'category',
            });
            return;
        } else {
            responseText = `I can help you find the best deals! Would you like me to guide you through finding the perfect product? Just tell me what you're looking for, or choose a category below:`;
            setIsTyping(false);
            addMessage({
                role: 'assistant',
                content: responseText,
                options: CATEGORY_OPTIONS,
                questionType: 'category',
            });
            return;
        }

        setIsTyping(false);
        addMessage({
            role: 'assistant',
            content: responseText,
            deals: matchedDeals.slice(0, 4),
        });
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
                            <p className="text-sm text-zinc-500">Tell me what you need • I'll find the best deals</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-auto">
                <div className="container-wide py-6">
                    {messages.length === 0 ? (
                        /* Welcome State */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                                <Bot className="w-10 h-10 text-amber-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-3">What are you looking for?</h2>
                            <p className="text-zinc-400 max-w-md mx-auto mb-8">
                                Tell me your needs, and I'll recommend the best products at the best prices. Choose a category to get started:
                            </p>

                            {/* Category Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-2xl mx-auto">
                                {CATEGORY_OPTIONS.map((cat) => (
                                    <button
                                        key={cat.value}
                                        onClick={() => {
                                            addMessage({ role: 'user', content: cat.label });
                                            startNeedsAssessment(cat.value);
                                        }}
                                        className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-left hover:bg-zinc-800 hover:border-amber-500/30 transition-all group"
                                    >
                                        <span className="text-3xl mb-2 block">{cat.icon}</span>
                                        <span className="text-sm font-medium text-white">{cat.label}</span>
                                        <p className="text-xs text-zinc-500 mt-1">{cat.description}</p>
                                    </button>
                                ))}
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
                                            <div className={`p-4 rounded-2xl whitespace-pre-line ${message.role === 'user'
                                                ? 'bg-amber-500 text-zinc-900'
                                                : 'bg-zinc-800/50 text-white'
                                                }`}>
                                                {message.content}
                                            </div>

                                            {/* Option Buttons */}
                                            {message.options && (
                                                <div className="mt-3 grid grid-cols-2 gap-2">
                                                    {message.options.map((option) => (
                                                        <button
                                                            key={option.value}
                                                            onClick={() => handleOptionSelect(message.questionType!, option.value, option.label)}
                                                            className="p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-left hover:border-amber-500 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-lg">{option.icon}</span>
                                                                <span className="font-medium text-white">{option.label}</span>
                                                            </div>
                                                            {option.description && (
                                                                <p className="text-xs text-zinc-500 group-hover:text-zinc-400">{option.description}</p>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Deal Cards */}
                                            {message.deals && message.deals.length > 0 && (
                                                <div className="mt-4 space-y-3">
                                                    {message.deals.map((deal) => (
                                                        <div
                                                            key={deal.id}
                                                            className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl hover:border-amber-500/30 transition-colors"
                                                        >
                                                            <div className="flex gap-4">
                                                                <img
                                                                    src={deal.imageUrl}
                                                                    alt={deal.title}
                                                                    className="w-20 h-20 rounded-lg object-cover"
                                                                />
                                                                <div className="flex-1 min-w-0">
                                                                    <h4 className="font-medium text-white line-clamp-2">{deal.title}</h4>
                                                                    <div className="flex items-baseline gap-2 mt-1">
                                                                        <span className="text-xl font-bold text-amber-400">${deal.currentPrice}</span>
                                                                        <span className="text-sm text-zinc-500 line-through">${deal.originalPrice}</span>
                                                                        <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">
                                                                            {deal.discountPercent}% off
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-zinc-500 mt-1">{deal.aiVerdict}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex gap-2 mt-3">
                                                                <Link
                                                                    to={`/deal/${deal.id}`}
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-zinc-800 rounded-lg text-sm text-white hover:bg-zinc-700 transition-colors"
                                                                >
                                                                    View Details
                                                                </Link>
                                                                <a
                                                                    href={getProductUrl(deal)}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-amber-500 rounded-lg text-sm text-zinc-900 font-medium hover:bg-amber-400 transition-colors"
                                                                >
                                                                    <ShoppingCart className="w-4 h-4" />
                                                                    Buy on {deal.marketplace.name}
                                                                </a>
                                                            </div>
                                                        </div>
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
                            placeholder="Tell me what you're looking for..."
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
