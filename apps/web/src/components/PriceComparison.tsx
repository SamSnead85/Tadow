import {
    ExternalLink, Check, TrendingDown, TrendingUp,
    Package, Truck, Shield, Star, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Retailer Data
interface RetailerInfo {
    id: string;
    name: string;
    logo?: string;
    trustScore: number;
    avgShipping: string;
    returnPolicy: string;
    priceMatchGuarantee: boolean;
    features: string[];
}

const RETAILERS: Record<string, RetailerInfo> = {
    amazon: {
        id: 'amazon',
        name: 'Amazon',
        trustScore: 95,
        avgShipping: '1-2 days',
        returnPolicy: '30 days',
        priceMatchGuarantee: false,
        features: ['Prime eligible', 'Easy returns', 'Wide selection'],
    },
    bestbuy: {
        id: 'bestbuy',
        name: 'Best Buy',
        trustScore: 92,
        avgShipping: '2-4 days',
        returnPolicy: '15 days',
        priceMatchGuarantee: true,
        features: ['Price match', 'In-store pickup', 'Geek Squad'],
    },
    walmart: {
        id: 'walmart',
        name: 'Walmart',
        trustScore: 88,
        avgShipping: '2-3 days',
        returnPolicy: '90 days',
        priceMatchGuarantee: false,
        features: ['Free shipping $35+', 'In-store pickup', 'Long returns'],
    },
    target: {
        id: 'target',
        name: 'Target',
        trustScore: 90,
        avgShipping: '2-5 days',
        returnPolicy: '90 days',
        priceMatchGuarantee: true,
        features: ['Price match', 'RedCard 5% off', 'Same-day delivery'],
    },
    newegg: {
        id: 'newegg',
        name: 'Newegg',
        trustScore: 85,
        avgShipping: '3-5 days',
        returnPolicy: '30 days',
        priceMatchGuarantee: false,
        features: ['Tech focused', 'Build guides', 'Combo deals'],
    },
};

// Price Comparison Card
interface PriceOption {
    retailer: string;
    price: number;
    shipping: number;
    inStock: boolean;
    deliveryDate: string;
    url: string;
    isLowest?: boolean;
}

interface PriceComparisonProps {
    productTitle: string;
    options: PriceOption[];
}

export function PriceComparison({ productTitle: _productTitle, options }: PriceComparisonProps) {
    const sortedOptions = [...options].sort((a, b) => (a.price + a.shipping) - (b.price + b.shipping));

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800">
                <h3 className="text-lg font-semibold text-white">Compare Prices</h3>
                <p className="text-sm text-zinc-400">{options.length} retailers have this item</p>
            </div>

            <div className="divide-y divide-zinc-800/50">
                {sortedOptions.map((option, i) => {
                    const retailer = RETAILERS[option.retailer.toLowerCase()] || { name: option.retailer, trustScore: 80 };

                    return (
                        <div
                            key={option.retailer}
                            className={`p-4 transition-colors hover:bg-zinc-800/30 ${i === 0 ? 'bg-emerald-500/5' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Retailer */}
                                <div className="w-24">
                                    <div className="font-medium text-white">{retailer.name}</div>
                                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                                        <Star className="w-3 h-3 text-amber-400" />
                                        {retailer.trustScore}%
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xl font-bold text-white">${option.price.toFixed(2)}</span>
                                        {i === 0 && (
                                            <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                                                LOWEST
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {option.shipping > 0 ? `+$${option.shipping} shipping` : 'Free shipping'}
                                    </div>
                                </div>

                                {/* Delivery */}
                                <div className="text-right text-sm">
                                    <div className={`${option.inStock ? 'text-emerald-400' : 'text-orange-400'}`}>
                                        {option.inStock ? 'In Stock' : 'Low Stock'}
                                    </div>
                                    <div className="text-zinc-500 flex items-center gap-1">
                                        <Truck className="w-3 h-3" />
                                        {option.deliveryDate}
                                    </div>
                                </div>

                                {/* Action */}
                                <a
                                    href={option.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${i === 0
                                        ? 'bg-emerald-500 hover:bg-emerald-400 text-white'
                                        : 'bg-zinc-800 hover:bg-zinc-700 text-white'
                                        }`}
                                >
                                    Buy <ExternalLink className="w-3 h-3 inline ml-1" />
                                </a>
                            </div>

                            {/* Features */}
                            {i === 0 && retailer.features && (
                                <div className="flex gap-2 mt-3">
                                    {retailer.features.map(f => (
                                        <span key={f} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="px-5 py-3 bg-zinc-800/30 text-xs text-zinc-500 text-center">
                Prices updated 5 minutes ago • <button className="text-amber-400 hover:underline">Refresh</button>
            </div>
        </div>
    );
}

// Retailer Trust Badge
export function RetailerTrustBadge({ retailerId }: { retailerId: string }) {
    const retailer = RETAILERS[retailerId.toLowerCase()];
    if (!retailer) return null;

    return (
        <div className="flex items-center gap-3 p-3 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold">
                {retailer.name[0]}
            </div>
            <div className="flex-1">
                <div className="text-white font-medium">{retailer.name}</div>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span className="flex items-center gap-1">
                        <Shield className="w-3 h-3 text-emerald-400" />
                        {retailer.trustScore}% Trust
                    </span>
                    <span className="flex items-center gap-1">
                        <Truck className="w-3 h-3" />
                        {retailer.avgShipping}
                    </span>
                    <span className="flex items-center gap-1">
                        <Package className="w-3 h-3" />
                        {retailer.returnPolicy} returns
                    </span>
                </div>
            </div>
            {retailer.priceMatchGuarantee && (
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                    Price Match
                </span>
            )}
        </div>
    );
}

// Price History Mini Chart
interface PriceHistoryPoint {
    date: string;
    price: number;
}

export function PriceHistoryMini({ history, currentPrice }: { history: PriceHistoryPoint[]; currentPrice: number }) {
    const prices = history.map(h => h.price);
    const minPrice = Math.min(...prices, currentPrice);
    const maxPrice = Math.max(...prices, currentPrice);
    const range = maxPrice - minPrice || 1;

    const allTimeLow = minPrice === currentPrice;
    const nearAllTimeLow = currentPrice <= minPrice * 1.05;
    const trend = history.length >= 2
        ? history[history.length - 1].price < history[0].price ? 'down' : 'up'
        : 'stable';

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-white font-medium">Price History</h4>
                <div className={`flex items-center gap-1 text-sm ${allTimeLow ? 'text-emerald-400' : nearAllTimeLow ? 'text-amber-400' : 'text-zinc-400'
                    }`}>
                    {allTimeLow ? (
                        <>
                            <Check className="w-4 h-4" />
                            All-time low!
                        </>
                    ) : nearAllTimeLow ? (
                        <>
                            <TrendingDown className="w-4 h-4" />
                            Near lowest
                        </>
                    ) : trend === 'down' ? (
                        <>
                            <TrendingDown className="w-4 h-4" />
                            Trending down
                        </>
                    ) : (
                        <>
                            <TrendingUp className="w-4 h-4" />
                            Trending up
                        </>
                    )}
                </div>
            </div>

            {/* Mini Chart */}
            <div className="h-16 flex items-end gap-1 mb-2">
                {history.map((point, i) => {
                    const height = ((point.price - minPrice) / range) * 100;
                    const isLowest = point.price === minPrice;
                    return (
                        <div
                            key={i}
                            className={`flex-1 rounded-t transition-all ${isLowest ? 'bg-emerald-500' : 'bg-zinc-700 hover:bg-zinc-600'
                                }`}
                            style={{ height: `${Math.max(height, 10)}%` }}
                            title={`$${point.price} on ${point.date}`}
                        />
                    );
                })}
                {/* Current price bar */}
                <div
                    className={`flex-1 rounded-t ${allTimeLow ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                    style={{ height: `${Math.max(((currentPrice - minPrice) / range) * 100, 10)}%` }}
                    title={`$${currentPrice} (Current)`}
                />
            </div>

            <div className="flex justify-between text-xs text-zinc-500">
                <span>30 days ago</span>
                <span>Today</span>
            </div>

            <Link to="#" className="block mt-3 text-center text-sm text-amber-400 hover:underline">
                View full price history →
            </Link>
        </div>
    );
}

// Stock Checker
interface StockStatus {
    retailer: string;
    inStock: boolean;
    quantity?: number;
    lastChecked: string;
}

export function StockChecker({ statuses }: { statuses: StockStatus[] }) {
    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
                <Package className="w-4 h-4 text-zinc-500" />
                Stock Status
            </h4>
            <div className="space-y-2">
                {statuses.map(status => (
                    <div key={status.retailer} className="flex items-center justify-between">
                        <span className="text-zinc-300">{status.retailer}</span>
                        <div className="flex items-center gap-2">
                            {status.inStock ? (
                                <span className="flex items-center gap-1 text-emerald-400 text-sm">
                                    <Check className="w-4 h-4" />
                                    {status.quantity ? `${status.quantity} left` : 'In Stock'}
                                </span>
                            ) : (
                                <span className="flex items-center gap-1 text-red-400 text-sm">
                                    <AlertCircle className="w-4 h-4" />
                                    Out of Stock
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            <p className="text-xs text-zinc-600 mt-3">Last checked: {statuses[0]?.lastChecked || 'Just now'}</p>
        </div>
    );
}

export default { PriceComparison, RetailerTrustBadge, PriceHistoryMini, StockChecker };
