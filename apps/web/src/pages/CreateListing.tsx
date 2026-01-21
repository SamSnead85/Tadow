import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft, ArrowRight, Upload, X, Check,
    AlertCircle, Truck
} from 'lucide-react';
import { Listing, ListingCondition, PricingType, ShippingType } from '../types/marketplace';
import { getCurrentUser, saveListing, verifyListing } from '../services/userVerification';

type Step = 'category' | 'details' | 'photos' | 'pricing' | 'shipping' | 'review';

const CATEGORIES = [
    { id: 'electronics', name: 'Electronics', icon: '📱' },
    { id: 'computers', name: 'Computers & Laptops', icon: '💻' },
    { id: 'gaming', name: 'Gaming', icon: '🎮' },
    { id: 'audio', name: 'Audio & Headphones', icon: '🎧' },
    { id: 'cameras', name: 'Cameras & Photo', icon: '📷' },
    { id: 'wearables', name: 'Wearables', icon: '⌚' },
    { id: 'home', name: 'Smart Home', icon: '🏠' },
    { id: 'other', name: 'Other', icon: '📦' },
];

const CONDITIONS: { value: ListingCondition; label: string; description: string }[] = [
    { value: 'new', label: 'New', description: 'Brand new, sealed in box' },
    { value: 'like_new', label: 'Like New', description: 'Opened but never used' },
    { value: 'excellent', label: 'Excellent', description: 'Minimal wear, works perfectly' },
    { value: 'good', label: 'Good', description: 'Normal wear, fully functional' },
    { value: 'fair', label: 'Fair', description: 'Visible wear, works fine' },
    { value: 'parts', label: 'For Parts', description: 'Not fully functional' },
];

