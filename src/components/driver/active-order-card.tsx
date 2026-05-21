"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CheckpointKind, DelayKind } from "@/lib/types";

type Order = {
  id: string;
  trackingCode: string;
  pickupBusiness: string;
  pickupArea: string;
  recipientName: string;
  recipientArea: string;
  recipientNotes?: string;
  priority: "normal" | "urgent";
  status: string;
  confirmationCode: string;
};

const STEPS: CheckpointKind[] = [
  "assigned",
  "picked_up",
  "arrived_nearby",
  "delivered",
];

export function ActiveOrderCard({
  order,
  checkpoints,
  delays,
  eta,
  onUpdate,
}: {
  order: Order;
  checkpoints: { kind: string; at: string }[];
  delays: { kind: string; at: string }[];
  eta?: string;
  onUpdate: () => void;
}) {
  const lastKind = (checkpoints[checkpoints.length - 1]?.kind ??
    "assigned") as CheckpointKind;
  const lastIdx = STEPS.indexOf(lastKind);
  const nextKind = STEPS[lastIdx + 1] as CheckpointKind | undefined;

  const [busy, setBusy] = useState(false);
  const [showDelay, setShowDelay] = useState(false);
  const [showCodePrompt, setShowCodePrompt] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function advance() {
    if (!nextKind) return;
    if (nextKind === "delivered") {
      setShowCodePrompt(true);
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/checkpoint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: nextKind }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error?.message ?? "Couldn't save. Try again.");
      return;
    }
    onUpdate();
  }

  async function confirmDelivered() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/orders/${order.id}/checkpoint`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "delivered", confirmationCode: code }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error?.message ?? "Couldn't save. Try again.");
      return;
    }
    setShowCodePrompt(false);
    setCode("");
    onUpdate();
  }

  async function addDelay(kind: DelayKind) {
    setBusy(true);
    await fetch(`/api/orders/${order.id}/delay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    setBusy(false);
    setShowDelay(false);
    onUpdate();
  }

  const buttonLabel = (() => {
    switch (nextKind) {
      case "picked_up":
        return "I've picked it up";
      case "arrived_nearby":
        return "I'm nearby";
      case "delivered":
        return "Hand off the order";
      default:
        return "Delivered";
    }
  })();

  return (
    <div className="flex flex-col">
      <div className="bg-white border border-surface-line rounded-3xl shadow-soft overflow-hidden">
        {/* Header */}
        <header className="px-6 pt-6 pb-3 flex items-center justify-between">
          <span className="text-xs font-mono text-ink-muted">
            #{order.trackingCode.replace(/^TRUST-/, "")}
          </span>
          {order.priority === "urgent" && <Badge tone="urgent" size="sm">Urgent</Badge>}
        </header>

        {/* From/To */}
        <div className="px-6 pb-6">
          <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 items-start">
            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-ink-muted mt-1.5">
              From
            </span>
            <div>
              <p className="text-base font-semibold text-ink leading-snug">
                {order.pickupBusiness}
              </p>
              <p className="text-xs text-ink-muted">{order.pickupArea}</p>
            </div>

            <span className="block h-7 w-px bg-surface-line mx-auto" aria-hidden />
            <span aria-hidden />

            <span className="text-[10px] uppercase tracking-[0.16em] font-bold text-trust mt-1.5">
              To
            </span>
            <div>
              <p className="font-display font-bold text-2xl text-ink tracking-tight leading-tight">
                {order.recipientName}
              </p>
              <p className="text-sm text-ink-soft">{order.recipientArea}</p>
              {order.recipientNotes && (
                <p className="mt-1 text-xs text-ink-muted leading-relaxed">
                  {order.recipientNotes}
                </p>
              )}
            </div>
          </div>
        </div>

        {eta && (
          <div className="px-6 pb-5">
            <div className="rounded-2xl bg-trust-soft border border-trust/15 px-4 py-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.14em] text-trust-ink font-bold">
                ETA
              </span>
              <span className="text-lg font-bold text-trust-ink tabular-nums">
                {eta}
              </span>
            </div>
          </div>
        )}

        <StepperLabeled last={lastIdx} />
      </div>

      {nextKind ? (
        <motion.button
          onClick={advance}
          disabled={busy}
          whileTap={{ scale: 0.985 }}
          className="mt-5 relative h-24 w-full rounded-3xl bg-violet-grad text-white font-bold text-xl tracking-tight shadow-glow active:shadow-lift disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden button-inner-glow"
        >
          <span className="relative z-10 inline-flex items-center gap-3">
            {busy ? "…" : buttonLabel}
            {!busy && (
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
                <path
                  d="M5 12h14m0 0l-5-5m5 5l-5 5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </motion.button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-3xl bg-violet-grad text-white p-7 text-center shadow-glow button-inner-glow"
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
          <div className="font-display font-bold text-2xl">Delivered.</div>
          <div className="text-sm mt-1.5 text-white/85">
            Trust ledger updated. Take a breath.
          </div>
        </motion.div>
      )}

      {nextKind && (
        <button
          onClick={() => setShowDelay(true)}
          className="mt-4 text-sm font-medium text-ink-muted hover:text-trust transition-colors self-center"
        >
          Something's holding it up? Add a delay reason
        </button>
      )}

      {error && (
        <div className="mt-3 rounded-2xl bg-accent-soft text-accent-ink text-sm p-3.5">
          {error}
        </div>
      )}

      <AnimatePresence>
        {showDelay && (
          <Sheet
            onClose={() => setShowDelay(false)}
            title="What's causing the delay?"
          >
            <DelayPicker onPick={addDelay} disabled={busy} />
          </Sheet>
        )}
        {showCodePrompt && (
          <Sheet
            onClose={() => setShowCodePrompt(false)}
            title="Confirm with the customer"
          >
            <p className="text-sm text-ink-muted leading-relaxed">
              Ask the customer for their 4-digit code (it's on their tracking
              page). No signature, no photo — just the four digits.
            </p>
            <input
              value={code}
              onChange={(e) =>
                setCode(e.target.value.replace(/[^0-9]/g, "").slice(0, 4))
              }
              placeholder="• • • •"
              inputMode="numeric"
              autoFocus
              className="mt-5 w-full h-24 text-center text-4xl tracking-[0.6em] font-mono rounded-3xl border border-surface-line bg-surface focus:bg-white focus:border-trust focus:shadow-ring"
            />
            {error && <p className="mt-2 text-sm text-accent-ink">{error}</p>}
            <Button
              onClick={confirmDelivered}
              size="lg"
              full
              className="mt-4"
              disabled={code.length !== 4 || busy}
            >
              Confirm delivery
            </Button>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  );
}

function StepperLabeled({ last }: { last: number }) {
  const LABELS = ["Assigned", "Picked up", "Nearby", "Delivered"];
  return (
    <div className="px-6 pb-6 pt-2 border-t border-surface-line">
      <ol className="flex items-center gap-2">
        {STEPS.map((_, i) => (
          <li key={i} className="flex-1">
            <span
              className={cn(
                "block h-1.5 rounded-full transition-colors",
                i <= last ? "bg-trust" : "bg-surface-line"
              )}
            />
            <span
              className={cn(
                "block mt-2 text-[10px] font-bold uppercase tracking-[0.08em] text-center",
                i <= last ? "text-trust-ink" : "text-ink-faint"
              )}
            >
              {LABELS[i]}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function DelayPicker({
  onPick,
  disabled,
}: {
  onPick: (k: DelayKind) => void;
  disabled?: boolean;
}) {
  const options: { k: DelayKind; label: string }[] = [
    { k: "traffic", label: "Traffic" },
    { k: "store_delay", label: "Store delay" },
    { k: "customer_unavailable", label: "Customer unavailable" },
    { k: "vehicle", label: "Vehicle issue" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 mt-2">
      {options.map((o) => (
        <button
          key={o.k}
          disabled={disabled}
          onClick={() => onPick(o.k)}
          className="h-20 rounded-2xl border border-surface-line bg-white hover:bg-trust-soft hover:border-trust/30 text-base font-semibold text-ink transition-all active:scale-[0.98]"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 60 }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-6 max-w-md mx-auto shadow-lift"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-12 rounded-full bg-surface-line mx-auto mb-5" />
        <h3 className="font-display font-bold text-lg tracking-tight mb-4 text-ink">
          {title}
        </h3>
        {children}
        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-sm text-ink-muted py-3 hover:text-ink transition-colors"
        >
          Cancel
        </button>
      </motion.div>
    </motion.div>
  );
}
