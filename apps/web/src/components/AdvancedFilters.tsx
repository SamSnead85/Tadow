import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Grid, List, SlidersHorizontal, Check, ChevronDown,
    ArrowUpDown, X, Zap
} from 'lucide-react';

// Filter Types
export interface FilterOptions {
    categories: string[];
    brands: string[];
    priceRange: [number, number];
    discountMin: number;
    inStockOnly: boolean;
    hotDealsOnly: boolean;
    sortBy: 'relevance' | 'price_low' | 'price_high' | 'discount' | 'newest' | 'popularity';
}

const defaultFilters: FilterOptions = {
    categories: [],
    brands: [],
    priceRange: [0, 5000],
    discountMin: 0,
    inStockOnly: false,
    hotDealsOnly: false,
    sortBy: 'relevance',
};

// Advanced Filter Panel
export function AdvancedFilterPanel({
    filters,
    onChange,
    availableCategories,
    availableBrands,
    onReset,
}: {
    filters: FilterOptions;
    onChange: (filters: FilterOptions) => void;
    availableCategories: string[];
    availableBrands: string[];
    onReset: () => void;
}) {
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['categories']));

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) next.delete(section);
            else next.add(section);
            return next;
        });
    };

    const toggleCategory = (cat: string) => {
        onChange({
            ...filters,
            categories: filters.categories.includes(cat)
                ? filters.categories.filter(c => c !== cat)
                : [...filters.categories, cat]
        });
    };

    const toggleBrand = (brand: string) => {
        onChange({
            ...filters,
            brands: filters.brands.includes(brand)
                ? filters.brands.filter(b => b !== brand)
                : [...filters.brands, brand]
        });
    };

    const activeFilterCount =
        filters.categories.length +
        filters.brands.length +
        (filters.discountMin > 0 ? 1 : 0) +
        (filters.inStockOnly ? 1 : 0) +
        (filters.hotDealsOnly ? 1 : 0);

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-white">Filters</h3>
                    {activeFilterCount > 0 && (
                        <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full">
                            {activeFilterCount}
                        </span>
                    )}
                </div>
                {activeFilterCount > 0 && (
                    <button onClick={onReset} className="text-sm text-zinc-400 hover:text-white">
                        Reset
                    </button>
                )}
            </div>

            {/* Categories */}
            <FilterSection
                title="Categories"
                expanded={expandedSections.has('categories')}
                onToggle={() => toggleSection('categories')}
            >
                <div className="space-y-1">
                    {availableCategories.map(cat => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer py-1">
                            <input
                                type="checkbox"
                                checked={filters.categories.includes(cat)}
                                onChange={() => toggleCategory(cat)}
                                className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-zinc-300 text-sm">{cat}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Brands */}
            <FilterSection
                title="Brands"
                expanded={expandedSections.has('brands')}
                onToggle={() => toggleSection('brands')}
            >
                <div className="grid grid-cols-2 gap-1">
                    {availableBrands.slice(0, 12).map(brand => (
                        <label key={brand} className="flex items-center gap-2 cursor-pointer py-1">
                            <input
                                type="checkbox"
                                checked={filters.brands.includes(brand)}
                                onChange={() => toggleBrand(brand)}
                                className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
                            />
                            <span className="text-zinc-300 text-sm truncate">{brand}</span>
                        </label>
                    ))}
                </div>
            </FilterSection>

            {/* Price Range */}
            <FilterSection
                title="Price Range"
                expanded={expandedSections.has('price')}
                onToggle={() => toggleSection('price')}
            >
                <div className="space-y-3">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={filters.priceRange[0]}
                            onChange={e => onChange({ ...filters, priceRange: [Number(e.target.value), filters.priceRange[1]] })}
                            placeholder="Min"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        />
                        <span className="text-zinc-500 self-center">-</span>
                        <input
                            type="number"
                            value={filters.priceRange[1]}
                            onChange={e => onChange({ ...filters, priceRange: [filters.priceRange[0], Number(e.target.value)] })}
                            placeholder="Max"
                            className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm"
                        />
                    </div>
                </div>
            </FilterSection>

            {/* Discount */}
            <FilterSection
                title="Minimum Discount"
                expanded={expandedSections.has('discount')}
                onToggle={() => toggleSection('discount')}
            >
                <div className="space-y-2">
                    <input
                        type="range"
                        min="0"
                        max="75"
                        step="5"
                        value={filters.discountMin}
                        onChange={e => onChange({ ...filters, discountMin: Number(e.target.value) })}
                        className="w-full accent-amber-500"
                    />
                    <div className="flex justify-between text-xs text-zinc-500">
                        <span>Any</span>
                        <span className="text-amber-400">{filters.discountMin}%+</span>
                        <span>75%</span>
                    </div>
                </div>
            </FilterSection>

            {/* Quick Filters */}
            <div className="p-4 border-t border-zinc-800 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-zinc-300">
                        <Zap className="w-4 h-4 text-orange-400" />
                        Hot Deals Only
                    </span>
                    <input
                        type="checkbox"
                        checked={filters.hotDealsOnly}
                        onChange={e => onChange({ ...filters, hotDealsOnly: e.target.checked })}
                        className="rounded border-zinc-600 bg-zinc-800 text-amber-500"
                    />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                    <span className="flex items-center gap-2 text-zinc-300">
                        <Check className="w-4 h-4 text-emerald-400" />
                        In Stock Only
                    </span>
                    <input
                        type="checkbox"
                        checked={filters.inStockOnly}
                        onChange={e => onChange({ ...filters, inStockOnly: e.target.checked })}
                        className="rounded border-zinc-600 bg-zinc-800 text-amber-500"
                    />
                </label>
            </div>
        </div>
    );
}

