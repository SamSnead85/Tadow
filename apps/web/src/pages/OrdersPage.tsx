import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Package, Truck, Check, MapPin,
    ChevronRight, MessageSquare, HelpCircle
} from 'lucide-react';
import { Order } from '../types/marketplace';
import { getOrders } from '../services/escrow';
import { getCurrentUser, getListingById, getUserById } from '../services/userVerification';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filter, setFilter] = useState<'all' | 'buying' | 'selling'>('all');
    const currentUser = getCurrentUser();

    useEffect(() => {
        const allOrders = getOrders();
        setOrders(allOrders);
    }, []);

    const filteredOrders = orders.filter(order => {
        if (filter === 'buying') return order.buyerId === currentUser?.id;
        if (filter === 'selling') return order.sellerId === currentUser?.id;
        return true;
    });

    return (
        <div className="min-h-screen bg-zinc-950 pb-24">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-white mb-2">Orders</h1>
                <p className="text-zinc-400 mb-6">Track your purchases and sales</p>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    {(['all', 'buying', 'selling'] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-full text-sm capitalize ${filter === tab
                                ? 'bg-amber-500 text-zinc-900 font-medium'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="text-center py-16">
                        <Package className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                        <p className="text-zinc-400">No orders yet</p>
                        <Link to="/marketplace" className="text-amber-400 text-sm mt-2 inline-block">
                            Browse marketplace
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredOrders.map(order => (
                            <OrderCard
                                key={order.id}
                                order={order}
                                currentUserId={currentUser?.id}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function OrderCard({ order, currentUserId }: { order: Order; currentUserId?: string }) {
    const listing = getListingById(order.listingId);
    const isBuyer = order.buyerId === currentUserId;
    const otherUser = getUserById(isBuyer ? order.sellerId : order.buyerId);

    const statusConfig = getStatusConfig(order.status);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden"
        >
            {/* Header */}
            <div className="px-4 py-3 bg-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}>
                        {statusConfig.label}
                    </span>
                    <span className="text-zinc-500 text-sm">
                        Order #{order.id.slice(-6).toUpperCase()}
                    </span>
                </div>
                <span className="text-zinc-500 text-sm">
                    {new Date(order.createdAt).toLocaleDateString()}
                </span>
            </div>

            {/* Content */}
            <div className="p-4 flex gap-4">
                <div className="w-20 h-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0">
                    {listing?.images?.[0] && (
                        <img src={listing.images[0]} alt={listing.title} className="w-full h-full object-cover" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-white truncate">{listing?.title || 'Unknown Item'}</h3>
                    <p className="text-zinc-500 text-sm">
                        {isBuyer ? 'From' : 'Sold to'}: {otherUser?.displayName || 'Unknown'}
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                        <span className="text-lg font-bold text-amber-400">${order.totalAmount}</span>
                        {order.shipping?.trackingNumber && (
                            <span className="text-xs text-zinc-500 flex items-center gap-1">
                                <Truck className="w-3 h-3" />
                                {order.shipping.trackingNumber}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="px-4 pb-4">
                <OrderTimeline order={order} />
            </div>

            {/* Actions */}
            <div className="px-4 py-3 bg-zinc-800/30 flex items-center justify-between border-t border-zinc-800">
                <div className="flex gap-2">
                    <Link
                        to={`/messages?id=conv_${order.id}`}
                        className="px-3 py-1.5 bg-zinc-700 text-white rounded-lg text-sm flex items-center gap-1"
                    >
                        <MessageSquare className="w-3 h-3" /> Message
                    </Link>
                    <button className="px-3 py-1.5 border border-zinc-700 text-zinc-400 rounded-lg text-sm flex items-center gap-1">
                        <HelpCircle className="w-3 h-3" /> Help
                    </button>
                </div>
                <Link
                    to={`/order/${order.id}`}
                    className="text-amber-400 text-sm flex items-center gap-1"
                >
                    Details <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </motion.div>
    );
}

function OrderTimeline({ order }: { order: Order }) {
    const steps = [
        { key: 'paid', label: 'Paid', icon: Check },
        { key: 'shipped', label: 'Shipped', icon: Truck },
        { key: 'delivered', label: 'Delivered', icon: MapPin },
        { key: 'completed', label: 'Completed', icon: Check },
    ];

    const currentStepIndex = getStepIndex(order.status);

    return (
        <div className="flex items-center justify-between">
            {steps.map((step, index) => {
                const Icon = step.icon;
                const isComplete = index <= currentStepIndex;
                const isCurrent = index === currentStepIndex;

                return (
                    <div key={step.key} className="flex items-center flex-1">
                        <div className="flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isComplete
                                ? 'bg-emerald-500 text-white'
                                : 'bg-zinc-800 text-zinc-500'
                                }`}>
                                <Icon className="w-4 h-4" />
                            </div>
                            <span className={`text-xs mt-1 ${isCurrent ? 'text-white font-medium' : 'text-zinc-500'
                                }`}>
                                {step.label}
                            </span>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 ${index < currentStepIndex ? 'bg-emerald-500' : 'bg-zinc-700'
                                }`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

function getStatusConfig(status: Order['status']) {
    switch (status) {
        case 'pending_payment':
            return { label: 'Pending', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400' };
        case 'payment_held':
            return { label: 'In Escrow', bgColor: 'bg-blue-500/20', textColor: 'text-blue-400' };
        case 'shipped':
            return { label: 'Shipped', bgColor: 'bg-purple-500/20', textColor: 'text-purple-400' };
        case 'delivered':
            return { label: 'Delivered', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' };
        case 'completed':
            return { label: 'Completed', bgColor: 'bg-emerald-500/20', textColor: 'text-emerald-400' };
        case 'disputed':
            return { label: 'Disputed', bgColor: 'bg-red-500/20', textColor: 'text-red-400' };
        case 'refunded':
            return { label: 'Refunded', bgColor: 'bg-zinc-500/20', textColor: 'text-zinc-400' };
        case 'cancelled':
            return { label: 'Cancelled', bgColor: 'bg-zinc-500/20', textColor: 'text-zinc-400' };
        default:
            return { label: 'Unknown', bgColor: 'bg-zinc-500/20', textColor: 'text-zinc-400' };
    }
}

function getStepIndex(status: Order['status']): number {
    switch (status) {
        case 'pending_payment': return -1;
        case 'payment_held': return 0;
        case 'shipped': return 1;
        case 'delivered': return 2;
        case 'completed': return 3;
        default: return -1;
    }
}
