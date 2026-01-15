import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { getTransactions } from "../../lib/services/wallet";
import { TransactionTable } from "@repo/ui/transaction-table";
import { redirect } from "next/navigation";

export default async function TransactionsPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const { data: transactions } = await getTransactions(Number(session.user.id), { limit: 20 });

    // Adapter for the table - map wallet transactions to table format
    const tableData = transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        status: t.type === 'credit' ? 'succeeded' : 'succeeded', // Wallet transactions are always completed
        createdAt: t.createdAt,
        provider: t.type === 'credit' ? 'Received' : 'Sent'
    }));

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                <p className="text-slate-500 dark:text-slate-400">View your complete transaction history.</p>
            </div>

            <TransactionTable transactions={tableData} />
        </div>
    );
}