// Collapsible Filter Section
function FilterSection({
    title,
    expanded,
    onToggle,
    children
}: {
    title: string;
    expanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <div className="border-t border-zinc-800">
            <button
                onClick={onToggle}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/30"
            >
                <span className="font-medium text-white">{title}</span>
                <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Sort Dropdown
export function SortDropdown({ value, onChange }: { value: FilterOptions['sortBy']; onChange: (value: FilterOptions['sortBy']) => void }) {
    const [open, setOpen] = useState(false);

    const options = [
        { value: 'relevance', label: 'Most Relevant' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'discount', label: 'Biggest Discount' },
        { value: 'newest', label: 'Newest First' },
        { value: 'popularity', label: 'Most Popular' },
    ];

    const current = options.find(o => o.value === value);

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:border-zinc-600"
            >
                <ArrowUpDown className="w-4 h-4" />
                <span>{current?.label || 'Sort'}</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {open && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-20 overflow-hidden"
                        >
                            {options.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => { onChange(option.value as any); setOpen(false); }}
                                    className={`w-full flex items-center justify-between px-4 py-2 text-left text-sm transition-colors ${value === option.value
                                        ? 'bg-amber-500/10 text-amber-400'
                                        : 'text-zinc-300 hover:bg-zinc-800'
                                        }`}
                                >
                                    {option.label}
                                    {value === option.value && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}

// View Toggle
export function ViewToggle({ view, onChange }: { view: 'grid' | 'list'; onChange: (view: 'grid' | 'list') => void }) {
    return (
        <div className="flex items-center bg-zinc-800 rounded-lg p-1">
            <button
                onClick={() => onChange('grid')}
                className={`p-2 rounded-md transition-colors ${view === 'grid' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'
                    }`}
            >
                <Grid className="w-4 h-4" />
            </button>
            <button
                onClick={() => onChange('list')}
                className={`p-2 rounded-md transition-colors ${view === 'list' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-white'
                    }`}
            >
                <List className="w-4 h-4" />
            </button>
        </div>
    );
}

// Active Filter Tags
export function ActiveFilterTags({
    filters,
    onRemove,
    onClear
}: {
    filters: FilterOptions;
    onRemove: (type: string, value: string) => void;
    onClear: () => void;
}) {
    const tags: { type: string; value: string; label: string }[] = [];

    filters.categories.forEach(cat => tags.push({ type: 'category', value: cat, label: cat }));
    filters.brands.forEach(brand => tags.push({ type: 'brand', value: brand, label: brand }));
    if (filters.discountMin > 0) tags.push({ type: 'discount', value: String(filters.discountMin), label: `${filters.discountMin}%+ off` });
    if (filters.inStockOnly) tags.push({ type: 'inStock', value: 'true', label: 'In Stock' });
    if (filters.hotDealsOnly) tags.push({ type: 'hotDeals', value: 'true', label: 'Hot Deals' });

    if (tags.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2">
            {tags.map((tag, i) => (
                <span
                    key={`${tag.type}-${tag.value}-${i}`}
                    className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm rounded-full"
                >
                    {tag.label}
                    <button onClick={() => onRemove(tag.type, tag.value)} className="hover:text-white">
                        <X className="w-3 h-3" />
                    </button>
                </span>
            ))}
            <button
                onClick={onClear}
                className="text-sm text-zinc-500 hover:text-white"
            >
                Clear all
            </button>
        </div>
    );
}

// Hook for filter management
export function useFilters(initialFilters = defaultFilters) {
    const [filters, setFilters] = useState<FilterOptions>(initialFilters);

    const updateFilters = (updates: Partial<FilterOptions>) => {
        setFilters(prev => ({ ...prev, ...updates }));
    };

    const resetFilters = () => setFilters(defaultFilters);

    const removeFilter = (type: string, value: string) => {
        switch (type) {
            case 'category':
                updateFilters({ categories: filters.categories.filter(c => c !== value) });
                break;
            case 'brand':
                updateFilters({ brands: filters.brands.filter(b => b !== value) });
                break;
            case 'discount':
                updateFilters({ discountMin: 0 });
                break;
            case 'inStock':
                updateFilters({ inStockOnly: false });
                break;
            case 'hotDeals':
                updateFilters({ hotDealsOnly: false });
                break;
        }
    };

    return {
        filters,
        updateFilters,
        setFilters,
        resetFilters,
        removeFilter,
    };
}

export default {
    AdvancedFilterPanel,
    SortDropdown,
    ViewToggle,
    ActiveFilterTags,
    useFilters,
};
