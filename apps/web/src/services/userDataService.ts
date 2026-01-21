/**
 * Watchlist Service - Local Storage Persistence
 * Manages user's saved deals with localStorage fallback
 */

export interface WatchlistItem {
    dealId: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    originalPrice: number;
    discountPercent: number;
    marketplace?: { name: string; color: string };
    addedAt: string;
    targetPrice?: number;
    alertEnabled: boolean;
}

// Storage key
const WATCHLIST_KEY = 'tadow_watchlist';
const PRICE_ALERTS_KEY = 'tadow_price_alerts';

// Get all watchlist items
export function getWatchlist(): WatchlistItem[] {
    try {
        const stored = localStorage.getItem(WATCHLIST_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

// Add item to watchlist
export function addToWatchlist(item: Omit<WatchlistItem, 'addedAt' | 'alertEnabled'>): void {
    const watchlist = getWatchlist();

    // Check if already exists
    if (watchlist.some(w => w.dealId === item.dealId)) {
        return;
    }

    watchlist.push({
        ...item,
        addedAt: new Date().toISOString(),
        alertEnabled: false,
    });

    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));

    // Dispatch custom event for real-time UI updates
    window.dispatchEvent(new CustomEvent('watchlist-updated', { detail: { action: 'add', item } }));
}

// Remove item from watchlist
export function removeFromWatchlist(dealId: string): void {
    const watchlist = getWatchlist().filter(w => w.dealId !== dealId);
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));

    window.dispatchEvent(new CustomEvent('watchlist-updated', { detail: { action: 'remove', dealId } }));
}

// Check if item is in watchlist
export function isInWatchlist(dealId: string): boolean {
    return getWatchlist().some(w => w.dealId === dealId);
}

// Toggle watchlist item
export function toggleWatchlist(item: Omit<WatchlistItem, 'addedAt' | 'alertEnabled'>): boolean {
    if (isInWatchlist(item.dealId)) {
        removeFromWatchlist(item.dealId);
        return false;
    } else {
        addToWatchlist(item);
        return true;
    }
}

// Set target price for alert
export function setTargetPrice(dealId: string, targetPrice: number): void {
    const watchlist = getWatchlist();
    const index = watchlist.findIndex(w => w.dealId === dealId);

    if (index !== -1) {
        watchlist[index].targetPrice = targetPrice;
        watchlist[index].alertEnabled = true;
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
    }
}

// Toggle price alert
export function toggleAlert(dealId: string): boolean {
    const watchlist = getWatchlist();
    const index = watchlist.findIndex(w => w.dealId === dealId);

    if (index !== -1) {
        watchlist[index].alertEnabled = !watchlist[index].alertEnabled;
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
        return watchlist[index].alertEnabled;
    }

    return false;
}

// Get watchlist count
export function getWatchlistCount(): number {
    return getWatchlist().length;
}

// Clear entire watchlist
export function clearWatchlist(): void {
    localStorage.removeItem(WATCHLIST_KEY);
    window.dispatchEvent(new CustomEvent('watchlist-updated', { detail: { action: 'clear' } }));
}

// ======================
// Price Alert Email Subscriptions
// ======================

export interface PriceAlertSubscription {
    id: string;
    email: string;
    dealId: string;
    dealTitle: string;
    targetPrice: number;
    currentPrice: number;
    createdAt: string;
    notifiedAt?: string;
}

export function getPriceAlerts(): PriceAlertSubscription[] {
    try {
        const stored = localStorage.getItem(PRICE_ALERTS_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function createPriceAlert(email: string, dealId: string, dealTitle: string, targetPrice: number, currentPrice: number): void {
    const alerts = getPriceAlerts();

    // Check for existing alert
    if (alerts.some(a => a.email === email && a.dealId === dealId)) {
        return;
    }

    alerts.push({
        id: `alert_${Date.now()}`,
        email,
        dealId,
        dealTitle,
        targetPrice,
        currentPrice,
        createdAt: new Date().toISOString(),
    });

    localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
}

export function deletePriceAlert(alertId: string): void {
    const alerts = getPriceAlerts().filter(a => a.id !== alertId);
    localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
}

// ======================
// User Preferences
// ======================

const PREFERENCES_KEY = 'tadow_preferences';

export interface UserPreferences {
    favoriteCategories: string[];
    favoriteBrands: string[];
    priceRangeMin?: number;
    priceRangeMax?: number;
    emailNotifications: boolean;
    pushNotifications: boolean;
    darkMode: boolean;
    currency: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    favoriteCategories: [],
    favoriteBrands: [],
    emailNotifications: true,
    pushNotifications: false,
    darkMode: true,
    currency: 'USD',
};

export function getPreferences(): UserPreferences {
    try {
        const stored = localStorage.getItem(PREFERENCES_KEY);
        return stored ? { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) } : DEFAULT_PREFERENCES;
    } catch {
        return DEFAULT_PREFERENCES;
    }
}

export function updatePreferences(updates: Partial<UserPreferences>): void {
    const current = getPreferences();
    const updated = { ...current, ...updates };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
}

export function toggleFavoriteCategory(category: string): void {
    const prefs = getPreferences();
    const index = prefs.favoriteCategories.indexOf(category);

    if (index === -1) {
        prefs.favoriteCategories.push(category);
    } else {
        prefs.favoriteCategories.splice(index, 1);
    }

    updatePreferences({ favoriteCategories: prefs.favoriteCategories });
}

export function toggleFavoriteBrand(brand: string): void {
    const prefs = getPreferences();
    const index = prefs.favoriteBrands.indexOf(brand);

    if (index === -1) {
        prefs.favoriteBrands.push(brand);
    } else {
        prefs.favoriteBrands.splice(index, 1);
    }

    updatePreferences({ favoriteBrands: prefs.favoriteBrands });
}

// ======================
// Recently Viewed
// ======================

const RECENTLY_VIEWED_KEY = 'tadow_recently_viewed';
const MAX_RECENTLY_VIEWED = 20;

export interface RecentlyViewedItem {
    dealId: string;
    title: string;
    imageUrl?: string;
    currentPrice: number;
    viewedAt: string;
}

export function getRecentlyViewed(): RecentlyViewedItem[] {
    try {
        const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function addToRecentlyViewed(dealId: string, title: string, currentPrice: number, imageUrl?: string): void {
    const items = getRecentlyViewed().filter(i => i.dealId !== dealId);

    items.unshift({
        dealId,
        title,
        imageUrl,
        currentPrice,
        viewedAt: new Date().toISOString(),
    });

    // Keep only the most recent
    const trimmed = items.slice(0, MAX_RECENTLY_VIEWED);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(trimmed));
}

// ======================
// Search History
// ======================

const SEARCH_HISTORY_KEY = 'tadow_search_history';
const MAX_SEARCH_HISTORY = 10;

export function getSearchHistory(): string[] {
    try {
        const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

export function addToSearchHistory(query: string): void {
    if (!query.trim()) return;

    const history = getSearchHistory().filter(h => h.toLowerCase() !== query.toLowerCase());
    history.unshift(query.trim());

    const trimmed = history.slice(0, MAX_SEARCH_HISTORY);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(trimmed));
}

export function clearSearchHistory(): void {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
}
