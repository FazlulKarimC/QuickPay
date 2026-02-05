import { CheckCircle } from "lucide-react";
import { Button } from "@repo/ui/button";
import { AmountDisplay } from "@repo/ui/amount-display";
import Link from "next/link";

export default function CheckoutSuccessPage({
    searchParams,
}: {
    searchParams: { amount?: string };
}) {
    const amount = searchParams.amount ? parseInt(searchParams.amount) : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce">
                    <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-500" />
                </div>

                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Successful</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Your transaction has been processed successfully.
                    </p>
                </div>

                {amount > 0 && (
                    <div className="py-6 animate-in zoom-in duration-500 delay-200">
                        <AmountDisplay amount={amount} size="xl" />
                    </div>
                )}

                <div className="pt-8">
                    <Link href="/dashboard">
                        <Button variant="secondary" className="w-full">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
