import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Clock, TrendingUp, Sparkles, ArrowRight, Laptop, Smartphone, Gamepad2, Headphones } from 'lucide-react';
import { getSearchHistory, addToSearchHistory, clearSearchHistory } from '../services/userDataService';

interface SearchAutocompleteProps {
    onSearch: (query: string) => void;
    onClose?: () => void;
    placeholder?: string;
}

// Trending searches (mock data)
const TRENDING_SEARCHES = [
    'MacBook Air M3',
    'iPhone 15 Pro',
    'PS5 Slim',
    'AirPods Pro 2',
    'Samsung OLED TV',
    'RTX 4090',
];

// Quick category filters
const QUICK_CATEGORIES = [
    { id: 'laptops', label: 'Laptops', icon: Laptop },
    { id: 'phones', label: 'Phones', icon: Smartphone },
    { id: 'gaming', label: 'Gaming', icon: Gamepad2 },
    { id: 'audio', label: 'Audio', icon: Headphones },
];

export function SearchAutocomplete({ onSearch, placeholder = 'Search deals...' }: SearchAutocompleteProps) {
    const [query, setQuery] = useState('');
    const [focused, setFocused] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches
    useEffect(() => {
        setRecentSearches(getSearchHistory());
    }, []);

    // Generate suggestions based on query
    useEffect(() => {
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        // Simple matching against known products/brands
        const allSuggestions = [
            'MacBook Air M3', 'MacBook Pro 16', 'Mac Mini M2',
            'iPhone 15 Pro', 'iPhone 15 Plus', 'iPhone SE',
            'iPad Pro M4', 'iPad Air M2', 'iPad 10th Gen',
            'Samsung Galaxy S24', 'Samsung Galaxy Z Fold', 'Samsung OLED TV',
            'Sony WH-1000XM5', 'Sony A7 IV', 'Sony PlayStation 5',
            'Apple Watch Ultra', 'Apple AirPods Pro', 'Apple HomePod',
            'Dell XPS 15', 'Dell Alienware', 'Dell Monitor',
            'NVIDIA RTX 4090', 'NVIDIA RTX 4080', 'NVIDIA GeForce',
            'Bose QuietComfort', 'Bose SoundLink', 'Bose Earbuds',
        ];

        const matches = allSuggestions.filter(s =>
            s.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 5);

        setSuggestions(matches);
    }, [query]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            addToSearchHistory(query);
            setRecentSearches(getSearchHistory());
            onSearch(query);
        }
    };

    const handleSuggestionClick = (suggestion: string) => {
        setQuery(suggestion);
        addToSearchHistory(suggestion);
        setRecentSearches(getSearchHistory());
        onSearch(suggestion);
    };

    const handleClearHistory = () => {
        clearSearchHistory();
        setRecentSearches([]);
    };

    const showDropdown = focused && (recentSearches.length > 0 || query.length >= 2 || !query);

    return (
        <div className="relative w-full">
            <form onSubmit={handleSubmit}>
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onFocus={() => setFocused(true)}
                        onBlur={() => setTimeout(() => setFocused(false), 200)}
                        placeholder={placeholder}
                        className="w-full pl-12 pr-12 py-4 bg-zinc-900/90 border border-zinc-700 focus:border-amber-500 rounded-xl text-white placeholder-zinc-500 outline-none text-lg transition-colors"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </form>

            {/* Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div className="p-2 border-b border-zinc-800">
                                <div className="px-2 py-1 text-xs text-zinc-500 uppercase">Suggestions</div>
                                {suggestions.map((suggestion, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-white hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span>{suggestion}</span>
                                        <ArrowRight className="w-4 h-4 text-zinc-600 ml-auto" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Recent Searches */}
                        {!query && recentSearches.length > 0 && (
                            <div className="p-2 border-b border-zinc-800">
                                <div className="flex items-center justify-between px-2 py-1">
                                    <span className="text-xs text-zinc-500 uppercase">Recent</span>
                                    <button onClick={handleClearHistory} className="text-xs text-zinc-500 hover:text-amber-400">Clear</button>
                                </div>
                                {recentSearches.slice(0, 5).map((search, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(search)}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <Clock className="w-4 h-4 text-zinc-500" />
                                        <span>{search}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Trending */}
                        {!query && (
                            <div className="p-2 border-b border-zinc-800">
                                <div className="px-2 py-1 text-xs text-zinc-500 uppercase">Trending</div>
                                {TRENDING_SEARCHES.slice(0, 4).map((search, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSuggestionClick(search)}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors"
                                    >
                                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                                        <span>{search}</span>
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* Quick Categories */}
                        {!query && (
                            <div className="p-3">
                                <div className="px-1 py-1 text-xs text-zinc-500 uppercase mb-2">Quick Filters</div>
                                <div className="grid grid-cols-4 gap-2">
                                    {QUICK_CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => handleSuggestionClick(cat.label)}
                                            className="flex flex-col items-center gap-1 p-3 bg-zinc-800/50 hover:bg-zinc-800 rounded-lg transition-colors"
                                        >
                                            <cat.icon className="w-5 h-5 text-amber-400" />
                                            <span className="text-xs text-zinc-300">{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
