import { useState, useEffect, createContext, useContext, ReactNode } from 'react';

// A/B Test Types
interface Experiment {
    id: string;
    name: string;
    variants: string[];
    weights?: number[]; // Optional, defaults to equal distribution
}

interface ABTestContext {
    getVariant: (experimentId: string) => string | null;
    trackConversion: (experimentId: string, event: string) => void;
}

// Storage key
const STORAGE_KEY = 'tadow_ab_assignments';

// Active Experiments
const EXPERIMENTS: Experiment[] = [
    { id: 'homepage_hero', name: 'Homepage Hero', variants: ['control', 'ai_focus', 'savings_focus'] },
    { id: 'deal_card_layout', name: 'Deal Card Layout', variants: ['compact', 'expanded'] },
    { id: 'cta_color', name: 'CTA Button Color', variants: ['amber', 'emerald', 'violet'] },
    { id: 'price_display', name: 'Price Display', variants: ['savings_first', 'price_first'] },
    { id: 'ai_chat_prompt', name: 'AI Chat Prompt', variants: ['minimal', 'detailed'] },
];

// Context
const ABContext = createContext<ABTestContext | null>(null);

// Get stored assignments
function getAssignments(): Record<string, string> {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

// Assign variant
function assignVariant(experiment: Experiment): string {
    const { variants, weights } = experiment;

    if (weights && weights.length === variants.length) {
        // Weighted random
        const total = weights.reduce((a, b) => a + b, 0);
        let random = Math.random() * total;
        for (let i = 0; i < variants.length; i++) {
            random -= weights[i];
            if (random <= 0) return variants[i];
        }
    }

    // Equal distribution
    return variants[Math.floor(Math.random() * variants.length)];
}

// Provider Component
export function ABTestProvider({ children }: { children: ReactNode }) {
    const [assignments, setAssignments] = useState<Record<string, string>>({});

    useEffect(() => {
        const stored = getAssignments();
        const updated = { ...stored };

        // Assign variants for any new experiments
        EXPERIMENTS.forEach(exp => {
            if (!updated[exp.id]) {
                updated[exp.id] = assignVariant(exp);
            }
        });

        // Save assignments
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        setAssignments(updated);

        // Log assignments (in production, send to analytics)
        console.log('[A/B Tests] Assignments:', updated);
    }, []);

    const getVariant = (experimentId: string): string | null => {
        return assignments[experimentId] || null;
    };

    const trackConversion = (experimentId: string, event: string) => {
        // In production, send to analytics service
        console.log('[A/B Tests] Conversion:', { experimentId, variant: assignments[experimentId], event });

        // Store locally for demo
        const conversions = JSON.parse(localStorage.getItem('tadow_ab_conversions') || '[]');
        conversions.push({
            experimentId,
            variant: assignments[experimentId],
            event,
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem('tadow_ab_conversions', JSON.stringify(conversions));
    };

    return (
        <ABContext.Provider value={{ getVariant, trackConversion }}>
            {children}
        </ABContext.Provider>
    );
}

// Hook
export function useABTest(experimentId: string) {
    const context = useContext(ABContext);
    if (!context) {
        console.warn('useABTest must be used within ABTestProvider');
        return { variant: null, trackConversion: () => { } };
    }

    return {
        variant: context.getVariant(experimentId),
        trackConversion: (event: string) => context.trackConversion(experimentId, event),
    };
}

// Component for conditional rendering
export function ABTestVariant({
    experimentId,
    variant,
    children
}: {
    experimentId: string;
    variant: string;
    children: ReactNode;
}) {
    const { variant: currentVariant } = useABTest(experimentId);

    if (currentVariant !== variant) return null;
    return <>{children}</>;
}

// Admin Dashboard for A/B Tests
export function ABTestDashboard() {
    const [results, setResults] = useState<Record<string, any>>({});

    useEffect(() => {
        // Calculate mock results
        const mockResults: Record<string, any> = {};

        EXPERIMENTS.forEach(exp => {
            mockResults[exp.id] = {
                ...exp,
                results: exp.variants.map(v => ({
                    variant: v,
                    visitors: Math.floor(Math.random() * 1000 + 100),
                    conversions: Math.floor(Math.random() * 100),
                    rate: (Math.random() * 10 + 1).toFixed(2),
                })),
                winner: exp.variants[Math.floor(Math.random() * exp.variants.length)],
                confidence: (Math.random() * 30 + 70).toFixed(1),
            };
        });

        setResults(mockResults);
    }, []);

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white">A/B Test Results</h2>

            {Object.values(results).map((exp: any) => (
                <div key={exp.id} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">{exp.name}</h3>
                            <p className="text-sm text-zinc-500">ID: {exp.id}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${parseFloat(exp.confidence) >= 95
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {exp.confidence}% confidence
                        </span>
                    </div>

                    <div className="grid gap-3">
                        {exp.results?.map((result: any) => (
                            <div
                                key={result.variant}
                                className={`flex items-center justify-between p-3 rounded-lg ${result.variant === exp.winner
                                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                                        : 'bg-zinc-800/50'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`font-medium ${result.variant === exp.winner ? 'text-emerald-400' : 'text-zinc-300'
                                        }`}>
                                        {result.variant}
                                    </span>
                                    {result.variant === exp.winner && (
                                        <span className="px-2 py-0.5 bg-emerald-500 text-black text-xs font-bold rounded">
                                            WINNER
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="text-center">
                                        <div className="text-white font-medium">{result.visitors}</div>
                                        <div className="text-zinc-500 text-xs">visitors</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-white font-medium">{result.conversions}</div>
                                        <div className="text-zinc-500 text-xs">conversions</div>
                                    </div>
                                    <div className="text-center">
                                        <div className={`font-bold ${result.variant === exp.winner ? 'text-emerald-400' : 'text-white'
                                            }`}>
                                            {result.rate}%
                                        </div>
                                        <div className="text-zinc-500 text-xs">rate</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default { ABTestProvider, useABTest, ABTestVariant, ABTestDashboard };
