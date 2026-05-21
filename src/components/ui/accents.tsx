import { cn } from "@/lib/utils";

/** Hand-drawn underline that sits under inline text. */
export function WavyUnderline({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 200 12"
      preserveAspectRatio="none"
      className={cn(
        "absolute left-[-0.15em] right-[-0.15em] -bottom-2 w-[110%] h-[0.32em] text-trust",
        className
      )}
    >
      <path
        d="M 2 7 Q 25 1, 50 6 T 100 6 T 150 6 T 198 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** Hand-drawn circle around inline text. */
export function ScribbleCircle({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 220 60"
      preserveAspectRatio="none"
      className={cn(
        "absolute inset-[-12%_-8%] w-[116%] h-[124%] text-trust pointer-events-none",
        className
      )}
    >
      <path
        d="M 18 32 C 12 12, 80 6, 140 8 C 200 10, 218 28, 210 42 C 198 56, 130 56, 70 54 C 22 52, 6 44, 14 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
        opacity="0.9"
      />
    </svg>
  );
}

/** Loose downward squiggle with an arrowhead — sits between sections. */
export function SquiggleArrow({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 60 110"
      className={cn("text-ink-faint", className)}
      fill="none"
    >
      <path
        d="M28 6 C 44 22, 18 38, 32 58 C 44 76, 22 90, 30 100"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M22 92 L 30 102 L 38 92"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Loose right-pointing arrow — for inline annotations. */
export function ArrowRightSketch({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 80 28"
      className={cn("text-ink-faint", className)}
      fill="none"
    >
      <path
        d="M4 14 C 20 6, 40 22, 74 14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M66 8 L 74 14 L 66 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** A subtle inline highlighter swipe behind text. */
export function HighlightSwipe({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute inset-x-[-0.1em] bottom-0 top-[55%] -z-10 rounded-sm bg-trust/15 -rotate-1",
        className
      )}
    />
  );
}
