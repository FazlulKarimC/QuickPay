'use client';

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Go back"
        >
            <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400" />
        </button>
    );
}
