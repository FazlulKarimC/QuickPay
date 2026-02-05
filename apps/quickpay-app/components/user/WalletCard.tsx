import { Wallet } from "lucide-react";
import { AmountDisplay } from "@repo/ui/amount-display";

export function WalletCard({ balance }: { balance: number }) {
    return (
        <div className="relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="w-32 h-32" />
            </div>

            <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2 text-indigo-100">
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">Total Balance</span>
                </div>

                <div>
                    {/* AmountDisplay inside dark bg needs white text force or context */}
                    <div className="text-5xl font-bold tracking-tight text-white">
                        {new Intl.NumberFormat('en-IN', {
                            style: 'currency',
                            currency: 'INR',
                            minimumFractionDigits: 2
                        }).format(balance / 100)}
                    </div>
                </div>

                <div className="pt-2 text-sm text-indigo-200">
                    Available for transfers and payments
                </div>
            </div>
        </div>
    );
}
