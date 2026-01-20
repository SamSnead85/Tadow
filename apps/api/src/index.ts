import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { productsRouter } from './routes/products';
import { recommendationsRouter } from './routes/recommendations';
import { pricesRouter } from './routes/prices';
import { dealsRouter } from './routes/deals';
import { marketplacesRouter } from './routes/marketplaces';
import { categoriesRouter } from './routes/categories';


dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3456;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Original Verity Routes
app.use('/api/products', productsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/prices', pricesRouter);

// Deal Aggregator Routes (New)
app.use('/api/deals', dealsRouter);
app.use('/api/marketplaces', marketplacesRouter);
app.use('/api/categories', categoriesRouter);

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await prisma.$disconnect();
    process.exit(0);
});

// Start server
app.listen(PORT, () => {
    console.log(`
🚀 Verity API Server running!
   
   Local:   http://localhost:${PORT}
   Health:  http://localhost:${PORT}/api/health
   
   Routes:
   - /api/products     (Product Research)
   - /api/deals        (Deal Aggregator)
   - /api/marketplaces (Marketplace Directory)
   - /api/categories   (Category Browser)
  `);
});

export { prisma };
