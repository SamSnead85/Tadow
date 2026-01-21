import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Trophy, Star, Flame, Target, Gift, Zap, Award, Crown,
    TrendingUp, Medal
} from 'lucide-react';

// Achievement Types
export type AchievementId =
    | 'first_save' | 'deal_hunter' | 'super_saver' | 'streak_3' | 'streak_7' | 'streak_30'
    | 'early_bird' | 'night_owl' | 'category_explorer' | 'brand_loyalist'
    | 'price_predictor' | 'community_helper' | 'referral_master' | 'all_time_low_sniper';

interface Achievement {
    id: AchievementId;
    name: string;
    description: string;
    icon: React.ElementType;
    color: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    xp: number;
    unlockedAt?: string;
}

const ACHIEVEMENTS: Achievement[] = [
    { id: 'first_save', name: 'First Save', description: 'Save your first deal', icon: Star, color: 'amber', rarity: 'common', xp: 10 },
    { id: 'deal_hunter', name: 'Deal Hunter', description: 'Save 10 deals', icon: Target, color: 'blue', rarity: 'common', xp: 50 },
    { id: 'super_saver', name: 'Super Saver', description: 'Save $500 total', icon: Trophy, color: 'emerald', rarity: 'rare', xp: 100 },
    { id: 'streak_3', name: '3-Day Streak', description: 'Visit 3 days in a row', icon: Flame, color: 'orange', rarity: 'common', xp: 25 },
    { id: 'streak_7', name: 'Weekly Warrior', description: 'Visit 7 days in a row', icon: Flame, color: 'orange', rarity: 'rare', xp: 75 },
    { id: 'streak_30', name: 'Monthly Master', description: 'Visit 30 days in a row', icon: Crown, color: 'violet', rarity: 'legendary', xp: 500 },
    { id: 'early_bird', name: 'Early Bird', description: 'Catch a deal before 7am', icon: Zap, color: 'yellow', rarity: 'common', xp: 15 },
    { id: 'night_owl', name: 'Night Owl', description: 'Browse deals after midnight', icon: Star, color: 'indigo', rarity: 'common', xp: 15 },
    { id: 'category_explorer', name: 'Explorer', description: 'Browse 5 different categories', icon: Target, color: 'cyan', rarity: 'common', xp: 30 },
    { id: 'brand_loyalist', name: 'Brand Loyalist', description: 'Save 5 deals from same brand', icon: Award, color: 'pink', rarity: 'rare', xp: 50 },
    { id: 'price_predictor', name: 'Price Prophet', description: 'Wait for a predicted price drop', icon: TrendingUp, color: 'emerald', rarity: 'epic', xp: 200 },
    { id: 'community_helper', name: 'Community Helper', description: 'Get 10 upvotes on comments', icon: Medal, color: 'amber', rarity: 'rare', xp: 100 },
    { id: 'referral_master', name: 'Referral Master', description: 'Refer 5 friends', icon: Gift, color: 'violet', rarity: 'epic', xp: 250 },
    { id: 'all_time_low_sniper', name: 'All-Time Low Sniper', description: 'Buy 3 all-time low deals', icon: Crown, color: 'amber', rarity: 'legendary', xp: 300 },
];

// Gamification Context Storage
const STORAGE_KEY = 'tadow_gamification';

interface GamificationState {
    xp: number;
    level: number;
    streak: number;
    lastVisit: string;
    totalSavings: number;
    dealsViewed: number;
    dealsSaved: number;
    dealsBought: number;
    achievements: string[];
    categoriesVisited: string[];
    brandsSaved: Record<string, number>;
}

function getDefaultState(): GamificationState {
    return {
        xp: 0,
        level: 1,
        streak: 0,
        lastVisit: '',
        totalSavings: 0,
        dealsViewed: 0,
        dealsSaved: 0,
        dealsBought: 0,
        achievements: [],
        categoriesVisited: [],
        brandsSaved: {},
    };
}

function loadState(): GamificationState {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? { ...getDefaultState(), ...JSON.parse(stored) } : getDefaultState();
    } catch {
        return getDefaultState();
    }
}

