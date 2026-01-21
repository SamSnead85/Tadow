import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Clock, TrendingUp, Zap } from 'lucide-react';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const popularSearches = [
    'MacBook Pro M3',
    'iPhone 15 Pro',
    'RTX 4090',
    'PlayStation 5',
    'AirPods Pro',
    'Samsung S24 Ultra',
];

const recentSearches = [
    'gaming laptop',
    'mechanical keyboard',
    '4K monitor',
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const suggestions = query.length > 0
        ? popularSearches.filter(s => s.toLowerCase().includes(query.toLowerCase()))
        : [];

    const handleSearch = useCallback((searchTerm: string) => {
        if (searchTerm.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
            onClose();
            setQuery('');
        }
    }, [navigate, onClose]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
        const items = suggestions.length > 0 ? suggestions : (query.length === 0 ? recentSearches : []);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => Math.min(i + 1, items.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (items[selectedIndex]) {
                handleSearch(items[selectedIndex]);
            } else {
                handleSearch(query);
            }
        } else if (e.key === 'Escape') {
            onClose();
        }
    }, [suggestions, query, selectedIndex, handleSearch, onClose]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [query]);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl"
                    >
                        <div className="bg-zinc-900 border border-zinc-700/50 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-800">
                                <Search className="w-5 h-5 text-zinc-500" />
                                <input
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Search for tech deals..."
                                    autoFocus
                                    className="flex-1 bg-transparent text-white text-lg outline-none placeholder:text-zinc-500"
                                />
                                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-500">
                                    ESC
                                </kbd>
                            </div>

                            {/* Content */}
                            <div className="max-h-[60vh] overflow-y-auto">
                                {/* AI Suggestion */}
                                {query.length > 0 && (
                                    <div className="px-5 py-3 border-b border-zinc-800/50">
                                        <button
                                            onClick={() => handleSearch(query)}
                                            className="w-full flex items-center gap-3 px-3 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-left hover:bg-emerald-500/15 transition-colors"
                                        >
                                            <Zap className="w-4 h-4 text-emerald-400" />
                                            <span className="text-emerald-300 text-sm">
                                                Search "<span className="font-medium">{query}</span>" with AI
                                            </span>
                                            <ArrowRight className="w-4 h-4 text-emerald-400 ml-auto" />
                                        </button>
                                    </div>
                                )}

                                {/* Suggestions */}
                                {suggestions.length > 0 && (
                                    <div className="px-3 py-2">
                                        <p className="px-2 py-1 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                            Suggestions
                                        </p>
                                        {suggestions.map((item, i) => (
                                            <button
                                                key={item}
                                                onClick={() => handleSearch(item)}
                                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedIndex === i
                                                    ? 'bg-zinc-800 text-white'
                                                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                                    }`}
                                            >
                                                <TrendingUp className="w-4 h-4" />
                                                <span className="text-sm">{item}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Recent Searches */}
                                {query.length === 0 && (
                                    <>
                                        <div className="px-3 py-2">
                                            <p className="px-2 py-1 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                                Recent Searches
                                            </p>
                                            {recentSearches.map((item, i) => (
                                                <button
                                                    key={item}
                                                    onClick={() => handleSearch(item)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${selectedIndex === i
                                                        ? 'bg-zinc-800 text-white'
                                                        : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                                        }`}
                                                >
                                                    <Clock className="w-4 h-4" />
                                                    <span className="text-sm">{item}</span>
                                                </button>
                                            ))}
                                        </div>

                                        <div className="px-3 py-2 border-t border-zinc-800/50">
                                            <p className="px-2 py-1 text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                                Popular Searches
                                            </p>
                                            <div className="flex flex-wrap gap-2 px-2 py-2">
                                                {popularSearches.map((item) => (
                                                    <button
                                                        key={item}
                                                        onClick={() => handleSearch(item)}
                                                        className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm rounded-full transition-colors"
                                                    >
                                                        {item}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-800 bg-zinc-900/50">
                                <div className="flex items-center gap-4 text-xs text-zinc-500">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↑</kbd>
                                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↓</kbd>
                                        navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↵</kbd>
                                        select
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-zinc-600">
                                    <Zap className="w-3 h-3" />
                                    Powered by AI
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Hook to use the search modal with Cmd+K
export function useSearchModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    return {
        isOpen,
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
    };
}
