"use client"

import * as React from "react";

interface TextInputProps {
    placeholder: string;
    onChange: (value: string) => void;
    label: string;
}

export const TextInput = ({
    placeholder,
    onChange,
    label
}: TextInputProps) => {
    return <div className="pt-2">
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-slate-300">{label}</label>
        <input onChange={(e) => onChange(e.target.value)} type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100" placeholder={placeholder} />
    </div>
}

// Also export Input component for compatibility
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