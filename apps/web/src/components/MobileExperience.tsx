import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Heart, X,
    Zap, Star, ArrowRight, Home, Search, User, TrendingUp
} from 'lucide-react';
import { ALL_DEALS } from '../data/extendedDeals';
import { useWatchlist } from '../hooks/useWatchlist';

// Swipeable Deal Card (Tinder-style)
interface SwipeableDealProps {
    deal: typeof ALL_DEALS[0];
    onSwipeLeft: () => void;
    onSwipeRight: () => void;
}

export function SwipeableDealCard({ deal, onSwipeLeft, onSwipeRight }: SwipeableDealProps) {
    const x = useMotionValue(0);
    const rotate = useTransform(x, [-200, 200], [-15, 15]);
    const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

    const leftIndicatorOpacity = useTransform(x, [-100, 0], [1, 0]);
    const rightIndicatorOpacity = useTransform(x, [0, 100], [0, 1]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        if (info.offset.x > 100) {
            onSwipeRight();
        } else if (info.offset.x < -100) {
            onSwipeLeft();
        }
    };

    return (
        <motion.div
            style={{ x, rotate, opacity }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={handleDragEnd}
            className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
            <div className="relative w-full h-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                {/* Image */}
                <div className="h-2/3 bg-zinc-800 relative">
                    <img src={deal.imageUrl} alt={deal.title} className="w-full h-full object-cover" />

                    {/* Swipe Indicators */}
                    <motion.div
                        style={{ opacity: leftIndicatorOpacity }}
                        className="absolute inset-0 bg-red-500/30 flex items-center justify-center"
                    >
                        <X className="w-20 h-20 text-red-500" />
                    </motion.div>
                    <motion.div
                        style={{ opacity: rightIndicatorOpacity }}
                        className="absolute inset-0 bg-emerald-500/30 flex items-center justify-center"
                    >
                        <Heart className="w-20 h-20 text-emerald-500" />
                    </motion.div>

                    {/* Badges */}
                    <div className="absolute top-4 left-4 flex gap-2">
                        {deal.isHot && (
                            <span className="px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                                <Zap className="w-3 h-3" /> HOT
                            </span>
                        )}
                        <span className="px-3 py-1 bg-emerald-500 text-white text-xs font-bold rounded-full">
                            {deal.discountPercent}% OFF
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-5">
                    <span className="text-amber-400 text-sm font-medium">{deal.brand}</span>
                    <h3 className="text-lg font-bold text-white mt-1 line-clamp-2">{deal.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-2xl font-bold text-amber-400">${deal.currentPrice}</span>
                        <span className="text-lg text-zinc-500 line-through">${deal.originalPrice}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                        <Star className="w-4 h-4 text-amber-400" />
                        <span className="text-zinc-300">{deal.dealScore || 92}/100 deal score</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Full Swipe Experience
export function SwipeDealExperience() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [savedDeals, setSavedDeals] = useState<string[]>([]);
    const { toggle } = useWatchlist();

    const deals = ALL_DEALS.slice(0, 20);
    const currentDeal = deals[currentIndex];

    const handleSwipeLeft = () => {
        // Pass
        if (currentIndex < deals.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const handleSwipeRight = () => {
        // Save
        if (currentDeal) {
            setSavedDeals([...savedDeals, currentDeal.id]);
            toggle({
                dealId: currentDeal.id,
                title: currentDeal.title,
                imageUrl: currentDeal.imageUrl,
                currentPrice: currentDeal.currentPrice,
                originalPrice: currentDeal.originalPrice,
                discountPercent: currentDeal.discountPercent,
            });
        }
        if (currentIndex < deals.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    if (currentIndex >= deals.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <Heart className="w-16 h-16 text-pink-500 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">You've seen all deals!</h2>
                <p className="text-zinc-400 mb-4">You saved {savedDeals.length} deals</p>
                <button
                    onClick={() => setCurrentIndex(0)}
                    className="px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl"
                >
                    Start Over
                </button>
            </div>
        );
    }

    return (
        <div className="relative h-[600px]">
            <AnimatePresence>
                <SwipeableDealCard
                    key={currentDeal.id}
                    deal={currentDeal}
                    onSwipeLeft={handleSwipeLeft}
                    onSwipeRight={handleSwipeRight}
                />
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-8 pb-8">
                <button
                    onClick={handleSwipeLeft}
                    className="w-14 h-14 rounded-full bg-zinc-800 border-2 border-red-500/50 flex items-center justify-center text-red-500 hover:bg-red-500/20"
                >
                    <X className="w-6 h-6" />
                </button>
                <button
                    onClick={handleSwipeRight}
                    className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg shadow-pink-500/30"
                >
                    <Heart className="w-8 h-8" />
                </button>
            </div>

            {/* Progress */}
            <div className="absolute top-0 left-0 right-0 p-4">
                <div className="flex gap-1">
                    {deals.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1 flex-1 rounded-full ${i < currentIndex ? 'bg-amber-500' : i === currentIndex ? 'bg-white' : 'bg-zinc-700'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Mobile Bottom Navigation
export function MobileBottomNav() {
    const [active, setActive] = useState('home');

    const navItems = [
        { id: 'home', icon: Home, label: 'Home', href: '/' },
        { id: 'search', icon: Search, label: 'Search', href: '/deals' },
        { id: 'swipe', icon: TrendingUp, label: 'Swipe', href: '/swipe' },
        { id: 'saved', icon: Heart, label: 'Saved', href: '/watchlist' },
        { id: 'account', icon: User, label: 'Account', href: '/account' },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900/95 backdrop-blur-lg border-t border-zinc-800 safe-area-pb lg:hidden z-50">
            <div className="flex items-center justify-around py-2">
                {navItems.map(item => (
                    <Link
                        key={item.id}
                        to={item.href}
                        onClick={() => setActive(item.id)}
                        className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-colors ${active === item.id
                            ? 'text-amber-400'
                            : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        <item.icon className="w-5 h-5" />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                ))}
            </div>
        </nav>
    );
}

// Pull-to-Refresh Component
export function PullToRefresh({ onRefresh, children }: { onRefresh: () => void; children: React.ReactNode }) {
    const [_pulling, setPulling] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const y = useMotionValue(0);

    const handleDragEnd = async (_: any, info: PanInfo) => {
        if (info.offset.y > 80) {
            setRefreshing(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            onRefresh();
            setRefreshing(false);
        }
        setPulling(false);
    };

    return (
        <div className="relative overflow-hidden">
            {/* Refresh indicator */}
            <motion.div
                style={{ y: useTransform(y, [0, 100], [-40, 0]) }}
                className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10"
            >
                <div className={`w-8 h-8 rounded-full border-2 border-amber-500 ${refreshing ? 'animate-spin border-t-transparent' : ''}`} />
            </motion.div>

            <motion.div
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={{ top: 0.5, bottom: 0 }}
                style={{ y }}
                onDragStart={() => setPulling(true)}
                onDragEnd={handleDragEnd}
            >
                {children}
            </motion.div>
        </div>
    );
}

// Story-style Deal Preview
export function DealStories() {
    const [activeStory, setActiveStory] = useState<number | null>(null);
    const stories = ALL_DEALS.filter(d => d.isHot).slice(0, 8);

    return (
        <>
            {/* Story Circles */}
            <div className="flex gap-4 overflow-x-auto pb-4 px-4 -mx-4">
                {stories.map((deal, i) => (
                    <button
                        key={deal.id}
                        onClick={() => setActiveStory(i)}
                        className="flex-shrink-0 flex flex-col items-center gap-1"
                    >
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gradient-to-br from-amber-400 to-orange-500">
                            <div className="w-full h-full rounded-full bg-zinc-900 p-[2px]">
                                <img
                                    src={deal.imageUrl}
                                    alt={deal.brand}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            </div>
                        </div>
                        <span className="text-xs text-zinc-400 truncate w-16 text-center">{deal.brand}</span>
                    </button>
                ))}
            </div>

            {/* Full Story Modal */}
            <AnimatePresence>
                {activeStory !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black"
                        onClick={() => setActiveStory(null)}
                    >
                        <div className="relative h-full">
                            {/* Progress bars */}
                            <div className="absolute top-0 left-0 right-0 flex gap-1 p-2 safe-area-pt">
                                {stories.map((_, i) => (
                                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= activeStory ? 'bg-white' : 'bg-white/30'}`} />
                                ))}
                            </div>

                            {/* Content */}
                            <div className="h-full flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <span className="text-amber-400 font-medium">{stories[activeStory].brand}</span>
                                <h3 className="text-2xl font-bold text-white mt-1">{stories[activeStory].title}</h3>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-3xl font-bold text-white">${stories[activeStory].currentPrice}</span>
                                    <span className="px-3 py-1 bg-emerald-500 text-white font-bold rounded-full">
                                        {stories[activeStory].discountPercent}% OFF
                                    </span>
                                </div>
                                <Link
                                    to={`/deal/${stories[activeStory].id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="mt-4 flex items-center justify-center gap-2 py-3 bg-amber-500 text-black font-semibold rounded-xl"
                                >
                                    View Deal <ArrowRight className="w-4 h-4" />
                                </Link>
                            </div>

                            {/* Navigation */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveStory(Math.max(0, activeStory - 1)); }}
                                className="absolute left-0 top-0 bottom-0 w-1/3"
                            />
                            <button
                                onClick={(e) => { e.stopPropagation(); setActiveStory(Math.min(stories.length - 1, activeStory + 1)); }}
                                className="absolute right-0 top-0 bottom-0 w-1/3"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}

export default {
    SwipeableDealCard,
    SwipeDealExperience,
    MobileBottomNav,
    PullToRefresh,
    DealStories
};
