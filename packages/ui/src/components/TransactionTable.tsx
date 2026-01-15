import React from 'react';
import { StatusBadge } from './StatusBadge';
import { AmountDisplay } from './AmountDisplay';

// Simple table implementation since we don't have the full shadcn table in this package yet
// In a real scenario, we might import from a local shadcn implementation
export function TransactionTable({ transactions }: { transactions: any[] }) {
    if (!transactions?.length) {
        return (
            <div className="p-8 text-center border rounded-lg border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                <p className="text-slate-500 dark:text-slate-400">No transactions found</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden border rounded-xl border-slate-200 dark:border-slate-800">
            <table className="w-full text-sm text-left">
                <thead className="text-xs font-semibold uppercase bg-slate-50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                        <th className="px-6 py-3">ID</th>
                        <th className="px-6 py-3">Amount</th>
                        <th className="px-6 py-3">Method</th>
                        <th className="px-6 py-3">Status</th>
                        <th className="px-6 py-3">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((tx) => (
                        <tr
                            key={tx.id}
                            className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                        >
                            <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400">
                                {tx.id.slice(0, 8)}...
                            </td>
                            <td className="px-6 py-4">
                                <AmountDisplay amount={tx.amount} size="sm" />
                            </td>
                            <td className="px-6 py-4 capitalize text-slate-700 dark:text-slate-300">
                                {tx.provider || tx.method || '—'}
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={tx.status} />
                            </td>
                            <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                                {new Date(tx.createdAt || tx.startTime).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
