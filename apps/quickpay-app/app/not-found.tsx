'use client';

import Link from "next/link";
import { Home, Building2, ArrowLeft } from "lucide-react";

export default function RootNotFound() {
    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-8">
                {/* 404 Illustration */}
                <div className="relative">
                    <h1 className="text-9xl font-bold text-slate-200 dark:text-slate-800">404</h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-32 h-32 bg-linear-to-br from-indigo-500 to-violet-600 rounded-full opacity-20 animate-pulse" />
                    </div>
                </div>

                {/* Message */}
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Page Not Found
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400">
                        The page you're looking for doesn't exist. Choose where you'd like to go:
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-indigo-600 to-violet-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        <Home className="w-5 h-5" />
                        User Login
                    </Link>
                    <Link
                        href="/merchant/login"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-linear-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
                    >
                        <Building2 className="w-5 h-5" />
                        Merchant Login
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
}
