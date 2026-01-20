import { motion } from 'framer-motion';
import { Inbox, Search, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
    type: 'no-results' | 'no-deals' | 'error' | 'loading';
    query?: string;
    onRetry?: () => void;
}

export function EmptyState({ type, query, onRetry }: EmptyStateProps) {
    const configs = {
        'no-results': {
            icon: Search,
            title: 'No deals found',
            description: query ? `No results for "${query}"` : 'Try adjusting your search or filters',
            action: { label: 'Clear Filters', to: '/search' },
        },
        'no-deals': {
            icon: Inbox,
            title: 'No deals available',
            description: 'Check back soon for new deals!',
            action: { label: 'Browse All Deals', to: '/' },
        },
        'error': {
            icon: RefreshCw,
            title: 'Something went wrong',
            description: 'Unable to load deals. Please try again.',
            action: { label: 'Retry', onClick: onRetry },
        },
        'loading': {
            icon: TrendingUp,
            title: 'Finding deals...',
            description: 'Searching across all marketplaces',
            action: null,
        },
    };

    const config = configs[type];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
        >
            <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center mb-6"
            >
                <Icon className={`w-8 h-8 ${type === 'loading' ? 'text-emerald-400 animate-pulse' : 'text-zinc-500'}`} />
            </motion.div>

            <h3 className="text-lg font-semibold text-white mb-2">
                {config.title}
            </h3>
            <p className="text-zinc-500 text-sm mb-6 max-w-sm">
                {config.description}
            </p>

            {config.action && (
                'to' in config.action ? (
                    <Link
                        to={config.action.to}
                        className="btn-secondary text-sm"
                    >
                        {config.action.label}
                    </Link>
                ) : config.action.onClick ? (
                    <button
                        onClick={config.action.onClick}
                        className="btn-primary text-sm"
                    >
                        {config.action.label}
                    </button>
                ) : null
            )}
        </motion.div>
    );
}
