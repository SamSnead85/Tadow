import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageSquare, ThumbsUp, ThumbsDown, Flag, Reply,
    User, ChevronDown, ChevronUp, Check
} from 'lucide-react';

interface Comment {
    id: string;
    author: string;
    avatar?: string;
    content: string;
    timestamp: string;
    likes: number;
    dislikes: number;
    isVerifiedBuyer: boolean;
    replies?: Comment[];
}

interface DealCommentsProps {
    dealId: string;
    comments?: Comment[];
}

// Mock comments
const MOCK_COMMENTS: Comment[] = [
    {
        id: '1',
        author: 'DealHunter42',
        content: 'Just bought this! Price was accurate and delivery was fast. Definitely recommend.',
        timestamp: '2 hours ago',
        likes: 24,
        dislikes: 1,
        isVerifiedBuyer: true,
        replies: [
            {
                id: '1-1',
                author: 'TechSavvy',
                content: 'How long did shipping take?',
                timestamp: '1 hour ago',
                likes: 3,
                dislikes: 0,
                isVerifiedBuyer: false,
            },
            {
                id: '1-2',
                author: 'DealHunter42',
                content: '2 days with Prime!',
                timestamp: '45 min ago',
                likes: 5,
                dislikes: 0,
                isVerifiedBuyer: true,
            }
        ]
    },
    {
        id: '2',
        author: 'BargainFinder',
        content: 'This is the lowest price I\'ve seen for this model in 3 months. Pulled the trigger!',
        timestamp: '5 hours ago',
        likes: 18,
        dislikes: 0,
        isVerifiedBuyer: true,
    },
    {
        id: '3',
        author: 'SmartShopper',
        content: 'Waiting for Black Friday - might get better deal then?',
        timestamp: '1 day ago',
        likes: 7,
        dislikes: 3,
        isVerifiedBuyer: false,
        replies: [
            {
                id: '3-1',
                author: 'PriceExpert',
                content: 'Historical data shows BF prices are usually only 5% lower. This is a good deal now.',
                timestamp: '22 hours ago',
                likes: 12,
                dislikes: 0,
                isVerifiedBuyer: false,
            }
        ]
    }
];

export function DealComments({ dealId: _dealId, comments = MOCK_COMMENTS }: DealCommentsProps) {
    const [displayComments, setDisplayComments] = useState(comments);
    const [newComment, setNewComment] = useState('');
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set());
    const [sortBy, setSortBy] = useState<'helpful' | 'newest'>('helpful');

    const toggleReplies = (commentId: string) => {
        setExpandedReplies(prev => {
            const next = new Set(prev);
            if (next.has(commentId)) {
                next.delete(commentId);
            } else {
                next.add(commentId);
            }
            return next;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        const comment: Comment = {
            id: `new_${Date.now()}`,
            author: 'You',
            content: newComment,
            timestamp: 'Just now',
            likes: 0,
            dislikes: 0,
            isVerifiedBuyer: false,
        };

        setDisplayComments([comment, ...displayComments]);
        setNewComment('');
    };

    const handleVote = (commentId: string, type: 'up' | 'down') => {
        setDisplayComments(prev =>
            prev.map(c => {
                if (c.id === commentId) {
                    return {
                        ...c,
                        likes: type === 'up' ? c.likes + 1 : c.likes,
                        dislikes: type === 'down' ? c.dislikes + 1 : c.dislikes,
                    };
                }
                return c;
            })
        );
    };

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-zinc-500" />
                    <h3 className="text-lg font-semibold text-white">Discussion</h3>
                    <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 text-xs rounded-full">
                        {displayComments.length}
                    </span>
                </div>
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'helpful' | 'newest')}
                    className="px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-300"
                >
                    <option value="helpful">Most Helpful</option>
                    <option value="newest">Newest</option>
                </select>
            </div>

            {/* New Comment */}
            <form onSubmit={handleSubmit} className="p-4 border-b border-zinc-800">
                <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div className="flex-1">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Share your thoughts on this deal..."
                            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 resize-none focus:border-amber-500 outline-none"
                            rows={2}
                        />
                        <div className="flex justify-end mt-2">
                            <button
                                type="submit"
                                disabled={!newComment.trim()}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                Post Comment
                            </button>
                        </div>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="divide-y divide-zinc-800/50">
                {displayComments.map((comment) => (
                    <div key={comment.id} className="p-4">
                        <CommentItem
                            comment={comment}
                            onVote={handleVote}
                            showReplies={expandedReplies.has(comment.id)}
                            onToggleReplies={() => toggleReplies(comment.id)}
                        />
                    </div>
                ))}
            </div>

            {/* Load More */}
            <div className="p-4 text-center border-t border-zinc-800">
                <button className="text-amber-400 hover:text-amber-300 text-sm font-medium">
                    Load More Comments
                </button>
            </div>
        </div>
    );
}

