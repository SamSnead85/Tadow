import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/prices/:productId - Get prices for a product
router.get('/:productId', async (req, res) => {
    try {
        const { productId } = req.params;

        const prices = await prisma.price.findMany({
            where: { productId },
            orderBy: {
                price: 'asc',
            },
        });

        if (prices.length === 0) {
            return res.status(404).json({ error: 'No prices found for this product' });
        }

        // Add lowest price indicator
        const lowestPrice = prices[0].price;
        const formattedPrices = prices.map((p) => ({
            ...p,
            isLowest: p.price === lowestPrice,
        }));

        res.json(formattedPrices);
    } catch (error) {
        console.error('Error fetching prices:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

export { router as pricesRouter };
