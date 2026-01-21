import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, Flag, MessageSquare, Camera, X, Check } from 'lucide-react';
import { Review } from '../types/marketplace';
import { saveReview, getUserReviews, getCurrentUser } from '../services/userVerification';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// STAR RATING INPUT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface StarRatingProps {
    rating: number;
    onRate?: (rating: number) => void;
    size?: 'sm' | 'md' | 'lg';
    readonly?: boolean;
}

export function StarRating({ rating, onRate, size = 'md', readonly = false }: StarRatingProps) {
    const [hovered, setHovered] = useState(0);

    const sizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    onClick={() => onRate?.(star)}
                    className={`${readonly ? '' : 'cursor-pointer hover:scale-110'} transition-transform`}
                >
                    <Star
                        className={`${sizes[size]} ${star <= (hovered || rating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-600'
                            } transition-colors`}
                    />
                </button>
            ))}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEW CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ReviewCardProps {
    review: Review;
    showReply?: boolean;
}

export function ReviewCard({ review, showReply = true }: ReviewCardProps) {
    const [helpful, setHelpful] = useState(false);
    const [showReplyForm, setShowReplyForm] = useState(false);

    const date = new Date(review.createdAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // AI sentiment analysis badge
    const getSentimentBadge = () => {
        if (!review.aiSentiment) return null;

        if (review.aiSentiment.authenticity < 50) {
            return (
                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                    AI Flagged
                </span>
            );
        }
        if (review.aiSentiment.authenticity > 90) {
            return (
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                    Verified Purchase
                </span>
            );
        }
        return null;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4"
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                    {review.reviewerId.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{review.reviewerId}</span>
                        {getSentimentBadge()}
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                        <StarRating rating={review.rating} readonly size="sm" />
                        <span className="text-xs text-zinc-500">{formattedDate}</span>
                    </div>

                    {review.title && (
                        <h4 className="font-medium text-white mb-1">{review.title}</h4>
                    )}
                    <p className="text-zinc-400 text-sm">{review.comment}</p>

                    {/* Review images */}
                    {review.images && review.images.length > 0 && (
                        <div className="flex gap-2 mt-3">
                            {review.images.map((img, i) => (
                                <img
                                    key={i}
                                    src={img}
                                    alt={`Review ${i + 1}`}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                            ))}
                        </div>
                    )}

                    {/* Aspect ratings */}
                    {review.aspects && (
                        <div className="flex gap-4 mt-3 text-xs">
                            <div>
                                <span className="text-zinc-500">Accuracy</span>
                                <div className="flex gap-0.5 mt-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <div
                                            key={s}
                                            className={`w-2 h-2 rounded-full ${s <= review.aspects!.accuracy
                                                    ? 'bg-amber-400'
                                                    : 'bg-zinc-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-zinc-500">Communication</span>
                                <div className="flex gap-0.5 mt-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <div
                                            key={s}
                                            className={`w-2 h-2 rounded-full ${s <= review.aspects!.communication
                                                    ? 'bg-amber-400'
                                                    : 'bg-zinc-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div>
                                <span className="text-zinc-500">Shipping</span>
                                <div className="flex gap-0.5 mt-0.5">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <div
                                            key={s}
                                            className={`w-2 h-2 rounded-full ${s <= review.aspects!.shipping
                                                    ? 'bg-amber-400'
                                                    : 'bg-zinc-700'
                                                }`}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Seller response */}
                    {review.response && (
                        <div className="mt-4 p-3 bg-zinc-800/50 rounded-lg border-l-2 border-amber-500">
                            <p className="text-xs text-amber-400 mb-1">Seller Response</p>
                            <p className="text-sm text-zinc-400">{review.response.comment}</p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3">
                        <button
                            onClick={() => setHelpful(!helpful)}
                            className={`flex items-center gap-1 text-xs ${helpful ? 'text-amber-400' : 'text-zinc-500 hover:text-zinc-400'
                                }`}
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            Helpful ({review.helpful + (helpful ? 1 : 0)})
                        </button>
                        {showReply && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-400"
                            >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Reply
                            </button>
                        )}
                        <button className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400">
                            <Flag className="w-3.5 h-3.5" />
                            Report
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEW FORM
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ReviewFormProps {
    orderId: string;
    revieweeId: string;
    type: 'buyer_to_seller' | 'seller_to_buyer';
    onSubmit?: () => void;
    onCancel?: () => void;
}

export function ReviewForm({ orderId, revieweeId, type, onSubmit, onCancel }: ReviewFormProps) {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [aspects, setAspects] = useState({ accuracy: 0, communication: 0, shipping: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const user = getCurrentUser();

    const handleSubmit = async () => {
        if (!user || rating === 0 || !comment.trim()) return;

        setIsSubmitting(true);

        // Simulate AI sentiment analysis
        const aiSentiment = {
            score: Math.random() * 2 - 1, // -1 to 1
            authenticity: 70 + Math.random() * 30, // 70-100
            flags: [],
        };

        const review: Review = {
            id: `review-${Date.now()}`,
            orderId,
            reviewerId: user.id,
            revieweeId,
            type,
            rating: rating as 1 | 2 | 3 | 4 | 5,
            title: title.trim() || undefined,
            comment: comment.trim(),
            images: images.length > 0 ? images : undefined,
            aspects: aspects.accuracy > 0 ? aspects : undefined,
            helpful: 0,
            reported: false,
            aiSentiment,
            createdAt: new Date(),
        };

        saveReview(review);

        setIsSubmitting(false);
        onSubmit?.();
    };

    const addDemoImage = () => {
        const demoImages = [
            'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=200',
            'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=200',
        ];
        if (images.length < 4) {
            setImages([...images, demoImages[images.length % demoImages.length]]);
        }
    };

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Leave a Review</h3>

            {/* Overall Rating */}
            <div className="mb-6">
                <label className="block text-sm text-zinc-400 mb-2">Overall Rating *</label>
                <StarRating rating={rating} onRate={setRating} size="lg" />
            </div>

            {/* Aspect Ratings */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Accuracy</label>
                    <StarRating
                        rating={aspects.accuracy}
                        onRate={r => setAspects({ ...aspects, accuracy: r })}
                        size="sm"
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Communication</label>
                    <StarRating
                        rating={aspects.communication}
                        onRate={r => setAspects({ ...aspects, communication: r })}
                        size="sm"
                    />
                </div>
                <div>
                    <label className="block text-sm text-zinc-400 mb-2">Shipping</label>
                    <StarRating
                        rating={aspects.shipping}
                        onRate={r => setAspects({ ...aspects, shipping: r })}
                        size="sm"
                    />
                </div>
            </div>

            {/* Title */}
            <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-2">Title (optional)</label>
                <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Summarize your experience"
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                />
            </div>

            {/* Comment */}
            <div className="mb-4">
                <label className="block text-sm text-zinc-400 mb-2">Your Review *</label>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    placeholder="Describe your experience with this seller..."
                    rows={4}
                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none resize-none"
                />
            </div>

            {/* Photos */}
            <div className="mb-6">
                <label className="block text-sm text-zinc-400 mb-2">Add Photos (optional)</label>
                <div className="flex gap-2">
                    {images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16">
                            <img src={img} alt="" className="w-full h-full rounded-lg object-cover" />
                            <button
                                onClick={() => setImages(images.filter((_, idx) => idx !== i))}
                                className="absolute -top-1 -right-1 p-0.5 bg-red-500 rounded-full"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    ))}
                    {images.length < 4 && (
                        <button
                            onClick={addDemoImage}
                            className="w-16 h-16 border-2 border-dashed border-zinc-700 rounded-lg flex items-center justify-center text-zinc-500 hover:border-amber-500 hover:text-amber-400"
                        >
                            <Camera className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-zinc-400 hover:text-white"
                    >
                        Cancel
                    </button>
                )}
                <button
                    onClick={handleSubmit}
                    disabled={rating === 0 || !comment.trim() || isSubmitting}
                    className="flex-1 btn-primary py-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Submitting...' : (
                        <>
                            <Check className="w-4 h-4" />
                            Submit Review
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REVIEWS LIST
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface ReviewsListProps {
    userId: string;
    showStats?: boolean;
}

export function ReviewsList({ userId, showStats = true }: ReviewsListProps) {
    const reviews = getUserReviews(userId);

    if (reviews.length === 0) {
        return (
            <div className="text-center py-8">
                <Star className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                <p className="text-zinc-500">No reviews yet</p>
            </div>
        );
    }

    // Calculate stats
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    const ratingCounts = [5, 4, 3, 2, 1].map(r => reviews.filter(rev => rev.rating === r).length);

    return (
        <div className="space-y-4">
            {showStats && (
                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-6">
                        <div className="text-center">
                            <p className="text-4xl font-bold text-white">{avgRating.toFixed(1)}</p>
                            <StarRating rating={Math.round(avgRating)} readonly size="sm" />
                            <p className="text-xs text-zinc-500 mt-1">{reviews.length} reviews</p>
                        </div>
                        <div className="flex-1 space-y-1">
                            {[5, 4, 3, 2, 1].map((stars, i) => (
                                <div key={stars} className="flex items-center gap-2">
                                    <span className="text-xs text-zinc-500 w-3">{stars}</span>
                                    <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-400 rounded-full"
                                            style={{ width: `${(ratingCounts[i] / reviews.length) * 100}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-zinc-500 w-6">{ratingCounts[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <AnimatePresence>
                {reviews.map(review => (
                    <ReviewCard key={review.id} review={review} />
                ))}
            </AnimatePresence>
        </div>
    );
}
