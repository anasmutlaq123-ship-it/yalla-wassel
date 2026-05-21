import { cn } from "@/lib/utils";

/** Initials avatar — we never store driver photos (privacy by design). */
export function Avatar({
  name,
  size = "md",
  className,
  tone = "violet",
}: {
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  tone?: "violet" | "white" | "dark";
}) {
  const dim = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-base",
    xl: "h-20 w-20 text-2xl",
  }[size];
  const initials = name
    .split(/\s+/)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const palette = {
    violet:
      "bg-violet-grad text-white shadow-soft",
    white:
      "bg-white text-trust-ink border border-trust-soft",
    dark:
      "bg-ink text-white",
  }[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold tracking-tight select-none",
        dim,
        palette,
        className
      )}
      aria-hidden
    >
      {initials}
    </span>
  );
}
