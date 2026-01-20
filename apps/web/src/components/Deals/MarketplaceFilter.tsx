import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface Marketplace {
    id: string;
    name: string;
    type?: string;
    color?: string;
    dealCount: number;
}

interface MarketplaceFilterProps {
    marketplaces: Marketplace[];
    selectedIds: string[];
    onChange: (selected: string[]) => void;
}

export function MarketplaceFilter({ marketplaces, selectedIds, onChange }: MarketplaceFilterProps) {
    const toggleMarketplace = (id: string) => {
        if (selectedIds.includes(id)) {
            onChange(selectedIds.filter(s => s !== id));
        } else {
            onChange([...selectedIds, id]);
        }
    };

    const selectAll = () => onChange(marketplaces.map(m => m.id));
    const selectNone = () => onChange([]);

    return (
        <div className="filter-section">
            <div className="flex items-center justify-between mb-3">
                <span className="filter-title">Marketplaces</span>
                <div className="flex gap-2 text-xs">
                    <button onClick={selectAll} className="text-emerald-400 hover:text-emerald-300 transition-colors">
                        All
                    </button>
                    <span className="text-zinc-700">·</span>
                    <button onClick={selectNone} className="text-zinc-500 hover:text-zinc-400 transition-colors">
                        None
                    </button>
                </div>
            </div>

            <div className="space-y-1">
                {marketplaces.map((mp) => {
                    const isSelected = selectedIds.includes(mp.id);
                    return (
                        <motion.button
                            key={mp.id}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => toggleMarketplace(mp.id)}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-sm transition-all ${isSelected
                                    ? 'bg-emerald-500/10 text-emerald-300'
                                    : 'text-zinc-400 hover:bg-zinc-700/50 hover:text-zinc-200'
                                }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div
                                    className={`w-4 h-4 rounded flex items-center justify-center transition-all ${isSelected
                                            ? 'bg-emerald-500'
                                            : 'border border-zinc-600 bg-zinc-800'
                                        }`}
                                >
                                    {isSelected && <Check className="w-3 h-3 text-zinc-900" />}
                                </div>
                                <span>{mp.name}</span>
                            </div>
                            <span className="text-zinc-600 text-xs font-mono">{mp.dealCount}</span>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}
