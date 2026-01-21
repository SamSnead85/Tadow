import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    ShoppingBag, Camera, Scan, Check, X,
    TrendingDown, TrendingUp, Star, AlertCircle, Sparkles
} from 'lucide-react';

// Product Scanner (Visual/Barcode)
interface ScanResult {
    title: string;
    brand: string;
    category: string;
    currentPrice: number;
    lowestPrice: number;
    highestPrice: number;
    priceRating: 'excellent' | 'good' | 'fair' | 'avoid';
    suggestion: string;
}

export function ProductScanner() {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState<ScanResult | null>(null);

    const mockScan = () => {
        setScanning(true);

        // Simulate scanning delay
        setTimeout(() => {
            setResult({
                title: 'Apple MacBook Air M3 15"',
                brand: 'Apple',
                category: 'Laptops',
                currentPrice: 1299,
                lowestPrice: 1199,
                highestPrice: 1499,
                priceRating: 'good',
                suggestion: 'Wait 2 weeks - prices typically drop 8% during Presidents Day sales',
            });
            setScanning(false);
        }, 2000);
    };

    const getRatingColor = (rating: ScanResult['priceRating']) => {
        switch (rating) {
            case 'excellent': return 'emerald';
            case 'good': return 'blue';
            case 'fair': return 'amber';
            case 'avoid': return 'red';
        }
    };

    const getRatingText = (rating: ScanResult['priceRating']) => {
        switch (rating) {
            case 'excellent': return 'Buy now! Best price';
            case 'good': return 'Good price';
            case 'fair': return 'Fair price - can be better';
            case 'avoid': return 'Wait for a better price';
        }
    };

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
                <Scan className="w-6 h-6 text-amber-400" />
                <h3 className="text-xl font-bold text-white">Scan & Compare</h3>
            </div>

            {!result && !scanning && (
                <div className="text-center py-8">
                    <div className="w-20 h-20 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-10 h-10 text-zinc-500" />
                    </div>
                    <h4 className="text-white font-medium mb-2">Scan a Product</h4>
                    <p className="text-zinc-400 text-sm mb-6">
                        Point your camera at a product or barcode to see if you're getting a good deal
                    </p>
                    <button
                        onClick={mockScan}
                        className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl transition-colors"
                    >
                        Start Scanning
                    </button>
                </div>
            )}

            {scanning && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 rounded-2xl border-4 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
                    <p className="text-amber-400 font-medium">Scanning...</p>
                    <p className="text-zinc-500 text-sm mt-1">Analyzing product and comparing prices</p>
                </div>
            )}

            {result && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="text-amber-400 text-sm">{result.brand}</span>
                            <h4 className="text-lg font-semibold text-white">{result.title}</h4>
                        </div>
                        <button onClick={() => setResult(null)} className="p-1 text-zinc-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Price Rating */}
                    <div className={`p-4 rounded-lg bg-${getRatingColor(result.priceRating)}-500/10 border border-${getRatingColor(result.priceRating)}-500/30`}>
                        <div className="flex items-center gap-2 mb-2">
                            {result.priceRating === 'excellent' || result.priceRating === 'good' ? (
                                <Check className={`w-5 h-5 text-${getRatingColor(result.priceRating)}-400`} />
                            ) : (
                                <AlertCircle className={`w-5 h-5 text-${getRatingColor(result.priceRating)}-400`} />
                            )}
                            <span className={`font-medium text-${getRatingColor(result.priceRating)}-400`}>
                                {getRatingText(result.priceRating)}
                            </span>
                        </div>
                        <p className="text-sm text-zinc-300">{result.suggestion}</p>
                    </div>

                    {/* Price Range */}
                    <div className="bg-zinc-800/50 rounded-lg p-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-zinc-400">Price Range (90 days)</span>
                        </div>
                        <div className="relative h-2 bg-zinc-700 rounded-full mb-2">
                            <div
                                className="absolute h-full bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full"
                                style={{
                                    left: '0%',
                                    width: `${((result.currentPrice - result.lowestPrice) / (result.highestPrice - result.lowestPrice)) * 100}%`
                                }}
                            />
                            <div
                                className="absolute w-4 h-4 bg-white rounded-full -top-1 shadow-lg"
                                style={{
                                    left: `${((result.currentPrice - result.lowestPrice) / (result.highestPrice - result.lowestPrice)) * 100}%`,
                                    transform: 'translateX(-50%)'
                                }}
                            />
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-emerald-400">${result.lowestPrice} (Low)</span>
                            <span className="text-white font-bold">${result.currentPrice}</span>
                            <span className="text-red-400">${result.highestPrice} (High)</span>
                        </div>
                    </div>

                    <button className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors">
                        Set Price Alert
                    </button>

                    <button
                        onClick={() => setResult(null)}
                        className="w-full py-2 text-zinc-400 hover:text-white text-sm"
                    >
                        Scan Another Product
                    </button>
                </motion.div>
            )}
        </div>
    );
}

