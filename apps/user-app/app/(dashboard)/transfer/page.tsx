import prisma from "@repo/db/client";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";
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
        status: t.status, // PaymentStatus enum matches requirements mostly
        provider: t.paymentMethod || 'Unknown'
    }))
}

export default async function TransferPage() {
    const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transfer & Add Money</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <AddMoney />
                </div>
                <div className="space-y-8">
                    <BalanceCard amount={balance.amount} locked={balance.locked} />
                    <div className="pt-4">
                        <OnRampTransactions transactions={transactions} />
                    </div>
                </div>
            </div>
        </div>
    );
}
