import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Bell, X, Package, MessageSquare,
    DollarSign, Star, TrendingDown, Heart
} from 'lucide-react';

interface Notification {
    id: string;
    type: 'message' | 'offer' | 'sale' | 'review' | 'price_drop' | 'like' | 'system';
    title: string;
    body: string;
    link?: string;
    read: boolean;
    createdAt: Date;
}

// Demo notifications
const DEMO_NOTIFICATIONS: Notification[] = [
    {
        id: 'notif_1',
        type: 'offer',
        title: 'New Offer!',
        body: 'Mike Johnson offered $1,750 for your MacBook Pro',
        link: '/messages',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
    },
    {
        id: 'notif_2',
        type: 'message',
        title: 'New Message',
        body: 'Emma Wilson: Is this still available?',
        link: '/messages',
        read: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
    {
        id: 'notif_3',
        type: 'price_drop',
        title: 'Price Drop Alert!',
        body: 'iPhone 15 Pro Max dropped to $849 (-$50)',
        link: '/listing/listing_3',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
        id: 'notif_4',
        type: 'like',
        title: 'Someone liked your listing',
        body: '3 people saved your Apple Watch Ultra 2',
        link: '/listing/listing_6',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
    {
        id: 'notif_5',
        type: 'review',
        title: 'New Review',
        body: 'Mike Johnson left you a 5-star review',
        link: '/profile/user_sarah',
        read: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(DEMO_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const unreadCount = notifications.filter(n => !n.read).length;
    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const markAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            <div className="max-w-2xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Notifications</h1>
                        <p className="text-zinc-400 text-sm">
                            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-amber-400 text-sm hover:text-amber-300"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-2 rounded-full text-sm ${filter === 'all'
                            ? 'bg-amber-500 text-zinc-900 font-medium'
                            : 'bg-zinc-800 text-zinc-400'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={`px-4 py-2 rounded-full text-sm ${filter === 'unread'
                            ? 'bg-amber-500 text-zinc-900 font-medium'
                            : 'bg-zinc-800 text-zinc-400'
                            }`}
                    >
                        Unread {unreadCount > 0 && `(${unreadCount})`}
                    </button>
                </div>

                {/* Notifications List */}
                <AnimatePresence mode="popLayout">
                    {filteredNotifications.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-12"
                        >
                            <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                            <p className="text-zinc-400">No notifications</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-2">
                            {filteredNotifications.map(notification => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    onRead={() => markAsRead(notification.id)}
                                    onDelete={() => deleteNotification(notification.id)}
                                />
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function NotificationItem({
    notification,
    onRead,
    onDelete
}: {
    notification: Notification;
    onRead: () => void;
    onDelete: () => void;
}) {
    const iconConfig: Record<Notification['type'], { icon: React.ReactNode; color: string }> = {
        message: { icon: <MessageSquare className="w-5 h-5" />, color: 'bg-blue-500/20 text-blue-400' },
        offer: { icon: <DollarSign className="w-5 h-5" />, color: 'bg-emerald-500/20 text-emerald-400' },
        sale: { icon: <Package className="w-5 h-5" />, color: 'bg-purple-500/20 text-purple-400' },
        review: { icon: <Star className="w-5 h-5" />, color: 'bg-amber-500/20 text-amber-400' },
        price_drop: { icon: <TrendingDown className="w-5 h-5" />, color: 'bg-red-500/20 text-red-400' },
        like: { icon: <Heart className="w-5 h-5" />, color: 'bg-rose-500/20 text-rose-400' },
        system: { icon: <Bell className="w-5 h-5" />, color: 'bg-zinc-500/20 text-zinc-400' },
    };

    const { icon, color } = iconConfig[notification.type];

    const content = (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className={`flex items-start gap-3 p-4 rounded-xl border transition-colors ${notification.read
                ? 'bg-zinc-900/30 border-zinc-800/50'
                : 'bg-zinc-900 border-zinc-700'
                }`}
            onClick={onRead}
        >
            <div className={`p-2 rounded-lg ${color}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h3 className={`font-medium ${notification.read ? 'text-zinc-400' : 'text-white'}`}>
                            {notification.title}
                        </h3>
                        <p className="text-sm text-zinc-500 truncate">{notification.body}</p>
                    </div>
                    {!notification.read && (
                        <div className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                </div>
                <span className="text-xs text-zinc-600 mt-1 block">
                    {formatTimeAgo(notification.createdAt)}
                </span>
            </div>
            <button
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDelete(); }}
                className="p-1 text-zinc-600 hover:text-zinc-400"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );

    if (notification.link) {
        return <Link to={notification.link}>{content}</Link>;
    }

    return content;
}

function formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
