import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';

export function NotFoundPage() {
    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                {/* 404 Visual */}
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mb-8"
                >
                    <div className="text-9xl font-bold bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        404
                    </div>
                </motion.div>

                {/* Message */}
                <h1 className="text-2xl font-bold text-white mb-3">
                    Page Not Found
                </h1>
                <p className="text-zinc-400 mb-8">
                    Looks like this deal expired or the page doesn't exist.
                    Let's get you back to finding amazing deals.
                </p>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/" className="btn-primary justify-center">
                        <Home className="w-4 h-4" />
                        Back to Deals
                    </Link>
                    <Link to="/search" className="btn-secondary justify-center">
                        <Search className="w-4 h-4" />
                        Search Products
                    </Link>
                </div>

                {/* Go Back Link */}
                <button
                    onClick={() => window.history.back()}
                    className="mt-8 text-zinc-500 hover:text-white text-sm flex items-center gap-2 mx-auto transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Go back to previous page
                </button>
            </motion.div>
        </div>
    );
}
