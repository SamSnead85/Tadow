/**
 * Deal Submission Form Component
 * 
 * Allows users to submit deals with:
 * - URL input with auto-extraction
 * - Price fields
 * - Category selection
 * - AI pre-screening preview
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Link2,
    DollarSign,
    Tag,
    FileText,
    Image,
    Sparkles,
    Send,
    AlertCircle,
    Check,
    Loader2,
} from 'lucide-react';

interface SubmissionResult {
    success: boolean;
    submissionId?: string;
    message: string;
    previewScore?: number;
    issues?: string[];
}

const CATEGORIES = [
    { value: 'laptops', label: 'Laptops', icon: '💻' },
    { value: 'phones', label: 'Phones', icon: '📱' },
    { value: 'tvs', label: 'TVs', icon: '📺' },
    { value: 'gaming', label: 'Gaming', icon: '🎮' },
    { value: 'audio', label: 'Audio', icon: '🎧' },
    { value: 'wearables', label: 'Wearables', icon: '⌚' },
    { value: 'cameras', label: 'Cameras', icon: '📷' },
    { value: 'computers', label: 'Desktops', icon: '🖥️' },
    { value: 'tablets', label: 'Tablets', icon: '📟' },
    { value: 'accessories', label: 'Accessories', icon: '🔌' },
    { value: 'other', label: 'Other', icon: '📦' },
];

interface DealSubmissionFormProps {
    onSuccess?: (result: SubmissionResult) => void;
    onClose?: () => void;
}

const DealSubmissionForm = ({ onSuccess, onClose }: DealSubmissionFormProps) => {
    const [formData, setFormData] = useState({
        url: '',
        title: '',
        currentPrice: '',
        originalPrice: '',
        category: '',
        description: '',
        imageUrl: '',
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isPreviewLoading, setIsPreviewLoading] = useState(false);
    const [previewScore, setPreviewScore] = useState<number | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [result, setResult] = useState<SubmissionResult | null>(null);

    // Debounced AI preview
    useEffect(() => {
        const timer = setTimeout(() => {
            if (formData.title && formData.currentPrice && formData.category) {
                previewDealScore();
            } else {
                setPreviewScore(null);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.title, formData.currentPrice, formData.originalPrice, formData.category]);

    const previewDealScore = async () => {
        setIsPreviewLoading(true);
        try {
            const response = await fetch('/api/aggregation/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: formData.title,
                    currentPrice: parseFloat(formData.currentPrice),
                    originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                    category: formData.category,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setPreviewScore(data.score);
            }
        } catch (error) {
            console.error('Preview failed:', error);
        } finally {
            setIsPreviewLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);
        setResult(null);
        setIsLoading(true);

        // Client-side validation
        const validationErrors: string[] = [];
        if (formData.url.length < 10 || !formData.url.includes('.')) {
            validationErrors.push('Please enter a valid URL');
        }
        if (formData.title.length < 10) {
            validationErrors.push('Title must be at least 10 characters');
        }
        if (!formData.currentPrice || parseFloat(formData.currentPrice) <= 0) {
            validationErrors.push('Please enter a valid price');
        }
        if (!formData.category) {
            validationErrors.push('Please select a category');
        }

        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/aggregation/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: 'user_' + Date.now(), // In production, use actual user ID
                    title: formData.title,
                    url: formData.url,
                    price: parseFloat(formData.currentPrice),
                    originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                    category: formData.category,
                    description: formData.description || undefined,
                    imageUrl: formData.imageUrl || undefined,
                }),
            });

            const data: SubmissionResult = await response.json();
            setResult(data);

            if (data.success) {
                onSuccess?.(data);
                // Reset form on success
                setFormData({
                    url: '',
                    title: '',
                    currentPrice: '',
                    originalPrice: '',
                    category: '',
                    description: '',
                    imageUrl: '',
                });
                setPreviewScore(null);
            } else if (data.issues) {
                setErrors(data.issues);
            }
        } catch (error) {
            setErrors(['Failed to submit deal. Please try again.']);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        if (score >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-zinc-900/95 border border-zinc-800 rounded-2xl overflow-hidden max-w-xl w-full">
            {/* Header */}
            <div className="p-5 border-b border-zinc-800">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                    <Tag className="w-5 h-5 text-amber-400" />
                    Submit a Deal
                </h2>
                <p className="text-sm text-zinc-400 mt-1">
                    Share a great deal with the community
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
                {/* URL */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Link2 className="w-4 h-4" />
                        Deal URL *
                    </label>
                    <input
                        type="url"
                        value={formData.url}
                        onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        required
                    />
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-4 h-4" />
                        Title *
                    </label>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Product name and key details"
                        className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        required
                    />
                </div>

                {/* Price row */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4" />
                            Current Price *
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.currentPrice}
                            onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                            Original Price
                        </label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.originalPrice}
                            onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                            placeholder="0.00"
                            className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                        />
                    </div>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Tag className="w-4 h-4" />
                        Category *
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {CATEGORIES.slice(0, 8).map((cat) => (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setFormData({ ...formData, category: cat.value })}
                                className={`p-2 rounded-lg text-center transition-all ${formData.category === cat.value
                                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-600'
                                    } border text-sm`}
                            >
                                <span className="text-lg block mb-0.5">{cat.icon}</span>
                                <span className="text-xs">{cat.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Optional fields toggle - description */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5">
                        Description (optional)
                    </label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Additional details about the deal..."
                        rows={2}
                        className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all resize-none"
                    />
                </div>

                {/* Image URL */}
                <div>
                    <label className="block text-sm font-medium text-zinc-300 mb-1.5 flex items-center gap-1.5">
                        <Image className="w-4 h-4" />
                        Image URL (optional)
                    </label>
                    <input
                        type="url"
                        value={formData.imageUrl}
                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 bg-zinc-800/60 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-amber-500/50 focus:ring-2 focus:ring-amber-500/20 transition-all"
                    />
                </div>

                {/* AI Preview */}
                <AnimatePresence>
                    {(previewScore !== null || isPreviewLoading) && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-zinc-800/40 border border-zinc-700 rounded-xl"
                        >
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                                <span className="text-sm text-zinc-300">AI Score Preview:</span>
                                {isPreviewLoading ? (
                                    <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
                                ) : (
                                    <span className={`font-bold text-lg ${getScoreColor(previewScore!)}`}>
                                        {previewScore}/100
                                    </span>
                                )}
                            </div>
                            {previewScore !== null && previewScore >= 70 && (
                                <p className="text-xs text-emerald-400 mt-1.5">
                                    ✓ This looks like a great deal!
                                </p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Errors */}
                <AnimatePresence>
                    {errors.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl"
                        >
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    {errors.map((error, i) => (
                                        <p key={i} className="text-sm text-red-400">{error}</p>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Success */}
                <AnimatePresence>
                    {result?.success && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl"
                        >
                            <div className="flex items-center gap-3">
                                <Check className="w-5 h-5 text-emerald-400" />
                                <span className="text-sm text-emerald-400">{result.message}</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Submit */}
                <div className="flex gap-3 pt-2">
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-zinc-800 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-900 font-semibold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Submit Deal
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DealSubmissionForm;
