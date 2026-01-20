import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Share2, Heart } from 'lucide-react';
import { VerityScore, StrengthsWeaknesses, ReviewSummary, TechSpecs } from '@/components/ProductDNA';
import { PriceTable } from '@/components/PriceEngine';
import { getProductById } from '@/data/products';

export function ProductPage() {
    const { id } = useParams<{ id: string }>();
    const product = getProductById(id || '');

    if (!product) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold text-noir-900 mb-4">Product Not Found</h1>
                    <Link to="/" className="btn-primary">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-noir-50">
            {/* Breadcrumb */}
            <div className="border-b border-noir-100 bg-white/80 backdrop-blur-sm sticky top-16 z-40">
                <div className="container-wide py-4">
                    <Link to="/" className="inline-flex items-center gap-2 text-noir-600 hover:text-noir-900 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        <span className="text-sm">Back to recommendations</span>
                    </Link>
                </div>
            </div>

            {/* Hero Section */}
            <section className="section-padding border-b border-noir-100">
                <div className="container-wide">
                    <div className="grid lg:grid-cols-2 gap-12 items-start">
                        {/* Product Image */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="aspect-video rounded-2xl bg-noir-100 overflow-hidden shadow-glass-lg"
                        >
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </motion.div>

                        {/* Product Info */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                        >
                            {/* Brand & Title */}
                            <div>
                                <p className="text-verity-600 font-medium mb-2">{product.brand}</p>
                                <h1 className="text-display-sm text-noir-900 mb-4">{product.name}</h1>

                                {/* Bottom Line */}
                                <div className="glass-card rounded-xl p-4 border-l-4 border-verity-600">
                                    <p className="text-sm text-noir-500 mb-1">The Bottom Line</p>
                                    <p className="text-noir-800 font-medium">{product.bottomLine}</p>
                                </div>
                            </div>

                            {/* Verity Score */}
                            <div className="flex items-center gap-6">
                                <VerityScore
                                    score={product.verityScore}
                                    breakdown={product.scoreBreakdown}
                                    size="lg"
                                />
                                <div>
                                    <p className="text-sm text-noir-500 mb-1">Verity Score</p>
                                    <p className="text-noir-700 text-sm max-w-xs">
                                        Based on expert analysis, user reviews, and value assessment.
                                        <button className="text-verity-600 ml-1 hover:underline">
                                            Learn more
                                        </button>
                                    </p>
                                </div>
                            </div>

                            {/* Persona Badges */}
                            <div>
                                <p className="text-sm text-noir-500 mb-2">Best for</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.idealPersonas.map((persona) => (
                                        <span key={persona} className="persona-badge">
                                            {persona}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 pt-4">
                                <button className="btn-ghost">
                                    <Heart className="w-4 h-4" />
                                    Save
                                </button>
                                <button className="btn-ghost">
                                    <Share2 className="w-4 h-4" />
                                    Share
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Content Sections */}
            <section className="section-padding">
                <div className="container-wide space-y-8">
                    {/* Strengths & Weaknesses */}
                    <StrengthsWeaknesses
                        strengths={product.strengthsSummary}
                        weaknesses={product.weaknessesSummary}
                    />

                    {/* User Reviews */}
                    <ReviewSummary summary={product.userReviewSummary} />

                    {/* Technical Specs */}
                    <TechSpecs specs={product.specs} />

                    {/* Price Comparison */}
                    <PriceTable prices={product.prices} productName={product.name} />
                </div>
            </section>
        </div>
    );
}
