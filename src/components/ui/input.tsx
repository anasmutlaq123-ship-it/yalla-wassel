import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...p }, ref) => (
  <input
    ref={ref}
    className={cn(
      "w-full h-12 px-4 rounded-2xl border border-surface-line bg-white text-ink placeholder:text-ink-faint transition-all duration-200 focus:border-trust focus:bg-white focus:shadow-ring",
      className
    )}
    {...p}
  />
));
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...p }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full min-h-[96px] p-4 rounded-2xl border border-surface-line bg-white text-ink placeholder:text-ink-faint transition-all focus:border-trust focus:shadow-ring resize-y",
      className
    )}
    {...p}
  />
));
Textarea.displayName = "Textarea";

export function Label({
  className,
  ...p
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "block text-xs font-semibold text-ink-soft tracking-tight mb-2",
        className
      )}
      {...p}
    />
  );
}
