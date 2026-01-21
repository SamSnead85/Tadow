import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { TadowScore } from '@/components/ProductDNA';
import { mockProducts } from '@/data/products';
import type { Product } from '@/types';

type SortOption = 'score' | 'price-low' | 'price-high' | 'name';

export function BrowsePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('score');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');

    useEffect(() => {
        // Load products (using mock data, could use API)
        setProducts(mockProducts);
    }, []);

    // Get unique brands
    const brands = ['all', ...new Set(products.map(p => p.brand))];

    // Filter and sort products
    const filteredProducts = products
        .filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.bottomLine.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBrand = selectedBrand === 'all' || p.brand === selectedBrand;
            return matchesSearch && matchesBrand;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'score':
                    return b.tadowScore - a.tadowScore;
                case 'price-low':
                    return Math.min(...a.prices.map(p => p.price)) - Math.min(...b.prices.map(p => p.price));
                case 'price-high':
                    return Math.min(...b.prices.map(p => p.price)) - Math.min(...a.prices.map(p => p.price));
                case 'name':
                    return a.name.localeCompare(b.name);
                default:
                    return 0;
            }
        });

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-noir-50">
            {/* Hero Section */}
            <section className="py-16 border-b border-noir-100">
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-2xl mx-auto mb-12"
                    >
                        <h1 className="text-display mb-4 text-noir-900">Browse All Laptops</h1>
                        <p className="text-lg text-noir-600">
                            Explore our curated selection of laptops with transparent Tadow Scores
                        </p>
                    </motion.div>

                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-400" />
                            <input
                                type="text"
                                placeholder="Search laptops..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input-field pl-12"
                            />
                        </div>

                        {/* Brand Filter */}
                        <div className="relative">
                            <SlidersHorizontal className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-400" />
                            <select
                                value={selectedBrand}
                                onChange={(e) => setSelectedBrand(e.target.value)}
                                className="input-field pl-12 pr-10 appearance-none cursor-pointer min-w-[160px]"
                            >
                                {brands.map(brand => (
                                    <option key={brand} value={brand}>
                                        {brand === 'all' ? 'All Brands' : brand}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Sort */}
                        <div className="relative">
                            <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-400" />
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="input-field pl-12 pr-10 appearance-none cursor-pointer min-w-[180px]"
                            >
                                <option value="score">Highest Score</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                                <option value="name">Name A-Z</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            {/* Products Grid */}
            <section className="section-padding">
                <div className="container-wide">
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-noir-600">
                            Showing <span className="font-semibold text-noir-900">{filteredProducts.length}</span> laptops
                        </p>
                    </div>

                    {filteredProducts.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-noir-500 text-lg">No laptops match your search criteria.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedBrand('all'); }}
                                className="btn-secondary mt-4"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link to={`/product/${product.id}`} className="block">
                                        <div className="product-card h-full flex flex-col">
                                            {/* Product Image */}
                                            <div className="aspect-video rounded-lg bg-noir-100 overflow-hidden mb-4">
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                                />
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between gap-4 mb-3">
                                                    <div>
                                                        <p className="text-sm text-noir-500">{product.brand}</p>
                                                        <h3 className="font-semibold text-noir-900">{product.name}</h3>
                                                    </div>
                                                    <TadowScore
                                                        score={product.tadowScore}
                                                        breakdown={product.scoreBreakdown}
                                                        size="sm"
                                                    />
                                                </div>

                                                <p className="text-noir-600 text-sm mb-4 line-clamp-2">
                                                    {product.bottomLine}
                                                </p>

                                                {/* Persona Tags */}
                                                <div className="flex flex-wrap gap-1.5 mb-4">
                                                    {product.idealPersonas.slice(0, 2).map((persona) => (
                                                        <span
                                                            key={persona}
                                                            className="text-xs px-2 py-1 rounded-full bg-noir-100 text-noir-600"
                                                        >
                                                            {persona}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Footer */}
                                            <div className="pt-4 border-t border-noir-100">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs text-noir-500">Starting from</p>
                                                        <p className="font-display font-bold text-noir-900">
                                                            ${Math.min(...product.prices.map(p => p.price)).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <span className="text-tadow-600 font-medium text-sm">
                                                        View Details →
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
