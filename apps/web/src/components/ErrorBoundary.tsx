import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: undefined });
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-md w-full text-center"
                    >
                        {/* Error Icon */}
                        <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
                            <AlertTriangle className="w-10 h-10 text-amber-400" />
                        </div>

                        {/* Message */}
                        <h1 className="text-2xl font-bold text-white mb-3">
                            Something went wrong
                        </h1>
                        <p className="text-zinc-400 mb-8">
                            We encountered an unexpected error. Don't worry, your data is safe.
                        </p>

                        {/* Actions */}
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="btn-primary"
                            >
                                <RefreshCw className="w-4 h-4" />
                                Try Again
                            </button>
                            <Link to="/" className="btn-ghost">
                                <Home className="w-4 h-4" />
                                Go Home
                            </Link>
                        </div>

                        {/* Error Details (dev only) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-8 p-4 bg-zinc-900 rounded-xl text-left">
                                <p className="text-xs font-mono text-red-400 break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            );
        }

        return this.props.children;
    }
}
