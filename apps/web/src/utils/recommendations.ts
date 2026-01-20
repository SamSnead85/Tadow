import type { QuestionnaireAnswers, Persona } from '@/types';

/**
 * Rules-based persona determination algorithm
 * Maps user answers to the most appropriate persona
 */
export function determinePersona(answers: QuestionnaireAnswers): Persona {
    const { primaryUse, budget, priority, importance } = answers;

    // Gaming use case
    if (primaryUse === 'gaming') {
        if (budget === 'over-2000' || priority === 'performance') {
            return 'Power User';
        }
        return 'Competitive Gamer';
    }

    // Creative work
    if (primaryUse === 'creative') {
        return 'Creative Professional';
    }

    // Travel-focused
    if (primaryUse === 'travel' || priority === 'portability' || importance === 'weight') {
        return 'Digital Nomad';
    }

    // Work-focused
    if (primaryUse === 'work') {
        if (priority === 'battery' || importance === 'build-quality') {
            return 'Business Traveler';
        }
        if (importance === 'upgradeability') {
            return 'Tinkerer';
        }
        return 'Business Traveler';
    }

    // School/Student
    if (primaryUse === 'school') {
        if (budget === 'over-2000' && priority === 'performance') {
            return 'Power User';
        }
        return 'Versatile Student';
    }

    // Upgradeability focus
    if (importance === 'upgradeability') {
        return 'Tinkerer';
    }

    // Default
    return 'Versatile Student';
}

/**
 * Score match between persona and product
 * Returns a relevance score from 0-100
 */
export function calculatePersonaMatch(persona: Persona, productPersonas: string[]): number {
    if (productPersonas.includes(persona)) {
        return 100;
    }

    // Partial matches based on persona similarity
    const similarPersonas: Record<Persona, Persona[]> = {
        'Digital Nomad': ['Business Traveler', 'Versatile Student'],
        'Creative Professional': ['Power User'],
        'Competitive Gamer': ['Power User'],
        'Business Traveler': ['Digital Nomad'],
        'Versatile Student': ['Digital Nomad', 'Business Traveler'],
        'Power User': ['Competitive Gamer', 'Creative Professional'],
        'Tinkerer': ['Power User'],
    };

    const similar = similarPersonas[persona] || [];
    for (const p of productPersonas) {
        if (similar.includes(p as Persona)) {
            return 75;
        }
    }

    return 50;
}
