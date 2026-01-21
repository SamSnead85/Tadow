import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Twitter, Facebook, Link2, Mail, MessageCircle, Check, X } from 'lucide-react';

interface SocialShareProps {
    title: string;
    url?: string;
    price?: number;
    discount?: number;
    variant?: 'button' | 'inline' | 'modal';
    onClose?: () => void;
}

export function SocialShare({ title, url = window.location.href, price, discount, variant = 'button', onClose }: SocialShareProps) {
    const [isOpen, setIsOpen] = useState(variant === 'modal');
    const [copied, setCopied] = useState(false);

    const shareText = price && discount
        ? `🔥 Found this deal on Tadow: ${title} - $${price.toLocaleString()} (${discount}% off)!`
        : `Check out this deal on Tadow: ${title}`;

    const shareLinks = [
        {
            name: 'Twitter',
            icon: Twitter,
            color: 'bg-[#1DA1F2]',
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`
        },
        {
            name: 'Facebook',
            icon: Facebook,
            color: 'bg-[#4267B2]',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`
        },
        {
            name: 'WhatsApp',
            icon: MessageCircle,
            color: 'bg-[#25D366]',
            url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + url)}`
        },
        {
            name: 'Email',
            icon: Mail,
            color: 'bg-zinc-600',
            url: `mailto:?subject=${encodeURIComponent('Check out this deal!')}&body=${encodeURIComponent(shareText + '\n\n' + url)}`
        }
    ];

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    };

    const handleShare = (shareUrl: string) => {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    };

    // Button variant (just shows share icon, opens inline on click)
    if (variant === 'button') {
        return (
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 hover:text-white transition-colors"
                >
                    <Share2 className="w-4 h-4" />
                </motion.button>

                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute right-0 top-full mt-2 z-50 bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-xl min-w-[200px]"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                {shareLinks.map((link) => (
                                    <button
                                        key={link.name}
                                        onClick={() => handleShare(link.url)}
                                        className={`p-2 ${link.color} rounded-lg hover:opacity-80 transition-opacity`}
                                        title={link.name}
                                    >
                                        <link.icon className="w-4 h-4 text-white" />
                                    </button>
                                ))}
                            </div>
                            <button
                                onClick={copyLink}
                                className="w-full flex items-center justify-center gap-2 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300"
                            >
                                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Link2 className="w-4 h-4" />}
                                {copied ? 'Copied!' : 'Copy Link'}
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    // Inline variant
    if (variant === 'inline') {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 mr-1">Share:</span>
                {shareLinks.slice(0, 3).map((link) => (
                    <button
                        key={link.name}
                        onClick={() => handleShare(link.url)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors"
                        title={link.name}
                    >
                        <link.icon className="w-3.5 h-3.5" />
                    </button>
                ))}
                <button
                    onClick={copyLink}
                    className="p-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-md text-zinc-400 hover:text-white transition-colors"
                    title="Copy link"
                >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Link2 className="w-3.5 h-3.5" />}
                </button>
            </div>
        );
    }

    // Modal variant
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-white">Share Deal</h3>
                        <button onClick={onClose} className="p-2 text-zinc-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{title}</p>

                    <div className="grid grid-cols-4 gap-3 mb-4">
                        {shareLinks.map((link) => (
                            <button
                                key={link.name}
                                onClick={() => handleShare(link.url)}
                                className={`flex flex-col items-center gap-1 p-3 ${link.color} rounded-xl hover:opacity-80 transition-opacity`}
                            >
                                <link.icon className="w-5 h-5 text-white" />
                                <span className="text-[10px] text-white/80">{link.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <input
                            type="text"
                            value={url}
                            readOnly
                            className="w-full pr-20 pl-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-400"
                        />
                        <button
                            onClick={copyLink}
                            className="absolute right-1 top-1 bottom-1 px-3 bg-amber-500 hover:bg-amber-400 rounded-md text-xs font-medium text-black"
                        >
                            {copied ? 'Copied!' : 'Copy'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
