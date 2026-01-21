import { motion } from 'framer-motion';
import { ShieldCheck, Star, Clock, Truck, Award, CheckCircle } from 'lucide-react';
import { VerifiedUser, UserBadge, VerificationLevel } from '../types/marketplace';
import { calculateTrustScore, getReviews } from '../services/userVerification';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRUST BADGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface TrustBadgeProps {
    user: VerifiedUser;
    size?: 'sm' | 'md' | 'lg';
    showDetails?: boolean;
}

export function TrustBadge({ user, size = 'md', showDetails = false }: TrustBadgeProps) {
    const trustScore = calculateTrustScore(user, getReviews());

    const sizes = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-2',
    };

    const colors: Record<VerificationLevel, string> = {
        none: 'bg-zinc-500/20 text-zinc-400',
        email: 'bg-zinc-500/20 text-zinc-400',
        phone: 'bg-blue-500/20 text-blue-400',
        id_verified: 'bg-emerald-500/20 text-emerald-400',
        trusted_seller: 'bg-amber-500/20 text-amber-400',
    };

    const labels: Record<VerificationLevel, string> = {
        none: 'Unverified',
        email: 'Email Verified',
        phone: 'Phone Verified',
        id_verified: 'ID Verified',
        trusted_seller: 'Trusted Seller',
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2"
        >
            <span className={`flex items-center gap-1.5 rounded-full font-medium ${sizes[size]} ${colors[user.verificationLevel]}`}>
                {user.verificationLevel === 'trusted_seller' ? (
                    <Award className="w-3.5 h-3.5" />
                ) : user.verificationLevel === 'id_verified' ? (
                    <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                    <CheckCircle className="w-3.5 h-3.5" />
                )}
                {labels[user.verificationLevel]}
            </span>

            {showDetails && (
                <span className="text-xs text-zinc-500">
                    Trust Score: {trustScore.overall}/100
                </span>
            )}
        </motion.div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// USER BADGE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const BADGE_CONFIG: Record<UserBadge, { icon: React.ReactNode; label: string; color: string }> = {
    verified_id: {
        icon: <ShieldCheck className="w-3.5 h-3.5" />,
        label: 'ID Verified',
        color: 'bg-emerald-500/20 text-emerald-400',
    },
    fast_shipper: {
        icon: <Truck className="w-3.5 h-3.5" />,
        label: 'Fast Shipper',
        color: 'bg-blue-500/20 text-blue-400',
    },
    top_rated: {
        icon: <Star className="w-3.5 h-3.5" />,
        label: 'Top Rated',
        color: 'bg-amber-500/20 text-amber-400',
    },
    power_seller: {
        icon: <Award className="w-3.5 h-3.5" />,
        label: 'Power Seller',
        color: 'bg-purple-500/20 text-purple-400',
    },
    trusted_buyer: {
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: 'Trusted Buyer',
        color: 'bg-emerald-500/20 text-emerald-400',
    },
    responsive: {
        icon: <Clock className="w-3.5 h-3.5" />,
        label: 'Responsive',
        color: 'bg-cyan-500/20 text-cyan-400',
    },
    local_meetup: {
        icon: <CheckCircle className="w-3.5 h-3.5" />,
        label: 'Local Meetup',
        color: 'bg-orange-500/20 text-orange-400',
    },
};

export function UserBadgeDisplay({ badge }: { badge: UserBadge }) {
    const config = BADGE_CONFIG[badge];

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
            {config.icon}
            {config.label}
        </span>
    );
}

export function UserBadgeList({ badges }: { badges: UserBadge[] }) {
    if (badges.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-1">
            {badges.map(badge => (
                <UserBadgeDisplay key={badge} badge={badge} />
            ))}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SELLER CARD
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

interface SellerCardProps {
    seller: VerifiedUser;
    compact?: boolean;
}

export function SellerCard({ seller, compact = false }: SellerCardProps) {
    const trustScore = calculateTrustScore(seller, getReviews());
    const memberSince = new Date(seller.memberSince);
    const memberDuration = Math.floor((Date.now() - memberSince.getTime()) / (1000 * 60 * 60 * 24 * 30));

    if (compact) {
        return (
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold">
                    {seller.displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{seller.displayName}</span>
                        {seller.verificationLevel === 'id_verified' || seller.verificationLevel === 'trusted_seller' ? (
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        ) : null}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{seller.stats.averageRating.toFixed(1)}</span>
                        <span>•</span>
                        <span>{seller.stats.totalSales} sales</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xl font-bold">
                    {seller.displayName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{seller.displayName}</span>
                        <TrustBadge user={seller} size="sm" />
                    </div>
                    <p className="text-xs text-zinc-500">
                        Member for {memberDuration} month{memberDuration !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                    <p className="text-lg font-bold text-white">{seller.stats.totalSales}</p>
                    <p className="text-xs text-zinc-500">Sales</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400" />
                        {seller.stats.averageRating.toFixed(1)}
                    </p>
                    <p className="text-xs text-zinc-500">Rating</p>
                </div>
                <div className="text-center">
                    <p className="text-lg font-bold text-white">{trustScore.overall}</p>
                    <p className="text-xs text-zinc-500">Trust</p>
                </div>
            </div>

            {seller.badges.length > 0 && (
                <UserBadgeList badges={seller.badges} />
            )}

            {/* Trust flags */}
            {trustScore.riskFlags.length > 0 && (
                <div className="mt-3 p-2 bg-amber-500/10 rounded-lg">
                    <p className="text-xs text-amber-400">
                        ⚠️ {trustScore.riskFlags[0]}
                    </p>
                </div>
            )}
        </div>
    );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TRUST SCORE METER
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function TrustScoreMeter({ score }: { score: number }) {
    const getColor = () => {
        if (score >= 80) return 'from-emerald-500 to-emerald-400';
        if (score >= 60) return 'from-amber-500 to-amber-400';
        return 'from-red-500 to-red-400';
    };

    return (
        <div className="w-full">
            <div className="flex justify-between mb-1">
                <span className="text-xs text-zinc-500">Trust Score</span>
                <span className="text-xs text-white font-medium">{score}/100</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className={`h-full bg-gradient-to-r ${getColor()} rounded-full`}
                />
            </div>
        </div>
    );
}
