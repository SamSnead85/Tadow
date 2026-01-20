import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle, Info, X, Zap } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'ai';

interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

interface ToastContextType {
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
        const id = Math.random().toString(36).substring(2);
        setToasts(prev => [...prev, { ...toast, id }]);

        // Auto remove after duration
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, toast.duration || 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used within ToastProvider');
    return context;
}

function ToastContainer() {
    const { toasts, removeToast } = useToast();

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
                ))}
            </AnimatePresence>
        </div>
    );
}

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
    const icons = {
        success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
        error: <AlertCircle className="w-5 h-5 text-red-400" />,
        info: <Info className="w-5 h-5 text-sky-400" />,
        ai: <Zap className="w-5 h-5 text-violet-400" />,
    };

    const colors = {
        success: 'border-emerald-500/30 bg-emerald-500/10',
        error: 'border-red-500/30 bg-red-500/10',
        info: 'border-sky-500/30 bg-sky-500/10',
        ai: 'border-violet-500/30 bg-violet-500/10',
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`flex items-start gap-3 p-4 rounded-xl border bg-zinc-900/95 backdrop-blur-lg shadow-xl min-w-[320px] max-w-md ${colors[toast.type]}`}
        >
            {icons[toast.type]}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{toast.title}</p>
                {toast.message && (
                    <p className="text-xs text-zinc-400 mt-0.5">{toast.message}</p>
                )}
            </div>
            <button
                onClick={onClose}
                className="p-1 text-zinc-500 hover:text-white transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
