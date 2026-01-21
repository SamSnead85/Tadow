import { motion } from 'framer-motion';
import { Crown, Clock, ExternalLink, TrendingUp, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { showcaseDeals } from '../data/showcaseDeals';
import { Link } from 'react-router-dom';

// Rotating Deal of the Day from our showcase deals
const dealOfTheDay = showcaseDeals[0]; // Always feature the top deal

export function DealOfTheDay() {
    const [timeLeft, setTimeLeft] = useState({
        hours: 14,
        minutes: 32,
        seconds: 47
    });

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                let { hours, minutes, seconds } = prev;
                seconds--;
                if (seconds < 0) { seconds = 59; minutes--; }
                if (minutes < 0) { minutes = 59; hours--; }
                if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
                return { hours, minutes, seconds };
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (n: number) => n.toString().padStart(2, '0');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10 border border-amber-500/20"
        >
            {/* Decorative glow */}
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-orange-500/15 rounded-full blur-2xl" />

            <div className="relative p-6 md:p-8">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                    {/* Badge */}
                    <div className="flex items-center gap-3 lg:hidden">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span className="text-amber-400 font-semibold text-sm">Deal of the Day</span>
                        </div>
                    </div>

                    {/* Image */}
                    <div className="relative w-full lg:w-56 h-48 lg:h-44 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0">
                        <img
                            src={dealOfTheDay.imageUrl}
                            alt={dealOfTheDay.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded">
                            -{dealOfTheDay.discount}%
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 text-center lg:text-left">
                        <div className="hidden lg:flex items-center gap-3 mb-3">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 rounded-full">
                                <Crown className="w-4 h-4 text-amber-400" />
                                <span className="text-amber-400 font-semibold text-sm">Deal of the Day</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs text-zinc-400">
                                <Sparkles className="w-3 h-3" />
                                Score: {dealOfTheDay.dealScore}/100
                            </div>
                        </div>

                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2 line-clamp-2">
                            {dealOfTheDay.title}
                        </h3>

                        <p className="text-zinc-400 text-sm mb-4 line-clamp-2">
                            {dealOfTheDay.description}
                        </p>

                        {/* Price */}
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                            <span className="text-3xl font-bold text-white">${dealOfTheDay.currentPrice}</span>
                            <span className="text-lg text-zinc-500 line-through">${dealOfTheDay.originalPrice}</span>
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-sm font-medium rounded">
                                Save ${dealOfTheDay.originalPrice - dealOfTheDay.currentPrice}
                            </span>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-center lg:justify-start gap-3 mb-4">
                            <Clock className="w-4 h-4 text-amber-400" />
                            <span className="text-sm text-zinc-400">Ends in</span>
                            <div className="flex items-center gap-1">
                                <span className="px-2 py-1 bg-zinc-800 text-white font-mono font-bold rounded">
                                    {formatTime(timeLeft.hours)}
                                </span>
                                <span className="text-amber-400">:</span>
                                <span className="px-2 py-1 bg-zinc-800 text-white font-mono font-bold rounded">
                                    {formatTime(timeLeft.minutes)}
                                </span>
                                <span className="text-amber-400">:</span>
                                <span className="px-2 py-1 bg-zinc-800 text-white font-mono font-bold rounded">
                                    {formatTime(timeLeft.seconds)}
                                </span>
                            </div>
                        </div>

                        {/* CTA */}
                        <Link
                            to={`/deal/${dealOfTheDay.id}`}
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-bold rounded-xl transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
                        >
                            <ExternalLink className="w-4 h-4" />
                            View Deal
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Trending Carousel
export function TrendingCarousel() {
    const hotDeals = showcaseDeals.filter(d => d.isHot).slice(0, 5);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                    <h3 className="text-lg font-bold text-white">Trending Now</h3>
                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-medium rounded-full animate-pulse">
                        Live
                    </span>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {hotDeals.map((deal, i) => (
                    <motion.div
                        key={deal.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex-shrink-0 w-72"
                    >
                        <Link
                            to={`/deal/${deal.id}`}
                            className="block p-4 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 hover:border-orange-500/30 rounded-xl transition-all group"
                        >
                            <div className="flex gap-4">
                                <div className="w-20 h-20 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                                    <img
                                        src={deal.imageUrl}
                                        alt={deal.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-medium text-white line-clamp-2 group-hover:text-orange-400 transition-colors">
                                        {deal.title}
                                    </h4>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className="text-lg font-bold text-white">${deal.currentPrice}</span>
                                        <span className="text-xs text-red-400 font-medium">-{deal.discount}%</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
