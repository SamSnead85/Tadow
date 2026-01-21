import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Chrome, Download, Zap, Bell, Eye, Check,
    ArrowRight, Shield, Star, TrendingDown, Gift
} from 'lucide-react';

// Browser Extension Landing
export function BrowserExtensionLanding() {
    const [installed, setInstalled] = useState(false);

    useEffect(() => {
        // Check if extension is installed (mock)
        const isInstalled = localStorage.getItem('tadow_extension_installed') === 'true';
        setInstalled(isInstalled);
    }, []);

    const features = [
        { icon: TrendingDown, title: 'Auto Price Alerts', desc: 'Get notified when prices drop on any product page' },
        { icon: Eye, title: 'Price History', desc: 'See price history on Amazon, Best Buy, and more' },
        { icon: Bell, title: 'Deal Notifications', desc: 'Never miss a flash sale or lightning deal' },
        { icon: Gift, title: 'Coupon Finder', desc: 'Automatically find and apply coupons at checkout' },
    ];

    const stats = [
        { value: '500K+', label: 'Active Users' },
        { value: '$2.3M', label: 'Saved This Month' },
        { value: '4.8', label: 'Chrome Store Rating' },
    ];

    const handleInstall = () => {
        // In production, redirect to Chrome Web Store
        localStorage.setItem('tadow_extension_installed', 'true');
        setInstalled(true);
    };

    return (
        <div className="min-h-screen bg-zinc-950">
            {/* Hero */}
            <section className="relative overflow-hidden py-20">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-violet-500/10" />

                <div className="container-wide relative">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 rounded-full text-sm text-zinc-300 mb-6">
                            <Chrome className="w-4 h-4 text-amber-400" />
                            Chrome Extension
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
                            Save Money on{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                                Every Purchase
                            </span>
                        </h1>

                        <p className="text-xl text-zinc-400 mb-8">
                            The Tadow browser extension finds deals, tracks prices, and applies coupons automatically. Install once, save forever.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {installed ? (
                                <div className="flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400">
                                    <Check className="w-5 h-5" />
                                    Extension Installed!
                                </div>
                            ) : (
                                <button
                                    onClick={handleInstall}
                                    className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                    Add to Chrome - It's Free
                                </button>
                            )}
                            <a href="#features" className="flex items-center gap-2 text-zinc-400 hover:text-white">
                                Learn more <ArrowRight className="w-4 h-4" />
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center justify-center gap-8 mt-12">
                            {stats.map(stat => (
                                <div key={stat.label} className="text-center">
                                    <div className="text-2xl font-bold text-white">{stat.value}</div>
                                    <div className="text-sm text-zinc-500">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section id="features" className="py-20 border-t border-zinc-800">
                <div className="container-wide">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        Everything You Need to Save
                    </h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6"
                            >
                                <feature.icon className="w-10 h-10 text-amber-400 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-zinc-400 text-sm">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="py-20 border-t border-zinc-800">
                <div className="container-wide">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">
                        How It Works
                    </h2>

                    <div className="max-w-3xl mx-auto">
                        {[
                            { step: 1, title: 'Install the Extension', desc: 'One click to add Tadow to your browser' },
                            { step: 2, title: 'Shop Normally', desc: 'Browse your favorite stores as usual' },
                            { step: 3, title: 'See Instant Savings', desc: 'Tadow shows price history, alerts, and coupons automatically' },
                        ].map((item) => (
                            <div key={item.step} className="flex items-start gap-6 mb-8">
                                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold text-xl flex-shrink-0">
                                    {item.step}
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-1">{item.title}</h3>
                                    <p className="text-zinc-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Supported Stores */}
            <section className="py-20 border-t border-zinc-800">
                <div className="container-wide">
                    <h2 className="text-3xl font-bold text-white text-center mb-4">
                        Works on 10,000+ Stores
                    </h2>
                    <p className="text-zinc-400 text-center mb-12">Including all your favorites</p>

                    <div className="flex flex-wrap justify-center gap-6">
                        {['Amazon', 'Best Buy', 'Walmart', 'Target', 'Newegg', 'eBay', 'Costco', 'Home Depot'].map(store => (
                            <div
                                key={store}
                                className="px-6 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white font-medium"
                            >
                                {store}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-20 border-t border-zinc-800">
                <div className="container-wide">
                    <div className="max-w-2xl mx-auto text-center bg-gradient-to-br from-amber-500/10 to-violet-500/10 border border-zinc-800 rounded-2xl p-12">
                        <Shield className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Start Saving Today
                        </h2>
                        <p className="text-zinc-400 mb-8">
                            Join 500,000+ smart shoppers who never overpay. It's free, forever.
                        </p>

                        {installed ? (
                            <div className="flex items-center justify-center gap-2 text-emerald-400">
                                <Check className="w-5 h-5" />
                                You're all set! The extension is active.
                            </div>
                        ) : (
                            <button
                                onClick={handleInstall}
                                className="flex items-center gap-2 mx-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-semibold rounded-xl hover:shadow-lg hover:shadow-amber-500/25 transition-all"
                            >
                                <Chrome className="w-5 h-5" />
                                Add to Chrome - Free
                            </button>
                        )}

                        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-400" />
                                4.8 rating
                            </span>
                            <span>•</span>
                            <span>500K+ users</span>
                            <span>•</span>
                            <span>No tracking</span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}

// Extension Popup (Simulated)
export function ExtensionPopup({ productUrl: _productUrl, productTitle: _productTitle }: { productUrl?: string; productTitle?: string }) {
    const [activeTab, setActiveTab] = useState<'overview' | 'coupons' | 'history'>('overview');

    return (
        <div className="w-[350px] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-amber-500/20 to-transparent border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-white">Tadow</span>
                </div>
                <span className="text-xs text-zinc-500">v2.1.0</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-zinc-800">
                {(['overview', 'coupons', 'history'] as const).map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2 text-sm font-medium transition-colors ${activeTab === tab
                            ? 'text-amber-400 border-b-2 border-amber-400'
                            : 'text-zinc-500 hover:text-white'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="p-4">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="text-center py-4">
                            <div className="text-3xl font-bold text-emerald-400 mb-1">$247</div>
                            <div className="text-sm text-zinc-400">Best price we found</div>
                            <div className="text-xs text-zinc-600 mt-1">You save $52 (17%)</div>
                        </div>
                        <button className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold rounded-lg transition-colors">
                            Go to Best Price
                        </button>
                        <div className="text-xs text-zinc-500 text-center">
                            Found on 5 retailers • Updated 2 min ago
                        </div>
                    </div>
                )}

                {activeTab === 'coupons' && (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                            <code className="text-amber-400 font-mono">SAVE20</code>
                            <button className="px-3 py-1 bg-amber-500 text-black text-xs font-medium rounded">Apply</button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                            <code className="text-amber-400 font-mono">FREESHIP</code>
                            <button className="px-3 py-1 bg-amber-500 text-black text-xs font-medium rounded">Apply</button>
                        </div>
                        <p className="text-xs text-zinc-500 text-center">2 coupons found for this store</p>
                    </div>
                )}

                {activeTab === 'history' && (
                    <div>
                        <div className="h-24 flex items-end gap-1 mb-2">
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex-1 bg-zinc-700 rounded-t"
                                    style={{ height: `${Math.random() * 80 + 20}%` }}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between text-xs text-zinc-500">
                            <span>3 months ago</span>
                            <span>Today</span>
                        </div>
                        <div className="mt-3 p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-center">
                            <span className="text-emerald-400 text-sm">🎉 Near all-time low!</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-4 py-2 bg-zinc-800/50 text-xs text-zinc-500 text-center">
                <button className="text-amber-400 hover:underline">Set price alert</button>
                {' • '}
                <button className="text-amber-400 hover:underline">Settings</button>
            </div>
        </div>
    );
}

export default { BrowserExtensionLanding, ExtensionPopup };
