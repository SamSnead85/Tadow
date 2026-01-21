import { useState, useEffect } from 'react';
import {
    TrendingUp, TrendingDown, Eye, ShoppingCart,
    Clock, DollarSign, Users, Target, ArrowUp, ArrowDown
} from 'lucide-react';

// Analytics Types
interface AnalyticsData {
    // User behavior
    pageViews: number;
    uniqueVisitors: number;
    sessionDuration: number; // minutes
    bounceRate: number;

    // Deal performance
    dealsViewed: number;
    dealsSaved: number;
    dealsClicked: number;
    conversionRate: number;

    // Financial
    totalSavings: number;
    avgDealValue: number;
    cashbackEarned: number;

    // Trending
    topCategories: { name: string; views: number; change: number }[];
    topDeals: { title: string; views: number; saves: number }[];
    peakHours: { hour: number; activity: number }[];
}

// Mock analytics data generator
function generateMockAnalytics(): AnalyticsData {
    return {
        pageViews: Math.floor(Math.random() * 50000 + 10000),
        uniqueVisitors: Math.floor(Math.random() * 15000 + 3000),
        sessionDuration: Math.round((Math.random() * 8 + 2) * 10) / 10,
        bounceRate: Math.round((Math.random() * 30 + 20) * 10) / 10,

        dealsViewed: Math.floor(Math.random() * 80000 + 20000),
        dealsSaved: Math.floor(Math.random() * 5000 + 1000),
        dealsClicked: Math.floor(Math.random() * 15000 + 5000),
        conversionRate: Math.round((Math.random() * 3 + 1) * 10) / 10,

        totalSavings: Math.floor(Math.random() * 100000 + 25000),
        avgDealValue: Math.floor(Math.random() * 200 + 50),
        cashbackEarned: Math.floor(Math.random() * 5000 + 1000),

        topCategories: [
            { name: 'Laptops', views: 12500, change: 12 },
            { name: 'Phones', views: 10200, change: -3 },
            { name: 'Gaming', views: 8900, change: 28 },
            { name: 'Audio', views: 7200, change: 5 },
            { name: 'TVs', views: 5400, change: -8 },
        ],
        topDeals: [
            { title: 'MacBook Air M3', views: 3200, saves: 890 },
            { title: 'iPhone 15 Pro', views: 2800, saves: 720 },
            { title: 'PS5 Bundle', views: 2400, saves: 650 },
        ],
        peakHours: Array.from({ length: 24 }, (_, h) => ({
            hour: h,
            activity: Math.floor(Math.sin((h - 6) * 0.3) * 50 + 50 + Math.random() * 20),
        })),
    };
}

