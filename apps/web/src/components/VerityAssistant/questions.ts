import { Question } from '@/types';

export const questions: Question[] = [
    {
        id: 'q1',
        text: "Welcome to Verity! I'm your AI Decision Concierge. Let's find your perfect laptop. What will you primarily use it for?",
        key: 'primaryUse',
        options: [
            { id: 'work', label: 'Work & Productivity', value: 'work', icon: '💼' },
            { id: 'gaming', label: 'Gaming', value: 'gaming', icon: '🎮' },
            { id: 'school', label: 'School & Learning', value: 'school', icon: '📚' },
            { id: 'travel', label: 'Travel & Mobility', value: 'travel', icon: '✈️' },
            { id: 'creative', label: 'Creative Work', value: 'creative', icon: '🎨' },
        ],
    },
    {
        id: 'q2',
        text: "What's your budget range?",
        key: 'budget',
        options: [
            { id: 'under-800', label: 'Under $800', value: 'under-800', icon: '💵' },
            { id: '800-1200', label: '$800 - $1,200', value: '800-1200', icon: '💰' },
            { id: '1200-2000', label: '$1,200 - $2,000', value: '1200-2000', icon: '💎' },
            { id: 'over-2000', label: 'Over $2,000', value: 'over-2000', icon: '👑' },
        ],
    },
    {
        id: 'q3',
        text: "When choosing a laptop, what's most important to you?",
        key: 'priority',
        options: [
            { id: 'portability', label: 'Lightweight & Portable', value: 'portability', icon: '🪶' },
            { id: 'performance', label: 'Raw Performance', value: 'performance', icon: '⚡' },
            { id: 'battery', label: 'All-Day Battery', value: 'battery', icon: '🔋' },
            { id: 'display', label: 'Stunning Display', value: 'display', icon: '🖥️' },
        ],
    },
    {
        id: 'q4',
        text: 'One more thing — which of these matters most for your daily use?',
        key: 'importance',
        options: [
            { id: 'weight', label: 'Ultra-Light Weight', value: 'weight', icon: '🎈' },
            { id: 'build-quality', label: 'Premium Build Quality', value: 'build-quality', icon: '🏛️' },
            { id: 'upgradeability', label: 'Easy to Upgrade', value: 'upgradeability', icon: '🔧' },
            { id: 'screen-size', label: 'Larger Screen', value: 'screen-size', icon: '📺' },
        ],
    },
];

export const personaDescriptions: Record<string, { name: string; description: string; emoji: string }> = {
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
