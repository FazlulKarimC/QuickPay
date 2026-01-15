import React from 'react';

export function MerchantHeader({
    name,
    logo,
    reference,
}: {
    name: string;
    logo?: string;
    reference?: string;
}) {
    return (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
            <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 flex items-center justify-center">
                {logo ? (
                    <img src={logo} alt={name} className="w-8 h-8 rounded" />
                ) : (
                    <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {name.charAt(0)}
                    </span>
                )}
            </div>
            <div className="flex-1">
                <p className="font-semibold text-slate-900 dark:text-slate-100">{name}</p>
                {reference && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Ref: {reference}
                    </p>
                )}
            </div>
        </div>
    );
}