// Analytics Dashboard Component
export function AnalyticsDashboard() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

    useEffect(() => {
        // Simulate fetching analytics
        setData(generateMockAnalytics());
    }, [timeRange]);

    if (!data) return null;

    return (
        <div className="space-y-6">
            {/* Time Range Selector */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Analytics Overview</h2>
                <div className="flex gap-2 bg-zinc-800 rounded-lg p-1">
                    {(['24h', '7d', '30d'] as const).map(range => (
                        <button
                            key={range}
                            onClick={() => setTimeRange(range)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${timeRange === range
                                ? 'bg-amber-500 text-black'
                                : 'text-zinc-400 hover:text-white'
                                }`}
                        >
                            {range}
                        </button>
                    ))}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    icon={Eye}
                    label="Page Views"
                    value={data.pageViews.toLocaleString()}
                    change={14}
                    color="blue"
                />
                <MetricCard
                    icon={Users}
                    label="Unique Visitors"
                    value={data.uniqueVisitors.toLocaleString()}
                    change={8}
                    color="violet"
                />
                <MetricCard
                    icon={ShoppingCart}
                    label="Deals Clicked"
                    value={data.dealsClicked.toLocaleString()}
                    change={22}
                    color="emerald"
                />
                <MetricCard
                    icon={DollarSign}
                    label="Total Savings"
                    value={`$${data.totalSavings.toLocaleString()}`}
                    change={35}
                    color="amber"
                />
            </div>

            {/* Conversion Funnel */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                <h3 className="text-lg font-semibold text-white mb-4">Deal Funnel</h3>
                <div className="flex items-center gap-4">
                    <FunnelStep label="Viewed" value={data.dealsViewed} percent={100} />
                    <div className="text-zinc-600">→</div>
                    <FunnelStep label="Saved" value={data.dealsSaved} percent={(data.dealsSaved / data.dealsViewed * 100)} />
                    <div className="text-zinc-600">→</div>
                    <FunnelStep label="Clicked" value={data.dealsClicked} percent={(data.dealsClicked / data.dealsViewed * 100)} />
                    <div className="text-zinc-600">→</div>
                    <FunnelStep label="Converted" value={Math.floor(data.dealsClicked * data.conversionRate / 100)} percent={data.conversionRate} />
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Categories */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Top Categories</h3>
                    <div className="space-y-3">
                        {data.topCategories.map((cat, i) => (
                            <div key={cat.name} className="flex items-center gap-3">
                                <span className="text-zinc-500 w-4">{i + 1}</span>
                                <span className="flex-1 text-white">{cat.name}</span>
                                <span className="text-zinc-400">{cat.views.toLocaleString()}</span>
                                <span className={`flex items-center gap-1 text-sm ${cat.change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {cat.change >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                                    {Math.abs(cat.change)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
                    <h3 className="text-lg font-semibold text-white mb-4">Peak Hours</h3>
                    <div className="h-32 flex items-end gap-1">
                        {data.peakHours.map((hour) => (
                            <div
                                key={hour.hour}
                                className="flex-1 bg-amber-500/80 rounded-t transition-all hover:bg-amber-400"
                                style={{ height: `${hour.activity}%` }}
                                title={`${hour.hour}:00 - ${hour.activity}% activity`}
                            />
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500 mt-2">
                        <span>12am</span>
                        <span>6am</span>
                        <span>12pm</span>
                        <span>6pm</span>
                        <span>12am</span>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
                    <Clock className="w-5 h-5 text-zinc-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{data.sessionDuration} min</div>
                    <div className="text-xs text-zinc-500">Avg Session</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
                    <Target className="w-5 h-5 text-zinc-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">{data.conversionRate}%</div>
                    <div className="text-xs text-zinc-500">Conversion Rate</div>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
                    <DollarSign className="w-5 h-5 text-zinc-500 mx-auto mb-1" />
                    <div className="text-xl font-bold text-white">${data.avgDealValue}</div>
                    <div className="text-xs text-zinc-500">Avg Deal Value</div>
                </div>
            </div>
        </div>
    );
}

// Metric Card
function MetricCard({
    icon: Icon,
    label,
    value,
    change,
    color
}: {
    icon: React.ElementType;
    label: string;
    value: string;
    change: number;
    color: string;
}) {
    return (
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 text-${color}-400`} />
                <span className="text-zinc-400 text-sm">{label}</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">{value}</div>
            <div className={`flex items-center gap-1 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change)}% vs last period
            </div>
        </div>
    );
}

// Funnel Step
function FunnelStep({ label, value, percent }: { label: string; value: number; percent: number }) {
    return (
        <div className="flex-1 text-center">
            <div className="text-2xl font-bold text-white">{value.toLocaleString()}</div>
            <div className="text-sm text-zinc-400">{label}</div>
            <div className="text-xs text-emerald-400">{percent.toFixed(1)}%</div>
        </div>
    );
}

// User Analytics Hook
export function useAnalytics() {
    const trackEvent = (event: string, properties?: Record<string, any>) => {
        // Store locally and/or send to analytics service
        const events = JSON.parse(localStorage.getItem('tadow_events') || '[]');
        events.push({
            event,
            properties,
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem('tadow_events', JSON.stringify(events.slice(-100)));

        // Log in dev
        console.log('[Analytics]', event, properties);
    };

    const trackPageView = (page: string) => trackEvent('page_view', { page });
    const trackDealView = (dealId: string) => trackEvent('deal_view', { dealId });
    const trackDealSave = (dealId: string) => trackEvent('deal_save', { dealId });
    const trackDealClick = (dealId: string, retailer: string) => trackEvent('deal_click', { dealId, retailer });
    const trackSearch = (query: string, results: number) => trackEvent('search', { query, results });

    return { trackEvent, trackPageView, trackDealView, trackDealSave, trackDealClick, trackSearch };
}

export default { AnalyticsDashboard, useAnalytics };
