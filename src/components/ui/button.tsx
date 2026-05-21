import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium tracking-[-0.005em] transition-all duration-300 ease-spring select-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.985]",
  {
    variants: {
      variant: {
        // Primary — solid violet, soft purple shadow that lifts on hover
        primary:
          "bg-trust text-white shadow-soft hover:bg-trust-ink hover:shadow-glow button-inner-glow",
        // Gradient — the dramatic CTA used in the hero
        gradient:
          "bg-violet-grad text-white shadow-soft hover:shadow-glow button-inner-glow",
        // Secondary — clean white pill with hairline border
        secondary:
          "bg-white text-ink border border-surface-line shadow-card hover:border-trust/30 hover:bg-surface hover:shadow-soft",
        // Ghost — text-only, hover swap
        ghost:
          "text-ink-soft hover:text-trust hover:bg-trust-soft/60",
        outline:
          "border border-trust/30 text-trust-ink bg-transparent hover:bg-trust-soft/50",
        danger:
          "bg-accent text-white shadow-soft hover:brightness-105 hover:shadow-lift",
        link:
          "text-trust underline-offset-4 hover:underline px-0 h-auto",
      },
      size: {
        sm: "h-9 px-4 text-xs rounded-xl",
        md: "h-11 px-5 text-sm rounded-2xl",
        lg: "h-13 px-7 text-[15px] rounded-2xl",
        xl: "h-16 px-9 text-base rounded-3xl",
        // Driver Silent Mode mega-button
        mega: "h-24 px-10 text-xl font-semibold rounded-3xl",
      },
      full: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      full: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, full, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, full }), className)}
      {...props}
    />
  )
);
Button.displayName = "Button";

export { buttonVariants };
