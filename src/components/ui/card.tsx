import * as React from "react";
import { cn } from "@/lib/utils";

export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { variant?: "raised" | "flat" | "violet" }
>(({ className, variant = "raised", ...p }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-3xl border transition-all duration-300",
      variant === "raised" &&
        "bg-white border-surface-line shadow-card hover:shadow-soft",
      variant === "flat" && "bg-surface border-transparent",
      variant === "violet" &&
        "bg-violet-grad-soft border-trust-soft text-trust-ink shadow-card",
      className
    )}
    {...p}
  />
));
Card.displayName = "Card";

export function CardHeader({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("px-6 pt-6 pb-3 space-y-1", className)} {...p} />
  );
}

export function CardTitle({
  className,
  ...p
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "text-base font-semibold text-ink tracking-tight",
        className
      )}
      {...p}
    />
  );
}

export function CardDescription({
  className,
  ...p
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-ink-muted leading-relaxed", className)}
      {...p}
    />
  );
}

export function CardContent({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-6 pb-6 pt-2", className)} {...p} />;
}

export function CardFooter({
  className,
  ...p
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-6 py-4 border-t border-surface-line flex items-center gap-3",
        className
      )}
      {...p}
    />
  );
}
