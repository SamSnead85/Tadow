import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Search, Command, ArrowRight, Laptop, Smartphone, Gamepad2,
    Headphones, Tv, Tablet, Watch, Camera, Home, Sparkles,
    TrendingUp, Heart, Settings, MessageSquare, BarChart3
} from 'lucide-react';

interface CommandItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    action: () => void;
    category: 'navigation' | 'category' | 'brand' | 'action';
    keywords?: string[];
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Command items
    const commands: CommandItem[] = [
        // Navigation
        { id: 'home', label: 'Home', icon: <Home className="w-4 h-4" />, action: () => navigate('/'), category: 'navigation', keywords: ['main', 'deals'] },
        { id: 'deals', label: 'All Deals', icon: <Sparkles className="w-4 h-4" />, action: () => navigate('/deals'), category: 'navigation' },
        { id: 'categories', label: 'Browse Categories', icon: <TrendingUp className="w-4 h-4" />, action: () => navigate('/categories'), category: 'navigation' },
        { id: 'watchlist', label: 'My Watchlist', icon: <Heart className="w-4 h-4" />, action: () => navigate('/watchlist'), category: 'navigation' },
        { id: 'agent', label: 'AI Shopping Agent', icon: <MessageSquare className="w-4 h-4" />, action: () => navigate('/agent'), category: 'navigation' },
        { id: 'analytics', label: 'Analytics Dashboard', icon: <BarChart3 className="w-4 h-4" />, action: () => navigate('/analytics'), category: 'navigation' },
        { id: 'settings', label: 'Account Settings', icon: <Settings className="w-4 h-4" />, action: () => navigate('/account'), category: 'navigation' },

        // Categories
        { id: 'cat-laptops', label: 'Laptops', icon: <Laptop className="w-4 h-4" />, action: () => navigate('/category/laptops'), category: 'category', keywords: ['notebook', 'macbook', 'computer'] },
        { id: 'cat-phones', label: 'Phones', icon: <Smartphone className="w-4 h-4" />, action: () => navigate('/category/phones'), category: 'category', keywords: ['iphone', 'android', 'mobile'] },
        { id: 'cat-gaming', label: 'Gaming', icon: <Gamepad2 className="w-4 h-4" />, action: () => navigate('/category/gaming'), category: 'category', keywords: ['ps5', 'xbox', 'nintendo'] },
        { id: 'cat-audio', label: 'Audio', icon: <Headphones className="w-4 h-4" />, action: () => navigate('/category/audio'), category: 'category', keywords: ['headphones', 'earbuds', 'speakers'] },
        { id: 'cat-tvs', label: 'TVs', icon: <Tv className="w-4 h-4" />, action: () => navigate('/category/tvs'), category: 'category', keywords: ['oled', 'smart tv', 'television'] },
        { id: 'cat-tablets', label: 'Tablets', icon: <Tablet className="w-4 h-4" />, action: () => navigate('/category/tablets'), category: 'category', keywords: ['ipad', 'surface'] },
        { id: 'cat-wearables', label: 'Wearables', icon: <Watch className="w-4 h-4" />, action: () => navigate('/category/wearables'), category: 'category', keywords: ['watch', 'fitness'] },
        { id: 'cat-cameras', label: 'Cameras', icon: <Camera className="w-4 h-4" />, action: () => navigate('/category/cameras'), category: 'category', keywords: ['drone', 'dslr', 'mirrorless'] },

        // Brands
        { id: 'brand-apple', label: 'Apple', icon: <span>🍎</span>, action: () => navigate('/brand/apple'), category: 'brand', keywords: ['macbook', 'iphone', 'ipad'] },
        { id: 'brand-samsung', label: 'Samsung', icon: <span>📱</span>, action: () => navigate('/brand/samsung'), category: 'brand', keywords: ['galaxy'] },
        { id: 'brand-sony', label: 'Sony', icon: <span>🎮</span>, action: () => navigate('/brand/sony'), category: 'brand', keywords: ['playstation', 'ps5'] },
        { id: 'brand-microsoft', label: 'Microsoft', icon: <span>💻</span>, action: () => navigate('/brand/microsoft'), category: 'brand', keywords: ['xbox', 'surface'] },
    ];

    // Filter commands
    const filteredCommands = query
        ? commands.filter(cmd =>
            cmd.label.toLowerCase().includes(query.toLowerCase()) ||
            cmd.keywords?.some(k => k.toLowerCase().includes(query.toLowerCase()))
        )
        : commands;

    // Group by category
    const grouped = {
        navigation: filteredCommands.filter(c => c.category === 'navigation'),
        category: filteredCommands.filter(c => c.category === 'category'),
        brand: filteredCommands.filter(c => c.category === 'brand'),
    };

    // Keyboard handler
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        // Open with Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen(prev => !prev);
        }

        if (!isOpen) return;

        if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                setIsOpen(false);
                setQuery('');
            }
        }
    }, [isOpen, filteredCommands, selectedIndex]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
            setSelectedIndex(0);
        }
    }, [isOpen, query]);

    const executeCommand = (cmd: CommandItem) => {
        cmd.action();
        setIsOpen(false);
        setQuery('');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    {/* Command Palette */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[101] w-full max-w-xl"
                    >
                        <div className="bg-zinc-900 border border-zinc-700 rounded-xl shadow-2xl overflow-hidden">
                            {/* Search Input */}
                            <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
                                <Search className="w-5 h-5 text-zinc-500" />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search commands, categories, brands..."
                                    className="flex-1 bg-transparent text-white placeholder-zinc-500 outline-none text-base"
                                />
                                <kbd className="px-2 py-0.5 text-xs bg-zinc-800 text-zinc-500 rounded">ESC</kbd>
                            </div>

                            {/* Results */}
                            <div className="max-h-[60vh] overflow-y-auto p-2">
                                {filteredCommands.length === 0 ? (
                                    <div className="text-center py-8 text-zinc-500">
                                        No results found for "{query}"
                                    </div>
                                ) : (
                                    <>
                                        {grouped.navigation.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-2 py-1 text-xs font-medium text-zinc-500 uppercase">Navigation</div>
                                                {grouped.navigation.map((cmd) => (
                                                    <CommandRow key={cmd.id} cmd={cmd} isSelected={filteredCommands.indexOf(cmd) === selectedIndex} onClick={() => executeCommand(cmd)} />
                                                ))}
                                            </div>
                                        )}
                                        {grouped.category.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-2 py-1 text-xs font-medium text-zinc-500 uppercase">Categories</div>
                                                {grouped.category.map((cmd) => (
                                                    <CommandRow key={cmd.id} cmd={cmd} isSelected={filteredCommands.indexOf(cmd) === selectedIndex} onClick={() => executeCommand(cmd)} />
                                                ))}
                                            </div>
                                        )}
                                        {grouped.brand.length > 0 && (
                                            <div className="mb-2">
                                                <div className="px-2 py-1 text-xs font-medium text-zinc-500 uppercase">Brands</div>
                                                {grouped.brand.map((cmd) => (
                                                    <CommandRow key={cmd.id} cmd={cmd} isSelected={filteredCommands.indexOf(cmd) === selectedIndex} onClick={() => executeCommand(cmd)} />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-800 text-xs text-zinc-500">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↑↓</kbd> navigate</span>
                                    <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 bg-zinc-800 rounded">↵</kbd> select</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Command className="w-3 h-3" /><span>K to toggle</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

function CommandRow({ cmd, isSelected, onClick }: { cmd: CommandItem; isSelected: boolean; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${isSelected ? 'bg-amber-500/20 text-amber-300' : 'text-zinc-300 hover:bg-zinc-800'
                }`}
        >
            <span className={isSelected ? 'text-amber-400' : 'text-zinc-500'}>{cmd.icon}</span>
            <span className="flex-1 text-left">{cmd.label}</span>
            {isSelected && <ArrowRight className="w-4 h-4 text-amber-400" />}
        </button>
    );
}
