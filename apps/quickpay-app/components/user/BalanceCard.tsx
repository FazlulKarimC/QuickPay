import { Card } from "@repo/ui/card";
import { Wallet, Lock, Calculator } from "lucide-react";
import { AmountDisplay } from "../shared/AmountDisplay";

export const BalanceCard = ({ amount, locked }: {
    amount: number;
    locked: number;
}) => {

    return (
        <Card title="Balance">
            <div className="p-4 space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Wallet className="w-4 h-4" />
                        <span>Available Balance</span>
                    </div>
                    <div className="font-semibold">
                        <AmountDisplay amount={amount} size="sm" className="text-slate-900 dark:text-white" />
                    </div>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-slate-200 dark:border-slate,700">
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Lock className="w-4 h-4" />
                        <span>Locked Balance</span>
                    </div>
                    <div className="font-semibold">
                        <AmountDisplay amount={locked} size="sm" className="text-slate-900 dark:text-white" />
                    </div>
                </div>

                <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium">
                        <Calculator className="w-4 h-4" />
                        <span>Total Balance</span>
                    </div>
                    <div>
                        <AmountDisplay amount={locked + amount} size="sm" className="text-indigo-600 dark:text-indigo-400" />
                    </div>
                </div>
            </div>
        </Card>
    );
}