export default function CreateListing() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('category');
    const [listing, setListing] = useState<Partial<Listing>>({
        images: [],
        quantity: 1,
        status: 'draft',
        views: 0,
        saves: 0,
    });
    const [verificationResult, setVerificationResult] = useState<ReturnType<typeof verifyListing> | null>(null);

    const user = getCurrentUser();

    const steps: Step[] = ['category', 'details', 'photos', 'pricing', 'shipping', 'review'];
    const currentIndex = steps.indexOf(step);

    const handleNext = () => {
        const nextIndex = currentIndex + 1;
        if (nextIndex < steps.length) {
            setStep(steps[nextIndex]);
        }
    };

    const handleBack = () => {
        const prevIndex = currentIndex - 1;
        if (prevIndex >= 0) {
            setStep(steps[prevIndex]);
        }
    };

    const handlePublish = () => {
        if (!user) return;

        const verification = verifyListing(listing);
        setVerificationResult(verification);

        if (!verification.approved) return;

        const newListing: Listing = {
            ...listing as Listing,
            id: `listing-${Date.now()}`,
            sellerId: user.id,
            createdAt: new Date(),
            updatedAt: new Date(),
            status: 'active',
            aiVerification: {
                imageAuthenticity: verification.imageAuthenticity,
                priceReasonableness: verification.priceReasonableness,
                descriptionQuality: verification.descriptionQuality,
                overallScore: verification.overallScore,
                flags: verification.flags,
            },
        };

        saveListing(newListing);
        navigate('/sell');
    };

    const updateListing = (updates: Partial<Listing>) => {
        setListing(prev => ({ ...prev, ...updates }));
    };

    const addImage = (url: string) => {
        updateListing({ images: [...(listing.images || []), url] });
    };

    const removeImage = (index: number) => {
        const newImages = [...(listing.images || [])];
        newImages.splice(index, 1);
        updateListing({ images: newImages });
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="bg-zinc-900/50 border-b border-zinc-800">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <button onClick={() => navigate('/sell')} className="text-zinc-400 hover:text-white flex items-center gap-2">
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <span className="text-zinc-500 text-sm">
                            Step {currentIndex + 1} of {steps.length}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="flex gap-1">
                        {steps.map((s, i) => (
                            <div
                                key={s}
                                className={`h-1 flex-1 rounded-full transition-colors ${i <= currentIndex ? 'bg-amber-500' : 'bg-zinc-800'
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    {/* Category Step */}
                    {step === 'category' && (
                        <motion.div
                            key="category"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-2">What are you selling?</h2>
                            <p className="text-zinc-400 mb-6">Choose a category</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {CATEGORIES.map(cat => (
                                    <button
                                        key={cat.id}
                                        onClick={() => {
                                            updateListing({ category: cat.id });
                                            handleNext();
                                        }}
                                        className={`p-4 rounded-xl border transition-all text-left ${listing.category === cat.id
                                            ? 'border-amber-500 bg-amber-500/10'
                                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                            }`}
                                    >
                                        <span className="text-3xl mb-2 block">{cat.icon}</span>
                                        <span className="text-white font-medium">{cat.name}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Details Step */}
                    {step === 'details' && (
                        <motion.div
                            key="details"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Tell us about your item</h2>
                                <p className="text-zinc-400">Be specific to attract buyers</p>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={listing.title || ''}
                                    onChange={(e) => updateListing({ title: e.target.value })}
                                    placeholder="e.g., Apple MacBook Pro 14-inch M3 Pro 2024"
                                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Brand</label>
                                    <input
                                        type="text"
                                        value={listing.brand || ''}
                                        onChange={(e) => updateListing({ brand: e.target.value })}
                                        placeholder="Apple"
                                        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Model</label>
                                    <input
                                        type="text"
                                        value={listing.model || ''}
                                        onChange={(e) => updateListing({ model: e.target.value })}
                                        placeholder="MacBook Pro"
                                        className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Description *</label>
                                <textarea
                                    value={listing.description || ''}
                                    onChange={(e) => updateListing({ description: e.target.value })}
                                    placeholder="Describe your item in detail. Include specs, condition details, and any accessories included..."
                                    rows={5}
                                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Condition *</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {CONDITIONS.map(cond => (
                                        <button
                                            key={cond.value}
                                            onClick={() => updateListing({ condition: cond.value })}
                                            className={`p-3 rounded-lg border text-left transition-all ${listing.condition === cond.value
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                                }`}
                                        >
                                            <span className="text-white font-medium block">{cond.label}</span>
                                            <span className="text-zinc-500 text-xs">{cond.description}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Photos Step */}
                    {step === 'photos' && (
                        <motion.div
                            key="photos"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Add photos</h2>
                                <p className="text-zinc-400">Photos increase buyer trust. Add at least 3.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {(listing.images || []).map((img, i) => (
                                    <div key={i} className="relative aspect-square bg-zinc-900 rounded-lg overflow-hidden">
                                        <img src={img} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                                        <button
                                            onClick={() => removeImage(i)}
                                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full text-white"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}

                                {(listing.images || []).length < 10 && (
                                    <button
                                        onClick={() => {
                                            // Simulated upload - in production, use file picker
                                            const demoImages = [
                                                'https://images.unsplash.com/photo-1517336714731-489689fd1ca4?w=400',
                                                'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400',
                                                'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400',
                                            ];
                                            const nextImage = demoImages[(listing.images || []).length % demoImages.length];
                                            addImage(nextImage);
                                        }}
                                        className="aspect-square bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg flex flex-col items-center justify-center text-zinc-500 hover:border-amber-500 hover:text-amber-400 transition-colors"
                                    >
                                        <Upload className="w-8 h-8 mb-2" />
                                        <span className="text-sm">Add Photo</span>
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Pricing Step */}
                    {step === 'pricing' && (
                        <motion.div
                            key="pricing"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Set your price</h2>
                                <p className="text-zinc-400">Price competitively to sell faster</p>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Price *</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500 text-2xl">$</span>
                                    <input
                                        type="number"
                                        value={listing.price || ''}
                                        onChange={(e) => updateListing({ price: parseFloat(e.target.value) || 0 })}
                                        placeholder="0.00"
                                        className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white text-2xl focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Pricing Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {(['fixed', 'negotiable'] as PricingType[]).map(type => (
                                        <button
                                            key={type}
                                            onClick={() => updateListing({ pricingType: type })}
                                            className={`p-4 rounded-lg border transition-all ${listing.pricingType === type
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                                }`}
                                        >
                                            <span className="text-white font-medium">
                                                {type === 'fixed' ? 'Fixed Price' : 'Open to Offers'}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {listing.pricingType === 'negotiable' && (
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Minimum Offer (optional)</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-zinc-500">$</span>
                                        <input
                                            type="number"
                                            value={listing.minimumOffer || ''}
                                            onChange={(e) => updateListing({ minimumOffer: parseFloat(e.target.value) || undefined })}
                                            placeholder="Decline offers below this"
                                            className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-zinc-400 mb-2">Original Retail Price (optional)</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-zinc-500">$</span>
                                    <input
                                        type="number"
                                        value={listing.originalRetailPrice || ''}
                                        onChange={(e) => updateListing({ originalRetailPrice: parseFloat(e.target.value) || undefined })}
                                        placeholder="Show buyers the savings"
                                        className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Shipping Step */}
                    {step === 'shipping' && (
                        <motion.div
                            key="shipping"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Shipping options</h2>
                                <p className="text-zinc-400">How will buyers receive their item?</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {(['both', 'ship', 'local_only'] as ShippingType[]).map(type => (
                                    <button
                                        key={type}
                                        onClick={() => updateListing({
                                            shipping: {
                                                ...listing.shipping,
                                                type,
                                                localPickupOnly: type === 'local_only'
                                            }
                                        })}
                                        className={`p-4 rounded-lg border transition-all text-center ${listing.shipping?.type === type
                                            ? 'border-amber-500 bg-amber-500/10'
                                            : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                            }`}
                                    >
                                        <Truck className="w-6 h-6 mx-auto mb-2 text-zinc-400" />
                                        <span className="text-white font-medium block">
                                            {type === 'both' ? 'Ship & Local' : type === 'ship' ? 'Ship Only' : 'Local Pickup Only'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {listing.shipping?.type !== 'local_only' && (
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-2">Shipping Cost</label>
                                    <div className="flex items-center gap-2">
                                        <span className="text-zinc-500">$</span>
                                        <input
                                            type="number"
                                            value={listing.shipping?.cost || ''}
                                            onChange={(e) => updateListing({
                                                shipping: { ...listing.shipping!, cost: parseFloat(e.target.value) || 0 }
                                            })}
                                            placeholder="0 for free shipping"
                                            className="flex-1 p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                        />
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Review Step */}
                    {step === 'review' && (
                        <motion.div
                            key="review"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">Review your listing</h2>
                                <p className="text-zinc-400">Make sure everything looks good</p>
                            </div>

                            {/* Preview Card */}
                            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
                                {listing.images && listing.images.length > 0 && (
                                    <div className="aspect-video bg-zinc-800">
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2">{listing.title || 'Untitled'}</h3>
                                    <p className="text-3xl font-bold text-amber-400 mb-4">
                                        ${listing.price?.toLocaleString() || '0'}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">
                                            {listing.condition}
                                        </span>
                                        <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">
                                            {listing.category}
                                        </span>
                                        <span className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-400">
                                            {listing.pricingType === 'negotiable' ? 'Open to Offers' : 'Fixed Price'}
                                        </span>
                                    </div>
                                    <p className="text-zinc-400 text-sm">{listing.description}</p>
                                </div>
                            </div>

                            {/* AI Verification Results */}
                            {verificationResult && (
                                <div className={`p-4 rounded-xl border ${verificationResult.approved
                                    ? 'border-emerald-500/30 bg-emerald-500/10'
                                    : 'border-red-500/30 bg-red-500/10'
                                    }`}>
                                    <div className="flex items-start gap-3">
                                        {verificationResult.approved ? (
                                            <Check className="w-5 h-5 text-emerald-400 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
                                        )}
                                        <div>
                                            <h4 className="font-semibold text-white">
                                                {verificationResult.approved ? 'Ready to Publish' : 'Issues Found'}
                                            </h4>
                                            {verificationResult.flags.length > 0 && (
                                                <ul className="text-sm text-zinc-400 mt-2 space-y-1">
                                                    {verificationResult.flags.map((flag, i) => (
                                                        <li key={i}>• {flag}</li>
                                                    ))}
                                                </ul>
                                            )}
                                            {verificationResult.suggestions.length > 0 && (
                                                <div className="mt-2">
                                                    <p className="text-xs text-zinc-500 mb-1">Suggestions:</p>
                                                    <ul className="text-sm text-zinc-400 space-y-1">
                                                        {verificationResult.suggestions.map((sug, i) => (
                                                            <li key={i}>💡 {sug}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                    {currentIndex > 0 ? (
                        <button
                            onClick={handleBack}
                            className="px-6 py-3 text-zinc-400 hover:text-white flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                    ) : (
                        <div />
                    )}

                    {step === 'review' ? (
                        <button
                            onClick={handlePublish}
                            className="btn-primary px-8 py-3 flex items-center gap-2"
                        >
                            <Check className="w-5 h-5" />
                            Publish Listing
                        </button>
                    ) : step !== 'category' && (
                        <button
                            onClick={handleNext}
                            className="btn-primary px-6 py-3 flex items-center gap-2"
                        >
                            Continue
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
