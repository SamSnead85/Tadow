/**
 * Job Scheduler Service - Orchestrates Continuous Deal Collection
 * 
 * Manages scheduled tasks for:
 * - Affiliate API polling
 * - Web scraping
 * - RSS feed aggregation
 * - Price verification
 * - Data cleanup
 */

import { affiliateManager } from './affiliateConnector';
import { webScraper } from './webScraper';
import { rssAggregator } from './rssAggregator';
import { dealNormalizer, NormalizedDeal } from './dealNormalizer';
import { dealScorer } from './dealScorer';

export interface ScheduledJob {
    name: string;
    intervalMinutes: number;
    lastRun: Date | null;
    nextRun: Date;
    enabled: boolean;
    running: boolean;
    handler: () => Promise<void>;
}

export interface JobStats {
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    lastError?: string;
    averageRunTimeMs: number;
}

export class JobScheduler {
    private jobs: Map<string, ScheduledJob> = new Map();
    private jobStats: Map<string, JobStats> = new Map();
    private isRunning: boolean = false;
    private checkInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.registerDefaultJobs();
    }

    /**
     * Register default collection jobs
     */
    private registerDefaultJobs(): void {
        // Affiliate API polling (every 15 minutes)
        this.registerJob({
            name: 'affiliate-api-poll',
            intervalMinutes: 15,
            enabled: true,
            handler: async () => {
                console.log('[Scheduler] Running affiliate API poll...');
                const deals = await affiliateManager.getAllHotDeals();
                console.log(`[Scheduler] Fetched ${deals.length} deals from affiliates`);
                await this.processDeals(deals.map(d => dealNormalizer.normalize(d)));
            },
        });

        // RSS feed aggregation (every 10 minutes)
        this.registerJob({
            name: 'rss-aggregation',
            intervalMinutes: 10,
            enabled: true,
            handler: async () => {
                console.log('[Scheduler] Running RSS aggregation...');
                const results = await rssAggregator.fetchAllDue();
                let totalItems = 0;
                for (const result of results) {
                    if (result.success) {
                        totalItems += result.items.length;
                    }
                }
                console.log(`[Scheduler] Fetched ${totalItems} RSS items from ${results.length} feeds`);
            },
        });

        // Web scraping (every 30 minutes)
        this.registerJob({
            name: 'web-scraping',
            intervalMinutes: 30,
            enabled: true,
            handler: async () => {
                console.log('[Scheduler] Running web scraping...');
                const results = await webScraper.scrapeAll();
                let totalDeals = 0;
                for (const [, result] of results) {
                    if (result.success) {
                        totalDeals += result.deals.length;
                    }
                }
                console.log(`[Scheduler] Scraped ${totalDeals} deals from ${results.size} sites`);
            },
        });

        // Price verification (every 60 minutes)
        this.registerJob({
            name: 'price-verification',
            intervalMinutes: 60,
            enabled: true,
            handler: async () => {
                console.log('[Scheduler] Running price verification...');
                // In production: verify prices for top deals are still accurate
                // Update stock status, mark expired deals
            },
        });

        // Data cleanup (every 24 hours)
        this.registerJob({
            name: 'data-cleanup',
            intervalMinutes: 1440, // 24 hours
            enabled: true,
            handler: async () => {
                console.log('[Scheduler] Running data cleanup...');
                // Archive old deals
                // Clear caches
                rssAggregator.clearCache();
            },
        });
    }

    /**
     * Register a new job
     */
    registerJob(config: {
        name: string;
        intervalMinutes: number;
        enabled: boolean;
        handler: () => Promise<void>;
    }): void {
        const job: ScheduledJob = {
            name: config.name,
            intervalMinutes: config.intervalMinutes,
            lastRun: null,
            nextRun: new Date(),
            enabled: config.enabled,
            running: false,
            handler: config.handler,
        };

        this.jobs.set(config.name, job);
        this.jobStats.set(config.name, {
            totalRuns: 0,
            successfulRuns: 0,
            failedRuns: 0,
            averageRunTimeMs: 0,
        });
    }

    /**
     * Process normalized deals through scoring
     */
    private async processDeals(deals: NormalizedDeal[]): Promise<void> {
        for (const deal of deals) {
            const score = dealScorer.scoreDeal({
                id: deal.id,
                title: deal.normalizedTitle,
                currentPrice: deal.currentPrice,
                originalPrice: deal.originalPrice,
                discountPercent: deal.discountPercent,
                category: deal.category,
                brand: deal.brand,
                marketplace: deal.marketplace,
                reviewScore: deal.rating,
                reviewCount: deal.reviewCount,
            });

            // In production: save to database with score
            console.log(`[Scheduler] Scored deal: ${deal.normalizedTitle} = ${score.totalScore}/100`);
        }
    }

    /**
     * Run a specific job
     */
    async runJob(name: string): Promise<boolean> {
        const job = this.jobs.get(name);
        if (!job || job.running) return false;

        job.running = true;
        const startTime = Date.now();
        const stats = this.jobStats.get(name)!;

        try {
            await job.handler();

            stats.successfulRuns++;
            job.lastRun = new Date();
            job.nextRun = new Date(Date.now() + job.intervalMinutes * 60 * 1000);

            return true;
        } catch (error) {
            stats.failedRuns++;
            stats.lastError = error instanceof Error ? error.message : 'Unknown error';
            console.error(`[Scheduler] Job ${name} failed:`, error);
            return false;
        } finally {
            job.running = false;
            stats.totalRuns++;

            const runTime = Date.now() - startTime;
            stats.averageRunTimeMs =
                (stats.averageRunTimeMs * (stats.totalRuns - 1) + runTime) / stats.totalRuns;
        }
    }

    /**
     * Check and run due jobs
     */
    private async checkJobs(): Promise<void> {
        const now = new Date();

        for (const [name, job] of this.jobs) {
            if (job.enabled && !job.running && job.nextRun <= now) {
                // Run in background, don't await
                this.runJob(name).catch(err =>
                    console.error(`[Scheduler] Error running job ${name}:`, err)
                );
            }
        }
    }

    /**
     * Start the scheduler
     */
    start(): void {
        if (this.isRunning) return;

        console.log('[Scheduler] Starting job scheduler...');
        this.isRunning = true;

        // Check jobs every minute
        this.checkInterval = setInterval(() => this.checkJobs(), 60000);

        // Run initial check
        this.checkJobs();
    }

    /**
     * Stop the scheduler
     */
    stop(): void {
        if (!this.isRunning) return;

        console.log('[Scheduler] Stopping job scheduler...');
        this.isRunning = false;

        if (this.checkInterval) {
            clearInterval(this.checkInterval);
            this.checkInterval = null;
        }
    }

    /**
     * Get job status
     */
    getJobStatus(name: string): { job: ScheduledJob; stats: JobStats } | null {
        const job = this.jobs.get(name);
        const stats = this.jobStats.get(name);

        if (!job || !stats) return null;
        return { job, stats };
    }

    /**
     * Get all jobs status
     */
    getAllJobsStatus(): Array<{ job: ScheduledJob; stats: JobStats }> {
        const statuses: Array<{ job: ScheduledJob; stats: JobStats }> = [];

        for (const [name, job] of this.jobs) {
            const stats = this.jobStats.get(name)!;
            statuses.push({ job, stats });
        }

        return statuses;
    }

    /**
     * Enable/disable a job
     */
    setJobEnabled(name: string, enabled: boolean): void {
        const job = this.jobs.get(name);
        if (job) {
            job.enabled = enabled;
        }
    }

    /**
     * Trigger immediate run of a job
     */
    async triggerJob(name: string): Promise<boolean> {
        const job = this.jobs.get(name);
        if (!job) return false;

        job.nextRun = new Date(); // Set to now
        return this.runJob(name);
    }
}

// Export singleton
export const jobScheduler = new JobScheduler();
