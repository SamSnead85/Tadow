import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, WifiOff, AlertCircle, AlertTriangle } from 'lucide-react';

// Error Boundary Fallback
export function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
            <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
                <p className="text-zinc-400 mb-6">{error.message || 'An unexpected error occurred'}</p>
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={resetErrorBoundary}
                        className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg"
                    >
                        Try Again
                    </button>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700"
                    >
                        Reload Page
                    </button>
                </div>
            </div>
        </div>
    );
}

// Offline Banner
export function OfflineBanner() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <motion.div
            initial={{ y: -50 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black py-2 px-4 text-center font-medium"
        >
            <WifiOff className="w-4 h-4 inline-block mr-2" />
            You're offline. Some features may not work.
        </motion.div>
    );
}

// Loading States
export function SkeletonLoader({ className = '', variant = 'box' }: { className?: string; variant?: 'box' | 'text' | 'circle' }) {
    const baseClass = 'animate-pulse bg-zinc-800 rounded';

    switch (variant) {
        case 'circle':
            return <div className={`${baseClass} rounded-full ${className}`} />;
        case 'text':
            return <div className={`${baseClass} h-4 ${className}`} />;
        default:
            return <div className={`${baseClass} ${className}`} />;
    }
}

export function DealCardSkeleton() {
    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <SkeletonLoader className="aspect-video" />
            <div className="p-4 space-y-3">
                <SkeletonLoader variant="text" className="w-1/3" />
                <SkeletonLoader variant="text" className="w-full" />
                <SkeletonLoader variant="text" className="w-2/3" />
                <div className="flex justify-between pt-2">
                    <SkeletonLoader className="w-20 h-6" />
                    <SkeletonLoader className="w-16 h-8 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function DealsGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <DealCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Spinner
export function Spinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

    return (
        <div className={`${sizes[size]} ${className}`}>
            <svg className="animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
        </div>
    );
}

// Full Page Loader
export function FullPageLoader({ message = 'Loading...' }: { message?: string }) {
    return (
        <div className="fixed inset-0 z-50 bg-zinc-950 flex items-center justify-center">
            <div className="text-center">
                <Spinner size="lg" className="text-amber-500 mx-auto mb-4" />
                <p className="text-zinc-400">{message}</p>
            </div>
        </div>
    );
}

// Pull to Refresh (for data)
export function useRefresh<T>(fetchFn: () => Promise<T>, interval?: number) {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetch = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await fetchFn();
            setData(result);
            setLastUpdated(new Date());
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch'));
        } finally {
            setLoading(false);
        }
    }, [fetchFn]);

    useEffect(() => {
        fetch();

        if (interval) {
            const id = setInterval(fetch, interval);
            return () => clearInterval(id);
        }
    }, [fetch, interval]);

    const refresh = useCallback(() => fetch(), [fetch]);

    return { data, loading, error, lastUpdated, refresh };
}

// Retry Button
export function RetryButton({ onRetry, error }: { onRetry: () => void; error?: string }) {
    return (
        <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
            <p className="text-zinc-400 mb-4">{error || 'Failed to load. Please try again.'}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium rounded-lg inline-flex items-center gap-2"
            >
                <RefreshCw className="w-4 h-4" />
                Retry
            </button>
        </div>
    );
}

// Infinite Scroll Hook
export function useInfiniteScroll(loadMore: () => void, hasMore: boolean, threshold = 100) {
    const [isLoading, setIsLoading] = useState(false);
    const observerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    setIsLoading(true);
                    loadMore();
                    setTimeout(() => setIsLoading(false), 1000);
                }
            },
            { rootMargin: `${threshold}px` }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [loadMore, hasMore, isLoading, threshold]);

    return { observerRef, isLoading };
}

// Infinite Scroll Trigger Component
export function InfiniteScrollTrigger({ loadMore, hasMore, loading }: {
    loadMore: () => void;
    hasMore: boolean;
    loading: boolean;
}) {
    const { observerRef, isLoading } = useInfiniteScroll(loadMore, hasMore);

    return (
        <div ref={observerRef} className="py-8 text-center">
            {(loading || isLoading) && hasMore && (
                <Spinner className="text-amber-500 mx-auto" />
            )}
            {!hasMore && (
                <p className="text-zinc-500">No more items to load</p>
            )}
        </div>
    );
}

// Debounce Hook
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);

    return debouncedValue;
}

// Local Storage Hook with SSR safety
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch {
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error saving to localStorage:', error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
}

// Clipboard Hook
export function useClipboard(timeout = 2000) {
    const [copied, setCopied] = useState(false);

    const copy = useCallback(async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), timeout);
            return true;
        } catch {
            return false;
        }
    }, [timeout]);

    return { copied, copy };
}

export default {
    ErrorFallback,
    OfflineBanner,
    SkeletonLoader,
    DealCardSkeleton,
    DealsGridSkeleton,
    Spinner,
    FullPageLoader,
    useRefresh,
    RetryButton,
    useInfiniteScroll,
    InfiniteScrollTrigger,
    useDebounce,
    useLocalStorage,
    useClipboard,
};
