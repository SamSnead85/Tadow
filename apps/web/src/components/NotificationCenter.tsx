import { useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, CheckCircle, AlertTriangle, Info, Sparkles, TrendingDown } from 'lucide-react';

// Notification Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'price_drop' | 'deal_expiring' | 'saved';

export interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    dealId?: string;
    duration?: number; // ms, default 5000
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface NotificationContextValue {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id'>) => void;
    removeNotification: (id: string) => void;
    clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = { ...notification, id };

        setNotifications(prev => [...prev, newNotification]);

        // Auto-remove after duration
        const duration = notification.duration || 5000;
        if (duration > 0) {
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const clearAll = useCallback(() => {
        setNotifications([]);
    }, []);

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
            {children}
            <NotificationContainer notifications={notifications} onRemove={removeNotification} />
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
}

// Notification Container (renders notifications)
function NotificationContainer({ notifications, onRemove }: { notifications: Notification[]; onRemove: (id: string) => void }) {
    return (
        <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence mode="popLayout">
                {notifications.map(notification => (
                    <NotificationToast key={notification.id} notification={notification} onRemove={onRemove} />
                ))}
            </AnimatePresence>
        </div>
    );
}

// Individual Notification Toast
function NotificationToast({ notification, onRemove }: { notification: Notification; onRemove: (id: string) => void }) {
    const typeConfig = {
        success: { icon: CheckCircle, bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', iconColor: 'text-emerald-400' },
        error: { icon: AlertTriangle, bg: 'bg-red-500/20', border: 'border-red-500/30', iconColor: 'text-red-400' },
        warning: { icon: AlertTriangle, bg: 'bg-amber-500/20', border: 'border-amber-500/30', iconColor: 'text-amber-400' },
        info: { icon: Info, bg: 'bg-blue-500/20', border: 'border-blue-500/30', iconColor: 'text-blue-400' },
        price_drop: { icon: TrendingDown, bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', iconColor: 'text-emerald-400' },
        deal_expiring: { icon: Bell, bg: 'bg-orange-500/20', border: 'border-orange-500/30', iconColor: 'text-orange-400' },
        saved: { icon: Sparkles, bg: 'bg-violet-500/20', border: 'border-violet-500/30', iconColor: 'text-violet-400' },
    };

    const config = typeConfig[notification.type];
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className={`pointer-events-auto ${config.bg} ${config.border} border rounded-xl p-4 shadow-xl backdrop-blur-md`}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-white">{notification.title}</h4>
                    {notification.message && (
                        <p className="text-xs text-zinc-400 mt-0.5">{notification.message}</p>
                    )}
                    {notification.action && (
                        <button
                            onClick={notification.action.onClick}
                            className="mt-2 text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
                        >
                            {notification.action.label}
                        </button>
                    )}
                </div>
                <button
                    onClick={() => onRemove(notification.id)}
                    className="text-zinc-500 hover:text-white transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

// Helper functions for common notifications
export function useDealNotifications() {
    const { addNotification } = useNotifications();

    return {
        notifyAddedToWatchlist: (dealTitle: string) => {
            addNotification({
                type: 'saved',
                title: 'Added to Watchlist',
                message: dealTitle.slice(0, 50) + (dealTitle.length > 50 ? '...' : ''),
            });
        },

        notifyRemovedFromWatchlist: () => {
            addNotification({
                type: 'info',
                title: 'Removed from Watchlist',
                duration: 3000,
            });
        },

        notifyPriceDrop: (dealTitle: string, oldPrice: number, newPrice: number) => {
            const savings = oldPrice - newPrice;
            addNotification({
                type: 'price_drop',
                title: `Price Drop! $${savings.toFixed(0)} off`,
                message: dealTitle.slice(0, 50) + (dealTitle.length > 50 ? '...' : ''),
                duration: 8000,
            });
        },

        notifyDealExpiring: (dealTitle: string) => {
            addNotification({
                type: 'deal_expiring',
                title: 'Deal Expiring Soon!',
                message: dealTitle.slice(0, 50) + (dealTitle.length > 50 ? '...' : ''),
                duration: 8000,
            });
        },

        notifyAlertCreated: (email: string) => {
            addNotification({
                type: 'success',
                title: 'Price Alert Created',
                message: `We'll email ${email} when the price drops`,
            });
        },

        notifyError: (message: string) => {
            addNotification({
                type: 'error',
                title: 'Error',
                message,
                duration: 6000,
            });
        },
    };
}
