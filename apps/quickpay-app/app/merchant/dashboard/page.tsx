import { Card } from "@repo/ui/card";
import { DollarSign, CreditCard, Activity, TrendingUp } from "lucide-react";
import prisma from "@repo/db/client";

async function getMerchantStats() {
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
        successRate,
        merchantName: merchant.name
    };
}

export default async function MerchantDashboard() {
    const stats = await getMerchantStats();

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Welcome back, {stats?.merchantName || 'Merchant'}!
                </h1>
                <p className="text-slate-500 dark:text-slate-400">
                    Here's your business overview for today.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-6 space-y-2 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Revenue</h3>
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
                            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        ₹{((stats?.revenue || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        From successful payments
                    </p>
                </Card>

                <Card className="p-6 space-y-2 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Transactions</h3>
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats?.count || 0}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Total payment intents
                    </p>
                </Card>

                <Card className="p-6 space-y-2 border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">Success Rate</h3>
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                            <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-slate-900 dark:text-white">
                        {stats?.successRate}%
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        Successful payments
                    </p>
                </Card>
            </div>

            {/* Chart */}
            <Card className="p-6 border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold mb-6 text-slate-900 dark:text-white">Weekly Revenue</h3>
                <div className="h-64 flex items-end justify-between gap-3">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const height = Math.random() * 80 + 20;
                        return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-lg relative h-full">
                                    <div
                                        className="absolute bottom-0 w-full bg-linear-to-t from-indigo-600 to-indigo-400 rounded-lg transition-all hover:from-indigo-500 hover:to-indigo-300"
                                        style={{ height: `${height}%` }}
                                    />
                                </div>
                                <span className="text-xs text-slate-500 dark:text-slate-400">{day}</span>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}
