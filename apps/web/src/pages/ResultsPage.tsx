import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import { VerityScore } from '@/components/ProductDNA';
import { personaDescriptions } from '@/components/VerityAssistant';
import { getRecommendations } from '@/data/products';
import type { Persona } from '@/types';

export function ResultsPage() {
    const location = useLocation();
    const { persona } = (location.state as { persona: Persona }) || { persona: 'Versatile Student' };

    const personaInfo = personaDescriptions[persona];
    const recommendations = getRecommendations(persona);

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-noir-50">
            {/* Hero Section */}
            <section className="section-padding border-b border-noir-100">
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        {/* Persona Badge */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="persona-badge mb-6 inline-flex"
                        >
                            <span className="text-lg">{personaInfo?.emoji}</span>
                            <span>{personaInfo?.name || persona}</span>
                        </motion.div>

                        <h1 className="text-display mb-6 text-noir-900">
                            Your Perfect Matches
                        </h1>

                        <p className="text-lg text-noir-600 leading-relaxed">
                            {personaInfo?.description || 'Based on your preferences, we have found the best laptops for you.'}
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Recommendations Grid */}
            <section className="section-padding">
                <div className="container-wide">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-verity-600" />
                            <h2 className="text-xl font-semibold text-noir-900">
                                Top {recommendations.length} Recommendations
                            </h2>
                        </div>
                        <p className="text-sm text-noir-500">
                            Sorted by Verity Score
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((product, index) => (
                            <motion.div
                                key={product.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 + index * 0.1 }}
                            >
                                <Link to={`/product/${product.id}`} className="block">
                                    <div className="product-card h-full flex flex-col">
                                        {/* Rank Badge */}
                                        <div className="absolute -top-2 -left-2 w-8 h-8 rounded-full bg-verity-600 text-white flex items-center justify-center font-bold text-sm shadow-lg">
                                            #{index + 1}
                                        </div>

                                        {/* Product Image */}
                                        <div className="aspect-video rounded-lg bg-noir-100 overflow-hidden mb-4">
                                            <img
                                                src={product.imageUrl}
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-start justify-between gap-4 mb-3">
                                                <div>
                                                    <p className="text-sm text-noir-500">{product.brand}</p>
                                                    <h3 className="font-semibold text-noir-900">{product.name}</h3>
                                                </div>
                                                <VerityScore
                                                    score={product.verityScore}
                                                    breakdown={product.scoreBreakdown}
                                                    size="sm"
                                                />
                                            </div>

                                            <p className="text-noir-600 text-sm mb-4 line-clamp-2">
                                                {product.bottomLine}
                                            </p>

                                            {/* Persona Match */}
                                            <div className="flex flex-wrap gap-1.5 mb-4">
                                                {product.idealPersonas.slice(0, 2).map((p) => (
                                                    <span
                                                        key={p}
                                                        className={`text-xs px-2 py-1 rounded-full ${p === persona
                                                                ? 'bg-verity-100 text-verity-700'
                                                                : 'bg-noir-100 text-noir-600'
                                                            }`}
                                                    >
                                                        {p}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price & CTA */}
                                        <div className="flex items-center justify-between pt-4 border-t border-noir-100">
                                            <div>
                                                <p className="text-xs text-noir-500">Starting from</p>
                                                <p className="font-display font-bold text-noir-900">
                                                    ${Math.min(...product.prices.map(p => p.price)).toLocaleString()}
                                                </p>
                                            </div>
                                            <span className="btn-ghost text-sm flex items-center gap-1">
                                                View Details
                                                <ArrowRight className="w-4 h-4" />
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Explore All */}
            <section className="pb-16">
                <div className="container-wide text-center">
                    <Link to="/" className="btn-secondary">
                        Start New Search
                    </Link>
                </div>
            </section>
        </div>
    );
}
