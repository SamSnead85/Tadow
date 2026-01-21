import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Search, Heart, User, Store, MapPin } from 'lucide-react';
import { getWatchlist } from '../utils/storage';

const navItems = [
    { to: '/deals', icon: Home, label: 'Home' },
    { to: '/search', icon: Search, label: 'Search' },
    { to: '/sell', icon: Store, label: 'Sell' },
    { to: '/local', icon: MapPin, label: 'Local' },
    { to: '/watchlist', icon: Heart, label: 'Saved', showBadge: true },
    { to: '/account', icon: User, label: 'Account' },
];

export function MobileNav() {
    const location = useLocation();
    const [watchlistCount] = useState(() => getWatchlist().length);

    // Hide on desktop
    return (
        <motion.nav
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 z-50 lg:hidden safe-area-bottom"
        >
            {/* Glass background */}
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-xl border-t border-zinc-800/50" />

            {/* Nav items */}
            <div className="relative flex items-center justify-around px-4 py-2">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.to ||
                        (item.to === '/deals' && location.pathname === '/');
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.to}
                            to={item.to}
                            className="flex flex-col items-center justify-center py-2 px-4 relative"
                        >
                            <motion.div
                                whileTap={{ scale: 0.9 }}
                                className={`relative p-2 rounded-xl transition-colors ${isActive
                                    ? 'bg-amber-500/20 text-amber-400'
                                    : 'text-zinc-500 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />

                                {/* Badge for watchlist */}
                                {item.showBadge && watchlistCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center">
                                        {watchlistCount > 9 ? '9+' : watchlistCount}
                                    </span>
                                )}
                            </motion.div>
                            <span className={`text-xs mt-1 ${isActive ? 'text-amber-400 font-medium' : 'text-zinc-500'}`}>
                                {item.label}
                            </span>

                            {/* Active indicator */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="mobile-nav-indicator"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute -bottom-1 w-1 h-1 bg-amber-400 rounded-full"
                                    />
                                )}
                            </AnimatePresence>
                        </Link>
                    );
                })}
            </div>
        </motion.nav>
    );
}

// Wrapper to add padding for mobile nav
export function MobileNavSpacer() {
    return <div className="h-20 lg:hidden" />;
}
