"use client";
import React from "react";

export interface CardProps {
  title?: string;
  className?: string;
  children?: React.ReactNode;
}

export function Card({
  title,
  className = "",
  children,
}: CardProps): JSX.Element {
  return (
    <div
      className={`border rounded-xl bg-white dark:bg-slate-900 dark:border-slate-800 ${className}`}
    >
      {title && (
        <h1 className="text-xl border-b pb-2 p-6 dark:border-slate-800">
          {title}
        </h1>
      )}
      <div className={title ? "" : ""}>{children}</div>
    </div>
  );
}
