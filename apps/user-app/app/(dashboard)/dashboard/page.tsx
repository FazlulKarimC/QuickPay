import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { getBalance } from "../../lib/services/wallet";
import { getTransactions } from "../../lib/services/wallet";
import { WalletCard } from "@/components/WalletCard";
import { QuickActions } from "@/components/QuickActions";
import { TransactionList } from "@/components/TransactionList";

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const { balance } = await getBalance(Number(session.user.id));
    const { data: transactions } = await getTransactions(Number(session.user.id), { limit: 5 });

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in-50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {session.user.name?.split(' ')[0] || 'User'}!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Here's what's happening with your wallet today.
                    </p>
                </div>
                <div className="text-sm text-slate-400 font-mono">
                    User ID: {session.user.id}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    <WalletCard balance={balance} />
                    <QuickActions />
                    <TransactionList transactions={transactions} />
                </div>

                <div className="space-y-6">
                    {/* Sidebar / Promo area */}
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-900 dark:to-slate-900/50 border border-indigo-100 dark:border-slate-800">
                        <h3 className="font-semibold text-indigo-900 dark:text-indigo-400 mb-2">Did you know?</h3>
                        <p className="text-sm text-indigo-700 dark:text-slate-400">
                            You can now use UPI for faster payments. Try it out in your next transaction!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}