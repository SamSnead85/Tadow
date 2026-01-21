// Product Types
export interface Product {
    id: string;
    name: string;
    brand: string;
    category: string;
    imageUrl: string;
    bottomLine: string;

    // Tadow Score
    tadowScore: number;
    scoreBreakdown: ScoreBreakdown;

    // Technical Specs
    specs: ProductSpecs;

    // AI Analysis
    idealPersonas: string[];
    strengthsSummary: string;
    weaknessesSummary: string;
    userReviewSummary: string;

    // Pricing
    prices: Price[];
}

export interface ScoreBreakdown {
    performance: number;
    display: number;
    battery: number;
    value: number;
    buildQuality: number;
}

export interface ProductSpecs {
    cpu: string;
    gpu: string;
    ram: string;
    storage: string;
    display: string;
    displayResolution: string;
    weight: string;
    batteryLife: string;
}

export interface Price {
    id: string;
    retailer: string;
    price: number;
    url: string;
    inStock: boolean;
}

// User & Questionnaire Types
export interface UserProfile {
    persona: Persona;
    answers: QuestionnaireAnswers;
}

export type Persona =
    | 'Digital Nomad'
    | 'Creative Professional'
    | 'Competitive Gamer'
    | 'Business Traveler'
    | 'Versatile Student'
    | 'Power User'
    | 'Tinkerer';

export interface QuestionnaireAnswers {
    primaryUse: 'work' | 'gaming' | 'school' | 'travel' | 'creative';
    budget: 'under-800' | '800-1200' | '1200-2000' | 'over-2000';
    priority: 'portability' | 'performance' | 'battery' | 'display';
    importance: 'weight' | 'build-quality' | 'upgradeability' | 'screen-size';
}

// Chat Types
export interface ChatMessage {
    id: string;
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
    options?: ChatOption[];
}

export interface ChatOption {
    id: string;
    label: string;
    value: string;
    icon?: string;
}

// Question Flow Types
export interface Question {
    id: string;
    text: string;
    key: keyof QuestionnaireAnswers;
    options: ChatOption[];
}

// API Response Types
export interface RecommendationResponse {
    persona: Persona;
    personaDescription: string;
    recommendations: Product[];
}
