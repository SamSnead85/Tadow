import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { marketplaceAggregator, CraigslistFetcher } from '../services/marketplace';

const router = Router();
const prisma = new PrismaClient();

// GET /api/deals - List deals with filters (LIVE from marketplaces)
router.get('/', async (req, res) => {
    try {
        const {
            category,
            sources,
            city,
            limit = '30',
        } = req.query;

        // Use the marketplace aggregator for live data
        const result = await marketplaceAggregator.fetchDeals({
            category: category as any,
            sources: sources ? (sources as string).split(',') as any[] : undefined,
            city: city as string,
            limit: parseInt(limit as string),
            useCache: true
        });

        res.json({
            deals: result.deals,
            sources: result.sources,
            total: result.totalAfterDedup,
            fetchTime: result.fetchTime,
            cached: result.cached
        });
    } catch (error) {
        console.error('Error fetching deals:', error);
        res.status(500).json({ error: 'Failed to fetch deals' });
    }
});

// GET /api/deals/hot - Get hot deals from Slickdeals/DealNews
router.get('/hot', async (req, res) => {
    try {
        const { limit = '15' } = req.query;

        const result = await marketplaceAggregator.getHotDeals(
            parseInt(limit as string)
        );

        res.json({
            deals: result.deals,
            sources: result.sources,
            cached: result.cached
        });
    } catch (error) {
        console.error('Error fetching hot deals:', error);
        res.status(500).json({ error: 'Failed to fetch hot deals' });
    }
});

// GET /api/deals/search - Search across marketplaces (LIVE)
router.get('/search', async (req, res) => {
    try {
        const {
            q,
            sources,
            city,
            limit = '30',
        } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter "q" is required' });
        }

        const result = await marketplaceAggregator.search(q as string, {
            sources: sources ? (sources as string).split(',') as any[] : undefined,
            city: city as string,
            limit: parseInt(limit as string),
            useCache: true
        });

        res.json({
            deals: result.deals,
            query: q,
            sources: result.sources,
            total: result.totalAfterDedup,
            fetchTime: result.fetchTime,
            cached: result.cached
        });
    } catch (error) {
        console.error('Error searching deals:', error);
        res.status(500).json({ error: 'Failed to search deals' });
    }
});

// GET /api/deals/sources - List available sources and their status
router.get('/sources', async (req, res) => {
    try {
        const stats = marketplaceAggregator.getSourceStats();
        const cities = CraigslistFetcher.getCities();

        res.json({
            sources: stats,
            cities,
            ebayConfigured: marketplaceAggregator.isEbayConfigured()
        });
    } catch (error) {
        console.error('Error fetching sources:', error);
        res.status(500).json({ error: 'Failed to fetch sources' });
    }
});

// POST /api/deals/refresh - Force refresh cache
router.post('/refresh', async (req, res) => {
    try {
        marketplaceAggregator.clearCache();

        // Trigger a fresh fetch
        const result = await marketplaceAggregator.fetchDeals({
            useCache: false
        });

        res.json({
            message: 'Cache cleared and deals refreshed',
            dealsCount: result.deals.length,
            sources: result.sources,
            fetchTime: result.fetchTime
        });
    } catch (error) {
        console.error('Error refreshing deals:', error);
        res.status(500).json({ error: 'Failed to refresh deals' });
    }
});

// GET /api/deals/categories - Get category stats
router.get('/categories', async (req, res) => {
    try {
        // Use database for saved deals, plus static categories
        const dbCategories = await prisma.deal.groupBy({
            by: ['category'],
            _count: true,
            orderBy: { _count: { category: 'desc' } },
        });

        const categories = [
            { name: 'laptops', label: 'Laptops', icon: '💻' },
            { name: 'phones', label: 'Phones', icon: '📱' },
            { name: 'tvs', label: 'TVs', icon: '📺' },
            { name: 'gaming', label: 'Gaming', icon: '🎮' },
            { name: 'audio', label: 'Audio', icon: '🎧' },
            { name: 'wearables', label: 'Wearables', icon: '⌚' },
            { name: 'cameras', label: 'Cameras', icon: '📷' },
            { name: 'computers', label: 'Desktops', icon: '🖥️' },
            { name: 'tablets', label: 'Tablets', icon: '📟' },
            { name: 'accessories', label: 'Accessories', icon: '🔌' },
        ];

        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

// GET /api/deals/featured - Get featured deals (from database)
router.get('/featured', async (req, res) => {
    try {
        const deals = await prisma.deal.findMany({
            where: { isFeatured: true },
            include: { marketplace: true },
            orderBy: { dealScore: 'desc' },
            take: 6,
        });
        res.json(deals);
    } catch (error) {
        console.error('Error fetching featured deals:', error);
        res.status(500).json({ error: 'Failed to fetch featured deals' });
    }
});

// GET /api/deals/:id - Get deal details (from database for saved deals)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const deal = await prisma.deal.findUnique({
            where: { id },
            include: {
                marketplace: true,
                priceHistory: {
                    orderBy: { recordedAt: 'desc' },
                    take: 30,
                },
            },
        });

        if (!deal) {
            return res.status(404).json({ error: 'Deal not found' });
        }

        // Increment view count
        await prisma.deal.update({
            where: { id },
            data: { views: { increment: 1 } },
        });

        // Get similar deals
        const similarDeals = await prisma.deal.findMany({
            where: {
                category: deal.category,
                id: { not: id },
            },
            include: { marketplace: true },
            orderBy: { dealScore: 'desc' },
            take: 4,
        });

        res.json({
            ...deal,
            similarDeals,
        });
    } catch (error) {
        console.error('Error fetching deal:', error);
        res.status(500).json({ error: 'Failed to fetch deal' });
    }
});

export { router as dealsRouter };
