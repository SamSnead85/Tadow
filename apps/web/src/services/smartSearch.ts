/**
 * AI-Powered Smart Search Service
 * Provides semantic understanding of search queries with:
 * - Brand → Category inference (e.g., "MacBook" → "Computers & Laptops")
 * - Synonym expansion (e.g., "phone" also matches "smartphone", "iPhone", "Galaxy")
 * - Typo tolerance and fuzzy matching
 * - Related category suggestions
 */

// Brand to category mappings
const BRAND_CATEGORY_MAP: Record<string, string[]> = {
    // Apple
    'macbook': ['Computers & Laptops', 'Apple'],
    'macbook pro': ['Computers & Laptops', 'Apple'],
    'macbook air': ['Computers & Laptops', 'Apple'],
    'imac': ['Computers & Laptops', 'Apple'],
    'mac mini': ['Computers & Laptops', 'Apple'],
    'mac studio': ['Computers & Laptops', 'Apple'],
    'iphone': ['Electronics', 'Smartphones', 'Apple'],
    'ipad': ['Electronics', 'Tablets', 'Apple'],
    'apple watch': ['Wearables', 'Apple'],
    'airpods': ['Audio & Headphones', 'Apple'],
    'homepod': ['Smart Home', 'Apple'],

    // Windows/PC
    'thinkpad': ['Computers & Laptops', 'Lenovo'],
    'surface': ['Computers & Laptops', 'Microsoft'],
    'dell xps': ['Computers & Laptops', 'Dell'],
    'hp spectre': ['Computers & Laptops', 'HP'],
    'asus rog': ['Computers & Laptops', 'Gaming'],
    'razer': ['Computers & Laptops', 'Gaming'],

    // Samsung
    'galaxy': ['Electronics', 'Smartphones', 'Samsung'],
    'galaxy tab': ['Electronics', 'Tablets', 'Samsung'],
    'galaxy watch': ['Wearables', 'Samsung'],
    'galaxy buds': ['Audio & Headphones', 'Samsung'],

    // Gaming
    'playstation': ['Gaming', 'Sony'],
    'ps5': ['Gaming', 'Sony'],
    'xbox': ['Gaming', 'Microsoft'],
    'nintendo': ['Gaming', 'Nintendo'],
    'switch': ['Gaming', 'Nintendo'],
    'steam deck': ['Gaming', 'Valve'],

    // Audio
    'sony wh': ['Audio & Headphones', 'Sony'],
    'bose': ['Audio & Headphones', 'Bose'],
    'beats': ['Audio & Headphones', 'Apple'],
    'sennheiser': ['Audio & Headphones', 'Sennheiser'],

    // Cameras
    'canon': ['Cameras & Photo', 'Canon'],
    'nikon': ['Cameras & Photo', 'Nikon'],
    'sony alpha': ['Cameras & Photo', 'Sony'],
    'fujifilm': ['Cameras & Photo', 'Fujifilm'],
    'gopro': ['Cameras & Photo', 'GoPro'],
    'dji': ['Cameras & Photo', 'DJI', 'Drones'],
};

// Synonym expansions for common terms
const SYNONYMS: Record<string, string[]> = {
    'laptop': ['notebook', 'macbook', 'thinkpad', 'chromebook', 'ultrabook'],
    'phone': ['smartphone', 'iphone', 'galaxy', 'pixel', 'mobile'],
    'tablet': ['ipad', 'galaxy tab', 'surface pro'],
    'headphones': ['earbuds', 'airpods', 'earphones', 'headset'],
    'watch': ['smartwatch', 'apple watch', 'galaxy watch', 'fitbit'],
    'tv': ['television', 'smart tv', 'oled', 'qled'],
    'computer': ['pc', 'desktop', 'laptop', 'workstation'],
    'camera': ['dslr', 'mirrorless', 'point and shoot'],
    'speaker': ['bluetooth speaker', 'soundbar', 'home audio'],
    'gaming': ['game', 'console', 'playstation', 'xbox', 'nintendo'],
};

