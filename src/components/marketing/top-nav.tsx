"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "#features", label: "Features" },
  { href: "/login?as=driver", label: "Drivers" },
  { href: "/login?as=dispatcher", label: "Dispatcher" },
  { href: "#about", label: "About" },
];

export function TopNav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -12, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        scrolled
          ? "glass-strong border-b border-surface-line shadow-card"
          : "bg-transparent border-b border-transparent"
      )}
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <Logo size="sm" />

        <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
          {ITEMS.map((it) => (
            <Link
              key={it.href}
              href={it.href}
              className="text-sm font-medium text-ink-soft hover:text-ink px-3.5 py-2 rounded-xl hover:bg-surface-sunken transition-colors"
            >
              {it.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/login" className="hidden sm:inline-flex">
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
          </Link>
          <Link href="/login?as=dispatcher">
            <Button size="sm">
              Start delivering
              <span aria-hidden className="ml-0.5">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
