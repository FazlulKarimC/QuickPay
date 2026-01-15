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

    return txns.map(t => ({
        id: t.id,
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
        provider: t.paymentMethod || 'Unknown'
    }));
}

export default async function MerchantTransactionsPage() {
    const transactions = await getMerchantTransactions();

    return (
        <div className="p-8 space-y-8 animate-in fade-in-50">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                {/* Add Filter/Export buttons here later */}
            </div>

            <TransactionTable transactions={transactions} />
        </div>
    );
}