// AI Shopping Assistant Quick Actions
interface QuickAction {
    id: string;
    icon: React.ElementType;
    title: string;
    description: string;
    action: () => void;
}

export function AIQuickActions({ onAction }: { onAction?: (action: string) => void }) {
    const actions: QuickAction[] = [
        {
            id: 'best-deals',
            icon: Star,
            title: 'Best Deals Right Now',
            description: 'Show me the hottest deals today',
            action: () => onAction?.('best-deals'),
        },
        {
            id: 'price-check',
            icon: TrendingDown,
            title: 'Check a Price',
            description: 'Is this product at a good price?',
            action: () => onAction?.('price-check'),
        },
        {
            id: 'buy-or-wait',
            icon: TrendingUp,
            title: 'Should I Buy or Wait?',
            description: 'Get timing advice on a purchase',
            action: () => onAction?.('buy-or-wait'),
        },
        {
            id: 'find-similar',
            icon: Sparkles,
            title: 'Find Alternatives',
            description: 'Show me similar products for less',
            action: () => onAction?.('find-similar'),
        },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {actions.map(action => (
                <button
                    key={action.id}
                    onClick={action.action}
                    className="flex flex-col items-start gap-2 p-4 bg-zinc-900/60 border border-zinc-800 rounded-xl hover:border-amber-500/50 hover:bg-zinc-800/50 transition-all text-left"
                >
                    <action.icon className="w-5 h-5 text-amber-400" />
                    <div>
                        <div className="text-white font-medium text-sm">{action.title}</div>
                        <div className="text-zinc-500 text-xs">{action.description}</div>
                    </div>
                </button>
            ))}
        </div>
    );
}

// Buying Guide Generator
interface BuyingGuide {
    category: string;
    things_to_consider: string[];
    top_picks: { title: string; price: number; reason: string }[];
    avoid: string[];
    best_time_to_buy: string;
}

export function BuyingGuideCard({ category }: { category: string }) {
    const [guide, setGuide] = useState<BuyingGuide | null>(null);
    const [loading, setLoading] = useState(false);

    const generateGuide = () => {
        setLoading(true);
        // Simulate AI generation
        setTimeout(() => {
            setGuide({
                category,
                things_to_consider: [
                    'Processor (M3 vs Intel for Mac)',
                    'RAM (16GB minimum for future-proofing)',
                    'Storage (512GB SSD recommended)',
                    'Display quality and size',
                    'Battery life for portability',
                ],
                top_picks: [
                    { title: 'MacBook Air M3', price: 1099, reason: 'Best overall value' },
                    { title: 'Dell XPS 13', price: 999, reason: 'Best Windows ultrabook' },
                    { title: 'ThinkPad X1 Carbon', price: 1199, reason: 'Best for business' },
                ],
                avoid: [
                    'Laptops with less than 8GB RAM',
                    'HDD storage (always get SSD)',
                    'Refurbished without warranty',
                ],
                best_time_to_buy: 'Back-to-school sales (August) or Black Friday for 20-30% off',
            });
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-4">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <h4 className="text-lg font-semibold text-white">Buying Guide: {category}</h4>
            </div>

            {!guide && !loading && (
                <div className="text-center py-6">
                    <p className="text-zinc-400 mb-4">Get AI-powered recommendations for buying a {category.toLowerCase()}</p>
                    <button
                        onClick={generateGuide}
                        className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg"
                    >
                        Generate Guide
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full" />
                </div>
            )}

            {guide && (
                <div className="space-y-4">
                    <div>
                        <h5 className="text-white font-medium mb-2">Things to Consider</h5>
                        <ul className="space-y-1">
                            {guide.things_to_consider.map((item, i) => (
                                <li key={i} className="flex items-center gap-2 text-sm text-zinc-400">
                                    <Check className="w-4 h-4 text-emerald-400" />
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h5 className="text-white font-medium mb-2">Top Picks</h5>
                        <div className="space-y-2">
                            {guide.top_picks.map((pick, i) => (
                                <div key={i} className="flex items-center justify-between p-2 bg-zinc-800/50 rounded">
                                    <div>
                                        <div className="text-white text-sm">{pick.title}</div>
                                        <div className="text-xs text-zinc-500">{pick.reason}</div>
                                    </div>
                                    <span className="text-amber-400 font-medium">${pick.price}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h5 className="text-blue-400 font-medium text-sm mb-1">Best Time to Buy</h5>
                        <p className="text-zinc-300 text-sm">{guide.best_time_to_buy}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default { ProductScanner, AIQuickActions, BuyingGuideCard };
