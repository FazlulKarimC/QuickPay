"use client";

import { useState, useEffect } from "react";
import { CreditCard, CheckCircle } from "lucide-react";

export function AnimatedPaymentCard() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsProcessing(true);
            setTimeout(() => {
                setIsSuccess(true);
                setTimeout(() => {
                    setIsProcessing(false);
                    setIsSuccess(false);
                }, 2000);
            }, 1500);
        }, 6000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative">
            {/* Floating payment card */}
            <div
                className={`glass-card p-6 rounded-2xl w-80 transition-all duration-500 ${isProcessing ? "scale-105 shadow-[0_0_30px_rgba(99,102,241,0.4)]" : ""
                    }`}
            >
                <div className="flex items-center justify-between mb-4">
                    <CreditCard className="w-8 h-8 text-[rgb(var(--primary-light))]" />
                    {isSuccess && (
                        <CheckCircle className="w-6 h-6 text-[rgb(var(--success))] animate-in zoom-in duration-300" />
                    )}
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[rgb(var(--text-muted))] text-sm">Amount</span>
                        <span className="text-[rgb(var(--text))] text-xl font-bold">₹2,499.00</span>
                    </div>

                    <div className="flex justify-between items-center">
                        <span className="text-[rgb(var(--text-muted))] text-sm">Status</span>
                        <span
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${isSuccess
                                ? "bg-[rgba(var(--success),0.2)] text-[rgb(var(--success))]"
                                : isProcessing
                                    ? "bg-[rgba(var(--info),0.2)] text-[rgb(var(--info))] animate-pulse"
                                    : "bg-[rgba(var(--text-muted),0.2)] text-[rgb(var(--text-muted))]"
                                }`}
                        >
                            {isSuccess ? "Succeeded" : isProcessing ? "Processing..." : "Ready"}
                        </span>
                    </div>

                    {/* Animated progress bar */}
                    {isProcessing && !isSuccess && (
                        <div className="h-1 bg-[rgb(var(--surface-light))] rounded-full overflow-hidden">
                            <div className="h-full bg-linear-to-r from-[rgb(var(--primary))] to-[rgb(var(--primary-light))] animate-[progress_1.5s_ease-in-out]" />
                        </div>
                    )}
                </div>
            </div>

            {/* Floating particles */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-[rgb(var(--primary))] opacity-20 rounded-full blur-2xl animate-pulse pointer-events-none" />
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-[rgb(var(--primary-light))] opacity-20 rounded-full blur-xl animate-pulse delay-700 pointer-events-none" />
        </div>
    );
}
