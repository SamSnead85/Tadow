import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Search, Bell, Trash2, Plus, X,
    Filter, Clock
} from 'lucide-react';

interface SavedSearch {
    id: string;
    query: string;
    filters: {
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        condition?: string;
    };
    alertsEnabled: boolean;
    lastChecked: Date;
    newResults: number;
    createdAt: Date;
}

// Simulated saved searches
const getSavedSearches = (): SavedSearch[] => {
    try {
        const data = localStorage.getItem('tadow_saved_searches');
        return data ? JSON.parse(data) : DEMO_SAVED_SEARCHES;
    } catch { return DEMO_SAVED_SEARCHES; }
};

const saveSavedSearches = (searches: SavedSearch[]) => {
    localStorage.setItem('tadow_saved_searches', JSON.stringify(searches));
};

const DEMO_SAVED_SEARCHES: SavedSearch[] = [
    {
        id: 'search_1',
        query: 'MacBook Pro M3',
        filters: { category: 'Computers & Laptops', maxPrice: 2000 },
        alertsEnabled: true,
        lastChecked: new Date(Date.now() - 1000 * 60 * 60),
        newResults: 3,
        createdAt: new Date('2026-01-15'),
    },
    {
        id: 'search_2',
        query: 'iPhone 15 Pro',
        filters: { category: 'Electronics', condition: 'like_new' },
        alertsEnabled: true,
        lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 4),
        newResults: 0,
        createdAt: new Date('2026-01-18'),
    },
    {
        id: 'search_3',
        query: 'Nintendo Switch',
        filters: { category: 'Gaming', maxPrice: 300 },
        alertsEnabled: false,
        lastChecked: new Date(Date.now() - 1000 * 60 * 60 * 24),
        newResults: 1,
        createdAt: new Date('2026-01-10'),
    },
];

export default function SavedSearchesPage() {
    const [searches, setSearches] = useState<SavedSearch[]>(getSavedSearches());
    const [showAddModal, setShowAddModal] = useState(false);

    const toggleAlerts = (id: string) => {
        const updated = searches.map(s =>
            s.id === id ? { ...s, alertsEnabled: !s.alertsEnabled } : s
        );
        setSearches(updated);
        saveSavedSearches(updated);
    };

    const deleteSearch = (id: string) => {
        const updated = searches.filter(s => s.id !== id);
        setSearches(updated);
        saveSavedSearches(updated);
    };

    const addSearch = (query: string, filters: SavedSearch['filters']) => {
        const newSearch: SavedSearch = {
            id: `search_${Date.now()}`,
            query,
            filters,
            alertsEnabled: true,
            lastChecked: new Date(),
            newResults: 0,
            createdAt: new Date(),
        };
        const updated = [newSearch, ...searches];
        setSearches(updated);
        saveSavedSearches(updated);
        setShowAddModal(false);
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Saved Searches</h1>
                        <p className="text-zinc-400 text-sm">Get alerts when new items match</p>
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-amber-500 text-zinc-900 rounded-lg font-medium flex items-center gap-2 hover:bg-amber-400"
                    >
                        <Plus className="w-4 h-4" /> New
                    </button>
                </div>

                {searches.length === 0 ? (
                    <div className="text-center py-12">
                        <Search className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                        <p className="text-zinc-400">No saved searches yet</p>
                        <p className="text-zinc-500 text-sm mt-1">Save searches to get alerts on new items</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {searches.map(search => (
                            <SavedSearchCard
                                key={search.id}
                                search={search}
                                onToggleAlerts={() => toggleAlerts(search.id)}
                                onDelete={() => deleteSearch(search.id)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Add Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <AddSearchModal
                        onClose={() => setShowAddModal(false)}
                        onSave={addSearch}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function SavedSearchCard({
    search,
    onToggleAlerts,
    onDelete
}: {
    search: SavedSearch;
    onToggleAlerts: () => void;
    onDelete: () => void;
}) {
    const filterCount = Object.values(search.filters).filter(Boolean).length;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
        >
            <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-500/20 rounded-lg">
                    <Search className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                    <Link
                        to={`/marketplace?q=${encodeURIComponent(search.query)}`}
                        className="font-medium text-white hover:text-amber-400 flex items-center gap-2"
                    >
                        "{search.query}"
                        {search.newResults > 0 && (
                            <span className="px-1.5 py-0.5 bg-amber-500 text-zinc-900 text-xs font-bold rounded">
                                {search.newResults} new
                            </span>
                        )}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500">
                        {filterCount > 0 && (
                            <span className="flex items-center gap-1">
                                <Filter className="w-3 h-3" /> {filterCount} filters
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatTimeAgo(search.lastChecked)}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onToggleAlerts}
                        className={`p-2 rounded-lg transition-colors ${search.alertsEnabled
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-zinc-800 text-zinc-500'
                            }`}
                        title={search.alertsEnabled ? 'Alerts on' : 'Alerts off'}
                    >
                        <Bell className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="p-2 bg-zinc-800 text-zinc-500 rounded-lg hover:text-red-400"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function AddSearchModal({
    onClose,
    onSave
}: {
    onClose: () => void;
    onSave: (query: string, filters: SavedSearch['filters']) => void;
}) {
    const [query, setQuery] = useState('');
    const [category, setCategory] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const handleSave = () => {
        if (!query.trim()) return;
        onSave(query.trim(), {
            category: category || undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 w-full max-w-md"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white">New Saved Search</h2>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Search Query</label>
                        <input
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="e.g., MacBook Pro M3"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Category (optional)</label>
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                        >
                            <option value="">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Computers & Laptops">Computers & Laptops</option>
                            <option value="Gaming">Gaming</option>
                            <option value="Audio & Headphones">Audio & Headphones</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm text-zinc-400 mb-1 block">Max Price (optional)</label>
                        <input
                            type="number"
                            value={maxPrice}
                            onChange={e => setMaxPrice(e.target.value)}
                            placeholder="e.g., 1000"
                            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                        />
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={!query.trim()}
                    className="w-full mt-6 py-3 bg-amber-500 text-zinc-900 rounded-lg font-medium disabled:opacity-50"
                >
                    Save Search
                </button>
            </motion.div>
        </motion.div>
    );
}

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
