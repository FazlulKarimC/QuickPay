import React from 'react';

export function AmountDisplay({
    amount,
    currency = "INR",
    size = "lg"
}: {
    amount: number;
    currency?: string;
    size?: "sm" | "md" | "lg" | "xl";
}) {
    const formatted = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
    }).format(amount / 100);

    const sizeClasses = {
        sm: "text-lg font-semibold",
        md: "text-2xl font-bold",
        lg: "text-4xl font-bold",
        xl: "text-5xl font-bold tracking-tight",
    };

    return (
        <span className={`${sizeClasses[size]} text-[rgb(var(--text))] dark:text-white`}>
            {formatted}
        </span>
    );
}
