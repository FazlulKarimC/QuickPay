import { XCircle } from "lucide-react";
import { Button } from "@repo/ui/button";
import Link from "next/link";

export default function CheckoutFailedPage() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center space-y-6">
                <div className="w-24 h-24 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <XCircle className="w-12 h-12 text-red-600 dark:text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Failed</h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Something went wrong with your transaction. Please try again.
                    </p>
                </div>

                <div className="pt-8 space-y-3">
                    <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Try Again
                    </Button>
                    <Link href="/dashboard" className="block">
                        <Button variant="secondary" className="w-full">
                            Back to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
