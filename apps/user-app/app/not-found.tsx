"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
            <div className="text-center space-y-8 max-w-md">
                {/* 404 Icon/Number */}
                <div className="relative">
                    <div className="text-[150px] md:text-[200px] font-bold text-slate-200 dark:text-slate-800 leading-none select-none">
                        404
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Search className="w-16 h-16 md:w-24 md:h-24 text-indigo-500 opacity-50" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                        Page Not Found
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 
                            bg-indigo-600 hover:bg-indigo-700 text-white 
                            font-medium rounded-xl transition-colors"
                    >
                        <Home className="w-5 h-5" />
                        Go to Dashboard
                    </Link>
                    <button
                        onClick={() => history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 
                            bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700
                            text-slate-700 dark:text-slate-300
                            font-medium rounded-xl transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>

                {/* Branding */}
                <div className="pt-8 text-sm text-slate-400">
                    <span className="font-semibold text-indigo-500">QuickPay</span> — Your trusted payment gateway
                </div>
            </div>
        </div>
    );
}
