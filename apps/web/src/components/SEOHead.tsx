import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    price?: number;
    currency?: string;
    availability?: 'in stock' | 'out of stock';
    brand?: string;
    category?: string;
}

export function SEOHead({
    title = 'Tadow.ai - AI-Powered Deal Intelligence',
    description = 'Find the best deals with AI-powered price predictions, real-time alerts, and smart recommendations. Save money on electronics, tech, and more.',
    keywords = 'deals, discounts, price drop, AI shopping, tech deals, electronics, price tracking, coupon, savings',
    image = 'https://tadow.ai/og-image.png',
    url = 'https://tadow.ai',
    type = 'website',
    price,
    currency = 'USD',
    availability,
    brand,
    category,
}: SEOHeadProps) {
    const fullTitle = title.includes('Tadow') ? title : `${title} | Tadow.ai`;

    // Generate structured data
    const structuredData: any = {
        '@context': 'https://schema.org',
        '@type': type === 'product' ? 'Product' : 'WebSite',
        name: title,
        description,
        url,
    };

    if (type === 'product' && price) {
        structuredData.offers = {
            '@type': 'Offer',
            price,
            priceCurrency: currency,
            availability: availability === 'in stock'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/OutOfStock',
        };
        if (brand) structuredData.brand = { '@type': 'Brand', name: brand };
        if (category) structuredData.category = category;
    }

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{fullTitle}</title>
            <meta name="title" content={fullTitle} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={url} />
            <meta property="twitter:title" content={fullTitle} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={image} />

            {/* Product-specific */}
            {price && <meta property="product:price:amount" content={String(price)} />}
            {price && <meta property="product:price:currency" content={currency} />}

            {/* Structured Data */}
            <script type="application/ld+json">
                {JSON.stringify(structuredData)}
            </script>

            {/* Canonical */}
            <link rel="canonical" href={url} />
        </Helmet>
    );
}

// Category SEO pages factory
export function generateCategorySEO(category: string, dealCount: number) {
    return {
        title: `Best ${category} Deals - Up to 70% Off Today`,
        description: `Find ${dealCount}+ verified ${category.toLowerCase()} deals. AI-powered price tracking, all-time low alerts, and expert recommendations. Updated every 15 minutes.`,
        keywords: `${category.toLowerCase()} deals, ${category.toLowerCase()} discounts, best ${category.toLowerCase()} prices, ${category.toLowerCase()} sale, cheap ${category.toLowerCase()}`,
    };
}

// Deal SEO
export function generateDealSEO(deal: { title: string; currentPrice: number; discountPercent: number; brand: string; category: string }) {
    return {
        title: `${deal.title} - ${deal.discountPercent}% Off - $${deal.currentPrice}`,
        description: `Save ${deal.discountPercent}% on ${deal.title}. Now only $${deal.currentPrice}. Verified price, in stock, free shipping available. Best ${deal.brand} deal today.`,
        keywords: `${deal.title}, ${deal.brand} deal, ${deal.category} sale, ${deal.brand} discount`,
        type: 'product' as const,
        price: deal.currentPrice,
        brand: deal.brand,
        category: deal.category,
        availability: 'in stock' as const,
    };
}

export default SEOHead;
