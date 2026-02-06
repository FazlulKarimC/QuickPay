"use client";

import { LucideIcon } from "lucide-react";

interface FeatureCardProps {
    icon: LucideIcon;
    title: string;
    description: string;
    gradient?: string;
}

export function FeatureCard({ icon: Icon, title, description, gradient }: FeatureCardProps) {
    return (
        <div className="group relative">
            <div className="absolute inset-0 bg-linear-to-br from-[rgb(var(--primary))] to-[rgb(var(--primary-dark))] rounded-2xl opacity-0 group-hover:opacity-10 transition-opacity duration-300 blur-xl" />

            <div className="relative glass-card p-6 rounded-2xl border border-[rgb(var(--border))] hover:border-[rgb(var(--primary))] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                {/* Icon with gradient background */}
                <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${gradient || "bg-linear-to-br from-[rgb(var(--primary-light))] to-[rgb(var(--primary))]"
                        }`}
                >
                    <Icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-[rgb(var(--text))] mb-2">{title}</h3>
                <p className="text-[rgb(var(--text-muted))] leading-relaxed">{description}</p>
            </div>
        </div>
    );
}
