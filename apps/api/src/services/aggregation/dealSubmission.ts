/**
 * Deal Submission Service - User-Generated Content
 * 
 * Allows users to submit deals with:
 * - AI pre-screening for quality
 * - Moderation queue
 * - Points/rewards for quality submissions
 * - Automatic price verification
 */

import { dealScorer } from './dealScorer';
import { dealNormalizer, NormalizedDeal } from './dealNormalizer';

export interface DealSubmission {
    id: string;
    userId: string;
    title: string;
    url: string;
    price: number;
    originalPrice?: number;
    category: string;
    description?: string;
    imageUrl?: string;
    submittedAt: Date;
    status: 'pending' | 'approved' | 'rejected' | 'duplicate';
    aiScore?: number;
    aiVerdict?: string;
    moderatorNotes?: string;
    pointsAwarded?: number;
}

export interface SubmissionResult {
    success: boolean;
    submissionId?: string;
    message: string;
    previewScore?: number;
    issues?: string[];
}

export interface UserStats {
    userId: string;
    totalSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
    totalPoints: number;
    rank: 'newbie' | 'contributor' | 'trusted' | 'expert' | 'legend';
}

// Points for various actions
const POINTS = {
    approved: 10,
    featured: 25,
    hotDeal: 50,
    firstPost: 5,
    streak: 2, // Bonus per consecutive day
};

// Rank thresholds
const RANKS: Array<{ min: number; rank: UserStats['rank'] }> = [
    { min: 0, rank: 'newbie' },
    { min: 50, rank: 'contributor' },
    { min: 200, rank: 'trusted' },
    { min: 500, rank: 'expert' },
    { min: 1000, rank: 'legend' },
];

export class DealSubmissionService {
    private submissions: Map<string, DealSubmission> = new Map();
    private userStats: Map<string, UserStats> = new Map();

    /**
     * Submit a new deal
     */
    async submitDeal(input: {
        userId: string;
        title: string;
        url: string;
        price: number;
        originalPrice?: number;
        category: string;
        description?: string;
        imageUrl?: string;
    }): Promise<SubmissionResult> {
        const issues: string[] = [];

        // Validation
        if (!input.title || input.title.length < 10) {
            issues.push('Title must be at least 10 characters');
        }
        if (!input.url || !this.isValidUrl(input.url)) {
            issues.push('Invalid URL');
        }
        if (!input.price || input.price <= 0) {
            issues.push('Price must be greater than 0');
        }
        if (input.originalPrice && input.originalPrice <= input.price) {
            issues.push('Original price must be higher than current price');
        }

        if (issues.length > 0) {
            return {
                success: false,
                message: 'Validation failed',
                issues,
            };
        }

        // Check for duplicates
        const isDuplicate = await this.checkDuplicate(input.url, input.title);
        if (isDuplicate) {
            return {
                success: false,
                message: 'This deal has already been submitted',
                issues: ['Duplicate deal detected'],
            };
        }

        // Create submission
        const submission: DealSubmission = {
            id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            userId: input.userId,
            title: input.title,
            url: input.url,
            price: input.price,
            originalPrice: input.originalPrice,
            category: input.category,
            description: input.description,
            imageUrl: input.imageUrl,
            submittedAt: new Date(),
            status: 'pending',
        };

        // AI Pre-screening
        const scoreResult = dealScorer.scoreDeal({
            id: submission.id,
            title: input.title,
            currentPrice: input.price,
            originalPrice: input.originalPrice,
            discountPercent: input.originalPrice
                ? ((input.originalPrice - input.price) / input.originalPrice) * 100
                : undefined,
            category: input.category,
            marketplace: this.extractMarketplace(input.url),
        });

        submission.aiScore = scoreResult.totalScore;
        submission.aiVerdict = scoreResult.verdictText;

        // Auto-approve high-scoring deals from trusted users
        const userRank = this.getUserStats(input.userId)?.rank || 'newbie';
        if (scoreResult.totalScore >= 80 && (userRank === 'trusted' || userRank === 'expert' || userRank === 'legend')) {
            submission.status = 'approved';
            this.awardPoints(input.userId, POINTS.approved);
        }

        // Auto-reject obviously bad submissions
        if (scoreResult.totalScore < 30) {
            submission.status = 'rejected';
            submission.moderatorNotes = 'Auto-rejected: Low quality score';
        }

        this.submissions.set(submission.id, submission);
        this.updateUserStats(input.userId, 'submitted');

        return {
            success: true,
            submissionId: submission.id,
            message: submission.status === 'approved'
                ? 'Deal approved and published!'
                : 'Deal submitted for review',
            previewScore: scoreResult.totalScore,
        };
    }

