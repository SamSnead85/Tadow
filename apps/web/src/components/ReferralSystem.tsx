import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Gift, Users, Copy, Check, Share2, Mail,
    MessageCircle, Twitter, Linkedin, DollarSign, Trophy
} from 'lucide-react';

interface ReferralStats {
    referralCode: string;
    referralLink: string;
    totalReferrals: number;
    pendingReferrals: number;
    earnedRewards: number;
    pendingRewards: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    referralHistory: { email: string; date: string; status: string; reward: number }[];
}

// Generate referral code
function generateReferralCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return 'TADOW-' + Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// Mock referral data
function getMockReferralStats(): ReferralStats {
    return {
        referralCode: generateReferralCode(),
        referralLink: `https://tadow.ai/join?ref=${generateReferralCode()}`,
        totalReferrals: 7,
        pendingReferrals: 2,
        earnedRewards: 35,
        pendingRewards: 10,
        tier: 'silver',
        referralHistory: [
            { email: 'friend1@...', date: '2 days ago', status: 'completed', reward: 5 },
            { email: 'friend2@...', date: '1 week ago', status: 'completed', reward: 5 },
            { email: 'friend3@...', date: '2 weeks ago', status: 'pending', reward: 5 },
        ],
    };
}

// Referral Program Dashboard
export function ReferralDashboard() {
    const [stats, setStats] = useState<ReferralStats | null>(null);
    const [copied, setCopied] = useState<'code' | 'link' | null>(null);

    useEffect(() => {
        setStats(getMockReferralStats());
    }, []);

    const copyToClipboard = (text: string, type: 'code' | 'link') => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (!stats) return null;

    const tiers = [
        { id: 'bronze', min: 0, max: 4, color: 'amber-600', reward: '$5/referral' },
        { id: 'silver', min: 5, max: 14, color: 'zinc-400', reward: '$7/referral' },
        { id: 'gold', min: 15, max: 29, color: 'amber-400', reward: '$10/referral' },
        { id: 'platinum', min: 30, max: Infinity, color: 'violet-400', reward: '$15/referral' },
    ];

    const currentTier = tiers.find(t => t.id === stats.tier)!;

    return (
        <div className="space-y-6">
            {/* Hero */}
            <div className="bg-gradient-to-br from-violet-500/20 via-transparent to-amber-500/20 border border-violet-500/30 rounded-xl p-6 text-center">
                <Gift className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Refer Friends, Earn Rewards</h2>
                <p className="text-zinc-400 mb-6">
                    Give $5, Get ${currentTier.id === 'bronze' ? 5 : currentTier.id === 'silver' ? 7 : currentTier.id === 'gold' ? 10 : 15} for every friend who joins
                </p>

                {/* Referral Code */}
                <div className="max-w-md mx-auto space-y-3">
                    <div className="flex items-center gap-2">
                        <div className="flex-1 px-4 py-3 bg-zinc-800 rounded-lg font-mono text-amber-400 text-lg">
                            {stats.referralCode}
                        </div>
                        <button
                            onClick={() => copyToClipboard(stats.referralCode, 'code')}
                            className={`px-4 py-3 rounded-lg font-medium transition-colors ${copied === 'code'
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-amber-500 hover:bg-amber-400 text-black'
                                }`}
                        >
                            {copied === 'code' ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    <button
                        onClick={() => copyToClipboard(stats.referralLink, 'link')}
                        className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors"
                    >
                        {copied === 'link' ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {copied === 'link' ? 'Link Copied!' : 'Copy Referral Link'}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Total Referrals" value={stats.totalReferrals} />
                <StatCard icon={DollarSign} label="Total Earned" value={`$${stats.earnedRewards}`} color="emerald" />
                <StatCard icon={Gift} label="Pending" value={`$${stats.pendingRewards}`} color="amber" />
                <StatCard icon={Trophy} label="Current Tier" value={stats.tier.charAt(0).toUpperCase() + stats.tier.slice(1)} color="violet" />
            </div>

            {/* Tier Progress */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Your Tier Progress</h3>
                <div className="flex items-center gap-2 mb-4">
                    {tiers.map((tier, i) => (
                        <div key={tier.id} className="flex-1">
                            <div className={`h-2 rounded-full ${stats.tier === tier.id
                                    ? `bg-${tier.color}`
                                    : tiers.findIndex(t => t.id === stats.tier) > i
                                        ? 'bg-zinc-600'
                                        : 'bg-zinc-800'
                                }`} />
                            <div className="mt-2 text-center">
                                <div className={`text-sm font-medium ${stats.tier === tier.id ? `text-${tier.color}` : 'text-zinc-500'}`}>
                                    {tier.id.charAt(0).toUpperCase() + tier.id.slice(1)}
                                </div>
                                <div className="text-xs text-zinc-600">{tier.reward}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Share Buttons */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Share Your Link</h3>
                <div className="grid grid-cols-4 gap-3">
                    <ShareButton icon={Mail} label="Email" color="zinc" onClick={() => window.open(`mailto:?subject=Check out Tadow&body=${stats.referralLink}`)} />
                    <ShareButton icon={Twitter} label="Twitter" color="blue" onClick={() => window.open(`https://twitter.com/intent/tweet?text=I%20just%20saved%20money%20on%20Tadow!&url=${stats.referralLink}`)} />
                    <ShareButton icon={MessageCircle} label="WhatsApp" color="emerald" onClick={() => window.open(`https://wa.me/?text=${stats.referralLink}`)} />
                    <ShareButton icon={Linkedin} label="LinkedIn" color="blue" onClick={() => window.open(`https://linkedin.com/sharing/share-offsite/?url=${stats.referralLink}`)} />
                </div>
            </div>

            {/* Referral History */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-4">Referral History</h3>
                {stats.referralHistory.length > 0 ? (
                    <div className="space-y-2">
                        {stats.referralHistory.map((ref, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
                                <div>
                                    <div className="text-white">{ref.email}</div>
                                    <div className="text-xs text-zinc-500">{ref.date}</div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-medium ${ref.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        ${ref.reward}
                                    </div>
                                    <div className={`text-xs ${ref.status === 'completed' ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {ref.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-zinc-500 text-center py-4">No referrals yet. Share your link to get started!</p>
                )}
            </div>

            {/* Terms */}
            <p className="text-xs text-zinc-600 text-center">
                Rewards are credited after referred friend makes their first purchase. Terms apply.
            </p>
        </div>
    );
}

// Stat Card
function StatCard({ icon: Icon, label, value, color = 'white' }: { icon: React.ElementType; label: string; value: string | number; color?: string }) {
    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <Icon className={`w-5 h-5 text-${color === 'white' ? 'zinc-500' : color + '-400'} mb-2`} />
            <div className={`text-2xl font-bold text-${color === 'white' ? 'white' : color + '-400'}`}>{value}</div>
            <div className="text-xs text-zinc-500">{label}</div>
        </div>
    );
}

// Share Button
function ShareButton({ icon: Icon, label, color, onClick }: { icon: React.ElementType; label: string; color: string; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-3 bg-${color}-500/10 hover:bg-${color}-500/20 rounded-xl transition-colors`}
        >
            <Icon className={`w-5 h-5 text-${color}-400`} />
            <span className="text-xs text-zinc-400">{label}</span>
        </button>
    );
}

// Invite Modal
export function InviteModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [emails, setEmails] = useState('');
    const [sent, setSent] = useState(false);

    const handleSend = () => {
        // Simulate sending
        setSent(true);
        setTimeout(() => {
            setSent(false);
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
                <h3 className="text-xl font-bold text-white mb-4">Invite Friends</h3>

                <textarea
                    value={emails}
                    onChange={e => setEmails(e.target.value)}
                    placeholder="Enter email addresses (one per line)"
                    className="w-full h-32 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 resize-none focus:border-amber-500 outline-none mb-4"
                />

                <button
                    onClick={handleSend}
                    disabled={!emails.trim()}
                    className={`w-full py-3 rounded-xl font-semibold transition-colors ${sent
                            ? 'bg-emerald-500 text-white'
                            : 'bg-amber-500 hover:bg-amber-400 text-black disabled:opacity-50'
                        }`}
                >
                    {sent ? '✓ Invites Sent!' : 'Send Invites'}
                </button>
            </motion.div>
        </motion.div>
    );
}

export default { ReferralDashboard, InviteModal };
