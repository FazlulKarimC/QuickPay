"use client"

export const Select = ({ options, onSelect }: {
    onSelect: (value: string) => void;
    options: {
        key: string;
        value: string;
    }[];
}) => {
    return (
        <select
            onChange={(e) => onSelect(e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm rounded-md border 
                border-slate-200 dark:border-slate-700
                bg-white dark:bg-slate-800 
                text-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
                dark:focus:ring-offset-slate-950
                disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {options.map(option => (
                <option
                    key={option.key}
                    value={option.key}
                    className="bg-white dark:bg-slate-800"
                >
                    {option.value}
                </option>
            ))}
        </select>
    );
}