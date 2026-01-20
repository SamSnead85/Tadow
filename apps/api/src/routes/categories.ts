import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/categories - List all categories with deal counts
router.get('/', async (req, res) => {
    try {
        const categories = await prisma.category.findMany({
            orderBy: { name: 'asc' },
        });

        // Get deal counts per category
        const dealCounts = await prisma.deal.groupBy({
            by: ['category'],
            _count: true,
        });

        const countMap = dealCounts.reduce((acc, curr) => {
            acc[curr.category] = curr._count;
            return acc;
        }, {} as Record<string, number>);

        res.json(categories.map((cat) => ({
            ...cat,
            dealCount: countMap[cat.name] || 0,
        })));
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
});

export { router as categoriesRouter };
