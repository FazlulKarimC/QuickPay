import { CheckCircle, XCircle, Loader2, RefreshCw, Circle, Ban } from "lucide-react";
import React from 'react';

type StatusConfig = {
    variant: "neutral" | "info" | "success" | "error" | "warning";
    icon: React.ElementType;
    animate: boolean;
};

const statusConfig: Record<string, StatusConfig> = {
    created: { variant: "neutral", icon: Circle, animate: false },
    processing: { variant: "info", icon: Loader2, animate: true },
    succeeded: { variant: "success", icon: CheckCircle, animate: false },
    failed: { variant: "error", icon: XCircle, animate: false },
    canceled: { variant: "neutral", icon: Ban, animate: false },
    refunded: { variant: "warning", icon: RefreshCw, animate: false },
};

export function StatusBadge({ status }: { status: string }) {
    const config = statusConfig[status] || statusConfig.created;
    const Icon = config.icon;

    // Map internal variants to Tailwind classes that use our CSS variables
    const variantClasses = {
        neutral: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
        info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        error: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    }[config.variant];

    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses}`}>
            <Icon className={`w-3 h-3 mr-1 ${config.animate ? 'animate-spin' : ''}`} />
            {status}
        </span>
    );
}
