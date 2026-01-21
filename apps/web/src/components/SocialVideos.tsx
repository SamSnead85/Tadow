import { motion } from 'framer-motion';
import { Play, Heart, Eye, ExternalLink, TrendingUp } from 'lucide-react';
import { SocialDealVideo } from '../services/dealScraper';

interface SocialVideoCardProps {
    video: SocialDealVideo;
    onPlay?: () => void;
}

export function SocialVideoCard({ video, onPlay }: SocialVideoCardProps) {
    const formatViews = (views: number): string => {
        if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
        if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
        return views.toString();
    };

    const getPlatformIcon = (platform: string) => {
        switch (platform) {
            case 'tiktok':
                return '🎵';
            case 'youtube':
                return '▶️';
            case 'instagram':
                return '📷';
            default:
                return '🎬';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative bg-zinc-900 rounded-xl overflow-hidden cursor-pointer"
            onClick={onPlay}
        >
            {/* Thumbnail */}
            <div className="relative aspect-[9/16] md:aspect-video">
                <img
                    src={video.thumbnailUrl}
                    alt={video.title}
                    className="w-full h-full object-cover"
                />

                {/* Play overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                        <Play className="w-8 h-8 text-white fill-white" />
                    </div>
                </div>

                {/* Platform badge */}
                <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-xs font-medium text-white flex items-center gap-1">
                    <span>{getPlatformIcon(video.platform)}</span>
                    {video.platform.charAt(0).toUpperCase() + video.platform.slice(1)}
                </div>

                {/* Views badge */}
                <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur rounded-lg text-xs text-white flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {formatViews(video.views)}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-medium text-white line-clamp-2 mb-2 group-hover:text-amber-400 transition-colors">
                    {video.title}
                </h3>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {video.creatorAvatar && (
                            <img
                                src={video.creatorAvatar}
                                alt={video.creatorName}
                                className="w-6 h-6 rounded-full"
                            />
                        )}
                        <span className="text-sm text-zinc-400">{video.creatorName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                        <Heart className="w-3 h-3" />
                        {formatViews(video.likes)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

interface SocialVideoSectionProps {
    videos: SocialDealVideo[];
    title?: string;
    productName?: string;
}

export function SocialVideoSection({ videos, title = "Watch Reviews & Unboxings", productName }: SocialVideoSectionProps) {
    if (videos.length === 0) return null;

    return (
        <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                    <h2 className="text-lg font-semibold text-white">{title}</h2>
                </div>
                {productName && (
                    <a
                        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(productName + ' review')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                        See more on YouTube
                        <ExternalLink className="w-3 h-3" />
                    </a>
                )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.slice(0, 4).map((video) => (
                    <SocialVideoCard
                        key={video.id}
                        video={video}
                        onPlay={() => window.open(video.videoUrl, '_blank')}
                    />
                ))}
            </div>
        </div>
    );
}

// TikTok embed component
interface TikTokEmbedProps {
    videoId: string;
}

export function TikTokEmbed({ videoId }: TikTokEmbedProps) {
    return (
        <div className="relative w-full max-w-[325px] mx-auto aspect-[9/16] bg-zinc-900 rounded-xl overflow-hidden">
            <iframe
                src={`https://www.tiktok.com/embed/v2/${videoId}`}
                className="w-full h-full"
                allowFullScreen
                allow="encrypted-media"
            />
        </div>
    );
}

// YouTube embed component
interface YouTubeEmbedProps {
    videoId: string;
}

export function YouTubeEmbed({ videoId }: YouTubeEmbedProps) {
    return (
        <div className="relative w-full aspect-video bg-zinc-900 rounded-xl overflow-hidden">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}?rel=0`}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
        </div>
    );
}
