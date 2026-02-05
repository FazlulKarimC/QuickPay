import { TransactionTable } from "@repo/ui/transaction-table";
import prisma from "@repo/db/client";

async function getMerchantTransactions() {
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) return [];

    const txns = await prisma.paymentIntent.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
        take: 20
    });

    // Map payment methods to user-friendly names
    const paymentMethodLabels: Record<string, string> = {
        'card': 'Card Payment',
        'upi': 'UPI',
        'netbanking': 'Net Banking',
        'wallet': 'Wallet'
    };

    return txns.map(t => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
        provider: paymentMethodLabels[t.paymentMethod || ''] || t.paymentMethod || 'Bank Transfer'
    }));
}

export default async function MerchantTransactionsPage() {
    const transactions = await getMerchantTransactions();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                <p className="text-slate-500 dark:text-slate-400">View and manage all your payment transactions.</p>
            </div>

            <TransactionTable transactions={transactions} />
        </div>
    );
}
