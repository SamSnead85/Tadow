const API_BASE = '/api';

/**
 * Fetch all products from the API
 */
export async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error('Failed to fetch products');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to mock data if API is unavailable
        const { mockProducts } = await import('@/data/products');
        return mockProducts;
    }
}

/**
 * Fetch a single product by ID
 */
export async function fetchProduct(id: string) {
    try {
        const response = await fetch(`${API_BASE}/products/${id}`);
        if (!response.ok) throw new Error('Failed to fetch product');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to mock data
        const { getProductById } = await import('@/data/products');
        return getProductById(id);
    }
}

/**
 * Get personalized recommendations based on questionnaire answers
 */
export async function fetchRecommendations(answers: {
    primaryUse: string;
    budget: string;
    priority: string;
    importance: string;
}) {
    try {
        const response = await fetch(`${API_BASE}/recommendations`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(answers),
        });
        if (!response.ok) throw new Error('Failed to fetch recommendations');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to local recommendation logic
        const { getRecommendations } = await import('@/data/products');
        const { determinePersona } = await import('@/utils/recommendations');
        const { personaDescriptions } = await import('@/components/VerityAssistant/questions');

        const persona = determinePersona(answers as any);
        const recommendations = getRecommendations(persona);
        const personaInfo = personaDescriptions[persona];

        return {
            persona,
            personaName: personaInfo?.name || persona,
            personaDescription: personaInfo?.description || '',
            personaEmoji: personaInfo?.emoji || '👤',
            recommendations,
        };
    }
}

/**
 * Fetch prices for a specific product
 */
export async function fetchPrices(productId: string) {
    try {
        const response = await fetch(`${API_BASE}/prices/${productId}`);
        if (!response.ok) throw new Error('Failed to fetch prices');
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        // Fallback to product's embedded prices
        const product = await fetchProduct(productId);
        return product?.prices || [];
    }
}
