import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.06em] leading-none",
  {
    variants: {
      tone: {
        neutral: "bg-surface text-ink-soft",
        trust: "bg-trust-soft text-trust-ink",
        urgent: "bg-accent-soft text-accent-ink",
        success: "bg-success-soft text-success-ink",
        warn: "bg-warn-soft text-warn",
        info: "bg-info-soft text-info",
        outline: "border border-surface-line text-ink-soft bg-transparent",
        dark: "bg-ink text-white",
        glass: "glass text-ink-soft border border-surface-line",
      },
      size: {
        sm: "px-2.5 py-0.5 text-[10px]",
        md: "px-3 py-1 text-[11px]",
      },
    },
    defaultVariants: { tone: "neutral", size: "md" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, size, ...p }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)} {...p} />
  );
}

/** A status dot + text — used for driver availability, order status, etc. */
export function StatusPill({
  label,
  tone = "neutral",
  pulse = false,
}: {
  label: string;
  tone?: "neutral" | "trust" | "success" | "urgent" | "warn";
  pulse?: boolean;
}) {
  const dotColor =
    tone === "success"
      ? "bg-success"
      : tone === "trust"
        ? "bg-trust"
        : tone === "urgent"
          ? "bg-accent"
          : tone === "warn"
            ? "bg-warn"
            : "bg-ink-faint";
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-soft">
      <span className="relative inline-flex h-2 w-2">
        {pulse && (
          <span
            className={cn(
              "absolute inset-0 rounded-full opacity-60 animate-ping",
              dotColor
            )}
          />
        )}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", dotColor)} />
      </span>
      {label}
    </span>
  );
}
