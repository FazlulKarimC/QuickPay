import prisma from "@repo/db/client";
import { AddMoney } from "@/components/user/AddMoneyCard";
import { BalanceCard } from "@/components/user/BalanceCard";
import { OnRampTransactions } from "@/components/user/OnRampTransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";

async function getBalance() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/api/auth/signin');
    }
    const wallet = await prisma.wallet.findUnique({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: wallet?.balance || 0,
        locked: 0
    }
}

async function getOnRampTransactions() {
    const session = await getServerSession(authOptions);
    const txns = await prisma.paymentIntent.findMany({
        where: {
            userId: Number(session?.user?.id)
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    });
    return txns.map((t) => ({
        time: t.createdAt,
        amount: t.amount,
        status: t.status,
        provider: t.paymentMethod || 'Unknown'
    }))
}

export default async function TransferPage() {
    const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Add Money</h1>
                <p className="text-slate-500 dark:text-slate-400">Add funds to your wallet using various payment methods.</p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                <div className="space-y-6">
                    <AddMoney />
                </div>
                <div className="space-y-6">
                    <BalanceCard amount={balance.amount} locked={balance.locked} />
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    );
}
