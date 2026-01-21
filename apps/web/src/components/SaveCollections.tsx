import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Bookmark, Clock, Bell,
    Trash2, MoreVertical, ChevronDown, Filter, Check,
    FolderPlus, Folder, Edit3, X
} from 'lucide-react';

// Collection/Folder Types
interface Collection {
    id: string;
    name: string;
    icon: string;
    color: string;
    dealCount: number;
    createdAt: string;
}

interface SavedDeal {
    id: string;
    dealId: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    originalPrice: number;
    savedAt: string;
    collectionId?: string;
    notes?: string;
    alertEnabled: boolean;
    targetPrice?: number;
}

// Collections Manager
export function CollectionsManager({ collections, onCreateCollection }: {
    collections: Collection[];
    onCreateCollection: (name: string) => void;
}) {
    const [isCreating, setIsCreating] = useState(false);
    const [newName, setNewName] = useState('');

    const handleCreate = () => {
        if (newName.trim()) {
            onCreateCollection(newName.trim());
            setNewName('');
            setIsCreating(false);
        }
    };

    const defaultCollections = [
        { id: 'all', name: 'All Saved', icon: '📚', count: 42 },
        { id: 'favorites', name: 'Favorites', icon: '⭐', count: 12 },
        { id: 'price-drop', name: 'Price Drops', icon: '📉', count: 8 },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Collections</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm"
                >
                    <FolderPlus className="w-4 h-4" />
                    New
                </button>
            </div>

            {/* Create New */}
            <AnimatePresence>
                {isCreating && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex gap-2"
                    >
                        <input
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            placeholder="Collection name..."
                            autoFocus
                            className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white text-sm focus:border-amber-500 outline-none"
                        />
                        <button onClick={handleCreate} className="p-2 bg-amber-500 text-black rounded-lg">
                            <Check className="w-4 h-4" />
                        </button>
                        <button onClick={() => setIsCreating(false)} className="p-2 bg-zinc-800 text-zinc-400 rounded-lg">
                            <X className="w-4 h-4" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Default Collections */}
            <div className="space-y-1">
                {defaultCollections.map(col => (
                    <button
                        key={col.id}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-left"
                    >
                        <span className="text-lg">{col.icon}</span>
                        <span className="flex-1 text-zinc-300">{col.name}</span>
                        <span className="text-xs text-zinc-600">{col.count}</span>
                    </button>
                ))}
            </div>

            {/* User Collections */}
            {collections.length > 0 && (
                <>
                    <div className="border-t border-zinc-800 pt-4">
                        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Your Collections</p>
                    </div>
                    <div className="space-y-1">
                        {collections.map(col => (
                            <button
                                key={col.id}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800/50 transition-colors text-left group"
                            >
                                <Folder className={`w-4 h-4 text-${col.color}-400`} />
                                <span className="flex-1 text-zinc-300">{col.name}</span>
                                <span className="text-xs text-zinc-600">{col.dealCount}</span>
                                <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-700 rounded">
                                    <MoreVertical className="w-3 h-3 text-zinc-500" />
                                </button>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

// Saved Deals List
export function SavedDealsList({ deals }: { deals: SavedDeal[] }) {
    const [sortBy, setSortBy] = useState<'date' | 'price' | 'discount'>('date');
    const [selectedDeals, setSelectedDeals] = useState<Set<string>>(new Set());

    const toggleSelect = (id: string) => {
        setSelectedDeals(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        if (selectedDeals.size === deals.length) {
            setSelectedDeals(new Set());
        } else {
            setSelectedDeals(new Set(deals.map(d => d.id)));
        }
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={selectAll}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedDeals.size === deals.length
                            ? 'bg-amber-500 border-amber-500'
                            : 'border-zinc-600 hover:border-zinc-500'
                            }`}
                    >
                        {selectedDeals.size === deals.length && <Check className="w-3 h-3 text-black" />}
                    </button>
                    {selectedDeals.size > 0 && (
                        <span className="text-sm text-zinc-400">{selectedDeals.size} selected</span>
                    )}
                </div>

                {selectedDeals.size > 0 ? (
                    <div className="flex items-center gap-2">
                        <button className="px-3 py-1 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700">
                            Move to Collection
                        </button>
                        <button className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-lg hover:bg-red-500/30">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value as any)}
                            className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300"
                        >
                            <option value="date">Date Added</option>
                            <option value="price">Price</option>
                            <option value="discount">Discount</option>
                        </select>
                        <button className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Deals List */}
            <div className="space-y-2">
                {deals.map(deal => {
                    const discount = Math.round((1 - deal.currentPrice / deal.originalPrice) * 100);
                    const isSelected = selectedDeals.has(deal.id);

                    return (
                        <motion.div
                            key={deal.id}
                            layout
                            className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${isSelected ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700'
                                }`}
                        >
                            <button
                                onClick={() => toggleSelect(deal.id)}
                                className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 hover:border-zinc-500'
                                    }`}
                            >
                                {isSelected && <Check className="w-3 h-3 text-black" />}
                            </button>

                            <Link to={`/deal/${deal.dealId}`} className="flex items-center gap-4 flex-1 min-w-0">
                                {deal.imageUrl && (
                                    <img src={deal.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-medium truncate">{deal.title}</h4>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-amber-400 font-bold">${deal.currentPrice}</span>
                                        <span className="text-zinc-500 line-through text-sm">${deal.originalPrice}</span>
                                        <span className="text-emerald-400 text-sm">{discount}% off</span>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            Saved {deal.savedAt}
                                        </span>
                                        {deal.alertEnabled && (
                                            <span className="flex items-center gap-1 text-amber-400">
                                                <Bell className="w-3 h-3" />
                                                Alert at ${deal.targetPrice}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </Link>

                            <button className="p-2 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </motion.div>
                    );
                })}
            </div>

            {deals.length === 0 && (
                <div className="text-center py-12">
                    <Bookmark className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                    <p className="text-zinc-400 mb-2">No saved deals yet</p>
                    <Link to="/deals" className="text-amber-400 hover:underline">Browse deals to save</Link>
                </div>
            )}
        </div>
    );
}

// Quick Save Widget (for deal cards)
export function QuickSaveButton({ dealId: _dealId, isSaved, onToggle }: {
    dealId: string;
    isSaved: boolean;
    onToggle: () => void;
}) {
    const [showOptions, setShowOptions] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={onToggle}
                className={`p-2 rounded-lg transition-all ${isSaved
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                    }`}
            >
                <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>

            {isSaved && (
                <button
                    onClick={(e) => { e.stopPropagation(); setShowOptions(!showOptions); }}
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center"
                >
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>
            )}

            <AnimatePresence>
                {showOptions && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-10"
                    >
                        <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-left text-sm text-zinc-300">
                            <FolderPlus className="w-4 h-4" />
                            Add to Collection
                        </button>
                        <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-left text-sm text-zinc-300">
                            <Bell className="w-4 h-4" />
                            Set Price Alert
                        </button>
                        <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-left text-sm text-zinc-300">
                            <Edit3 className="w-4 h-4" />
                            Add Note
                        </button>
                        <div className="border-t border-zinc-800" />
                        <button
                            onClick={onToggle}
                            className="w-full flex items-center gap-2 px-4 py-2 hover:bg-zinc-800 text-left text-sm text-red-400"
                        >
                            <Trash2 className="w-4 h-4" />
                            Remove
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default { CollectionsManager, SavedDealsList, QuickSaveButton };
