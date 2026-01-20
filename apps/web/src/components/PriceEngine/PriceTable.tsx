import { motion } from 'framer-motion';
import { ExternalLink, TrendingDown, Bell } from 'lucide-react';
import type { Price } from '@/types';

interface PriceTableProps {
    prices: Price[];
    productName: string;
}

// Retailer logos/colors
const retailerConfig: Record<string, { color: string; bgColor: string }> = {
    'Amazon': { color: '#FF9900', bgColor: 'bg-orange-50' },
    'Best Buy': { color: '#0046BE', bgColor: 'bg-blue-50' },
    'Walmart': { color: '#0071CE', bgColor: 'bg-blue-50' },
    'B&H Photo': { color: '#000000', bgColor: 'bg-noir-50' },
    'Newegg': { color: '#E65C00', bgColor: 'bg-orange-50' },
    'Manufacturer': { color: '#374151', bgColor: 'bg-noir-50' },
};

export function PriceTable({ prices, productName }: PriceTableProps) {
    // Sort by price, lowest first
    const sortedPrices = [...prices].sort((a, b) => a.price - b.price);
    const lowestPrice = sortedPrices[0]?.price;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-card rounded-xl overflow-hidden"
        >
            {/* Header */}
            <div className="p-6 border-b border-noir-100">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-noir-900">Live Prices & Availability</h3>
                        <p className="text-sm text-noir-500 mt-1">
                            Compare prices across major retailers
                        </p>
                    </div>
                    <button className="btn-ghost text-sm flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        Track Price
                    </button>
                </div>
            </div>

            {/* Price List */}
            <div className="divide-y divide-noir-100">
                {sortedPrices.map((price, index) => {
                    const config = retailerConfig[price.retailer] || retailerConfig['Manufacturer'];
                    const isLowest = price.price === lowestPrice;

                    return (
                        <motion.div
                            key={price.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.7 + index * 0.1 }}
                            className="price-row"
                        >
                            {/* Retailer */}
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                                    <span
                                        className="font-bold text-sm"
                                        style={{ color: config.color }}
                                    >
                                        {price.retailer.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <p className="font-medium text-noir-900">{price.retailer}</p>
                                    <p className="text-xs text-noir-500">
                                        {price.inStock ? 'In Stock' : 'Out of Stock'}
                                    </p>
                                </div>
                            </div>

                            {/* Price & Action */}
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <div className="flex items-center gap-2">
                                        {isLowest && (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                                                <TrendingDown className="w-3 h-3" />
                                                Lowest
                                            </span>
                                        )}
                                        <span className="font-display font-bold text-xl text-noir-900">
                                            ${price.price.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <motion.a
                                    href={price.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`btn-primary text-sm ${!price.inStock ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    Buy Now
                                    <ExternalLink className="w-4 h-4" />
                                </motion.a>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Footer */}
            <div className="p-4 bg-noir-50/50 border-t border-noir-100">
                <p className="text-xs text-noir-500 text-center">
                    Prices updated in real-time. We may earn affiliate commission from purchases.
                </p>
            </div>
        </motion.div>
    );
}
