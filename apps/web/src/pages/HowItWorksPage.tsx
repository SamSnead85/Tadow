import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    MessageSquare,
    UserCheck,
    BarChart3,
    ShoppingCart,
    Shield,
    Sparkles,
    TrendingUp,
    Heart
} from 'lucide-react';

const steps = [
    {
        icon: MessageSquare,
        title: 'Tell Us About You',
        description: 'Answer a few quick questions about how you plan to use your laptop, your budget, and what matters most to you.',
        color: 'bg-blue-100 text-blue-600',
    },
    {
        icon: UserCheck,
        title: 'Get Your Persona',
        description: 'Our AI analyzes your answers and matches you to one of 7 user personas, like "The Digital Nomad" or "The Creative Professional".',
        color: 'bg-purple-100 text-purple-600',
    },
    {
        icon: BarChart3,
        title: 'See Personalized Matches',
        description: 'View laptops ranked by how well they match your needs, with transparent Verity Scores showing exactly why each product earned its rating.',
        color: 'bg-green-100 text-green-600',
    },
    {
        icon: ShoppingCart,
        title: 'Buy With Confidence',
        description: 'Compare prices across retailers, find the best deal, and purchase knowing you made an informed decision.',
        color: 'bg-amber-100 text-amber-600',
    },
];

const scoreFactors = [
    {
        name: 'Expert Analysis',
        weight: '30%',
        description: 'Aggregated scores from trusted sources like RTINGS, Wirecutter, and Notebookcheck.',
    },
    {
        name: 'Long-Term Durability',
        weight: '25%',
        description: 'AI-powered analysis of 6+ month user reviews to identify recurring issues.',
    },
    {
        name: 'Value for Money',
        weight: '20%',
        description: 'Performance-to-price ratio compared to similar products in the category.',
    },
    {
        name: 'User Satisfaction',
        weight: '15%',
        description: 'Average rating across verified purchases from multiple retailers.',
    },
    {
        name: 'Brand Support',
        weight: '10%',
        description: 'Manufacturer track record for warranty, repairs, and customer service.',
    },
];

export function HowItWorksPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-noir-50">
            {/* Hero */}
            <section className="section-padding border-b border-noir-100">
                <div className="container-wide text-center max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-verity-50 text-verity-700 rounded-full mb-6">
                            <Shield className="w-4 h-4" />
                            <span className="text-sm font-medium">100% Unbiased</span>
                        </div>
                        <h1 className="text-display mb-6 text-noir-900">
                            How Verity Works
                        </h1>
                        <p className="text-lg text-noir-600 leading-relaxed">
                            We're not like other product review sites. No ads, no sponsored content,
                            no pay-to-play rankings. Just honest, data-driven recommendations
                            personalized to your needs.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Process Steps */}
            <section className="section-padding">
                <div className="container-wide">
                    <div className="text-center mb-16">
                        <h2 className="text-display-sm text-noir-900 mb-4">Your Journey to the Perfect Laptop</h2>
                        <p className="text-noir-600 max-w-2xl mx-auto">
                            In just 4 simple steps, go from "I need a new laptop" to "This is exactly right for me."
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <motion.div
                                key={step.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                viewport={{ once: true }}
                                className="relative"
                            >
                                {/* Connector Line */}
                                {index < steps.length - 1 && (
                                    <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-noir-200" />
                                )}

                                <div className="glass-card rounded-xl p-6 h-full">
                                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <div className="text-sm text-verity-600 font-medium mb-2">Step {index + 1}</div>
                                    <h3 className="font-semibold text-noir-900 mb-2">{step.title}</h3>
                                    <p className="text-noir-600 text-sm">{step.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Verity Score Explanation */}
            <section className="section-padding bg-noir-900 text-white">
                <div className="container-wide">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-verity-600/20 text-verity-400 rounded-full mb-6">
                                <Sparkles className="w-4 h-4" />
                                <span className="text-sm font-medium">The Verity Score</span>
                            </div>
                            <h2 className="text-display-sm mb-6">
                                A New Standard of Trust
                            </h2>
                            <p className="text-noir-300 mb-8 leading-relaxed">
                                The Verity Score is a transparent 1-100 rating that combines multiple
                                data sources into one trustworthy number. Unlike star ratings that can
                                be manipulated, our score is calculated from verified expert reviews,
                                long-term user feedback, and objective value analysis.
                            </p>
                            <p className="text-noir-400 text-sm">
                                Hover over any Verity Score to see exactly how it was calculated.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="bg-noir-800/50 rounded-2xl p-8"
                        >
                            <h3 className="font-semibold mb-6">Score Breakdown</h3>
                            <div className="space-y-4">
                                {scoreFactors.map((factor, index) => (
                                    <motion.div
                                        key={factor.name}
                                        initial={{ opacity: 0, x: 20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        viewport={{ once: true }}
                                        className="flex gap-4"
                                    >
                                        <div className="flex-shrink-0 w-14 h-8 bg-verity-600 rounded flex items-center justify-center">
                                            <span className="text-sm font-bold">{factor.weight}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-white">{factor.name}</h4>
                                            <p className="text-noir-400 text-sm">{factor.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Trust Badges */}
            <section className="section-padding">
                <div className="container-wide text-center">
                    <h2 className="text-display-sm text-noir-900 mb-12">Why Trust Verity?</h2>

                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="glass-card rounded-xl p-8"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="font-semibold text-noir-900 mb-2">No Paid Placements</h3>
                            <p className="text-noir-600 text-sm">
                                Companies cannot pay to rank higher. Our recommendations are based purely on merit.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            viewport={{ once: true }}
                            className="glass-card rounded-xl p-8"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center mx-auto mb-4">
                                <TrendingUp className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="font-semibold text-noir-900 mb-2">Data-Driven</h3>
                            <p className="text-noir-600 text-sm">
                                Every score is calculated from real data, not subjective opinions or gut feelings.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            viewport={{ once: true }}
                            className="glass-card rounded-xl p-8"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                                <Heart className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="font-semibold text-noir-900 mb-2">User-First</h3>
                            <p className="text-noir-600 text-sm">
                                We make money through affiliate links only when you find a product you love.
                            </p>
                        </motion.div>
                    </div>

                    <Link to="/" className="btn-primary">
                        Start Finding Your Perfect Laptop
                    </Link>
                </div>
            </section>
        </div>
    );
}
