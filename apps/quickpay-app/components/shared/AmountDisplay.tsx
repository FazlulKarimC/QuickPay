/**
 * AmountDisplay Component
 * 
 * Displays currency amounts with consistent formatting across the app.
 * Follows design system specification from DESIGN_SYSTEM.md
 */

'use client';

export function AmountDisplay({
    amount,
    currency = "INR",
    size = "md",
    className = ""
}: {
    amount: number;
    currency?: string;
    size?: "sm" | "md" | "lg" | "xl";
    className?: string;
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
        <span className={`${sizeClasses[size]} ${className}`}>
            {formatted}
        </span>
    );
}
