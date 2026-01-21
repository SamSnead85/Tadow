/**
 * Aggregation API Routes
 * 
 * Advanced routes for AI-powered deal intelligence:
 * - /api/aggregation/score - Score a deal
 * - /api/aggregation/predict - Price prediction
 * - /api/aggregation/chat - AI assistant
 * - /api/aggregation/submit - User submissions
 * - /api/aggregation/jobs - Scheduler status
 */

import { Router } from 'express';
import {
    dealScorer,
    priceTracker,
    aiAssistant,
    dealSubmissionService,
    jobScheduler,
    rssAggregator,
    aggregationPipeline,
} from '../services/aggregation';

const router = Router();

// POST /api/aggregation/score - Score a deal
router.post('/score', async (req, res) => {
    try {
        const { title, currentPrice, originalPrice, category, brand, marketplace } = req.body;

        if (!title || !currentPrice) {
            return res.status(400).json({ error: 'title and currentPrice are required' });
        }

        const score = dealScorer.scoreDeal({
            id: `temp_${Date.now()}`,
            title,
            currentPrice,
            originalPrice,
            discountPercent: originalPrice ? ((originalPrice - currentPrice) / originalPrice) * 100 : undefined,
            category: category || 'electronics',
            brand,
            marketplace: marketplace || 'Unknown',
        });

        res.json({
            score: score.totalScore,
            verdict: score.verdictText,
            recommendation: score.recommendation,
            breakdown: score.breakdown,
            insights: score.insights,
        });
    } catch (error) {
        console.error('Error scoring deal:', error);
        res.status(500).json({ error: 'Failed to score deal' });
    }
});

// POST /api/aggregation/predict - Price prediction
router.post('/predict', async (req, res) => {
    try {
        const { priceHistory, category } = req.body;

        if (!priceHistory || !Array.isArray(priceHistory)) {
            return res.status(400).json({ error: 'priceHistory array is required' });
        }

        const history = priceHistory.map((p: { price: number; date: string }) => ({
            price: p.price,
            recordedAt: new Date(p.date),
        }));

        const prediction = priceTracker.predictPrice(history, category);

        res.json(prediction);
    } catch (error) {
        console.error('Error predicting price:', error);
        res.status(500).json({ error: 'Failed to predict price' });
    }
});

// POST /api/aggregation/analyze - Analyze price history
router.post('/analyze', async (req, res) => {
    try {
        const { currentPrice, priceHistory } = req.body;

        if (!currentPrice || !priceHistory) {
            return res.status(400).json({ error: 'currentPrice and priceHistory are required' });
        }

        const history = priceHistory.map((p: { price: number; date: string }) => ({
            price: p.price,
            recordedAt: new Date(p.date),
        }));

        const stats = priceTracker.analyzeHistory(currentPrice, history);
        const chartData = priceTracker.generateChartData(history, 90);

        res.json({
            stats,
            chartData,
        });
    } catch (error) {
        console.error('Error analyzing price:', error);
        res.status(500).json({ error: 'Failed to analyze price' });
    }
});

// POST /api/aggregation/chat - AI chat assistant
router.post('/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'message is required' });
        }

        const response = await aiAssistant.chat(message, {
            sessionId: sessionId || `session_${Date.now()}`,
            messages: [],
            preferences: {},
        });

        res.json(response);
    } catch (error) {
        console.error('Error in chat:', error);
        res.status(500).json({ error: 'Failed to process chat message' });
    }
});

// POST /api/aggregation/submit - Submit a deal
router.post('/submit', async (req, res) => {
    try {
        const { userId, title, url, price, originalPrice, category, description, imageUrl } = req.body;

        if (!userId || !title || !url || !price || !category) {
            return res.status(400).json({
                error: 'userId, title, url, price, and category are required'
            });
        }

        const result = await dealSubmissionService.submitDeal({
            userId,
            title,
            url,
            price,
            originalPrice,
            category,
            description,
            imageUrl,
        });

        res.json(result);
    } catch (error) {
        console.error('Error submitting deal:', error);
        res.status(500).json({ error: 'Failed to submit deal' });
    }
});

// GET /api/aggregation/submissions - Get pending submissions
router.get('/submissions', async (req, res) => {
    try {
        const submissions = dealSubmissionService.getPendingSubmissions();
        res.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// POST /api/aggregation/moderate - Moderate a submission
router.post('/moderate', async (req, res) => {
    try {
        const { submissionId, status, notes, moderatorId } = req.body;

        if (!submissionId || !status) {
            return res.status(400).json({ error: 'submissionId and status are required' });
        }

        const success = await dealSubmissionService.moderate(submissionId, {
            status,
            notes,
            moderatorId,
        });

        res.json({ success });
    } catch (error) {
        console.error('Error moderating submission:', error);
        res.status(500).json({ error: 'Failed to moderate submission' });
    }
});

// GET /api/aggregation/leaderboard - User leaderboard
router.get('/leaderboard', async (req, res) => {
    try {
        const { limit = '10' } = req.query;
        const leaderboard = dealSubmissionService.getLeaderboard(parseInt(limit as string));
        res.json(leaderboard);
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

// GET /api/aggregation/user/:userId/stats - User stats
router.get('/user/:userId/stats', async (req, res) => {
    try {
        const { userId } = req.params;
        const stats = dealSubmissionService.getUserStats(userId);

        if (!stats) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json(stats);
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
});

// GET /api/aggregation/jobs - Job scheduler status
router.get('/jobs', async (req, res) => {
    try {
        const jobs = jobScheduler.getAllJobsStatus();
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Failed to fetch job status' });
    }
});

// POST /api/aggregation/jobs/:name/trigger - Trigger a job
router.post('/jobs/:name/trigger', async (req, res) => {
    try {
        const { name } = req.params;
        const success = await jobScheduler.triggerJob(name);

        if (!success) {
            return res.status(404).json({ error: 'Job not found or already running' });
        }

        res.json({ success, message: `Job ${name} triggered` });
    } catch (error) {
        console.error('Error triggering job:', error);
        res.status(500).json({ error: 'Failed to trigger job' });
    }
});

// GET /api/aggregation/feeds - RSS feed stats
router.get('/feeds', async (req, res) => {
    try {
        const stats = rssAggregator.getStats();
        const feeds = rssAggregator.getEnabledFeeds();

        res.json({
            feeds,
            stats,
        });
    } catch (error) {
        console.error('Error fetching feed stats:', error);
        res.status(500).json({ error: 'Failed to fetch feed stats' });
    }
});

// GET /api/aggregation/top - Get top AI-scored deals
router.get('/top', async (req, res) => {
    try {
        const { limit = '20' } = req.query;
        const deals = await aggregationPipeline.getTopDeals(parseInt(limit as string));

        res.json({
            deals,
            count: deals.length,
        });
    } catch (error) {
        console.error('Error fetching top deals:', error);
        res.status(500).json({ error: 'Failed to fetch top deals' });
    }
});

// GET /api/aggregation/search - AI-powered search
router.get('/search', async (req, res) => {
    try {
        const { q, category } = req.query;

        if (!q) {
            return res.status(400).json({ error: 'Query parameter q is required' });
        }

        const deals = await aggregationPipeline.searchDeals(q as string, category as string);

        res.json({
            query: q,
            deals,
            count: deals.length,
        });
    } catch (error) {
        console.error('Error searching deals:', error);
        res.status(500).json({ error: 'Failed to search deals' });
    }
});

export { router as aggregationRouter };
