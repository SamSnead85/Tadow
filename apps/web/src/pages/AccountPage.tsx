import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    User, Bell, Shield, LogOut, ChevronRight,
    Heart, TrendingDown, Settings, Moon, Sun, Mail, Smartphone,
    Check, AlertCircle
} from 'lucide-react';
import { getWatchlist, getPriceAlerts, getPreferences, updatePreferences } from '../utils/storage';

interface UserData {
    email: string;
    name: string;
    signedIn: boolean;
    createdAt: string;
}

export function AccountPage() {
    const [user, setUser] = useState<UserData | null>(null);
    const [activeTab, setActiveTab] = useState('profile');
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [emailNotifications, setEmailNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(true);
    const [watchlistCount, setWatchlistCount] = useState(0);
    const [alertsCount, setAlertsCount] = useState(0);

    useEffect(() => {
        const stored = localStorage.getItem('tadow_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }

        setWatchlistCount(getWatchlist().length);
        setAlertsCount(getPriceAlerts().length);

        // Check notification permission
        if ('Notification' in window) {
            setNotificationsEnabled(Notification.permission === 'granted');
        }

        // Load preferences
        const prefs = getPreferences();
        setDarkMode(prefs.darkMode);
    }, []);

    const handleSignOut = () => {
        localStorage.removeItem('tadow_user');
        window.location.href = '/';
    };

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationsEnabled(permission === 'granted');

            if (permission === 'granted') {
                // Show test notification
                new Notification('Tadow Alerts Enabled! 🔔', {
                    body: 'You\'ll now receive price drop notifications.',
                    icon: '/favicon.png'
                });
            }
        }
    };

    const toggleDarkMode = () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        updatePreferences({ darkMode: newValue });
    };

    const stats = [
        { label: 'Saved Deals', value: watchlistCount, icon: Heart, color: 'text-red-400' },
        { label: 'Price Alerts', value: alertsCount, icon: Bell, color: 'text-amber-400' },
        { label: 'Total Saved', value: '$0', icon: TrendingDown, color: 'text-emerald-400' },
    ];

    const menuItems = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Preferences', icon: Settings },
        { id: 'security', label: 'Security', icon: Shield },
    ];

    if (!user) {
        return (
            <div className="min-h-screen bg-zinc-950 py-8">
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-20"
                    >
                        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-zinc-800 flex items-center justify-center">
                            <User className="w-12 h-12 text-zinc-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Sign in to view your account</h2>
                        <p className="text-zinc-400 mb-8">Access your watchlist, price alerts, and preferences</p>
                        <Link to="/" className="btn-primary inline-flex">
                            Go to Deals
                        </Link>
                    </motion.div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 py-8">
            <div className="container-wide">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                            <span className="text-2xl font-bold text-zinc-900">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                            <p className="text-zinc-400">{user.email}</p>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="glass p-4 rounded-xl text-center">
                                <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
                                <div className="text-xl font-bold text-white">{stat.value}</div>
                                <div className="text-xs text-zinc-500">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Sidebar Menu */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1"
                    >
                        <div className="glass rounded-xl overflow-hidden">
                            {menuItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${activeTab === item.id
                                        ? 'bg-amber-500/10 text-amber-400 border-l-2 border-amber-500'
                                        : 'text-zinc-400 hover:bg-zinc-800/50'
                                        }`}
                                >
                                    <item.icon className="w-5 h-5" />
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={handleSignOut}
                                className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>

                    {/* Content Area */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-3"
                    >
                        <div className="glass rounded-xl p-6">
                            {activeTab === 'profile' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white">Profile Settings</h2>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">Display Name</label>
                                            <input
                                                type="text"
                                                defaultValue={user.name}
                                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">Email</label>
                                            <input
                                                type="email"
                                                defaultValue={user.email}
                                                className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <button className="btn-primary">Save Changes</button>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'notifications' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white">Notification Settings</h2>

                                    {/* Push Notifications */}
                                    <div className="p-4 bg-zinc-800/50 rounded-xl">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <Smartphone className="w-5 h-5 text-amber-400" />
                                                <div>
                                                    <h3 className="font-medium text-white">Push Notifications</h3>
                                                    <p className="text-sm text-zinc-500">Get instant alerts on your device</p>
                                                </div>
                                            </div>
                                            {notificationsEnabled ? (
                                                <span className="flex items-center gap-1 text-sm text-emerald-400">
                                                    <Check className="w-4 h-4" /> Enabled
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={requestNotificationPermission}
                                                    className="btn-primary text-sm"
                                                >
                                                    Enable
                                                </button>
                                            )}
                                        </div>
                                        {!notificationsEnabled && (
                                            <div className="flex items-start gap-2 p-3 bg-amber-500/10 rounded-lg text-sm">
                                                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5" />
                                                <p className="text-amber-200">
                                                    Enable push notifications to get instant price drop alerts.
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Email Notifications */}
                                    <div className="p-4 bg-zinc-800/50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <Mail className="w-5 h-5 text-blue-400" />
                                                <div>
                                                    <h3 className="font-medium text-white">Email Notifications</h3>
                                                    <p className="text-sm text-zinc-500">Receive daily deal digests</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => setEmailNotifications(!emailNotifications)}
                                                className={`w-12 h-6 rounded-full transition-colors ${emailNotifications ? 'bg-amber-500' : 'bg-zinc-700'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick Links */}
                                    <div className="space-y-2">
                                        <Link to="/watchlist" className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Heart className="w-5 h-5 text-red-400" />
                                                <span className="text-white">Manage Watchlist</span>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-zinc-500" />
                                        </Link>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'preferences' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white">Preferences</h2>

                                    <div className="p-4 bg-zinc-800/50 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                {darkMode ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-yellow-400" />}
                                                <div>
                                                    <h3 className="font-medium text-white">Dark Mode</h3>
                                                    <p className="text-sm text-zinc-500">Toggle dark/light theme</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={toggleDarkMode}
                                                className={`w-12 h-6 rounded-full transition-colors ${darkMode ? 'bg-amber-500' : 'bg-zinc-700'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'
                                                    }`} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-white">Security</h2>

                                    <div className="space-y-4">
                                        <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                                            <span className="text-white">Change Password</span>
                                            <ChevronRight className="w-5 h-5 text-zinc-500" />
                                        </button>
                                        <button className="w-full flex items-center justify-between p-4 bg-zinc-800/50 rounded-xl hover:bg-zinc-800 transition-colors">
                                            <span className="text-white">Two-Factor Authentication</span>
                                            <ChevronRight className="w-5 h-5 text-zinc-500" />
                                        </button>
                                        <button className="w-full flex items-center justify-between p-4 bg-red-500/10 rounded-xl hover:bg-red-500/20 transition-colors text-red-400">
                                            <span>Delete Account</span>
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
