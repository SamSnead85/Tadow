import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Mail, Check,
    Zap, TrendingDown, Gift
} from 'lucide-react';

// Email Subscription Types
type EmailFrequency = 'realtime' | 'daily' | 'weekly' | 'never';
type EmailCategory = 'deals' | 'alerts' | 'digest' | 'tips' | 'promotions';

interface EmailPreferences {
    email: string;
    verified: boolean;
    frequency: EmailFrequency;
    categories: EmailCategory[];
    dealCategories: string[];
    minDiscount: number;
}

// Email Capture Component
export function EmailCapture({ onSuccess }: { onSuccess?: (email: string) => void }) {
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));

        // Store locally
        localStorage.setItem('tadow_email', email);
        setSubmitted(true);
        setLoading(false);
        onSuccess?.(email);
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
            >
                <Check className="w-5 h-5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">You're subscribed! Check your inbox.</span>
            </motion.div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email for deal alerts"
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:border-amber-500 outline-none"
                    required
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-xl disabled:opacity-50 transition-colors"
            >
                {loading ? '...' : 'Subscribe'}
            </button>
        </form>
    );
}

// Email Preferences Manager
export function EmailPreferencesManager() {
    const [prefs, setPrefs] = useState<EmailPreferences>({
        email: localStorage.getItem('tadow_email') || '',
        verified: true,
        frequency: 'daily',
        categories: ['deals', 'alerts'],
        dealCategories: ['Laptops', 'Phones'],
        minDiscount: 20,
    });
    const [saved, setSaved] = useState(false);

    const handleSave = () => {
        localStorage.setItem('tadow_email_prefs', JSON.stringify(prefs));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const frequencies: { value: EmailFrequency; label: string; desc: string }[] = [
        { value: 'realtime', label: 'Real-time', desc: 'Instant notifications for price drops' },
        { value: 'daily', label: 'Daily Digest', desc: 'Once a day, best deals summary' },
        { value: 'weekly', label: 'Weekly', desc: 'Once a week, top deals roundup' },
        { value: 'never', label: 'Never', desc: 'No emails, only on-site notifications' },
    ];

    const categories: { id: EmailCategory; label: string; icon: React.ElementType }[] = [
        { id: 'deals', label: 'Hot Deals', icon: Zap },
        { id: 'alerts', label: 'Price Alerts', icon: TrendingDown },
        { id: 'digest', label: 'Daily Digest', icon: Mail },
        { id: 'tips', label: 'Shopping Tips', icon: Gift },
    ];

    return (
        <div className="space-y-6">
            {/* Email Address */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <h4 className="text-white font-medium mb-3">Email Address</h4>
                <div className="flex items-center gap-3">
                    <input
                        type="email"
                        value={prefs.email}
                        onChange={(e) => setPrefs({ ...prefs, email: e.target.value })}
                        className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white"
                    />
                    {prefs.verified && (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-sm rounded-full">
                            Verified
                        </span>
                    )}
                </div>
            </div>

            {/* Frequency */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <h4 className="text-white font-medium mb-3">Email Frequency</h4>
                <div className="space-y-2">
                    {frequencies.map(freq => (
                        <label
                            key={freq.value}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${prefs.frequency === freq.value
                                ? 'bg-amber-500/10 border border-amber-500/30'
                                : 'border border-transparent hover:bg-zinc-800'
                                }`}
                        >
                            <input
                                type="radio"
                                name="frequency"
                                checked={prefs.frequency === freq.value}
                                onChange={() => setPrefs({ ...prefs, frequency: freq.value })}
                                className="sr-only"
                            />
                            <div className={`w-4 h-4 rounded-full border-2 ${prefs.frequency === freq.value
                                ? 'border-amber-500 bg-amber-500'
                                : 'border-zinc-600'
                                }`} />
                            <div>
                                <div className="text-white font-medium">{freq.label}</div>
                                <div className="text-sm text-zinc-500">{freq.desc}</div>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Categories */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <h4 className="text-white font-medium mb-3">Email Types</h4>
                <div className="grid grid-cols-2 gap-2">
                    {categories.map(cat => {
                        const active = prefs.categories.includes(cat.id);
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setPrefs({
                                    ...prefs,
                                    categories: active
                                        ? prefs.categories.filter(c => c !== cat.id)
                                        : [...prefs.categories, cat.id]
                                })}
                                className={`flex items-center gap-2 p-3 rounded-lg transition-colors ${active
                                    ? 'bg-amber-500/20 border border-amber-500/30 text-amber-400'
                                    : 'bg-zinc-800 border border-transparent text-zinc-400'
                                    }`}
                            >
                                <cat.icon className="w-4 h-4" />
                                {cat.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Min Discount */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <h4 className="text-white font-medium">Minimum Discount</h4>
                    <span className="text-amber-400 font-medium">{prefs.minDiscount}%+</span>
                </div>
                <input
                    type="range"
                    min="5"
                    max="50"
                    step="5"
                    value={prefs.minDiscount}
                    onChange={(e) => setPrefs({ ...prefs, minDiscount: Number(e.target.value) })}
                    className="w-full accent-amber-500"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                    <span>5%</span>
                    <span>50%</span>
                </div>
            </div>

            {/* Save Button */}
            <button
                onClick={handleSave}
                className={`w-full py-3 rounded-xl font-semibold transition-all ${saved
                    ? 'bg-emerald-500 text-white'
                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                    }`}
            >
                {saved ? '✓ Saved!' : 'Save Preferences'}
            </button>
        </div>
    );
}

// Unsubscribe Component
export function UnsubscribePage({ token: _token }: { token?: string }) {
    const [unsubscribed, setUnsubscribed] = useState(false);
    const [reason, setReason] = useState('');

    const handleUnsubscribe = () => {
        // In real app, call API with token
        localStorage.removeItem('tadow_email');
        setUnsubscribed(true);
    };

    if (unsubscribed) {
        return (
            <div className="max-w-md mx-auto text-center py-16">
                <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
                    <Mail className="w-8 h-8 text-zinc-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">You've been unsubscribed</h1>
                <p className="text-zinc-400 mb-6">
                    You won't receive any more emails from Tadow. We're sorry to see you go!
                </p>
                <button
                    onClick={() => setUnsubscribed(false)}
                    className="text-amber-400 hover:underline"
                >
                    Changed your mind? Re-subscribe
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto py-16">
            <h1 className="text-2xl font-bold text-white mb-2 text-center">Unsubscribe</h1>
            <p className="text-zinc-400 mb-6 text-center">
                Are you sure you want to stop receiving deal alerts?
            </p>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 mb-6">
                <h4 className="text-white font-medium mb-3">Why are you leaving?</h4>
                <div className="space-y-2">
                    {['Too many emails', 'Deals not relevant', 'Found a better service', 'Other'].map(r => (
                        <label key={r} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="reason"
                                checked={reason === r}
                                onChange={() => setReason(r)}
                                className="text-amber-500"
                            />
                            <span className="text-zinc-300">{r}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={handleUnsubscribe}
                    className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700"
                >
                    Unsubscribe
                </button>
                <a
                    href="/account"
                    className="flex-1 py-3 bg-amber-500 text-black font-semibold rounded-xl text-center"
                >
                    Manage Preferences
                </a>
            </div>
        </div>
    );
}

export default { EmailCapture, EmailPreferencesManager, UnsubscribePage };
