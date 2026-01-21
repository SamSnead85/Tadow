import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Flame, Menu, X, Sparkles, Command, User } from 'lucide-react';
import { SearchModal, useSearchModal } from './SearchModal';
import { MobileNav, MobileNavSpacer } from './MobileNav';
import { AuthModal } from './AuthModal';

interface TadowUser {
    email: string;
    name: string;
    signedIn: boolean;
}

export function Layout() {
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const searchModal = useSearchModal();
    const [scrolled, setScrolled] = useState(false);
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [user, setUser] = useState<TadowUser | null>(null);

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

    const isActivePath = (path: string) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/deals';
        return location.pathname.startsWith(path);
    };

    const navLinks = [
        { path: '/', label: 'Deals', icon: Flame },
        { path: '/search', label: 'Search', icon: Search },
        { path: '/assistant', label: 'AI Assistant', icon: Sparkles, isAI: true },
    ];

    return (
        <div className="min-h-screen bg-zinc-950">
            <SearchModal isOpen={searchModal.isOpen} onClose={searchModal.close} />
            <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />

            {/* Navigation */}
            <nav className={`nav-glass ${scrolled ? 'shadow-xl shadow-black/20' : ''}`}>
                <div className="container-wide">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="relative"
                            >
                                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 blur-lg opacity-30 group-hover:opacity-60 transition-opacity duration-500" />
                                <img
                                    src="/favicon.png"
                                    alt="Tadow"
                                    className="relative w-10 h-10 rounded-xl shadow-lg shadow-amber-500/20"
                                />
                            </motion.div>

                            <div className="flex flex-col">
                                <span className="font-bold text-xl text-white tracking-tight group-hover:text-amber-400 transition-colors">
                                    Tadow
                                </span>
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest -mt-0.5">
                                    Deals That Hit Different
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Nav */}
                        <div className="hidden md:flex items-center gap-1">
                            {navLinks.map((link) => {
                                const isActive = isActivePath(link.path) && !(link.path === '/' && location.pathname === '/search');
                                const Icon = link.icon;

                                return (
                                    <Link key={link.path} to={link.path} className="nav-link group">
                                        <motion.div
                                            whileHover={{ y: -1 }}
                                            className={`flex items-center gap-1.5 ${isActive
                                                ? link.isAI ? 'text-violet-400' : 'text-amber-400'
                                                : 'text-zinc-400 group-hover:text-white'
                                                }`}
                                        >
                                            {Icon && <Icon className="w-3.5 h-3.5" />}
                                            {link.label}
                                            {link.isAI && <Sparkles className="w-3 h-3 text-violet-400" />}
                                        </motion.div>

                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-indicator"
                                                className={`absolute bottom-0 left-2 right-2 h-0.5 rounded-full ${link.isAI ? 'bg-violet-400' : 'bg-amber-400'
                                                    }`}
                                                style={{ boxShadow: link.isAI ? '0 0 12px rgba(139, 92, 246, 0.5)' : '0 0 12px rgba(212, 168, 87, 0.5)' }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right Side */}
                        <div className="hidden md:flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={searchModal.open}
                                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-colors"
                            >
                                <Search className="w-4 h-4 text-zinc-500" />
                                <span className="text-sm text-zinc-500">Search...</span>
                                <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 bg-zinc-800 rounded text-[10px] text-zinc-500 font-mono">
                                    <Command className="w-3 h-3" />K
                                </kbd>
                            </motion.button>

                            {user ? (
                                <Link to="/account" className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
                                    <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                                        <User className="w-4 h-4 text-amber-400" />
                                    </div>
                                    <span className="text-sm text-white">{user.name}</span>
                                </Link>
                            ) : (
                                <>
                                    <button
                                        onClick={() => setAuthModalOpen(true)}
                                        className="btn-ghost text-sm"
                                    >
                                        Sign In
                                    </button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => setAuthModalOpen(true)}
                                        className="btn-primary"
                                    >
                                        Get Started
                                    </motion.button>
                                </>
                            )}
                        </div>

                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden p-2 text-zinc-400 hover:text-white"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </nav>

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
            <main className="pt-16">
                <Outlet />
            </main>

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
