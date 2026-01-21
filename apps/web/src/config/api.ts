// API configuration
// In development, Vite proxies /api to localhost:3456
// In production, we use the deployed API URL or fall back to relative paths

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const apiConfig = {
    baseUrl: API_BASE_URL,
    endpoints: {
        deals: `${API_BASE_URL}/api/deals`,
        hotDeals: `${API_BASE_URL}/api/deals/hot`,
        featuredDeals: `${API_BASE_URL}/api/deals/featured`,
        searchDeals: `${API_BASE_URL}/api/deals/search`,
        deal: (id: string) => `${API_BASE_URL}/api/deals/${id}`,
        marketplaces: `${API_BASE_URL}/api/marketplaces`,
        categories: `${API_BASE_URL}/api/categories`,
        health: `${API_BASE_URL}/api/health`,
    }
};

// Helper for API calls with error handling
export async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('API fetch error:', error);
        throw error;
    }
}

export default apiConfig;
