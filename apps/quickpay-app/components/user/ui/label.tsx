import * as React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
    className?: string;
    children: React.ReactNode;
}

export function Label({ className = "", children, ...props }: LabelProps) {
    return (
        <label
            className={`text-sm font-medium text-slate-700 dark:text-slate-300 leading-none 
        peer-disabled:cursor-not-allowed peer-disabled:opacity-70
        ${className}`}
            {...props}
        >
            {children}
        </label>
    );
}
