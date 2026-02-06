import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";
import { getBalance } from "../../lib/services/wallet";
import { getTransactions } from "../../lib/services/wallet";
import { WalletCard } from "@/components/user/WalletCard";
import { QuickActions } from "@/components/user/QuickActions";
import { TransactionList } from "@/components/user/TransactionList";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Dashboard() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }

    const { balance } = await getBalance(Number(session.user.id));
    const { data: transactions } = await getTransactions(Number(session.user.id), { limit: 5 });

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Welcome back, {session.user.name?.split(' ')[0] || 'User'}!
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Here's what's happening with your wallet today.
                    </p>
                </div>
                <div className="text-sm text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                    ID: {session.user.id}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <WalletCard balance={balance} />
                    <QuickActions />
                    <TransactionList transactions={transactions} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-linear-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-slate-700">
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