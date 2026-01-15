import { TransactionTable } from "@repo/ui/transaction-table";
import { Card } from "@repo/ui/card";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function TransactionList({ transactions }: { transactions: any[] }) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Recent Transactions</h2>
                <Link href="/transactions">
                    <Button variant="ghost" className="gap-2 text-indigo-600 dark:text-indigo-400">
                        View All <ArrowRight className="w-4 h-4" />
                    </Button>
                </Link>
            </div>

            <Card className="border-0 shadow-none bg-transparent">
                <TransactionTable transactions={transactions} />
            </Card>
        </div>
    );
}
