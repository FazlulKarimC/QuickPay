import Link from "next/link";
import { Send, Plus, History, Settings } from "lucide-react";
import { Button } from "@repo/ui/button";
import { Card } from "@repo/ui/card";

export function QuickActions() {
    const actions = [
        { label: "Send Money", icon: Send, href: "/transfer", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 dark:text-indigo-400" },
        { label: "Add Money", icon: Plus, href: "/add-money", color: "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400" },
        { label: "History", icon: History, href: "/transactions", color: "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400" },
        { label: "Settings", icon: Settings, href: "/settings", color: "text-slate-600 bg-slate-50 dark:bg-slate-900/50 dark:text-slate-400" },
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {actions.map((action) => (
                <Link key={action.label} href={action.href} className="block group">
                    <Card className="p-6 flex flex-col items-center justify-center gap-4 hover:shadow-lg transition-all hover:-translate-y-1 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                        <div className={`p-4 rounded-full ${action.color} group-hover:scale-110 transition-transform`}>
                            <action.icon className="w-6 h-6" />
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{action.label}</span>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
