import { SendCard } from "../../../components/SendCard";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import { redirect } from "next/navigation";

export default async function P2PPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        redirect('/api/auth/signin');
    }
    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in-50">
            {/* Page Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Send Money</h1>
                <p className="text-slate-500 dark:text-slate-400">Transfer funds instantly to any QuickPay user.</p>
            </div>

            {/* Content */}
            <div className="flex justify-center">
                <div className="w-full max-w-lg">
                    <SendCard />
                </div>
            </div>
        </div>
    );
}
