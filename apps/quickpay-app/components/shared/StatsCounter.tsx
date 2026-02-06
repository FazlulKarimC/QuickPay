"use client";

import { useEffect, useState } from "react";

interface StatsCounterProps {
    label: string;
    value: number;
    suffix?: string;
    prefix?: string;
    duration?: number;
}

export function StatsCounter({ label, value, suffix = "", prefix = "", duration = 2000 }: StatsCounterProps) {
    const [count, setCount] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);

            setCount(Math.floor(progress * value));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration, isMounted]);

    return (
        <div className="text-center">
            <div className="text-4xl font-bold text-gradient mb-2">
                {prefix}
                {isMounted ? count.toLocaleString() : "0"}
                {suffix}
            </div>
            <div className="text-[rgb(var(--text-muted))] text-sm">{label}</div>
        </div>
    );
}
