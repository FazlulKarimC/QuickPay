"use client";

import { usePathname } from "next/navigation";
import { MerchantSidebar } from "@/components/merchant/MerchantSidebar";

export default function MerchantLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const isLoginPage = pathname === "/merchant/login";

    // Don't show sidebar on login page
    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <MerchantSidebar />
            <main className="ml-64">{children}</main>
        </div>
    );
}

