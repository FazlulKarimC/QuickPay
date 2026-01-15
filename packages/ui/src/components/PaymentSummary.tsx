import React from 'react';

export function PaymentSummary({
    items,
}: {
    items: Array<{ label: string; value: React.ReactNode; highlight?: boolean }>;
}) {
    return (
        <div className="space-y-3">
            {items.map((item, i) => (
                <div
                    key={i}
                    className={`flex justify-between items-center py-2 
            ${i < items.length - 1 ? 'border-b border-slate-200 dark:border-slate-800' : ''}
            ${item.highlight ? 'font-semibold' : ''}`}
                >
                    <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
                    <span className={item.highlight ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}>
                        {item.value}
                    </span>
                </div>
            ))}
        </div>
    );
}