    /**
     * Check for duplicate submissions
     */
    private async checkDuplicate(url: string, title: string): Promise<boolean> {
        for (const [, sub] of this.submissions) {
            if (sub.url === url) return true;

            // Fuzzy title match
            const similarity = this.calculateSimilarity(sub.title, title);
            if (similarity > 0.8) return true;
        }
        return false;
    }

    /**
     * Calculate string similarity
     */
    private calculateSimilarity(str1: string, str2: string): number {
        const s1 = str1.toLowerCase().split(/\s+/);
        const s2 = str2.toLowerCase().split(/\s+/);

        const intersection = s1.filter(w => s2.includes(w)).length;
        const union = new Set([...s1, ...s2]).size;

        return intersection / union;
    }

    /**
     * Extract marketplace from URL
     */
    private extractMarketplace(url: string): string {
        try {
            const hostname = new URL(url).hostname.toLowerCase();

            if (hostname.includes('amazon')) return 'Amazon';
            if (hostname.includes('walmart')) return 'Walmart';
            if (hostname.includes('bestbuy')) return 'Best Buy';
            if (hostname.includes('target')) return 'Target';
            if (hostname.includes('newegg')) return 'Newegg';
            if (hostname.includes('ebay')) return 'eBay';
            if (hostname.includes('costco')) return 'Costco';

            return hostname.replace('www.', '').split('.')[0];
        } catch {
            return 'Unknown';
        }
    }

    /**
     * Validate URL
     */
    private isValidUrl(url: string): boolean {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Moderate a submission
     */
    async moderate(submissionId: string, decision: {
        status: 'approved' | 'rejected';
        notes?: string;
        moderatorId?: string;
    }): Promise<boolean> {
        const submission = this.submissions.get(submissionId);
        if (!submission || submission.status !== 'pending') return false;

        submission.status = decision.status;
        submission.moderatorNotes = decision.notes;

        if (decision.status === 'approved') {
            this.awardPoints(submission.userId, POINTS.approved);
            this.updateUserStats(submission.userId, 'approved');
        } else {
            this.updateUserStats(submission.userId, 'rejected');
        }

        return true;
    }

    /**
     * Award points to user
     */
    private awardPoints(userId: string, points: number): void {
        const stats = this.getOrCreateUserStats(userId);
        stats.totalPoints += points;
        stats.rank = this.calculateRank(stats.totalPoints);
    }

    /**
     * Calculate user rank based on points
     */
    private calculateRank(points: number): UserStats['rank'] {
        for (let i = RANKS.length - 1; i >= 0; i--) {
            if (points >= RANKS[i].min) {
                return RANKS[i].rank;
            }
        }
        return 'newbie';
    }

    /**
     * Get or create user stats
     */
    private getOrCreateUserStats(userId: string): UserStats {
        let stats = this.userStats.get(userId);
        if (!stats) {
            stats = {
                userId,
                totalSubmissions: 0,
                approvedSubmissions: 0,
                rejectedSubmissions: 0,
                totalPoints: 0,
                rank: 'newbie',
            };
            this.userStats.set(userId, stats);
        }
        return stats;
    }

    /**
     * Update user stats
     */
    private updateUserStats(userId: string, action: 'submitted' | 'approved' | 'rejected'): void {
        const stats = this.getOrCreateUserStats(userId);

        switch (action) {
            case 'submitted':
                stats.totalSubmissions++;
                break;
            case 'approved':
                stats.approvedSubmissions++;
                break;
            case 'rejected':
                stats.rejectedSubmissions++;
                break;
        }
    }

    /**
     * Get user stats
     */
    getUserStats(userId: string): UserStats | null {
        return this.userStats.get(userId) || null;
    }

    /**
     * Get pending submissions for moderation
     */
    getPendingSubmissions(): DealSubmission[] {
        return Array.from(this.submissions.values())
            .filter(s => s.status === 'pending')
            .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    }

    /**
     * Get submission by ID
     */
    getSubmission(id: string): DealSubmission | null {
        return this.submissions.get(id) || null;
    }

    /**
     * Get user's submissions
     */
    getUserSubmissions(userId: string): DealSubmission[] {
        return Array.from(this.submissions.values())
            .filter(s => s.userId === userId)
            .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(limit: number = 10): UserStats[] {
        return Array.from(this.userStats.values())
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .slice(0, limit);
    }
}

// Export singleton
export const dealSubmissionService = new DealSubmissionService();
