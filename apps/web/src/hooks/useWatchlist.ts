import { useState, useEffect, useCallback } from 'react';
import {
    getWatchlist,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    toggleWatchlist,
    setTargetPrice,
    toggleAlert,
    getWatchlistCount,
    clearWatchlist,
    WatchlistItem,
} from '../services/userDataService';

/**
 * React hook for managing watchlist state with real-time updates
 */
export function useWatchlist() {
    const [items, setItems] = useState<WatchlistItem[]>([]);
    const [count, setCount] = useState(0);

    // Load initial data
    useEffect(() => {
        setItems(getWatchlist());
        setCount(getWatchlistCount());
    }, []);

    // Listen for updates from other components
    useEffect(() => {
        const handleUpdate = () => {
            setItems(getWatchlist());
            setCount(getWatchlistCount());
        };

        window.addEventListener('watchlist-updated', handleUpdate);
        return () => window.removeEventListener('watchlist-updated', handleUpdate);
    }, []);

    const add = useCallback((item: Omit<WatchlistItem, 'addedAt' | 'alertEnabled'>) => {
        addToWatchlist(item);
        setItems(getWatchlist());
        setCount(getWatchlistCount());
    }, []);

    const remove = useCallback((dealId: string) => {
        removeFromWatchlist(dealId);
        setItems(getWatchlist());
        setCount(getWatchlistCount());
    }, []);

    const toggle = useCallback((item: Omit<WatchlistItem, 'addedAt' | 'alertEnabled'>) => {
        const added = toggleWatchlist(item);
        setItems(getWatchlist());
        setCount(getWatchlistCount());
        return added;
    }, []);

    const isWatched = useCallback((dealId: string) => {
        return isInWatchlist(dealId);
    }, []);

    const setPrice = useCallback((dealId: string, price: number) => {
        setTargetPrice(dealId, price);
        setItems(getWatchlist());
    }, []);

    const toggleItemAlert = useCallback((dealId: string) => {
        const enabled = toggleAlert(dealId);
        setItems(getWatchlist());
        return enabled;
    }, []);

    const clear = useCallback(() => {
        clearWatchlist();
        setItems([]);
        setCount(0);
    }, []);

    return {
        items,
        count,
        add,
        remove,
        toggle,
        isWatched,
        setPrice,
        toggleItemAlert,
        clear,
    };
}

/**
 * Simple hook to check if a specific deal is in watchlist
 */
export function useIsWatched(dealId: string): boolean {
    const [watched, setWatched] = useState(false);

    useEffect(() => {
        setWatched(isInWatchlist(dealId));

        const handleUpdate = () => {
            setWatched(isInWatchlist(dealId));
        };

        window.addEventListener('watchlist-updated', handleUpdate);
        return () => window.removeEventListener('watchlist-updated', handleUpdate);
    }, [dealId]);

    return watched;
}