// Category keywords
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    'Computers & Laptops': ['laptop', 'computer', 'pc', 'desktop', 'notebook', 'macbook', 'chromebook'],
    'Electronics': ['phone', 'smartphone', 'tablet', 'gadget', 'device'],
    'Gaming': ['game', 'console', 'controller', 'gaming', 'playstation', 'xbox', 'nintendo'],
    'Audio & Headphones': ['headphones', 'earbuds', 'speaker', 'audio', 'music', 'sound'],
    'Cameras & Photo': ['camera', 'photo', 'lens', 'dslr', 'mirrorless', 'video'],
    'Wearables': ['watch', 'smartwatch', 'fitness', 'tracker', 'wearable'],
    'Smart Home': ['smart home', 'alexa', 'google home', 'nest', 'ring', 'automation'],
};

export interface SmartSearchResult {
    originalQuery: string;
    normalizedQuery: string;
    inferredCategories: string[];
    inferredBrand?: string;
    expandedTerms: string[];
    suggestions: string[];
    confidence: number;
}

/**
 * Analyzes a search query and returns semantic insights
 */
export function analyzeSearchQuery(query: string): SmartSearchResult {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);

    let inferredCategories: string[] = [];
    let inferredBrand: string | undefined;
    let expandedTerms: string[] = [normalizedQuery];
    let confidence = 50;

    // Check for brand matches
    for (const [brand, categories] of Object.entries(BRAND_CATEGORY_MAP)) {
        if (normalizedQuery.includes(brand) || words.some(w => brand.includes(w) && w.length > 2)) {
            inferredCategories = [...new Set([...inferredCategories, ...categories])];
            inferredBrand = categories[categories.length - 1]; // Last item is usually the brand
            confidence = Math.min(confidence + 25, 95);
        }
    }

    // Check for synonym expansions
    for (const [term, synonyms] of Object.entries(SYNONYMS)) {
        if (normalizedQuery.includes(term) || synonyms.some(s => normalizedQuery.includes(s))) {
            expandedTerms = [...new Set([...expandedTerms, term, ...synonyms])];
            confidence = Math.min(confidence + 10, 95);
        }
    }

    // Check for category keywords
    if (inferredCategories.length === 0) {
        for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
            if (keywords.some(k => normalizedQuery.includes(k))) {
                inferredCategories.push(category);
                confidence = Math.min(confidence + 15, 90);
            }
        }
    }

    // Generate suggestions
    const suggestions = generateSuggestions(normalizedQuery, inferredCategories);

    return {
        originalQuery: query,
        normalizedQuery,
        inferredCategories,
        inferredBrand,
        expandedTerms,
        suggestions,
        confidence,
    };
}

/**
 * Generates smart search suggestions based on query and categories
 */
function generateSuggestions(query: string, categories: string[]): string[] {
    const suggestions: string[] = [];

    if (categories.includes('Computers & Laptops')) {
        suggestions.push(`${query} under $1000`, `${query} M3`, `${query} 16 inch`);
    }
    if (categories.includes('Electronics')) {
        suggestions.push(`${query} unlocked`, `${query} 256GB`, `${query} Pro Max`);
    }
    if (categories.includes('Gaming')) {
        suggestions.push(`${query} bundle`, `${query} with controller`);
    }

    return suggestions.slice(0, 5);
}

/**
 * Fuzzy match score between two strings (0-1)
 */
export function fuzzyMatch(str1: string, str2: string): number {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1 === s2) return 1;
    if (s1.includes(s2) || s2.includes(s1)) return 0.9;

    // Levenshtein distance-based scoring
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    const longerLength = longer.length;

    if (longerLength === 0) return 1;

    const distance = levenshteinDistance(longer, shorter);
    return (longerLength - distance) / longerLength;
}

function levenshteinDistance(s1: string, s2: string): number {
    const costs: number[] = [];
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i === 0) {
                costs[j] = j;
            } else if (j > 0) {
                let newValue = costs[j - 1];
                if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
                    newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                }
                costs[j - 1] = lastValue;
                lastValue = newValue;
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
}

/**
 * Get related search terms for autocomplete
 */
export function getAutocompleteSuggestions(partial: string): string[] {
    const p = partial.toLowerCase();
    const suggestions: string[] = [];

    // Check brands
    for (const brand of Object.keys(BRAND_CATEGORY_MAP)) {
        if (brand.startsWith(p) || fuzzyMatch(brand, p) > 0.6) {
            suggestions.push(brand);
        }
    }

    // Check synonyms
    for (const [term, syns] of Object.entries(SYNONYMS)) {
        if (term.startsWith(p)) suggestions.push(term);
        syns.forEach(s => { if (s.startsWith(p)) suggestions.push(s); });
    }

    return [...new Set(suggestions)].slice(0, 8);
}
