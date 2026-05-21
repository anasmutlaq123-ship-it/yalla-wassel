import * as React from "react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  description,
  className,
  icon,
}: {
  title: string;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-14 px-6",
        className
      )}
    >
      <div className="h-14 w-14 rounded-2xl bg-trust-soft text-trust-ink grid place-items-center mb-4">
        {icon ?? (
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
            <path
              d="M5 12l5 5L20 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
      <p className="text-base font-semibold text-ink">{title}</p>
      {description && (
        <p className="mt-1.5 text-sm text-ink-muted max-w-sm">{description}</p>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-surface-sunken rounded-2xl animate-pulse-soft",
        className
      )}
    />
  );
}
