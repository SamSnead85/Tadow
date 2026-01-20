import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

type Persona =
    | 'Digital Nomad'
    | 'Creative Professional'
    | 'Competitive Gamer'
    | 'Business Traveler'
    | 'Versatile Student'
    | 'Power User'
    | 'Tinkerer';

interface QuestionnaireAnswers {
    primaryUse: 'work' | 'gaming' | 'school' | 'travel' | 'creative';
    budget: 'under-800' | '800-1200' | '1200-2000' | 'over-2000';
    priority: 'portability' | 'performance' | 'battery' | 'display';
    importance: 'weight' | 'build-quality' | 'upgradeability' | 'screen-size';
}

const personaDescriptions: Record<Persona, { name: string; description: string; emoji: string }> = {
    'Digital Nomad': {
        name: 'The Digital Nomad',
        description: 'You need a laptop that travels as well as you do — lightweight, long battery life, and reliable connectivity wherever you go.',
        emoji: '🌍',
    },
    'Creative Professional': {
        name: 'The Creative Professional',
        description: "Color accuracy, processing power, and a stunning display are your priorities. You need a machine that can keep up with your vision.",
        emoji: '🎨',
    },
    'Competitive Gamer': {
        name: 'The Competitive Gamer',
        description: 'High refresh rates, powerful GPUs, and thermal management are essential. Every frame counts in your world.',
        emoji: '🎮',
    },
    'Business Traveler': {
        name: 'The Business Traveler',
        description: 'Reliability, security, and all-day battery life are non-negotiable. You need a professional tool that works as hard as you do.',
        emoji: '💼',
    },
    'Versatile Student': {
        name: 'The Versatile Student',
        description: 'You need a laptop that handles everything from essays to entertainment — versatile, affordable, and built to last through your degree.',
        emoji: '📚',
    },
    'Power User': {
        name: 'The Power User',
        description: 'Maximum performance, no compromises. You push your hardware to the limit and expect it to keep up.',
        emoji: '⚡',
    },
    'Tinkerer': {
        name: 'The Tinkerer',
        description: 'You love customization and upgradability. A laptop should grow with you, not hold you back.',
        emoji: '🔧',
    },
};

// Determine persona from questionnaire answers
function determinePersona(answers: QuestionnaireAnswers): Persona {
    const { primaryUse, budget, priority, importance } = answers;

    if (primaryUse === 'gaming') {
        if (budget === 'over-2000' || priority === 'performance') {
            return 'Power User';
        }
        return 'Competitive Gamer';
    }

    if (primaryUse === 'creative') {
        return 'Creative Professional';
    }

    if (primaryUse === 'travel' || priority === 'portability' || importance === 'weight') {
        return 'Digital Nomad';
    }

    if (primaryUse === 'work') {
        if (priority === 'battery' || importance === 'build-quality') {
            return 'Business Traveler';
        }
        if (importance === 'upgradeability') {
            return 'Tinkerer';
        }
        return 'Business Traveler';
    }

    if (primaryUse === 'school') {
        if (budget === 'over-2000' && priority === 'performance') {
            return 'Power User';
        }
        return 'Versatile Student';
    }

    if (importance === 'upgradeability') {
        return 'Tinkerer';
    }

    return 'Versatile Student';
}

// POST /api/recommendations - Get personalized recommendations
router.post('/', async (req, res) => {
    try {
        const answers = req.body as QuestionnaireAnswers;

        // Validate answers
        if (!answers.primaryUse || !answers.budget || !answers.priority || !answers.importance) {
            return res.status(400).json({ error: 'Missing required questionnaire answers' });
        }

        // Determine persona
        const persona = determinePersona(answers);
        const personaInfo = personaDescriptions[persona];

        // Fetch products that match the persona
        const products = await prisma.product.findMany({
            include: {
                prices: true,
            },
            orderBy: {
                verityScore: 'desc',
            },
        });

        // Filter and sort by persona match
        const recommendations = products
            .map((p) => {
                const idealPersonas = JSON.parse(p.idealPersonas) as string[];
                const isMatch = idealPersonas.includes(persona);
                return {
                    ...p,
                    scoreBreakdown: JSON.parse(p.scoreBreakdown),
                    specs: JSON.parse(p.specs),
                    idealPersonas,
                    matchScore: isMatch ? 100 : 50,
                };
            })
            .filter((p) => p.idealPersonas.includes(persona))
            .sort((a, b) => b.verityScore - a.verityScore)
            .slice(0, 3);

        res.json({
            persona,
            personaName: personaInfo.name,
            personaDescription: personaInfo.description,
            personaEmoji: personaInfo.emoji,
            recommendations,
        });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        res.status(500).json({ error: 'Failed to generate recommendations' });
    }
});

export { router as recommendationsRouter };
