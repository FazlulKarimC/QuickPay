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
        <div className="max-w-7xl mx-auto p-4 md:p-8 flex justify-center animate-in fade-in-50">
            <div className="w-full max-w-2xl pt-8">
                <SendCard />
            </div>
        </div>
    );
}
