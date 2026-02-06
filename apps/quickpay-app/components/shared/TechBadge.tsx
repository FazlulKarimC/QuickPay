"use client";

interface TechBadgeProps {
    name: string;
    icon?: string;
}

export function TechBadge({ name, icon }: TechBadgeProps) {
    return (
        <div className="group relative inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[rgb(var(--surface))] border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-300 hover:scale-105 cursor-default">
            {icon && <span className="text-lg">{icon}</span>}
            <span className="text-sm font-medium text-[rgb(var(--text-secondary))] group-hover:text-[rgb(var(--text))] transition-colors">
                {name}
            </span>

            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-[rgb(var(--primary))] opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-300" />
        </div>
    );
}
