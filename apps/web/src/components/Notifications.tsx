import { useState, useCallback, createContext, useContext, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Check, AlertCircle, AlertTriangle, Info, Bell,
    ChevronRight
} from 'lucide-react';

// Notification Types
type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    message?: string;
    duration?: number;
    action?: { label: string; onClick: () => void };
    persistent?: boolean;
}

// Context
interface NotificationContextType {
    notifications: Notification[];
    show: (notification: Omit<Notification, 'id'>) => string;
    dismiss: (id: string) => void;
    dismissAll: () => void;
    success: (title: string, message?: string) => string;
    error: (title: string, message?: string) => string;
    warning: (title: string, message?: string) => string;
    info: (title: string, message?: string) => string;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// Provider
export function NotificationProvider({ children, maxNotifications = 5 }: { children: ReactNode; maxNotifications?: number }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const dismiss = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const dismissAll = useCallback(() => {
        setNotifications([]);
    }, []);

    const show = useCallback((notification: Omit<Notification, 'id'>) => {
        const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newNotification: Notification = { ...notification, id };

        setNotifications(prev => {
            const updated = [...prev, newNotification];
            // Limit notifications
            if (updated.length > maxNotifications) {
                return updated.slice(-maxNotifications);
            }
            return updated;
        });

        // Auto-dismiss
        if (!notification.persistent) {
            const duration = notification.duration || 5000;
            setTimeout(() => dismiss(id), duration);
        }

        return id;
    }, [dismiss, maxNotifications]);

    const success = useCallback((title: string, message?: string) =>
        show({ type: 'success', title, message }), [show]);
    const error = useCallback((title: string, message?: string) =>
        show({ type: 'error', title, message, duration: 8000 }), [show]);
    const warning = useCallback((title: string, message?: string) =>
        show({ type: 'warning', title, message }), [show]);
    const info = useCallback((title: string, message?: string) =>
        show({ type: 'info', title, message }), [show]);

    return (
        <NotificationContext.Provider value={{ notifications, show, dismiss, dismissAll, success, error, warning, info }}>
            {children}
            <NotificationContainer notifications={notifications} onDismiss={dismiss} />
        </NotificationContext.Provider>
    );
}

export function useNotifications() {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotifications must be used within NotificationProvider');
    return context;
}

// Notification Container
function NotificationContainer({ notifications, onDismiss }: { notifications: Notification[]; onDismiss: (id: string) => void }) {
    return (
        <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {notifications.map(notification => (
                    <NotificationToast key={notification.id} notification={notification} onDismiss={() => onDismiss(notification.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

// Individual Notification Toast
function NotificationToast({ notification, onDismiss }: { notification: Notification; onDismiss: () => void }) {
    const config = {
        success: { icon: Check, bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', iconColor: 'text-emerald-400' },
        error: { icon: AlertCircle, bg: 'bg-red-500/10', border: 'border-red-500/30', iconColor: 'text-red-400' },
        warning: { icon: AlertTriangle, bg: 'bg-amber-500/10', border: 'border-amber-500/30', iconColor: 'text-amber-400' },
        info: { icon: Info, bg: 'bg-blue-500/10', border: 'border-blue-500/30', iconColor: 'text-blue-400' },
    }[notification.type];

    const Icon = config.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            className={`${config.bg} ${config.border} border rounded-xl p-4 backdrop-blur-lg shadow-2xl pointer-events-auto`}
        >
            <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${config.iconColor} flex-shrink-0 mt-0.5`} />
                <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium">{notification.title}</h4>
                    {notification.message && (
                        <p className="text-zinc-400 text-sm mt-0.5">{notification.message}</p>
                    )}
                    {notification.action && (
                        <button
                            onClick={notification.action.onClick}
                            className="mt-2 text-sm text-amber-400 hover:underline flex items-center gap-1"
                        >
                            {notification.action.label}
                            <ChevronRight className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <button onClick={onDismiss} className="text-zinc-500 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </motion.div>
    );
}

// Push Notification Request
export function PushNotificationBanner({ onEnable, onDismiss }: { onEnable: () => void; onDismiss: () => void }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4"
        >
            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-2xl">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <Bell className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <h4 className="text-white font-medium">Never Miss a Deal!</h4>
                        <p className="text-zinc-400 text-sm mt-0.5">
                            Enable notifications to get instant alerts when prices drop.
                        </p>
                        <div className="flex gap-2 mt-3">
                            <button
                                onClick={() => { onEnable(); setDismissed(true); }}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black text-sm font-medium rounded-lg"
                            >
                                Enable Notifications
                            </button>
                            <button
                                onClick={() => { onDismiss(); setDismissed(true); }}
                                className="px-4 py-2 bg-zinc-800 text-zinc-300 text-sm rounded-lg hover:bg-zinc-700"
                            >
                                Not Now
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => setDismissed(true)}
                        className="text-zinc-500 hover:text-white"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// In-App Notification Badge
export function NotificationBadge({ count }: { count: number }) {
    if (count === 0) return null;

    return (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {count > 99 ? '99+' : count}
        </span>
    );
}

// Notification Center Panel
interface NotificationItem {
    id: string;
    type: 'price_drop' | 'deal_alert' | 'system';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    link?: string;
}

export function NotificationCenterPanel({ notifications, onMarkRead, onClear }: {
    notifications: NotificationItem[];
    onMarkRead: (id: string) => void;
    onClear: () => void;
}) {
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-zinc-800">
                <h3 className="text-white font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-amber-500 text-black text-xs font-bold rounded-full">
                        {unreadCount} new
                    </span>
                )}
            </div>

            <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="py-12 text-center text-zinc-500">
                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No notifications yet</p>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            onClick={() => onMarkRead(notif.id)}
                            className={`p-4 border-b border-zinc-800/50 cursor-pointer transition-colors ${notif.read ? 'bg-transparent' : 'bg-amber-500/5'
                                } hover:bg-zinc-800/50`}
                        >
                            <div className="flex items-start gap-3">
                                {!notif.read && (
                                    <span className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                                )}
                                <div className={!notif.read ? '' : 'ml-5'}>
                                    <h4 className="text-white text-sm font-medium">{notif.title}</h4>
                                    <p className="text-zinc-400 text-xs mt-0.5">{notif.message}</p>
                                    <span className="text-zinc-600 text-xs mt-1 block">{notif.timestamp}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 border-t border-zinc-800">
                    <button
                        onClick={onClear}
                        className="w-full py-2 text-sm text-zinc-400 hover:text-white"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
}

export default {
    NotificationProvider,
    useNotifications,
    PushNotificationBanner,
    NotificationBadge,
    NotificationCenterPanel,
};
