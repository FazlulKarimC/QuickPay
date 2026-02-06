'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { AmountDisplay } from '../shared/AmountDisplay';
import { RefreshCw, Eye, Undo2, CheckCircle, XCircle, Clock, CreditCard, Smartphone, Building2 } from 'lucide-react';

interface Transaction {
    id: string;
    amount: number;
    status: string;
    createdAt: Date | string;
    processedAt?: Date | string | null;
    paymentMethod?: string | null;
    customerPhone?: string | null;
    bankReference?: string | null;
    failureReason?: string | null;
    currency?: string;
}

interface MerchantTransactionTableProps {
    transactions: Transaction[];
    merchantApiKey: string;
}

const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
    created: { color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', icon: <Clock className="w-3 h-3" /> },
    processing: { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: <RefreshCw className="w-3 h-3 animate-spin" /> },
    succeeded: { color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30', icon: <CheckCircle className="w-3 h-3" /> },
    failed: { color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: <XCircle className="w-3 h-3" /> },
    canceled: { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: <XCircle className="w-3 h-3" /> },
    refunded: { color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', icon: <Undo2 className="w-3 h-3" /> },
};

const paymentMethodIcons: Record<string, React.ReactNode> = {
    card: <CreditCard className="w-4 h-4" />,
    upi: <Smartphone className="w-4 h-4" />,
    netbanking: <Building2 className="w-4 h-4" />,
};

export function MerchantTransactionTable({ transactions, merchantApiKey }: MerchantTransactionTableProps) {
    const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
    const [isRefunding, setIsRefunding] = useState(false);
    const [refundMessage, setRefundMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const handleRefund = async (txId: string) => {
        setIsRefunding(true);
        setRefundMessage(null);

        try {
            const res = await fetch(`/api/payment-intents/${txId}/refund`, {
                method: 'POST',
                headers: {
                    'X-API-Key': merchantApiKey,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();

            if (res.ok) {
                setRefundMessage({ type: 'success', text: 'Refund processed successfully!' });
                // Update the selected transaction status locally
                setSelectedTx(prev => prev ? { ...prev, status: 'refunded' } : null);
                // Refresh the page after a delay to show updated data
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                setRefundMessage({ type: 'error', text: data.error?.message || 'Failed to process refund' });
            }
        } catch {
            setRefundMessage({ type: 'error', text: 'Network error. Please try again.' });
        } finally {
            setIsRefunding(false);
        }
    };

    const formatDate = (date: Date | string) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getPaymentMethodLabel = (method?: string | null) => {
        const labels: Record<string, string> = {
            card: 'Card Payment',
            upi: 'UPI',
            netbanking: 'Net Banking',
        };
        return method ? labels[method] || method : '—';
    };

    if (!transactions?.length) {
        return (
            <div className="p-8 text-center border rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400">No transactions found</p>
            </div>
        );
    }

    return (
        <>
            <div className="overflow-hidden border rounded-xl border-slate-200 dark:border-slate-800">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs font-semibold uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Amount</th>
                            <th className="px-6 py-3">Method</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {transactions.map((tx) => {
                            const statusStyle = statusConfig[tx.status] ?? { color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-800', icon: <Clock className="w-3 h-3" /> };
                            return (
                                <tr
                                    key={tx.id}
                                    className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                                >
                                    <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                                        {tx.id.slice(0, 8)}...
                                    </td>
                                    <td className="px-6 py-4">
                                        <AmountDisplay amount={tx.amount} size="sm" className="text-base! font-semibold!" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                            {paymentMethodIcons[tx.paymentMethod || ''] || null}
                                            <span className="capitalize">{getPaymentMethodLabel(tx.paymentMethod)}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.color} ${statusStyle.bg}`}>
                                            {statusStyle.icon}
                                            <span className="capitalize">{tx.status}</span>
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                        {new Date(tx.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedTx(tx)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Transaction Details Modal */}
            <Dialog open={!!selectedTx} onOpenChange={() => { setSelectedTx(null); setRefundMessage(null); }}>
                <DialogContent className="bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-slate-900 dark:text-white">Transaction Details</DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400">
                            Payment ID: {selectedTx?.id}
                        </DialogDescription>
                    </DialogHeader>

                    {selectedTx && (
                        <div className="space-y-4 mt-4">
                            {/* Amount */}
                            <div className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-900">
                                <AmountDisplay amount={selectedTx.amount} size="lg" className="text-slate-900 dark:text-white" />
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    {selectedTx.currency || 'INR'}
                                </p>
                            </div>

                            {/* Status */}
                            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusConfig[selectedTx.status]?.color || 'text-slate-600'} ${statusConfig[selectedTx.status]?.bg || 'bg-slate-100'}`}>
                                    {statusConfig[selectedTx.status]?.icon || <Clock className="w-3 h-3" />}
                                    <span className="capitalize">{selectedTx.status}</span>
                                </span>
                            </div>

                            {/* Payment Method */}
                            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Payment Method</span>
                                <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-white">
                                    {paymentMethodIcons[selectedTx.paymentMethod || ''] || null}
                                    <span>{getPaymentMethodLabel(selectedTx.paymentMethod)}</span>
                                </div>
                            </div>

                            {/* Customer */}
                            {selectedTx.customerPhone && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Customer</span>
                                    <span className="text-sm font-mono text-slate-900 dark:text-white">
                                        {selectedTx.customerPhone}
                                    </span>
                                </div>
                            )}

                            {/* Bank Reference */}
                            {selectedTx.bankReference && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Bank Reference</span>
                                    <span className="text-sm font-mono text-slate-900 dark:text-white">
                                        {selectedTx.bankReference}
                                    </span>
                                </div>
                            )}

                            {/* Failure Reason */}
                            {selectedTx.failureReason && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Failure Reason</span>
                                    <span className="text-sm text-red-600 dark:text-red-400">
                                        {selectedTx.failureReason}
                                    </span>
                                </div>
                            )}

                            {/* Created At */}
                            <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Created</span>
                                <span className="text-sm text-slate-900 dark:text-white">
                                    {formatDate(selectedTx.createdAt)}
                                </span>
                            </div>

                            {/* Processed At */}
                            {selectedTx.processedAt && (
                                <div className="flex justify-between items-center py-2 border-b border-slate-200 dark:border-slate-800">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">Processed</span>
                                    <span className="text-sm text-slate-900 dark:text-white">
                                        {formatDate(selectedTx.processedAt)}
                                    </span>
                                </div>
                            )}

                            {/* Refund Message */}
                            {refundMessage && (
                                <div className={`p-3 rounded-lg text-sm ${refundMessage.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                                    {refundMessage.text}
                                </div>
                            )}

                            {/* Refund Button */}
                            {selectedTx.status === 'succeeded' && (
                                <button
                                    onClick={() => handleRefund(selectedTx.id)}
                                    disabled={isRefunding}
                                    className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isRefunding ? (
                                        <>
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <Undo2 className="w-4 h-4" />
                                            Refund This Payment
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
