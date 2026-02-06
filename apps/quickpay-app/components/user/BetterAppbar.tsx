"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@repo/ui/button";
import { Home, ArrowLeftRight, Clock, Users, LogOut, LogIn } from "lucide-react";
import Link from "next/link";

export function BetterAppbar() {
    const session = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const user = session.data?.user;

    const navItems = [
        { name: "Home", href: "/user/dashboard", icon: Home },
        { name: "Transfer", href: "/user/transfer", icon: ArrowLeftRight },
        { name: "Transactions", href: "/user/transactions", icon: Clock },
        { name: "P2P", href: "/user/p2p", icon: Users },
    ];

    return (
        <div className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
                <div className="text-2xl font-bold bg-linear-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent cursor-pointer" onClick={() => router.push('/')}>
                    QuickPay
                </div>

                <div className="hidden md:flex items-center gap-6">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-indigo-600 dark:hover:text-indigo-400
                                    ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400"}
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                {item.name}
                            </Link>
                        )
                    })}
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="secondary"
                        className="gap-2"
                        onClick={async () => {
                            if (user) {
                                await signOut()
                                router.push("/")
                            } else {
                                signIn()
                            }
                        }}
                    >
                        {user ? (
                            <>
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Logout</span>
                            </>
                        ) : (
                            <>
                                <LogIn className="w-4 h-4" />
                                Login
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
