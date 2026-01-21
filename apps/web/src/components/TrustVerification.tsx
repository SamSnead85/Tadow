import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    Shield, Check, X, AlertTriangle, Clock, Eye,
    ThumbsUp, ThumbsDown, Flag, Star,
    BadgeCheck, ShieldCheck, ShieldAlert
} from 'lucide-react';

// Verification Types
type VerificationStatus = 'verified' | 'pending' | 'unverified' | 'flagged';

interface DealVerification {
    status: VerificationStatus;
    verifiedAt?: string;
    verifiedBy: 'ai' | 'community' | 'both';
    priceAccurate: boolean;
    inStock: boolean;
    shippingCorrect: boolean;
    couponWorks?: boolean;
    lastChecked: string;
    communityVotes: { up: number; down: number };
    reports: number;
    trustScore: number;
}

interface SellerRating {
    sellerId: string;
    sellerName: string;
    rating: number;
    totalReviews: number;
    positivePercent: number;
    onTimeShipping: number;
    accurateDescription: number;
    responseTime: string;
    verified: boolean;
    badges: string[];
}

// Deal Verification Badge
export function VerificationBadge({ verification }: { verification: DealVerification }) {
    const getStatusConfig = (status: VerificationStatus) => {
        switch (status) {
            case 'verified':
                return { icon: ShieldCheck, color: 'emerald', text: 'Verified Deal' };
            case 'pending':
                return { icon: Clock, color: 'amber', text: 'Verification Pending' };
            case 'unverified':
                return { icon: Shield, color: 'zinc', text: 'Not Yet Verified' };
            case 'flagged':
                return { icon: ShieldAlert, color: 'red', text: 'Under Review' };
        }
    };

    const config = getStatusConfig(verification.status);

    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg bg-${config.color}-500/10 border border-${config.color}-500/30`}>
            <config.icon className={`w-4 h-4 text-${config.color}-400`} />
            <span className={`text-sm font-medium text-${config.color}-400`}>{config.text}</span>
        </div>
    );
}

// Full Verification Card
export function VerificationCard({ verification }: { verification: DealVerification }) {
    const [_showDetails, _setShowDetails] = useState(false);

    const checks = [
        { label: 'Price Verified', value: verification.priceAccurate, icon: Check },
        { label: 'In Stock', value: verification.inStock, icon: Check },
        { label: 'Shipping Accurate', value: verification.shippingCorrect, icon: Check },
        { label: 'Coupon Works', value: verification.couponWorks, icon: Check },
    ];

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ShieldCheck className={`w-6 h-6 ${verification.status === 'verified' ? 'text-emerald-400' : 'text-zinc-500'
                        }`} />
                    <div>
                        <h4 className="text-white font-medium">Deal Verification</h4>
                        <p className="text-xs text-zinc-500">Last checked: {verification.lastChecked}</p>
                    </div>
                </div>
                <VerificationBadge verification={verification} />
            </div>

            <div className="p-5">
                {/* Verification Checks */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                    {checks.map(check => (
                        check.value !== undefined && (
                            <div
                                key={check.label}
                                className={`flex items-center gap-2 p-2 rounded-lg ${check.value ? 'bg-emerald-500/10' : 'bg-red-500/10'
                                    }`}
                            >
                                {check.value ? (
                                    <Check className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <X className="w-4 h-4 text-red-400" />
                                )}
                                <span className={`text-sm ${check.value ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {check.label}
                                </span>
                            </div>
                        )
                    ))}
                </div>

                {/* Trust Score */}
                <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg mb-4">
                    <span className="text-zinc-400 text-sm">Trust Score</span>
                    <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full ${verification.trustScore >= 80 ? 'bg-emerald-500' :
                                    verification.trustScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                    }`}
                                style={{ width: `${verification.trustScore}%` }}
                            />
                        </div>
                        <span className="text-white font-medium">{verification.trustScore}%</span>
                    </div>
                </div>

                {/* Community Votes */}
                <div className="flex items-center gap-4">
                    <span className="text-zinc-500 text-sm">Community says:</span>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 text-emerald-400 hover:bg-emerald-500/10 px-2 py-1 rounded">
                            <ThumbsUp className="w-4 h-4" />
                            <span className="text-sm">{verification.communityVotes.up}</span>
                        </button>
                        <button className="flex items-center gap-1 text-red-400 hover:bg-red-500/10 px-2 py-1 rounded">
                            <ThumbsDown className="w-4 h-4" />
                            <span className="text-sm">{verification.communityVotes.down}</span>
                        </button>
                    </div>
                    <button className="ml-auto flex items-center gap-1 text-zinc-500 hover:text-orange-400 text-sm">
                        <Flag className="w-3 h-3" />
                        Report
                    </button>
                </div>

                {/* Verified By */}
                <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-2 text-xs text-zinc-500">
                    <Eye className="w-3 h-3" />
                    Verified by: {verification.verifiedBy === 'ai' ? 'Tadow AI' :
                        verification.verifiedBy === 'community' ? 'Community' : 'AI + Community'}
                </div>
            </div>
        </div>
    );
}

// Seller Rating Component
export function SellerRatingCard({ seller }: { seller: SellerRating }) {
    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center text-white font-bold text-lg">
                        {seller.sellerName[0]}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium">{seller.sellerName}</h4>
                            {seller.verified && (
                                <BadgeCheck className="w-4 h-4 text-blue-400" />
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span className="text-white font-medium">{seller.rating.toFixed(1)}</span>
                            <span className="text-zinc-500 text-sm">({seller.totalReviews.toLocaleString()} reviews)</span>
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${seller.positivePercent >= 95 ? 'bg-emerald-500/20 text-emerald-400' :
                    seller.positivePercent >= 90 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                    {seller.positivePercent}% Positive
                </div>
            </div>

            {/* Badges */}
            {seller.badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                    {seller.badges.map(badge => (
                        <span key={badge} className="px-2 py-1 bg-zinc-800 text-zinc-400 text-xs rounded">
                            {badge}
                        </span>
                    ))}
                </div>
            )}

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
                <div className="text-center">
                    <div className="text-xl font-bold text-white">{seller.onTimeShipping}%</div>
                    <div className="text-xs text-zinc-500">On-time Shipping</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-white">{seller.accurateDescription}%</div>
                    <div className="text-xs text-zinc-500">Accurate Description</div>
                </div>
                <div className="text-center">
                    <div className="text-xl font-bold text-white">{seller.responseTime}</div>
                    <div className="text-xs text-zinc-500">Response Time</div>
                </div>
            </div>
        </div>
    );
}

// Report Deal Modal
export function ReportDealModal({ isOpen, onClose, dealId: _dealId }: { isOpen: boolean; onClose: () => void; dealId: string }) {
    const [reason, setReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const reasons = [
        'Price is incorrect',
        'Item is out of stock',
        'Coupon doesn\'t work',
        'Shipping cost different',
        'Suspicious/scam deal',
        'Expired deal still showing',
        'Other',
    ];

    const handleSubmit = () => {
        // Simulate submission
        setSubmitted(true);
        setTimeout(() => {
            setSubmitted(false);
            onClose();
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6"
            >
                {submitted ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                            <Check className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                        <p className="text-zinc-400">Your report has been submitted and will be reviewed.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <Flag className="w-6 h-6 text-orange-400" />
                            <h3 className="text-xl font-bold text-white">Report Issue</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">What's wrong with this deal?</label>
                                <div className="space-y-2">
                                    {reasons.map(r => (
                                        <label key={r} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${reason === r ? 'bg-amber-500/10 border border-amber-500/30' : 'bg-zinc-800 border border-transparent'
                                            }`}>
                                            <input
                                                type="radio"
                                                name="reason"
                                                checked={reason === r}
                                                onChange={() => setReason(r)}
                                                className="sr-only"
                                            />
                                            <div className={`w-4 h-4 rounded-full border-2 ${reason === r ? 'border-amber-500 bg-amber-500' : 'border-zinc-600'
                                                }`} />
                                            <span className="text-zinc-300">{r}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-zinc-400 text-sm mb-2">Additional details (optional)</label>
                                <textarea
                                    value={details}
                                    onChange={e => setDetails(e.target.value)}
                                    placeholder="Provide more details..."
                                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 resize-none focus:border-amber-500 outline-none"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 py-3 bg-zinc-800 text-zinc-300 rounded-xl hover:bg-zinc-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!reason}
                                    className="flex-1 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 disabled:opacity-50"
                                >
                                    Submit Report
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}

// Scam Alert Banner
export function ScamAlertBanner({ message }: { message?: string }) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl"
        >
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="flex-1 text-sm text-red-300">
                {message || '⚠️ Be cautious: Some deals may be third-party sellers. Always verify before purchasing.'}
            </p>
            <button onClick={() => setDismissed(true)} className="text-red-400 hover:text-red-300">
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}

export default { VerificationBadge, VerificationCard, SellerRatingCard, ReportDealModal, ScamAlertBanner };