function saveState(state: GamificationState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Calculate level from XP
function calculateLevel(xp: number): number {
    return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function xpForLevel(level: number): number {
    return Math.pow(level - 1, 2) * 100;
}

function xpForNextLevel(level: number): number {
    return Math.pow(level, 2) * 100;
}

// Hook
export function useGamification() {
    const [state, setState] = useState<GamificationState>(loadState);
    const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

    useEffect(() => {
        // Check streak on load
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (state.lastVisit !== today) {
            const newState = { ...state, lastVisit: today };

            if (state.lastVisit === yesterday) {
                newState.streak = state.streak + 1;
                // Check streak achievements
                if (newState.streak >= 3 && !state.achievements.includes('streak_3')) {
                    unlockAchievement('streak_3');
                }
                if (newState.streak >= 7 && !state.achievements.includes('streak_7')) {
                    unlockAchievement('streak_7');
                }
                if (newState.streak >= 30 && !state.achievements.includes('streak_30')) {
                    unlockAchievement('streak_30');
                }
            } else if (state.lastVisit !== today) {
                newState.streak = 1;
            }

            setState(newState);
            saveState(newState);
        }

        // Check time-based achievements
        const hour = new Date().getHours();
        if (hour < 7 && !state.achievements.includes('early_bird')) {
            unlockAchievement('early_bird');
        }
        if (hour >= 0 && hour < 5 && !state.achievements.includes('night_owl')) {
            unlockAchievement('night_owl');
        }
    }, []);

    const addXP = (amount: number) => {
        const newXP = state.xp + amount;
        const newLevel = calculateLevel(newXP);
        const newState = { ...state, xp: newXP, level: newLevel };
        setState(newState);
        saveState(newState);
    };

    const unlockAchievement = (id: AchievementId) => {
        if (state.achievements.includes(id)) return;

        const achievement = ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return;

        const newState = {
            ...state,
            achievements: [...state.achievements, id],
            xp: state.xp + achievement.xp,
            level: calculateLevel(state.xp + achievement.xp),
        };

        setState(newState);
        saveState(newState);
        setNewAchievement(achievement);

        // Auto-dismiss after 5s
        setTimeout(() => setNewAchievement(null), 5000);
    };

    const trackDealSave = (brand: string, category: string) => {
        const brandCount = (state.brandsSaved[brand] || 0) + 1;
        const newState = {
            ...state,
            dealsSaved: state.dealsSaved + 1,
            brandsSaved: { ...state.brandsSaved, [brand]: brandCount },
            categoriesVisited: state.categoriesVisited.includes(category)
                ? state.categoriesVisited
                : [...state.categoriesVisited, category],
        };

        // Check achievements
        if (state.dealsSaved === 0) unlockAchievement('first_save');
        if (newState.dealsSaved >= 10) unlockAchievement('deal_hunter');
        if (brandCount >= 5) unlockAchievement('brand_loyalist');
        if (newState.categoriesVisited.length >= 5) unlockAchievement('category_explorer');

        setState(newState);
        saveState(newState);
        addXP(5);
    };

    const trackSavings = (amount: number) => {
        const newTotal = state.totalSavings + amount;
        const newState = { ...state, totalSavings: newTotal };

        if (newTotal >= 500) unlockAchievement('super_saver');

        setState(newState);
        saveState(newState);
    };

    return {
        state,
        addXP,
        unlockAchievement,
        trackDealSave,
        trackSavings,
        newAchievement,
        dismissAchievement: () => setNewAchievement(null),
        level: state.level,
        xp: state.xp,
        xpProgress: ((state.xp - xpForLevel(state.level)) / (xpForNextLevel(state.level) - xpForLevel(state.level))) * 100,
        achievements: ACHIEVEMENTS.filter(a => state.achievements.includes(a.id)),
        allAchievements: ACHIEVEMENTS,
    };
}

// Achievement Popup
export function AchievementPopup({ achievement, onDismiss }: { achievement: Achievement | null; onDismiss: () => void }) {
    if (!achievement) return null;

    const rarityColors = {
        common: 'from-zinc-500 to-zinc-600',
        rare: 'from-blue-500 to-cyan-500',
        epic: 'from-violet-500 to-purple-500',
        legendary: 'from-amber-400 to-orange-500',
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
            >
                <div className={`bg-gradient-to-r ${rarityColors[achievement.rarity]} p-[2px] rounded-xl shadow-2xl`}>
                    <div className="bg-zinc-900 rounded-xl p-4 flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-${achievement.color}-500/20 flex items-center justify-center`}>
                            <achievement.icon className={`w-6 h-6 text-${achievement.color}-400`} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-amber-400 text-xs font-bold uppercase">Achievement Unlocked!</span>
                                <span className="text-xs text-zinc-500">+{achievement.xp} XP</span>
                            </div>
                            <h4 className="text-white font-semibold">{achievement.name}</h4>
                            <p className="text-zinc-400 text-sm">{achievement.description}</p>
                        </div>
                        <button onClick={onDismiss} className="p-1 text-zinc-500 hover:text-white">×</button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Level Badge
export function LevelBadge({ level, size = 'md' }: { level: number; size?: 'sm' | 'md' | 'lg' }) {
    const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-12 h-12 text-lg' };

    return (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-black`}>
            {level}
        </div>
    );
}

// XP Progress Bar
export function XPProgressBar({ xp, level, progress }: { xp: number; level: number; progress: number }) {
    return (
        <div className="space-y-1">
            <div className="flex justify-between text-xs">
                <span className="text-zinc-400">Level {level}</span>
                <span className="text-amber-400">{xp} XP</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500"
                />
            </div>
        </div>
    );
}

export default { useGamification, AchievementPopup, LevelBadge, XPProgressBar };
