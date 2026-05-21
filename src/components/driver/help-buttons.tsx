"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import type { HelpKind } from "@/lib/types";

const OPTIONS: { k: HelpKind; label: string; sub?: string }[] = [
  { k: "traffic", label: "Traffic blocked" },
  { k: "customer_unavailable", label: "Customer unavailable" },
  { k: "store_delay", label: "Store is taking too long" },
  { k: "vehicle", label: "Vehicle issue", sub: "We'll find a handoff." },
];

export function HelpButtons() {
  const router = useRouter();
  const [busy, setBusy] = useState<HelpKind | null>(null);
  const [sent, setSent] = useState<HelpKind | null>(null);

  async function raise(k: HelpKind) {
    setBusy(k);
    await fetch("/api/help", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: k }),
    });
    setBusy(null);
    setSent(k);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 rounded-3xl bg-violet-grad text-white p-8 text-center shadow-glow button-inner-glow"
      >
        <div className="mx-auto h-12 w-12 rounded-2xl bg-white/15 grid place-items-center mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
            <path
              d="M5 12l5 5L20 7"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-display font-bold text-xl">Dispatcher notified.</p>
        <p className="mt-1.5 text-sm text-white/85 leading-relaxed">
          You don't need to call. Keep going — we've got the rest.
        </p>
        <button
          onClick={() => router.push("/driver")}
          className="mt-6 inline-flex items-center justify-center px-6 h-12 rounded-2xl bg-white text-trust-ink font-semibold hover:bg-canvas transition-colors"
        >
          Back to my delivery
        </button>
      </motion.div>
    );
  }

  return (
    <div className="mt-7 grid grid-cols-2 gap-3">
      {OPTIONS.map((o) => (
        <button
          key={o.k}
          disabled={!!busy}
          onClick={() => raise(o.k)}
          className="h-28 rounded-3xl border border-surface-line bg-white hover:bg-accent-soft hover:border-accent/40 hover:shadow-soft transition-all p-4 text-left active:scale-[0.98]"
        >
          <div className="text-base font-medium text-ink">{o.label}</div>
          {o.sub && (
            <div className="mt-1 text-xs text-ink-muted">{o.sub}</div>
          )}
          {busy === o.k && (
            <div className="text-xs text-ink-faint mt-2">Sending…</div>
          )}
        </button>
      ))}
    </div>
  );
}
