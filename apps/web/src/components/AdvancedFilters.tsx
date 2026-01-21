import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X, ChevronDown, Check, DollarSign, TrendingDown, Zap } from 'lucide-react';

interface FilterState {
    categories: string[];
    brands: string[];
    priceMin: number | null;
    priceMax: number | null;
    minDiscount: number | null;
    minScore: number | null;
    condition: string[];
    marketplace: string[];
    sortBy: string;
    onlyHot: boolean;
    onlyAllTimeLow: boolean;
}

interface AdvancedFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    onReset: () => void;
    resultCount?: number;
}

const CATEGORIES = ['Laptops', 'Phones', 'Gaming', 'Audio', 'TVs', 'Tablets', 'Wearables', 'Cameras', 'Home'];
const BRANDS = ['Apple', 'Samsung', 'Sony', 'Microsoft', 'Google', 'Dell', 'HP', 'Lenovo', 'ASUS', 'LG', 'Bose', 'Nintendo'];
const SORT_OPTIONS = [
    { value: 'score', label: 'Best Score' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'discount', label: 'Biggest Discount' },
    { value: 'newest', label: 'Newest First' },
];

export function AdvancedFilters({ filters, onChange, onReset, resultCount }: AdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeSection, setActiveSection] = useState<string | null>(null);

    const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
        onChange({ ...filters, [key]: value });
    };

    const toggleArrayItem = (key: 'categories' | 'brands' | 'marketplace' | 'condition', item: string) => {
        const current = filters[key];
        const newValue = current.includes(item)
            ? current.filter(i => i !== item)
            : [...current, item];
        updateFilter(key, newValue);
    };

    const activeFilterCount = [
        filters.categories.length,
        filters.brands.length,
        filters.priceMin || filters.priceMax ? 1 : 0,
        filters.minDiscount ? 1 : 0,
        filters.minScore ? 1 : 0,
        filters.condition.length,
        filters.marketplace.length,
        filters.onlyHot ? 1 : 0,
        filters.onlyAllTimeLow ? 1 : 0,
    ].reduce((a, b) => a + b, 0);

    return (
        <div className="relative">
            {/* Filter Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isOpen || activeFilterCount > 0
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-zinc-800 text-zinc-300 border border-zinc-700 hover:border-zinc-600'
                    }`}
            >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {activeFilterCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-amber-500 text-black text-xs font-bold flex items-center justify-center">
                        {activeFilterCount}
                    </span>
                )}
            </button>

            {/* Filter Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 mt-2 w-[340px] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-50 overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
                            <h3 className="text-sm font-semibold text-white">Filter Results</h3>
                            <div className="flex items-center gap-2">
                                {activeFilterCount > 0 && (
                                    <button onClick={onReset} className="text-xs text-zinc-500 hover:text-amber-400">
                                        Reset all
                                    </button>
                                )}
                                <button onClick={() => setIsOpen(false)} className="p-1 text-zinc-500 hover:text-white">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="max-h-[60vh] overflow-y-auto">
                            {/* Quick Toggles */}
                            <div className="p-4 border-b border-zinc-800 space-y-2">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.onlyHot}
                                        onChange={(e) => updateFilter('onlyHot', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${filters.onlyHot ? 'bg-orange-500 border-orange-500' : 'border-zinc-600'
                                        }`}>
                                        {filters.onlyHot && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <Zap className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm text-white">Hot Deals Only</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.onlyAllTimeLow}
                                        onChange={(e) => updateFilter('onlyAllTimeLow', e.target.checked)}
                                        className="sr-only"
                                    />
                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${filters.onlyAllTimeLow ? 'bg-emerald-500 border-emerald-500' : 'border-zinc-600'
                                        }`}>
                                        {filters.onlyAllTimeLow && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <TrendingDown className="w-4 h-4 text-emerald-400" />
                                    <span className="text-sm text-white">All-Time Low Prices</span>
                                </label>
                            </div>

                            {/* Price Range */}
                            <div className="p-4 border-b border-zinc-800">
                                <button
                                    onClick={() => setActiveSection(activeSection === 'price' ? null : 'price')}
                                    className="w-full flex items-center justify-between text-sm text-white"
                                >
                                    <span className="flex items-center gap-2">
                                        <DollarSign className="w-4 h-4 text-emerald-400" />
                                        Price Range
                                    </span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'price' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeSection === 'price' && (
                                    <div className="mt-3 flex items-center gap-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.priceMin || ''}
                                            onChange={(e) => updateFilter('priceMin', e.target.value ? Number(e.target.value) : null)}
                                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
                                        />
                                        <span className="text-zinc-500">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.priceMax || ''}
                                            onChange={(e) => updateFilter('priceMax', e.target.value ? Number(e.target.value) : null)}
                                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Categories */}
                            <div className="p-4 border-b border-zinc-800">
                                <button
                                    onClick={() => setActiveSection(activeSection === 'categories' ? null : 'categories')}
                                    className="w-full flex items-center justify-between text-sm text-white"
                                >
                                    <span>Categories {filters.categories.length > 0 && `(${filters.categories.length})`}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'categories' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeSection === 'categories' && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => toggleArrayItem('categories', cat)}
                                                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${filters.categories.includes(cat)
                                                    ? 'bg-amber-500 text-black'
                                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Brands */}
                            <div className="p-4 border-b border-zinc-800">
                                <button
                                    onClick={() => setActiveSection(activeSection === 'brands' ? null : 'brands')}
                                    className="w-full flex items-center justify-between text-sm text-white"
                                >
                                    <span>Brands {filters.brands.length > 0 && `(${filters.brands.length})`}</span>
                                    <ChevronDown className={`w-4 h-4 transition-transform ${activeSection === 'brands' ? 'rotate-180' : ''}`} />
                                </button>
                                {activeSection === 'brands' && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {BRANDS.map(brand => (
                                            <button
                                                key={brand}
                                                onClick={() => toggleArrayItem('brands', brand)}
                                                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${filters.brands.includes(brand)
                                                    ? 'bg-amber-500 text-black'
                                                    : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                                    }`}
                                            >
                                                {brand}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Min Discount */}
                            <div className="p-4 border-b border-zinc-800">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white">Minimum Discount</span>
                                    <span className="text-sm text-amber-400">{filters.minDiscount || 0}%+</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="50"
                                    step="5"
                                    value={filters.minDiscount || 0}
                                    onChange={(e) => updateFilter('minDiscount', Number(e.target.value) || null)}
                                    className="w-full accent-amber-500"
                                />
                            </div>

                            {/* Sort */}
                            <div className="p-4">
                                <span className="text-sm text-white block mb-2">Sort By</span>
                                <select
                                    value={filters.sortBy}
                                    onChange={(e) => updateFilter('sortBy', e.target.value)}
                                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white"
                                >
                                    {SORT_OPTIONS.map(opt => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-zinc-800 bg-zinc-900/80">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
                            >
                                {resultCount !== undefined ? `Show ${resultCount} results` : 'Apply Filters'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Default filter state
export function getDefaultFilters(): FilterState {
    return {
        categories: [],
        brands: [],
        priceMin: null,
        priceMax: null,
        minDiscount: null,
        minScore: null,
        condition: [],
        marketplace: [],
        sortBy: 'score',
        onlyHot: false,
        onlyAllTimeLow: false,
    };
}

// Apply filters to deals
export function applyFilters<T extends {
    category?: string;
    brand?: string;
    currentPrice: number;
    discountPercent: number;
    dealScore?: number;
    isHot?: boolean;
    isAllTimeLow?: boolean;
}>(deals: T[], filters: FilterState): T[] {
    return deals.filter(deal => {
        if (filters.categories.length && !filters.categories.includes(deal.category || '')) return false;
        if (filters.brands.length && !filters.brands.includes(deal.brand || '')) return false;
        if (filters.priceMin && deal.currentPrice < filters.priceMin) return false;
        if (filters.priceMax && deal.currentPrice > filters.priceMax) return false;
        if (filters.minDiscount && deal.discountPercent < filters.minDiscount) return false;
        if (filters.minScore && (deal.dealScore || 0) < filters.minScore) return false;
        if (filters.onlyHot && !deal.isHot) return false;
        if (filters.onlyAllTimeLow && !deal.isAllTimeLow) return false;
        return true;
    });
}
