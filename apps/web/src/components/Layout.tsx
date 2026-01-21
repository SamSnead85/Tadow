import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Menu, X, Sparkles, ChevronDown, ShoppingCart, Command } from 'lucide-react';
import { SearchModal, useSearchModal } from './SearchModal';
import { MobileNav, MobileNavSpacer } from './MobileNav';
import { AuthModal } from './AuthModal';
import AIChatWidget from './AIChatWidget';
import { CommandPalette } from './CommandPalette';

interface TadowUser {
    email: string;
    name: string;
    signedIn: boolean;
}

const categories = [
    { value: '', label: 'All' },
    { value: 'laptops', label: 'Laptops' },
    { value: 'phones', label: 'Phones' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'audio', label: 'Audio' },
    { value: 'tvs', label: 'TVs' },
];

export function Layout() {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const searchModal = useSearchModal();
    const [scrolled, setScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [user, setUser] = useState<TadowUser | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchCategory, setSearchCategory] = useState('');

    // Check for existing session
    useEffect(() => {
        const stored = localStorage.getItem('tadow_user');
        if (stored) {
            setUser(JSON.parse(stored));
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            const params = new URLSearchParams();
            params.set('q', searchQuery);
            if (searchCategory) params.set('category', searchCategory);
            navigate(`/search?${params.toString()}`);
        }
    };

    const isActivePath = (path: string) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/deals';
        return location.pathname.startsWith(path);
    };

    const navLinks = [
        { path: '/', label: 'Deals', icon: Flame },
        { path: '/categories', label: 'Categories' },
        { path: '/assistant', label: 'AI Assistant', icon: Sparkles, isAI: true },
        { path: '/watchlist', label: 'Watchlist' },
    ];

    return (
        <div className="min-h-screen bg-zinc-950">
            <SearchModal isOpen={searchModal.isOpen} onClose={searchModal.close} />
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
            <CommandPalette />

            {/* Amazon-Style Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 ${scrolled ? 'shadow-xl shadow-black/30' : ''}`}>
                {/* Main Header Bar */}
                <div className="bg-zinc-900 border-b border-zinc-800">
                    <div className="container-wide">
                        <div className="flex items-center gap-4 h-16">
                            {/* Logo */}
                            <Link to="/" className="flex items-center gap-2 flex-shrink-0 group">
                                <img
                                    src="/favicon.png"
                                    alt="Tadow"
                                    className="w-9 h-9 rounded-lg"
                                />
                                <span className="font-bold text-xl text-white hidden sm:block group-hover:text-amber-400 transition-colors">
                                    Tadow
                                </span>
                            </Link>

                            {/* Search Bar - Large & Centered */}
                            <form onSubmit={handleSearch} className="flex-1 max-w-4xl mx-auto">
                                <div className="flex items-stretch h-12 rounded-lg overflow-hidden border-2 border-zinc-700 focus-within:border-amber-500 transition-colors shadow-lg shadow-black/20">
                                    {/* Category Dropdown */}
                                    <div className="relative hidden sm:block">
                                        <select
                                            value={searchCategory}
                                            onChange={(e) => setSearchCategory(e.target.value)}
                                            className="h-full px-4 pr-9 bg-zinc-700 text-zinc-200 text-sm border-r border-zinc-600 cursor-pointer focus:outline-none appearance-none font-medium"
                                        >
                                            {categories.map(cat => (
                                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    </div>

                                    {/* Search Input */}
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search for laptops, phones, gaming gear..."
                                        className="flex-1 px-5 bg-zinc-800 text-white placeholder:text-zinc-500 focus:outline-none text-base font-medium"
                                    />

                                    {/* Search Button */}
                                    <button
                                        type="submit"
                                        className="px-6 bg-amber-500 hover:bg-amber-400 text-zinc-900 font-semibold transition-colors"
                                    >
                                        <Search className="w-5 h-5" />
                                    </button>
                                </div>
                            </form>

                            {/* Right Side Actions */}
                            <div className="hidden md:flex items-center gap-1">
                                {/* Account */}
                                {user ? (
                                    <Link to="/account" className="flex flex-col px-3 py-1 hover:bg-zinc-800 rounded transition-colors">
                                        <span className="text-xs text-zinc-400">Hello, {user.name}</span>
                                        <span className="text-sm font-semibold text-white flex items-center gap-1">
                                            Account <ChevronDown className="w-3 h-3" />
                                        </span>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setAuthModalOpen(true)}
                                        className="flex flex-col px-3 py-1 hover:bg-zinc-800 rounded transition-colors text-left"
                                    >
                                        <span className="text-xs text-zinc-400">Hello, Sign in</span>
                                        <span className="text-sm font-semibold text-white flex items-center gap-1">
                                            Account <ChevronDown className="w-3 h-3" />
                                        </span>
                                    </button>
                                )}

                                {/* Watchlist */}
                                <Link to="/watchlist" className="flex flex-col px-3 py-1 hover:bg-zinc-800 rounded transition-colors">
                                    <span className="text-xs text-zinc-400">Returns</span>
                                    <span className="text-sm font-semibold text-white">& Watchlist</span>
                                </Link>

                                {/* Cart/Saved */}
                                <Link to="/watchlist" className="relative p-2 hover:bg-zinc-800 rounded transition-colors">
                                    <ShoppingCart className="w-6 h-6 text-white" />
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-zinc-900 text-xs font-bold rounded-full flex items-center justify-center">
                                        0
                                    </span>
                                </Link>
                            </div>

                            {/* Mobile Menu Button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden p-2 text-zinc-400 hover:text-white"
                            >
                                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Secondary Nav Bar */}
                <div className="bg-zinc-800/95 backdrop-blur-sm border-b border-zinc-700/50">
                    <div className="container-wide">
                        <div className="flex items-center gap-1 h-10 overflow-x-auto hide-scrollbar">
                            {navLinks.map((link) => {
                                const isActive = isActivePath(link.path) && !(link.path === '/' && location.pathname === '/search');
                                const Icon = link.icon;

                                return (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium whitespace-nowrap transition-colors ${isActive
                                            ? link.isAI ? 'text-violet-400 bg-violet-500/10' : 'text-amber-400 bg-amber-500/10'
                                            : 'text-zinc-300 hover:text-white hover:bg-zinc-700'
                                            }`}
                                    >
                                        {Icon && <Icon className="w-4 h-4" />}
                                        {link.label}
                                    </Link>
                                );
                            })}
                            <div className="h-4 w-px bg-zinc-600 mx-2" />
                            <Link to="/local" className="text-sm text-zinc-400 hover:text-white px-2 whitespace-nowrap">Local Deals</Link>
                            <Link to="/marketplace" className="text-sm text-zinc-400 hover:text-white px-2 whitespace-nowrap">Marketplace</Link>
                            <Link to="/sell" className="text-sm text-zinc-400 hover:text-white px-2 whitespace-nowrap">Sell</Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                        />
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 z-50 w-80 glass-strong p-6 md:hidden"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <span className="text-lg font-semibold text-white">Menu</span>
                                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-white">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <button
                                onClick={() => { setMobileMenuOpen(false); searchModal.open(); }}
                                className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-800/50 rounded-xl text-zinc-400 mb-4"
                            >
                                <Search className="w-4 h-4" />
                                <span className="text-sm">Search deals...</span>
                            </button>

                            <div className="space-y-2">
                                {navLinks.map((link) => {
                                    const Icon = link.icon;
                                    return (
                                        <Link
                                            key={link.path}
                                            to={link.path}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActivePath(link.path)
                                                ? 'bg-amber-500/10 text-amber-400'
                                                : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-white'
                                                }`}
                                        >
                                            {Icon && <Icon className="w-4 h-4" />}
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            <div className="mt-8 pt-8 border-t border-zinc-800 space-y-3">
                                <button className="w-full btn-secondary text-sm">Sign In</button>
                                <button className="w-full btn-primary text-sm">Get Started</button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-28">
                <Outlet />
            </main>

            {/* AI Chat Widget */}
            <AIChatWidget />

            {/* Footer */}
            <footer className="border-t border-zinc-800/50 bg-zinc-950">
                <div className="container-wide py-16">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-5">
                                <img
                                    src="/favicon.png"
                                    alt="Tadow"
                                    className="w-10 h-10 rounded-xl shadow-lg"
                                />
                                <div>
                                    <span className="font-bold text-xl text-white">Tadow</span>
                                    <span className="text-zinc-600 text-xs ml-2 font-mono">v1.0</span>
                                </div>
                            </div>
                            <p className="text-zinc-400 text-sm leading-relaxed mb-5 max-w-xs">
                                AI-powered deal intelligence. Find deals that hit different across
                                every marketplace—never overpay again.
                            </p>
                            <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg w-fit">
                                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                <span className="text-amber-400 text-xs font-medium">All systems operational</span>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Marketplaces</h4>
                            <ul className="space-y-2.5 text-sm">
                                {['Amazon', 'eBay', 'Best Buy', 'Walmart', 'Craigslist', 'Facebook', 'Swappa'].map(source => (
                                    <li key={source}>
                                        <Link to={`/search?marketplace=${source}`} className="text-zinc-500 hover:text-white transition-colors">
                                            {source}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Categories</h4>
                            <ul className="space-y-2.5 text-sm">
                                {['Laptops', 'Phones', 'TVs', 'Gaming', 'Audio', 'Wearables'].map(cat => (
                                    <li key={cat}>
                                        <Link to={`/search?category=${cat}`} className="text-zinc-500 hover:text-amber-400 transition-colors">
                                            {cat}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4">Company</h4>
                            <ul className="space-y-2.5 text-sm">
                                {['About', 'Blog', 'Careers', 'Press'].map(item => (
                                    <li key={item}>
                                        <a href="#" className="text-zinc-500 hover:text-white transition-colors">{item}</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="mt-12 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <p className="text-zinc-600 text-xs">© 2026 Tadow. All rights reserved.</p>
                        <div className="flex items-center gap-6 text-xs text-zinc-500">
                            <span className="flex items-center gap-1 text-zinc-600">
                                <Command className="w-3 h-3" />K to search
                            </span>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Mobile Navigation */}
            <MobileNav />
            <MobileNavSpacer />
        </div>
    );
}
