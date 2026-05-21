import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg" | "xl";

const MARK_SIZE: Record<Size, number> = {
  sm: 30,
  md: 38,
  lg: 50,
  xl: 92,
};

// Wordmark height — set on the text so the mark + text optically align.
const TEXT_SIZE: Record<Size, string> = {
  sm: "text-base",
  md: "text-lg",
  lg: "text-2xl",
  xl: "text-4xl",
};

const GAP: Record<Size, string> = {
  sm: "gap-2",
  md: "gap-2.5",
  lg: "gap-3",
  xl: "gap-4",
};

/** The transparent scooter mark — used wherever a bare icon is right. */
export function LogoMark({
  size = "md",
  className,
}: {
  size?: Size;
  className?: string;
}) {
  const dim = MARK_SIZE[size];
  return (
    <Image
      src="/logo.png?v=5"
      alt=""
      width={dim}
      height={dim}
      priority
      className={cn("shrink-0 select-none", className)}
    />
  );
}

/** Mark + handcrafted wordmark. Self-wraps in a Link to the homepage. */
export function Logo({
  size = "md",
  className,
  asLink = true,
  href = "/",
  showText = true,
}: {
  size?: Size;
  className?: string;
  asLink?: boolean;
  href?: string;
  showText?: boolean;
}) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center",
        GAP[size],
        asLink && "transition-opacity hover:opacity-85",
        className
      )}
    >
      <LogoMark size={size} />
      {showText && (
        <span
          className={cn(
            "font-semibold tracking-[-0.015em] text-trust-ink leading-none",
            TEXT_SIZE[size]
          )}
        >
          Yalla&nbsp;Wassel
        </span>
      )}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link
      href={href}
      aria-label="Yalla Wassel · home"
      className="inline-flex items-center"
    >
      {content}
    </Link>
  );
}
