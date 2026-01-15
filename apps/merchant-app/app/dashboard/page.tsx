import { Card } from "@repo/ui/card";
import { DollarSign, CreditCard, Activity } from "lucide-react";
import prisma from "@repo/db/client";

async function getMerchantStats() {
    // Mocking merchant ID fetch - normally from session
    // const session = await getServerSession(authOptions);
    // const merchantId = session.user.id;

    // For demo, we might fetch the first merchant or use a fixed ID
    const merchant = await prisma.merchant.findFirst();
    if (!merchant) return null;

    const totalRevenue = await prisma.paymentIntent.aggregate({
        where: {
            merchantId: merchant.id,
            status: 'succeeded'
        },
        _sum: { amount: true }
    });

    const txCount = await prisma.paymentIntent.count({
        where: { merchantId: merchant.id }
    });

    const successCount = await prisma.paymentIntent.count({
        where: {
            merchantId: merchant.id,
            status: 'succeeded'
        }
    });

    const successRate = txCount > 0 ? ((successCount / txCount) * 100).toFixed(1) : 0;

    return {
        revenue: totalRevenue._sum.amount || 0,
        count: txCount,
        successRate
    };
}

export default async function MerchantDashboard() {
    const stats = await getMerchantStats();

    return (
        <div className="p-8 space-y-8 animate-in fade-in-50">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Merchant Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 space-y-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</h3>
                        <DollarSign className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{((stats?.revenue || 0) / 100).toLocaleString()}
                    </div>
                </Card>

                <Card className="p-6 space-y-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Transactions</h3>
                        <CreditCard className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats?.count || 0}
                    </div>
                </Card>

                <Card className="p-6 space-y-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Success Rate</h3>
                        <Activity className="w-4 h-4 text-slate-400" />
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats?.successRate}%
                    </div>
                </Card>
            </div>

            <Card className="p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                <h3 className="text-lg font-medium mb-4 text-slate-900 dark:text-white">Revenue Overview</h3>
                <div className="h-64 flex items-end justify-between gap-2">
                    {/* Simple CSS bar chart placeholder */}
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="w-full bg-indigo-100 dark:bg-indigo-900/20 rounded-t-sm relative group">
                            <div
                                className="absolute bottom-0 w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-sm transition-all hover:bg-indigo-600 dark:hover:bg-indigo-500"
                                style={{ height: `${Math.random() * 80 + 20}%` }}
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-400">
                    <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                </div>
            </Card>
        </div>
    );
}
