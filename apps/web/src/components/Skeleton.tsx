import { motion } from 'framer-motion';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div className={`animate-pulse bg-zinc-800 rounded ${className}`} />
    );
}

export function DealCardSkeleton() {
    return (
        <div className="deal-card">
            {/* Image */}
            <Skeleton className="aspect-[16/10] rounded-none" />

            {/* Content */}
            <div className="p-4 space-y-3">
                {/* Meta badges */}
                <div className="flex gap-2">
                    <Skeleton className="w-16 h-5 rounded-md" />
                    <Skeleton className="w-12 h-5 rounded-md" />
                </div>

                {/* Title */}
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-4 w-3/4 rounded" />

                {/* Verdict */}
                <Skeleton className="h-3 w-1/2 rounded" />

                {/* Price */}
                <div className="flex items-baseline gap-2 pt-1">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-4 w-14 rounded" />
                </div>

                {/* Footer */}
                <div className="flex gap-4 pt-1">
                    <Skeleton className="h-3 w-20 rounded" />
                    <Skeleton className="h-3 w-12 rounded" />
                </div>
            </div>
        </div>
    );
}

export function DealGridSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                >
                    <DealCardSkeleton />
                </motion.div>
            ))}
        </div>
    );
}

export function HeroSkeleton() {
    return (
        <div className="text-center max-w-3xl mx-auto py-16 space-y-6">
            <Skeleton className="h-6 w-48 mx-auto rounded-full" />
            <Skeleton className="h-12 w-96 mx-auto rounded" />
            <Skeleton className="h-5 w-80 mx-auto rounded" />
            <Skeleton className="h-14 w-full max-w-2xl mx-auto rounded-2xl" />
            <div className="flex justify-center gap-8 pt-4">
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
                <Skeleton className="h-4 w-24 rounded" />
            </div>
        </div>
    );
}

export function FilterSkeleton() {
    return (
        <div className="filter-section space-y-3">
            <Skeleton className="h-3 w-24 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded" />
                    <Skeleton className="h-4 flex-1 rounded" />
                    <Skeleton className="h-3 w-6 rounded" />
                </div>
            ))}
        </div>
    );
}
