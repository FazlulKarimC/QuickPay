import React from "react";

function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse rounded-md bg-slate-200 dark:bg-slate-700 ${className}`} />
    );
}

export function TransactionListSkeleton({ count = 5 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div
                    key={i}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                >
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                    <Skeleton className="h-5 w-20" />
                </div>
            ))}
        </div>
    );
}

export function DashboardCardSkeleton() {
    return (
        <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Skeleton className="h-4 w-24 mb-3" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-3 w-20" />
        </div>
    );
}

export function WalletBalanceSkeleton() {
    return (
        <div className="p-8 rounded-2xl bg-linear-to-br from-indigo-500 to-indigo-700 dark:from-indigo-600 dark:to-indigo-800">
            <Skeleton className="h-4 w-20 mb-3 bg-white/20" />
            <Skeleton className="h-12 w-40 mb-4 bg-white/20" />
            <Skeleton className="h-3 w-32 bg-white/20" />
        </div>
    );
}
