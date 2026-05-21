"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const items = [
  { href: "/dispatcher", label: "Command", icon: HomeIcon },
  { href: "/dispatcher/dispatch", label: "Dispatch", icon: SendIcon },
  { href: "/dispatcher/orders", label: "Orders", icon: BoxIcon },
  { href: "/dispatcher/drivers", label: "Team", icon: UsersIcon },
];

export function DispatcherNav() {
  const path = usePathname();
  return (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {items.map((it) => {
        const active =
          it.href === "/dispatcher"
            ? path === "/dispatcher"
            : path?.startsWith(it.href);
        const Icon = it.icon;
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "group flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all",
              active
                ? "bg-trust-soft text-trust-ink"
                : "text-ink-muted hover:bg-surface hover:text-ink"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-colors",
                active ? "text-trust" : "text-ink-faint group-hover:text-ink"
              )}
            />
            <span>{it.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 11l8-7 8 7v9a1 1 0 01-1 1h-4v-6h-6v6H5a1 1 0 01-1-1v-9z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function SendIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 12l16-7-4 16-4-6-8-3z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function BoxIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M4 8l8-4 8 4M4 8v8l8 4m-8-12l8 4m0 0v8m0-8l8-4m0 0v8l-8 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function UsersIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M3 19c0-3 2.7-5 6-5s6 2 6 5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="17" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M15 14c2.5 0 6 1.4 6 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
