import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, User, Eye, EyeOff, Github, Chrome } from 'lucide-react';

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'signin' | 'signup';
}

export function AuthModal({ isOpen, onClose, initialMode = 'signin' }: AuthModalProps) {
    const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        // Simulate auth (replace with real auth later)
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Store basic session (demo only)
        localStorage.setItem('tadow_user', JSON.stringify({
            email,
            name: mode === 'signup' ? name : email.split('@')[0],
            signedIn: true,
            createdAt: new Date().toISOString(),
        }));

        setLoading(false);
        onClose();
        window.location.reload();
    };

    const handleSocialAuth = (provider: string) => {
        console.log(`Auth with ${provider}`);
        // Would integrate with OAuth
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto"
                    >
                        <div className="glass-strong rounded-2xl p-6">
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Header */}
                            <div className="text-center mb-6">
                                <img
                                    src="/favicon.png"
                                    alt="Tadow"
                                    className="w-12 h-12 mx-auto mb-4 rounded-xl"
                                />
                                <h2 className="text-2xl font-bold text-white">
                                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                                </h2>
                                <p className="text-zinc-400 text-sm mt-1">
                                    {mode === 'signin'
                                        ? 'Sign in to access your watchlist and alerts'
                                        : 'Join Tadow to save deals and get alerts'
                                    }
                                </p>
                            </div>

                            {/* Social Auth */}
                            <div className="flex gap-3 mb-6">
                                <button
                                    onClick={() => handleSocialAuth('google')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white text-sm transition-colors"
                                >
                                    <Chrome className="w-4 h-4" />
                                    Google
                                </button>
                                <button
                                    onClick={() => handleSocialAuth('github')}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white text-sm transition-colors"
                                >
                                    <Github className="w-4 h-4" />
                                    GitHub
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-px bg-zinc-800" />
                                <span className="text-xs text-zinc-500">or continue with email</span>
                                <div className="flex-1 h-px bg-zinc-800" />
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {mode === 'signup' && (
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                                            placeholder="Your name"
                                            required
                                        />
                                    </div>
                                )}

                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="Email address"
                                        required
                                    />
                                </div>

                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-amber-500 transition-colors"
                                        placeholder="Password"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {mode === 'signin' && (
                                    <div className="text-right">
                                        <button type="button" className="text-sm text-amber-400 hover:text-amber-300">
                                            Forgot password?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full btn-primary justify-center py-3 disabled:opacity-50"
                                >
                                    {loading ? (
                                        <div className="w-5 h-5 border-2 border-zinc-900 border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                        mode === 'signin' ? 'Sign In' : 'Create Account'
                                    )}
                                </button>
                            </form>

                            {/* Toggle Mode */}
                            <p className="text-center text-sm text-zinc-400 mt-6">
                                {mode === 'signin' ? (
                                    <>
                                        Don't have an account?{' '}
                                        <button
                                            onClick={() => setMode('signup')}
                                            className="text-amber-400 hover:text-amber-300 font-medium"
                                        >
                                            Sign up
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => setMode('signin')}
                                            className="text-amber-400 hover:text-amber-300 font-medium"
                                        >
                                            Sign in
                                        </button>
                                    </>
                                )}
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
