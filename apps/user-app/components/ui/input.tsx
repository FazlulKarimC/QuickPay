import * as React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
}

export function Input({ className = "", ...props }: InputProps) {
    return (
        <input
            className={`flex h-10 w-full rounded-md border border-slate-200 dark:border-slate-700 
        bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100
        ring-offset-white dark:ring-offset-slate-950
        placeholder:text-slate-500 dark:placeholder:text-slate-400
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
        ${className}`}
            {...props}
        />
    );
}
