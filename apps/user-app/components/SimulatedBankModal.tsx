"use client"

import { useState, useEffect } from "react";
import { X, Building2, CheckCircle2, XCircle, Loader2, AlertCircle } from "lucide-react";

interface SimulatedBankModalProps {
    isOpen: boolean;
    onClose: () => void;
    paymentIntentId: string;
    amount: number;
    provider: string;
    onSuccess?: () => void;
}

export function SimulatedBankModal({
    isOpen,
    onClose,
    paymentIntentId,
    amount,
    provider,
    onSuccess
}: SimulatedBankModalProps) {
    const [status, setStatus] = useState<"idle" | "processing" | "success" | "failed">("idle");
    const [message, setMessage] = useState("");
    const [processingMessage, setProcessingMessage] = useState("Contacting bank...");

    useEffect(() => {
        if (status === "processing") {
            const messages = [
                "Contacting bank...",
                "Verifying payment details...",
                "Processing transaction...",
                "Awaiting bank confirmation..."
            ];
            let index = 0;
            const interval = setInterval(() => {
                index = (index + 1) % messages.length;
                setProcessingMessage(messages[index] || "Processing...");
            }, 1500);

            return () => clearInterval(interval);
        }
    }, [status]);

    const handleApprove = async () => {
        setStatus("processing");

        try {
            // Call the bank simulator API
            const response = await fetch("/api/bank-simulator/process", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    paymentIntentId,
                    amount: amount * 100, // Convert to paise
                    method: "card",
                    callbackUrl: `${window.location.origin}/api/webhooks/bank`,
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to process payment");
            }

            const data = await response.json();

            // Wait for the estimated delay plus a buffer
            const waitTime = (data.estimatedDelayMs || 3000) + 1000;

            await new Promise(resolve => setTimeout(resolve, waitTime));

            // Check if payment was successful by fetching the payment intent
            const checkResponse = await fetch(`/api/user/payment-status/${paymentIntentId}`);
            const paymentIntent = await checkResponse.json();

            if (paymentIntent.status === "succeeded") {
                setStatus("success");
                setMessage("Payment approved successfully!");

                // Call onSuccess callback after a short delay
                setTimeout(() => {
                    onSuccess?.();
                    setTimeout(() => {
                        onClose();
                        setStatus("idle");
                    }, 2000);
                }, 1500);
            } else if (paymentIntent.status === "failed") {
                setStatus("failed");
                setMessage(paymentIntent.failureReason || "Payment was declined by the bank");
            } else {
                // Still processing
                setStatus("processing");
                setProcessingMessage("Still processing... please wait");
            }
        } catch (error) {
            setStatus("failed");
            setMessage("An error occurred while processing your payment");
            console.error("Payment processing error:", error);
        }
    };

    const handleDecline = () => {
        setStatus("failed");
        setMessage("Payment cancelled by user");
        setTimeout(() => {
            onClose();
            setStatus("idle");
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative w-full max-w-md mx-4">
                <div className="bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-indigo-600 to-purple-600">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-6 h-6 text-white" />
                            <div>
                                <h2 className="text-lg font-semibold text-white">{provider}</h2>
                                <p className="text-xs text-indigo-100">Secure Payment Gateway</p>
                            </div>
                        </div>
                        {status === "idle" && (
                            <button
                                onClick={onClose}
                                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {status === "idle" && (
                            <>
                                <div className="mb-6">
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        You are about to add money to your QuickPay wallet
                                    </p>

                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Amount</span>
                                            <span className="text-lg font-bold text-slate-900 dark:text-white">
                                                ₹{amount.toFixed(2)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Merchant</span>
                                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                                                QuickPay
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Order ID</span>
                                            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                                                {paymentIntentId.slice(0, 12)}...
                                            </span>
                                        </div>
                                    </div>

                                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg">
                                        <div className="flex gap-2">
                                            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                            <div>
                                                <p className="text-xs text-blue-800 dark:text-blue-300 font-medium">
                                                    Educational Simulation
                                                </p>
                                                <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                                                    This is a simulated bank interface for learning purposes.
                                                    Payment will be processed using the built-in bank simulator.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={handleDecline}
                                        className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleApprove}
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/30"
                                    >
                                        Approve Payment
                                    </button>
                                </div>
                            </>
                        )}

                        {status === "processing" && (
                            <div className="text-center py-8">
                                <Loader2 className="w-12 h-12 text-indigo-600 dark:text-indigo-400 animate-spin mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Processing Payment
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                    {processingMessage}
                                </p>
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-full">
                                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse" />
                                    <span className="text-xs font-medium text-indigo-700 dark:text-indigo-300">
                                        Please do not close this window
                                    </span>
                                </div>
                            </div>
                        )}

                        {status === "success" && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-green-100 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Payment Successful!
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400">
                                    {message}
                                </p>
                                <p className="text-xs text-slate-500 dark:text-slate-500 mt-4">
                                    Your wallet will be updated shortly...
                                </p>
                            </div>
                        )}

                        {status === "failed" && (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-red-100 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    Payment Failed
                                </h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                                    {message}
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white rounded-lg font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Educational note at bottom */}
                {status === "idle" && (
                    <p className="text-center text-xs text-slate-400 mt-3">
                        🎓 This simulates the async webhook flow used by real payment gateways
                    </p>
                )}
            </div>
        </div>
    );
}
