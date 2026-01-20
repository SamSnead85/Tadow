import { useMemo } from 'react';

interface PriceHistoryPoint {
    price: number;
    recordedAt: string;
}

interface PriceHistoryChartProps {
    data: PriceHistoryPoint[];
    currentPrice: number;
    allTimeLow?: number;
    historicHigh?: number;
}

export function PriceHistoryChart({ data, currentPrice, allTimeLow, historicHigh: _historicHigh }: PriceHistoryChartProps) {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;

        const sortedData = [...data].sort(
            (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
        );

        const prices = sortedData.map(d => d.price);
        const minPrice = Math.min(...prices, currentPrice) * 0.95;
        const maxPrice = Math.max(...prices, currentPrice) * 1.05;
        const priceRange = maxPrice - minPrice;

        const width = 600;
        const height = 200;
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const points = sortedData.map((point, i) => {
            const x = padding.left + (i / (sortedData.length - 1)) * chartWidth;
            const y = padding.top + chartHeight - ((point.price - minPrice) / priceRange) * chartHeight;
            return { x, y, price: point.price, date: new Date(point.recordedAt) };
        });

        // Create SVG path
        const pathD = points
            .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
            .join(' ');

        // Create gradient area path
        const areaD =
            pathD +
            ` L ${points[points.length - 1].x} ${padding.top + chartHeight}` +
            ` L ${padding.left} ${padding.top + chartHeight}` +
            ' Z';

        // Y-axis labels
        const yLabels = [];
        const numYLabels = 5;
        for (let i = 0; i <= numYLabels; i++) {
            const price = minPrice + (priceRange / numYLabels) * (numYLabels - i);
            const y = padding.top + (chartHeight / numYLabels) * i;
            yLabels.push({ y, label: `$${Math.round(price)}` });
        }

        // X-axis labels (first, middle, last)
        const xLabels = [
            { x: padding.left, label: formatDate(points[0].date) },
            { x: padding.left + chartWidth / 2, label: formatDate(points[Math.floor(points.length / 2)].date) },
            { x: padding.left + chartWidth, label: 'Today' },
        ];

        // All-time low marker
        const allTimeLowY = allTimeLow
            ? padding.top + chartHeight - ((allTimeLow - minPrice) / priceRange) * chartHeight
            : null;

        return {
            width,
            height,
            padding,
            chartWidth,
            chartHeight,
            points,
            pathD,
            areaD,
            yLabels,
            xLabels,
            allTimeLowY,
        };
    }, [data, currentPrice, allTimeLow]);

    if (!chartData) {
        return (
            <div className="h-52 flex items-center justify-center bg-noir-50 rounded-xl">
                <p className="text-noir-500">No price history available</p>
            </div>
        );
    }

    return (
        <div className="relative">
            <svg
                viewBox={`0 0 ${chartData.width} ${chartData.height}`}
                className="w-full h-auto"
                preserveAspectRatio="xMidYMid meet"
            >
                <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgb(16, 185, 129)" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="rgb(16, 185, 129)" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/* Grid lines */}
                {chartData.yLabels.map((label, i) => (
                    <line
                        key={i}
                        x1={chartData.padding.left}
                        y1={label.y}
                        x2={chartData.padding.left + chartData.chartWidth}
                        y2={label.y}
                        stroke="#e5e7eb"
                        strokeDasharray="4,4"
                    />
                ))}

                {/* All-time low line */}
                {chartData.allTimeLowY && (
                    <>
                        <line
                            x1={chartData.padding.left}
                            y1={chartData.allTimeLowY}
                            x2={chartData.padding.left + chartData.chartWidth}
                            y2={chartData.allTimeLowY}
                            stroke="#10b981"
                            strokeWidth="2"
                            strokeDasharray="6,4"
                        />
                        <text
                            x={chartData.padding.left + chartData.chartWidth - 5}
                            y={chartData.allTimeLowY - 8}
                            textAnchor="end"
                            className="text-xs fill-emerald-600 font-medium"
                        >
                            All-Time Low
                        </text>
                    </>
                )}

                {/* Area fill */}
                <path d={chartData.areaD} fill="url(#priceGradient)" />

                {/* Price line */}
                <path
                    d={chartData.pathD}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data points */}
                {chartData.points.map((point, i) => (
                    <g key={i}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="#10b981"
                            className="opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                        />
                        <title>{`$${point.price.toLocaleString()} - ${formatDate(point.date)}`}</title>
                    </g>
                ))}

                {/* Current price point */}
                <circle
                    cx={chartData.points[chartData.points.length - 1].x}
                    cy={chartData.points[chartData.points.length - 1].y}
                    r="6"
                    fill="#10b981"
                    stroke="white"
                    strokeWidth="2"
                />

                {/* Y-axis labels */}
                {chartData.yLabels.map((label, i) => (
                    <text
                        key={i}
                        x={chartData.padding.left - 10}
                        y={label.y + 4}
                        textAnchor="end"
                        className="text-xs fill-noir-500"
                    >
                        {label.label}
                    </text>
                ))}

                {/* X-axis labels */}
                {chartData.xLabels.map((label, i) => (
                    <text
                        key={i}
                        x={label.x}
                        y={chartData.height - 10}
                        textAnchor={i === 0 ? 'start' : i === chartData.xLabels.length - 1 ? 'end' : 'middle'}
                        className="text-xs fill-noir-500"
                    >
                        {label.label}
                    </text>
                ))}
            </svg>
        </div>
    );
}

function formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
