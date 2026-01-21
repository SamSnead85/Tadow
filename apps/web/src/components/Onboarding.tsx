import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronRight, ChevronLeft, Check, Sparkles, Bell,
    Target, Heart, DollarSign, X
} from 'lucide-react';

// User Preferences Flow
export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
    const [step, setStep] = useState(0);
    const [preferences, setPreferences] = useState({
        categories: [] as string[],
        brands: [] as string[],
        priceRange: 'mid' as 'budget' | 'mid' | 'premium',
        alertFrequency: 'daily' as 'realtime' | 'daily' | 'weekly',
    });

    const categories = [
        'Laptops', 'Phones', 'Gaming', 'Audio', 'TVs', 'Cameras',
        'Smart Home', 'Wearables', 'Tablets', 'Accessories'
    ];

    const brands = [
        'Apple', 'Samsung', 'Sony', 'LG', 'Microsoft', 'Dell',
        'HP', 'Lenovo', 'Bose', 'JBL', 'Nintendo', 'PlayStation'
    ];

    const toggleCategory = (cat: string) => {
        setPreferences(prev => ({
            ...prev,
            categories: prev.categories.includes(cat)
                ? prev.categories.filter(c => c !== cat)
                : [...prev.categories, cat]
        }));
    };

    const toggleBrand = (brand: string) => {
        setPreferences(prev => ({
            ...prev,
            brands: prev.brands.includes(brand)
                ? prev.brands.filter(b => b !== brand)
                : [...prev.brands, brand]
        }));
    };

    const steps = [
        {
            title: "What are you shopping for?",
            subtitle: "Select your favorite categories",
            content: (
                <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${preferences.categories.includes(cat)
                                ? 'bg-amber-500 text-black'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: "Any favorite brands?",
            subtitle: "We'll prioritize deals from these brands",
            content: (
                <div className="grid grid-cols-3 gap-2">
                    {brands.map(brand => (
                        <button
                            key={brand}
                            onClick={() => toggleBrand(brand)}
                            className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${preferences.brands.includes(brand)
                                ? 'bg-amber-500 text-black'
                                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                }`}
                        >
                            {brand}
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: "What's your budget?",
            subtitle: "Help us find deals in your range",
            content: (
                <div className="space-y-3">
                    {[
                        { id: 'budget', label: 'Budget-Friendly', desc: 'Best bang for the buck', icon: DollarSign },
                        { id: 'mid', label: 'Mid-Range', desc: 'Balance of price and quality', icon: Target },
                        { id: 'premium', label: 'Premium', desc: 'Top-tier products only', icon: Sparkles },
                    ].map(option => (
                        <button
                            key={option.id}
                            onClick={() => setPreferences(p => ({ ...p, priceRange: option.id as any }))}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${preferences.priceRange === option.id
                                ? 'bg-amber-500/20 border-2 border-amber-500'
                                : 'bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
                                }`}
                        >
                            <option.icon className={`w-6 h-6 ${preferences.priceRange === option.id ? 'text-amber-400' : 'text-zinc-500'}`} />
                            <div className="text-left">
                                <div className="text-white font-medium">{option.label}</div>
                                <div className="text-zinc-500 text-sm">{option.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            ),
        },
        {
            title: "How often do you want alerts?",
            subtitle: "Stay informed about price drops",
            content: (
                <div className="space-y-3">
                    {[
                        { id: 'realtime', label: 'Real-time', desc: 'Instant notifications' },
                        { id: 'daily', label: 'Daily Digest', desc: 'Once per day summary' },
                        { id: 'weekly', label: 'Weekly', desc: 'Weekend deal roundup' },
                    ].map(option => (
                        <button
                            key={option.id}
                            onClick={() => setPreferences(p => ({ ...p, alertFrequency: option.id as any }))}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all ${preferences.alertFrequency === option.id
                                ? 'bg-amber-500/20 border-2 border-amber-500'
                                : 'bg-zinc-800 border-2 border-transparent hover:border-zinc-700'
                                }`}
                        >
                            <Bell className={`w-6 h-6 ${preferences.alertFrequency === option.id ? 'text-amber-400' : 'text-zinc-500'}`} />
                            <div className="text-left">
                                <div className="text-white font-medium">{option.label}</div>
                                <div className="text-zinc-500 text-sm">{option.desc}</div>
                            </div>
                        </button>
                    ))}
                </div>
            ),
        },
    ];

    const handleComplete = () => {
        localStorage.setItem('tadow_preferences', JSON.stringify(preferences));
        localStorage.setItem('tadow_onboarded', 'true');
        onComplete();
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center p-4"
        >
            <div className="w-full max-w-lg">
                {/* Progress */}
                <div className="flex gap-2 mb-8">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors ${i <= step ? 'bg-amber-500' : 'bg-zinc-800'
                                }`}
                        />
                    ))}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="mb-8"
                    >
                        <h1 className="text-2xl font-bold text-white mb-2">{steps[step].title}</h1>
                        <p className="text-zinc-400 mb-6">{steps[step].subtitle}</p>
                        {steps[step].content}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    {step > 0 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="flex items-center gap-2 text-zinc-400 hover:text-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back
                        </button>
                    ) : (
                        <button onClick={onComplete} className="text-zinc-500 hover:text-zinc-300 text-sm">
                            Skip setup
                        </button>
                    )}

                    {step < steps.length - 1 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl"
                        >
                            Continue
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={handleComplete}
                            className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl"
                        >
                            <Check className="w-4 h-4" />
                            Get Started
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

// Feature Tour Tooltip
interface TourStep {
    target: string;
    title: string;
    description: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function FeatureTour({ steps, onComplete }: { steps: TourStep[]; onComplete: () => void }) {
    const [currentStep, setCurrentStep] = useState(0);

    const current = steps[currentStep];
    if (!current) return null;

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />

            {/* Tooltip */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl p-4 max-w-xs"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                }}
            >
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-zinc-500">{currentStep + 1} of {steps.length}</span>
                    <button onClick={onComplete} className="text-zinc-500 hover:text-white">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <h4 className="text-white font-semibold mb-1">{current.title}</h4>
                <p className="text-zinc-400 text-sm mb-4">{current.description}</p>

                <div className="flex items-center justify-between">
                    {currentStep > 0 && (
                        <button
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="text-zinc-400 hover:text-white text-sm"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (currentStep < steps.length - 1) {
                                setCurrentStep(currentStep + 1);
                            } else {
                                onComplete();
                            }
                        }}
                        className="ml-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg text-sm"
                    >
                        {currentStep < steps.length - 1 ? 'Next' : 'Got it!'}
                    </button>
                </div>
            </motion.div>
        </>
    );
}

// Welcome Back Message
export function WelcomeBackBanner({ userName, savings }: { userName?: string; savings: number }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-amber-500/20 via-transparent to-violet-500/20 border border-amber-500/30 rounded-xl p-4 mb-6"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">
                            {greeting}{userName ? `, ${userName}` : ''}! 👋
                        </h3>
                        <p className="text-zinc-400 text-sm">
                            You've saved <span className="text-emerald-400 font-medium">${savings}</span> with Tadow. Keep hunting!
                        </p>
                    </div>
                </div>
                <button onClick={() => setDismissed(true)} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

// Empty State Component
export function EmptyState({
    icon: Icon = Heart,
    title,
    description,
    action,
    actionLabel,
}: {
    icon?: React.ElementType;
    title: string;
    description: string;
    action?: () => void;
    actionLabel?: string;
}) {
    return (
        <div className="text-center py-16">
            <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
            <p className="text-zinc-400 mb-6 max-w-md mx-auto">{description}</p>
            {action && actionLabel && (
                <button
                    onClick={action}
                    className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl"
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default { OnboardingFlow, FeatureTour, WelcomeBackBanner, EmptyState };
