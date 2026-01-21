/**
 * Agent API Routes
 * 
 * Endpoints for the autonomous shopping agent, preferences,
 * and deal predictions.
 */

import { Router, Request, Response } from 'express';
import { preferenceModel, shoppingAgent, dealPredictor } from '../services/agent';

const router = Router();

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PREFERENCES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/agent/preferences
 * Get user's learned preferences
 */
router.get('/preferences', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const prefs = await preferenceModel.getPreferences(userId);
        res.json({
            success: true,
            preferences: preferenceModel.exportPreferences(userId),
            suggestedSearches: await preferenceModel.getSuggestedSearches(userId),
            topCategories: await preferenceModel.getTopCategories(userId),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get preferences' });
    }
});

/**
 * POST /api/agent/preferences
 * Update user preferences
 */
router.post('/preferences', async (req: Request, res: Response) => {
    try {
        const { userId = 'demo-user', preferences } = req.body;
        preferenceModel.importPreferences(userId, preferences);
        res.json({ success: true, message: 'Preferences updated' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update preferences' });
    }
});

/**
 * POST /api/agent/activity
 * Record user activity for learning
 */
router.post('/activity', async (req: Request, res: Response) => {
    try {
        const { userId = 'demo-user', activity } = req.body;
        await preferenceModel.recordActivity(userId, activity);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to record activity' });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHOPPING AGENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * GET /api/agent/status
 * Get agent status and stats
 */
router.get('/status', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const agent = shoppingAgent.getAgent(userId);

        if (!agent) {
            // Initialize agent for new users
            const newAgent = await shoppingAgent.initializeAgent(userId);
            res.json({
                success: true,
                agent: {
                    status: newAgent.status,
                    aggressiveness: newAgent.aggressiveness,
                    activeHunts: newAgent.activeHunts.length,
                    stats: newAgent.stats,
                },
            });
        } else {
            res.json({
                success: true,
                agent: {
                    status: agent.status,
                    aggressiveness: agent.aggressiveness,
                    activeHunts: agent.activeHunts.length,
                    stats: agent.stats,
                },
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to get agent status' });
    }
});

/**
 * POST /api/agent/settings
 * Update agent settings
 */
router.post('/settings', async (req: Request, res: Response) => {
    try {
        const { userId = 'demo-user', settings } = req.body;
        const agent = await shoppingAgent.updateAgentSettings(userId, settings);
        res.json({
            success: true,
            agent: {
                status: agent.status,
                aggressiveness: agent.aggressiveness,
            },
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update agent settings' });
    }
});

/**
 * GET /api/agent/activity-log
 * Get agent activity history
 */
router.get('/activity-log', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const limit = parseInt(req.query.limit as string) || 20;
        const log = shoppingAgent.getActivityLog(userId, limit);
        res.json({ success: true, activities: log });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get activity log' });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEAL HUNTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/agent/hunt
 * Create a new deal hunt
 */
router.post('/hunt', async (req: Request, res: Response) => {
    try {
        const {
            userId = 'demo-user',
            query,
            category,
            brand,
            maxPrice,
            minDealScore = 70,
            targetDiscount,
            expiresInDays = 30,
        } = req.body;

        if (!query || !maxPrice) {
            return res.status(400).json({ error: 'query and maxPrice are required' });
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        const hunt = await shoppingAgent.createHunt(userId, {
            query,
            category,
            brand,
            maxPrice,
            minDealScore,
            targetDiscount,
            expiresAt,
        });

        res.json({ success: true, hunt });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create hunt' });
    }
});

/**
 * GET /api/agent/hunts
 * Get user's active hunts
 */
router.get('/hunts', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const agent = shoppingAgent.getAgent(userId);

        res.json({
            success: true,
            hunts: agent?.activeHunts || [],
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get hunts' });
    }
});

/**
 * DELETE /api/agent/hunt/:huntId
 * Cancel a hunt
 */
router.delete('/hunt/:huntId', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string || 'demo-user';
        const { huntId } = req.params;

        const success = shoppingAgent.pauseHunt(userId, huntId);
        res.json({ success });
    } catch (error) {
        res.status(500).json({ error: 'Failed to cancel hunt' });
    }
});

/**
 * POST /api/agent/trigger
 * Manually trigger agent run
 */
router.post('/trigger', async (req: Request, res: Response) => {
    try {
        const { userId = 'demo-user', deals } = req.body;

        // Demo deals for testing
        const testDeals = deals || [
            {
                id: 'laptop-1',
                title: 'Apple MacBook Air M3 15" - 256GB SSD, 8GB RAM',
                category: 'Laptops',
                brand: 'Apple',
                currentPrice: 1099,
                originalPrice: 1299,
                discountPercent: 15,
                dealScore: 94,
                marketplace: 'Amazon',
            },
        ];

        const foundDeals = await shoppingAgent.runForUser(userId, testDeals);
        res.json({
            success: true,
            dealsFound: foundDeals.length,
            deals: foundDeals,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to trigger agent' });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEAL PREDICTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * POST /api/agent/predict
 * Get price prediction for a deal
 */
router.post('/predict', async (req: Request, res: Response) => {
    try {
        const deal = req.body;

        if (!deal.id || !deal.currentPrice) {
            return res.status(400).json({ error: 'id and currentPrice are required' });
        }

        const prediction = await dealPredictor.predictPrice({
            id: deal.id,
            title: deal.title || 'Unknown Product',
            category: deal.category || 'Electronics',
            brand: deal.brand || 'Unknown',
            currentPrice: deal.currentPrice,
            originalPrice: deal.originalPrice || deal.currentPrice,
            dealScore: deal.dealScore || 75,
            isAllTimeLow: deal.isAllTimeLow || false,
            views: deal.views,
            priceHistory: deal.priceHistory,
        });

        res.json({
            success: true,
            prediction,
            summary: dealPredictor.getBuyOrWaitSummary(prediction),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to predict price' });
    }
});

/**
 * POST /api/agent/predict/batch
 * Get predictions for multiple deals
 */
router.post('/predict/batch', async (req: Request, res: Response) => {
    try {
        const { deals } = req.body;

        if (!Array.isArray(deals)) {
            return res.status(400).json({ error: 'deals array is required' });
        }

        const predictions = await dealPredictor.predictBatch(deals);
        res.json({
            success: true,
            predictions: predictions.map(p => ({
                ...p,
                summary: dealPredictor.getBuyOrWaitSummary(p),
            })),
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to predict prices' });
    }
});

/**
 * GET /api/agent/recommend/:dealId
 * Get quick buy/wait recommendation
 */
router.get('/recommend/:dealId', async (req: Request, res: Response) => {
    try {
        const { dealId } = req.params;
        const category = req.query.category as string || 'Electronics';
        const currentPrice = parseFloat(req.query.price as string) || 100;
        const dealScore = parseInt(req.query.score as string) || 80;

        const prediction = await dealPredictor.predictPrice({
            id: dealId,
            title: 'Product',
            category,
            brand: 'Brand',
            currentPrice,
            originalPrice: currentPrice * 1.2,
            dealScore,
            isAllTimeLow: false,
        });

        res.json({
            success: true,
            recommendation: prediction.recommendation,
            reasons: prediction.recommendationReasons,
            confidence: prediction.confidence30d,
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get recommendation' });
    }
});

export { router as agentRouter };
