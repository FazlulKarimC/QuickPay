import { BetterAppbar } from "@/components/user/BetterAppbar";

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <BetterAppbar />
            <main>{children}</main>
        </div>
    );
}
