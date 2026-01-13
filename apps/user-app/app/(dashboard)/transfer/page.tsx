import prisma from "@repo/db/client";
import { AddMoney } from "../../../components/AddMoneyCard";
import { BalanceCard } from "../../../components/BalanceCard";
import { OnRampTransactions } from "../../../components/OnRampTransactions";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

async function getBalance() {
    const session = await getServerSession(authOptions);
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
        }
    });
    return txns.map((t) => ({
        time: t.createdAt,
        amount: t.amount,
        status: t.status, // PaymentStatus enum matches requirements mostly
        provider: t.paymentMethod || 'Unknown'
    }))
}

export default async function () {
    const balance = await getBalance();
    const transactions = await getOnRampTransactions();

    return <div className="w-screen h-[92vh] bg-gradient-to-br from-[#0F2027] via-[#203A43] to-[#2C5364] text-white">
        <div className="text-4xl pl-4 pt-8 mb-8 font-bold items-center">
            <div>Transfer</div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 p-4">
            <div>
                <AddMoney />
            </div>
            <div>
                <BalanceCard amount={balance.amount} locked={balance.locked} />
                <div className="pt-4">
                    <OnRampTransactions transactions={transactions} />
                </div>
            </div>
        </div>
    </div>
}