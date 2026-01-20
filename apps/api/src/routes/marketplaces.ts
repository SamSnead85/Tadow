import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/marketplaces - List all marketplaces with deal counts
router.get('/', async (req, res) => {
    try {
        const marketplaces = await prisma.marketplace.findMany({
            include: {
                _count: {
                    select: { deals: true },
                },
            },
            orderBy: { name: 'asc' },
        });

        res.json(marketplaces.map((mp) => ({
            id: mp.id,
            name: mp.name,
            type: mp.type,
            logoUrl: mp.logoUrl,
            baseUrl: mp.baseUrl,
            color: mp.color,
            dealCount: mp._count.deals,
        })));
    } catch (error) {
        console.error('Error fetching marketplaces:', error);
        res.status(500).json({ error: 'Failed to fetch marketplaces' });
    }
});

// GET /api/marketplaces/:id - Get marketplace details
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const marketplace = await prisma.marketplace.findUnique({
            where: { id },
            include: {
                deals: {
                    orderBy: { dealScore: 'desc' },
                    take: 10,
                },
                _count: {
                    select: { deals: true },
                },
            },
        });

        if (!marketplace) {
            return res.status(404).json({ error: 'Marketplace not found' });
        }

        res.json(marketplace);
    } catch (error) {
        console.error('Error fetching marketplace:', error);
        res.status(500).json({ error: 'Failed to fetch marketplace' });
    }
});

export { router as marketplacesRouter };
