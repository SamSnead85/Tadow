import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/products - List all products
router.get('/', async (req, res) => {
    try {
        const products = await prisma.product.findMany({
            include: {
                prices: true,
            },
            orderBy: {
                verityScore: 'desc',
            },
        });

        // Parse JSON fields
        const formattedProducts = products.map((p) => ({
            ...p,
            scoreBreakdown: JSON.parse(p.scoreBreakdown),
            specs: JSON.parse(p.specs),
            idealPersonas: JSON.parse(p.idealPersonas),
        }));

        res.json(formattedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /api/products/:id - Get single product
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                prices: true,
                reviews: true,
            },
        });

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Parse JSON fields
        const formattedProduct = {
            ...product,
            scoreBreakdown: JSON.parse(product.scoreBreakdown),
            specs: JSON.parse(product.specs),
            idealPersonas: JSON.parse(product.idealPersonas),
        };

        res.json(formattedProduct);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

export { router as productsRouter };