// Individual Comment Component
function CommentItem({
    comment,
    onVote,
    showReplies,
    onToggleReplies,
    isReply = false
}: {
    comment: Comment;
    onVote: (id: string, type: 'up' | 'down') => void;
    showReplies?: boolean;
    onToggleReplies?: () => void;
    isReply?: boolean;
}) {
    return (
        <div className={isReply ? 'ml-12 mt-3' : ''}>
            <div className="flex gap-3">
                <div className={`${isReply ? 'w-8 h-8' : 'w-10 h-10'} rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0`}>
                    {comment.avatar ? (
                        <img src={comment.avatar} alt="" className="w-full h-full rounded-full" />
                    ) : (
                        <User className={`${isReply ? 'w-4 h-4' : 'w-5 h-5'} text-zinc-500`} />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-white">{comment.author}</span>
                        {comment.isVerifiedBuyer && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">
                                <Check className="w-3 h-3" /> Verified Buyer
                            </span>
                        )}
                        <span className="text-zinc-500 text-sm">{comment.timestamp}</span>
                    </div>
                    <p className="text-zinc-300 text-sm mb-2">{comment.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 text-xs">
                        <button
                            onClick={() => onVote(comment.id, 'up')}
                            className="flex items-center gap-1 text-zinc-500 hover:text-emerald-400 transition-colors"
                        >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span>{comment.likes}</span>
                        </button>
                        <button
                            onClick={() => onVote(comment.id, 'down')}
                            className="flex items-center gap-1 text-zinc-500 hover:text-red-400 transition-colors"
                        >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span>{comment.dislikes}</span>
                        </button>
                        <button className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors">
                            <Reply className="w-3.5 h-3.5" />
                            Reply
                        </button>
                        <button className="flex items-center gap-1 text-zinc-500 hover:text-orange-400 transition-colors">
                            <Flag className="w-3.5 h-3.5" />
                            Report
                        </button>
                    </div>

                    {/* Replies Toggle */}
                    {comment.replies && comment.replies.length > 0 && !isReply && (
                        <button
                            onClick={onToggleReplies}
                            className="flex items-center gap-1 mt-3 text-amber-400 hover:text-amber-300 text-sm"
                        >
                            {showReplies ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            {showReplies ? 'Hide' : 'Show'} {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
                        </button>
                    )}

                    {/* Replies */}
                    <AnimatePresence>
                        {showReplies && comment.replies && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                            >
                                {comment.replies.map((reply) => (
                                    <CommentItem
                                        key={reply.id}
                                        comment={reply}
                                        onVote={onVote}
                                        isReply
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

// Social Proof Widget
interface SocialProofWidgetProps {
    viewCount: number;
    purchaseCount: number;
    watchlistCount: number;
}

export function SocialProofWidget({ viewCount, purchaseCount, watchlistCount }: SocialProofWidgetProps) {
    return (
        <div className="flex items-center gap-4 py-3 px-4 bg-zinc-900/60 border border-zinc-800 rounded-xl">
            <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-zinc-900 flex items-center justify-center">
                            <User className="w-3 h-3 text-zinc-400" />
                        </div>
                    ))}
                </div>
                <span className="text-sm text-zinc-400">
                    <span className="text-white font-medium">{purchaseCount}</span> bought today
                </span>
            </div>
            <div className="w-px h-4 bg-zinc-700" />
            <span className="text-sm text-zinc-400">
                <span className="text-white font-medium">{viewCount.toLocaleString()}</span> views
            </span>
            <div className="w-px h-4 bg-zinc-700" />
            <span className="text-sm text-zinc-400">
                <span className="text-white font-medium">{watchlistCount}</span> watching
            </span>
        </div>
    );
}

export default DealComments;
