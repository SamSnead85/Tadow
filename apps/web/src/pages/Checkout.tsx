import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft, CreditCard, Shield, Check, Lock,
    Truck
} from 'lucide-react';
import { getListingById, getCurrentUser } from '../services/userVerification';
import { calculateFees, createOrder, BUYER_PROTECTIONS } from '../services/escrow';

export default function Checkout() {
    const { listingId } = useParams<{ listingId: string }>();
    const navigate = useNavigate();
    const [step, setStep] = useState<'shipping' | 'payment' | 'confirm'>('shipping');
    const [paymentMethod, setPaymentMethod] = useState<string>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const listing = listingId ? getListingById(listingId) : null;
    const user = getCurrentUser();

    if (!listing) {
        return (
            <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-xl text-white mb-2">Listing not found</h1>
                    <button onClick={() => navigate(-1)} className="text-amber-400">Go back</button>
                </div>
            </div>
        );
    }

    const fees = calculateFees(listing.price, listing.shipping?.cost || 0);

    const handlePlaceOrder = async () => {
        if (!user) {
            navigate('/account');
            return;
        }

        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        const order = createOrder(listing, user, paymentMethod);

        setIsProcessing(false);
        navigate(`/order/${order.id}/success`);
    };

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            {/* Header */}
            <div className="bg-zinc-900/50 border-b border-zinc-800">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="text-zinc-400 hover:text-white flex items-center gap-2"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Back
                        </button>
                        <div className="flex items-center gap-2 text-emerald-400">
                            <Lock className="w-4 h-4" />
                            <span className="text-sm">Secure Checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Progress Steps */}
                        <div className="flex items-center gap-4 mb-8">
                            {(['shipping', 'payment', 'confirm'] as const).map((s, i) => (
                                <div key={s} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step === s
                                        ? 'bg-amber-500 text-zinc-900'
                                        : i < ['shipping', 'payment', 'confirm'].indexOf(step)
                                            ? 'bg-emerald-500 text-white'
                                            : 'bg-zinc-800 text-zinc-500'
                                        }`}>
                                        {i < ['shipping', 'payment', 'confirm'].indexOf(step) ? (
                                            <Check className="w-4 h-4" />
                                        ) : (
                                            i + 1
                                        )}
                                    </div>
                                    <span className={`text-sm ${step === s ? 'text-white' : 'text-zinc-500'}`}>
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </span>
                                    {i < 2 && <div className="w-8 h-0.5 bg-zinc-800" />}
                                </div>
                            ))}
                        </div>

                        {/* Shipping Step */}
                        {step === 'shipping' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold text-white">Shipping Address</h2>

                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">First Name</label>
                                            <input
                                                type="text"
                                                placeholder="John"
                                                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">Last Name</label>
                                            <input
                                                type="text"
                                                placeholder="Doe"
                                                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm text-zinc-400 mb-2">Street Address</label>
                                        <input
                                            type="text"
                                            placeholder="123 Main St"
                                            className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">City</label>
                                            <input
                                                type="text"
                                                placeholder="New York"
                                                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">State</label>
                                            <input
                                                type="text"
                                                placeholder="NY"
                                                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">ZIP Code</label>
                                            <input
                                                type="text"
                                                placeholder="10001"
                                                className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {listing.shipping?.type !== 'local_only' && (
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4">
                                        <div className="flex items-center gap-3">
                                            <Truck className="w-5 h-5 text-zinc-400" />
                                            <div>
                                                <p className="text-white font-medium">Standard Shipping</p>
                                                <p className="text-sm text-zinc-500">
                                                    Estimated delivery: 3-5 business days
                                                </p>
                                            </div>
                                            <span className="ml-auto text-amber-400 font-medium">
                                                {listing.shipping?.cost === 0 ? 'Free' : `$${listing.shipping?.cost}`}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={() => setStep('payment')}
                                    className="w-full btn-primary py-3"
                                >
                                    Continue to Payment
                                </button>
                            </motion.div>
                        )}

                        {/* Payment Step */}
                        {step === 'payment' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold text-white">Payment Method</h2>

                                <div className="space-y-3">
                                    {[
                                        { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
                                        { id: 'paypal', label: 'PayPal', icon: '🅿️' },
                                        { id: 'apple', label: 'Apple Pay', icon: '🍎' },
                                    ].map(method => (
                                        <button
                                            key={method.id}
                                            onClick={() => setPaymentMethod(method.id)}
                                            className={`w-full p-4 rounded-xl border text-left flex items-center gap-4 transition-all ${paymentMethod === method.id
                                                ? 'border-amber-500 bg-amber-500/10'
                                                : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'
                                                }`}
                                        >
                                            <span className="text-2xl">{method.icon}</span>
                                            <span className="text-white font-medium">{method.label}</span>
                                            {paymentMethod === method.id && (
                                                <Check className="w-5 h-5 text-amber-400 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-4">
                                        <div>
                                            <label className="block text-sm text-zinc-400 mb-2">Card Number</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="4242 4242 4242 4242"
                                                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none pr-12"
                                                />
                                                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-2">Expiry</label>
                                                <input
                                                    type="text"
                                                    placeholder="MM/YY"
                                                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-zinc-400 mb-2">CVC</label>
                                                <input
                                                    type="text"
                                                    placeholder="123"
                                                    className="w-full p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:border-amber-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep('shipping')}
                                        className="px-6 py-3 text-zinc-400 hover:text-white"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={() => setStep('confirm')}
                                        className="flex-1 btn-primary py-3"
                                    >
                                        Review Order
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Confirm Step */}
                        {step === 'confirm' && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="space-y-6"
                            >
                                <h2 className="text-xl font-bold text-white">Review Order</h2>

                                {/* Order Summary */}
                                <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
                                    <div className="flex gap-4 p-4">
                                        {listing.images?.[0] && (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                className="w-20 h-20 rounded-lg object-cover"
                                            />
                                        )}
                                        <div>
                                            <h3 className="font-medium text-white">{listing.title}</h3>
                                            <p className="text-sm text-zinc-500">{listing.condition}</p>
                                            <p className="text-amber-400 font-bold mt-1">${listing.price}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Buyer Protection */}
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Shield className="w-5 h-5 text-emerald-400" />
                                        <span className="font-medium text-emerald-400">Tadow Buyer Protection</span>
                                    </div>
                                    <p className="text-sm text-zinc-400">
                                        Your payment is protected. If something goes wrong, we'll make it right.
                                    </p>
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep('payment')}
                                        className="px-6 py-3 text-zinc-400 hover:text-white"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handlePlaceOrder}
                                        disabled={isProcessing}
                                        className={`flex-1 btn-primary py-3 ${isProcessing ? 'opacity-50' : ''}`}
                                    >
                                        {isProcessing ? 'Processing...' : `Pay $${fees.total.toFixed(2)}`}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 sticky top-4">
                            <h3 className="font-semibold text-white mb-4">Order Summary</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Item</span>
                                    <span className="text-white">${listing.price.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Shipping</span>
                                    <span className="text-white">
                                        {listing.shipping?.cost === 0 ? 'Free' : `$${listing.shipping?.cost?.toFixed(2)}`}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-zinc-400">Platform Fee</span>
                                    <span className="text-white">${fees.platformFee.toFixed(2)}</span>
                                </div>
                                <div className="border-t border-zinc-800 my-3" />
                                <div className="flex justify-between font-semibold">
                                    <span className="text-white">Total</span>
                                    <span className="text-amber-400">${fees.total.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Protection Icons */}
                            <div className="mt-6 pt-6 border-t border-zinc-800 space-y-3">
                                {BUYER_PROTECTIONS.slice(0, 2).map(protection => (
                                    <div key={protection.title} className="flex items-center gap-2 text-xs text-zinc-500">
                                        <span>{protection.icon}</span>
                                        <span>{protection.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
