/**
 * Price History Chart Component
 * 
 * Interactive chart showing:
 * - Price history over time
 * - All-time low/high markers
 * - Current price indicator
 * - Trend line
 * - Buy recommendation zone
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface PricePoint {
    price: number;
    date: Date | string;
}

interface PriceStats {
    currentPrice: number;
    averagePrice: number;
    lowestPrice: number;
    highestPrice: number;
    lowestPriceDate?: Date;
    highestPriceDate?: Date;
    priceVolatility: number;
    daysTracked: number;
    percentFromLow: number;
    percentFromHigh: number;
    trend: 'rising' | 'falling' | 'stable';
    trendStrength: number;
}

interface PriceHistoryChartProps {
    data: PricePoint[];
    currentPrice: number;
    stats?: PriceStats;
    height?: number;
    showStats?: boolean;
}

const PriceHistoryChart = ({
    data,
    currentPrice,
    stats,
    height = 200,
    showStats = true
}: PriceHistoryChartProps) => {
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; date: string } | null>(null);
    const [timeRange, setTimeRange] = useState<'30d' | '90d' | '6m' | '1y' | 'all'>('90d');

    // Filter data based on time range
    const filteredData = useMemo(() => {
        const now = new Date();
        const ranges: Record<typeof timeRange, number> = {
            '30d': 30,
            '90d': 90,
            '6m': 180,
            '1y': 365,
            'all': Infinity,
        };

        const days = ranges[timeRange];
        const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

        return data.filter(p => {
            const date = typeof p.date === 'string' ? new Date(p.date) : p.date;
            return date >= cutoff;
        }).sort((a, b) => {
            const dateA = typeof a.date === 'string' ? new Date(a.date) : a.date;
            const dateB = typeof b.date === 'string' ? new Date(b.date) : b.date;
            return dateA.getTime() - dateB.getTime();
        });
    }, [data, timeRange]);

    // Calculate chart dimensions
    const chartWidth = 600;
    const chartHeight = height - 40; // Leave space for labels
    const padding = { top: 20, right: 40, bottom: 30, left: 60 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    // Calculate min/max for scaling
    const prices = filteredData.map(p => p.price);
    const minPrice = Math.min(...prices, currentPrice) * 0.95;
    const maxPrice = Math.max(...prices, currentPrice) * 1.05;
    const priceRange = maxPrice - minPrice || 1;

    // Generate SVG path
    const linePath = useMemo(() => {
        if (filteredData.length === 0) return '';

        const points = filteredData.map((point, i) => {
            const x = padding.left + (i / (filteredData.length - 1 || 1)) * plotWidth;
            const y = padding.top + plotHeight - ((point.price - minPrice) / priceRange) * plotHeight;
            return `${x},${y}`;
        });

        return `M ${points.join(' L ')}`;
    }, [filteredData, padding, plotWidth, plotHeight, minPrice, priceRange]);

    // Generate area path
    const areaPath = useMemo(() => {
        if (filteredData.length === 0) return '';

        const points = filteredData.map((point, i) => {
            const x = padding.left + (i / (filteredData.length - 1 || 1)) * plotWidth;
            const y = padding.top + plotHeight - ((point.price - minPrice) / priceRange) * plotHeight;
            return `${x},${y}`;
        });

        return `M ${padding.left},${padding.top + plotHeight} L ${points.join(' L ')} L ${padding.left + plotWidth},${padding.top + plotHeight} Z`;
    }, [filteredData, padding, plotWidth, plotHeight, minPrice, priceRange]);

    // Current price Y position
    const currentPriceY = padding.top + plotHeight - ((currentPrice - minPrice) / priceRange) * plotHeight;

    // Handle mouse move for tooltip
    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;

        if (x < padding.left || x > chartWidth - padding.right) {
            setHoveredPoint(null);
            return;
        }

        const index = Math.round(((x - padding.left) / plotWidth) * (filteredData.length - 1));
        const clampedIndex = Math.max(0, Math.min(filteredData.length - 1, index));
        const point = filteredData[clampedIndex];

        if (point) {
            const pointX = padding.left + (clampedIndex / (filteredData.length - 1 || 1)) * plotWidth;
            const pointY = padding.top + plotHeight - ((point.price - minPrice) / priceRange) * plotHeight;
            const date = typeof point.date === 'string' ? new Date(point.date) : point.date;

            setHoveredPoint({
                x: pointX,
                y: pointY,
                price: point.price,
                date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            });
        }
    };

    // Format price for display
    const formatPrice = (price: number) => `$${price.toFixed(2)}`;

    // Determine if current price is good
    const isGoodPrice = stats
        ? stats.percentFromLow < 15
        : currentPrice <= (Math.min(...prices) * 1.1);

    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-amber-400" />
                    <span className="font-semibold text-white">Price History</span>
                </div>

                {/* Time range selector */}
                <div className="flex gap-1 bg-zinc-800/60 rounded-lg p-1">
                    {(['30d', '90d', '6m', '1y', 'all'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${timeRange === range
                                    ? 'bg-amber-500 text-zinc-900'
                                    : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {range.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Chart */}
            <div className="relative">
                <svg
                    width="100%"
                    height={chartHeight}
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    preserveAspectRatio="xMidYMid meet"
                    className="overflow-visible"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoveredPoint(null)}
                >
                    <defs>
                        <linearGradient id="priceGradient" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="rgba(212, 168, 87, 0.3)" />
                            <stop offset="100%" stopColor="rgba(212, 168, 87, 0)" />
                        </linearGradient>
                    </defs>

                    {/* Grid lines */}
                    {[0, 0.25, 0.5, 0.75, 1].map(fraction => {
                        const y = padding.top + fraction * plotHeight;
                        const price = maxPrice - fraction * priceRange;
                        return (
                            <g key={fraction}>
                                <line
                                    x1={padding.left}
                                    y1={y}
                                    x2={chartWidth - padding.right}
                                    y2={y}
                                    stroke="rgba(255,255,255,0.05)"
                                    strokeDasharray="4,4"
                                />
                                <text
                                    x={padding.left - 8}
                                    y={y + 4}
                                    textAnchor="end"
                                    fill="rgba(255,255,255,0.4)"
                                    fontSize="10"
                                >
                                    ${Math.round(price)}
                                </text>
                            </g>
                        );
                    })}

                    {/* Area fill */}
                    <path d={areaPath} fill="url(#priceGradient)" />

                    {/* Line */}
                    <motion.path
                        d={linePath}
                        fill="none"
                        stroke="#D4A857"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1, ease: 'easeInOut' }}
                    />

                    {/* Current price line */}
                    <line
                        x1={padding.left}
                        y1={currentPriceY}
                        x2={chartWidth - padding.right}
                        y2={currentPriceY}
                        stroke="#22C55E"
                        strokeWidth="1"
                        strokeDasharray="6,4"
                        opacity={0.6}
                    />
                    <text
                        x={chartWidth - padding.right + 5}
                        y={currentPriceY + 4}
                        fill="#22C55E"
                        fontSize="10"
                        fontWeight="bold"
                    >
                        ${currentPrice}
                    </text>

                    {/* Hover tooltip */}
                    {hoveredPoint && (
                        <g>
                            <line
                                x1={hoveredPoint.x}
                                y1={padding.top}
                                x2={hoveredPoint.x}
                                y2={padding.top + plotHeight}
                                stroke="rgba(255,255,255,0.3)"
                                strokeDasharray="4,4"
                            />
                            <circle
                                cx={hoveredPoint.x}
                                cy={hoveredPoint.y}
                                r="5"
                                fill="#D4A857"
                                stroke="#1a1a1a"
                                strokeWidth="2"
                            />
                        </g>
                    )}
                </svg>

                {/* Tooltip */}
                {hoveredPoint && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl pointer-events-none"
                        style={{
                            left: hoveredPoint.x,
                            top: hoveredPoint.y - 60,
                            transform: 'translateX(-50%)',
                        }}
                    >
                        <div className="text-sm font-bold text-white">{formatPrice(hoveredPoint.price)}</div>
                        <div className="text-xs text-zinc-400">{hoveredPoint.date}</div>
                    </motion.div>
                )}
            </div>

            {/* Stats */}
            {showStats && stats && (
                <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-zinc-800">
                    <StatItem
                        label="All-Time Low"
                        value={formatPrice(stats.lowestPrice)}
                        icon={<TrendingDown className="w-3.5 h-3.5 text-emerald-400" />}
                        highlight={currentPrice <= stats.lowestPrice * 1.05}
                    />
                    <StatItem
                        label="Average"
                        value={formatPrice(stats.averagePrice)}
                        icon={<Calendar className="w-3.5 h-3.5 text-amber-400" />}
                    />
                    <StatItem
                        label="All-Time High"
                        value={formatPrice(stats.highestPrice)}
                        icon={<TrendingUp className="w-3.5 h-3.5 text-red-400" />}
                    />
                    <StatItem
                        label={`${stats.daysTracked}d Trend`}
                        value={`${stats.trend === 'falling' ? '↓' : stats.trend === 'rising' ? '↑' : '→'} ${Math.abs(stats.trendStrength).toFixed(1)}%`}
                        icon={
                            stats.trend === 'falling'
                                ? <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                                : stats.trend === 'rising'
                                    ? <TrendingUp className="w-3.5 h-3.5 text-red-400" />
                                    : <span className="text-zinc-400">~</span>
                        }
                    />
                </div>
            )}

            {/* Recommendation */}
            {isGoodPrice && (
                <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-medium">🎯 Great time to buy!</span>
                        <span className="text-sm text-zinc-400">
                            Currently {stats ? `${stats.percentFromLow.toFixed(1)}%` : 'near'} above all-time low
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

const StatItem = ({
    label,
    value,
    icon,
    highlight = false
}: {
    label: string;
    value: string;
    icon: React.ReactNode;
    highlight?: boolean;
}) => (
    <div className={`p-2 rounded-lg ${highlight ? 'bg-emerald-500/10' : 'bg-zinc-800/40'}`}>
        <div className="flex items-center gap-1.5 mb-1">
            {icon}
            <span className="text-xs text-zinc-500">{label}</span>
        </div>
        <div className={`font-semibold ${highlight ? 'text-emerald-400' : 'text-white'}`}>
            {value}
        </div>
    </div>
);

export default PriceHistoryChart;
