import { MerchantTransactionTable } from "../../../components/merchant/MerchantTransactionTable";
import prisma from "@repo/db/client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getMerchantData() {
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) return { transactions: [], apiKey: '' };

    const txns = await prisma.paymentIntent.findMany({
        where: { merchantId: merchant.id },
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
            user: {
                select: { number: true }
            }
        }
    });

    return {
        transactions: txns.map(t => ({
            id: t.id,
            amount: t.amount,
            status: t.status,
            createdAt: t.createdAt,
            processedAt: t.processedAt,
            paymentMethod: t.paymentMethod,
            customerPhone: t.user?.number || null,
            bankReference: t.bankReference,
            failureReason: t.failureReason,
            currency: t.currency,
        })),
        apiKey: merchant.apiKey
    };
}

export default async function MerchantTransactionsPage() {
    const { transactions, apiKey } = await getMerchantData();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Transactions</h1>
                <p className="text-slate-500 dark:text-slate-400">View and manage all your payment transactions.</p>
            </div>

            <MerchantTransactionTable transactions={transactions} merchantApiKey={apiKey} />
        </div>
    );
}
