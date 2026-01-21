// Tadow Watchlist - Local Storage Utility
// Manages user's saved deals with localStorage persistence

const WATCHLIST_KEY = 'tadow_watchlist';
const PRICE_ALERTS_KEY = 'tadow_price_alerts';
const USER_PREFERENCES_KEY = 'tadow_preferences';

export interface WatchlistItem {
    dealId: string;
    title: string;
    currentPrice: number;
    savedAt: string;
    imageUrl?: string;
    marketplace: string;
}

export interface PriceAlert {
    dealId: string;
    title: string;
    targetPrice: number;
    currentPrice: number;
    email?: string;
    createdAt: string;
    triggered: boolean;
}

export interface UserPreferences {
    darkMode: boolean;
    notifications: boolean;
    emailAlerts: boolean;
    defaultSort: string;
    defaultView: 'grid' | 'list';
    favoriteCategories: string[];
    lastVisit: string;
}

// Watchlist Functions
export function getWatchlist(): WatchlistItem[] {
    try {
        const data = localStorage.getItem(WATCHLIST_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addToWatchlist(item: WatchlistItem): boolean {
    try {
        const watchlist = getWatchlist();
        if (watchlist.some(w => w.dealId === item.dealId)) {
            return false; // Already exists
        }
        watchlist.push({ ...item, savedAt: new Date().toISOString() });
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
        return true;
    } catch {
        return false;
    }
}

export function removeFromWatchlist(dealId: string): boolean {
    try {
        const watchlist = getWatchlist().filter(w => w.dealId !== dealId);
        localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
        return true;
    } catch {
        return false;
    }
}

export function isInWatchlist(dealId: string): boolean {
    return getWatchlist().some(w => w.dealId === dealId);
}

// Price Alerts Functions
export function getPriceAlerts(): PriceAlert[] {
    try {
        const data = localStorage.getItem(PRICE_ALERTS_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function addPriceAlert(alert: Omit<PriceAlert, 'createdAt' | 'triggered'>): boolean {
    try {
        const alerts = getPriceAlerts();
        if (alerts.some(a => a.dealId === alert.dealId)) {
            return false; // Already exists
        }
        alerts.push({
            ...alert,
            createdAt: new Date().toISOString(),
            triggered: false
        });
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
        return true;
    } catch {
        return false;
    }
}

export function removePriceAlert(dealId: string): boolean {
    try {
        const alerts = getPriceAlerts().filter(a => a.dealId !== dealId);
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
        return true;
    } catch {
        return false;
    }
}

export function checkPriceAlerts(currentDeals: Array<{ id: string; currentPrice: number }>): PriceAlert[] {
    const alerts = getPriceAlerts();
    const triggered: PriceAlert[] = [];

    alerts.forEach(alert => {
        const deal = currentDeals.find(d => d.id === alert.dealId);
        if (deal && deal.currentPrice <= alert.targetPrice && !alert.triggered) {
            triggered.push(alert);
            alert.triggered = true;
        }
    });

    if (triggered.length > 0) {
        localStorage.setItem(PRICE_ALERTS_KEY, JSON.stringify(alerts));
    }

    return triggered;
}

// User Preferences Functions
export function getPreferences(): UserPreferences {
    try {
        const data = localStorage.getItem(USER_PREFERENCES_KEY);
        return data ? JSON.parse(data) : getDefaultPreferences();
    } catch {
        return getDefaultPreferences();
    }
}

function getDefaultPreferences(): UserPreferences {
    return {
        darkMode: true,
        notifications: false,
        emailAlerts: false,
        defaultSort: 'score',
        defaultView: 'grid',
        favoriteCategories: [],
        lastVisit: new Date().toISOString(),
    };
}

export function updatePreferences(updates: Partial<UserPreferences>): boolean {
    try {
        const current = getPreferences();
        const updated = { ...current, ...updates, lastVisit: new Date().toISOString() };
        localStorage.setItem(USER_PREFERENCES_KEY, JSON.stringify(updated));
        return true;
    } catch {
        return false;
    }
}

// Analytics / Usage Tracking (privacy-friendly, local-only)
export function trackDealView(dealId: string): void {
    try {
        const key = 'tadow_deal_views';
        const views = JSON.parse(localStorage.getItem(key) || '{}');
        views[dealId] = (views[dealId] || 0) + 1;
        localStorage.setItem(key, JSON.stringify(views));
    } catch {
        // Silently fail
    }
}

export function getMostViewedDeals(): string[] {
    try {
        const key = 'tadow_deal_views';
        const views = JSON.parse(localStorage.getItem(key) || '{}');
        return Object.entries(views)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 10)
            .map(([id]) => id);
    } catch {
        return [];
    }
}

// Clear all user data
export function clearAllData(): void {
    localStorage.removeItem(WATCHLIST_KEY);
    localStorage.removeItem(PRICE_ALERTS_KEY);
    localStorage.removeItem(USER_PREFERENCES_KEY);
    localStorage.removeItem('tadow_deal_views');
}
