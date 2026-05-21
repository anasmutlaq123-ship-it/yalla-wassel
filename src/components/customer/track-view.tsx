"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/empty";
import { cn, timeOnly } from "@/lib/utils";
import type { CheckpointKind } from "@/lib/types";

type Resp = {
  order: {
    trackingCode: string;
    pickupBusiness: string;
    pickupArea: string;
    recipientName: string;
    recipientArea: string;
    priority: "normal" | "urgent";
    status: string;
    confirmationCode: string;
    createdAt: string;
    deliveredAt?: string;
  };
  checkpoints: { kind: CheckpointKind; at: string }[];
  delays: { kind: string; at: string; note?: string }[];
  driver: { initial: string; area?: string } | null;
  eta: { label: string };
};

const STEPS: { k: CheckpointKind; label: string; long: string }[] = [
  { k: "assigned", label: "Assigned", long: "A driver has been assigned" },
  { k: "picked_up", label: "Picked up", long: "Driver has your package" },
  { k: "arrived_nearby", label: "Nearby", long: "Driver is in your area" },
  { k: "delivered", label: "Delivered", long: "Handed off to you" },
];

export function TrackView({ code }: { code: string }) {
  const { data, error } = usePoll<Resp>(`/api/track/${code}`, 3000);

  if (error || (data && (data as any).error)) {
    return (
      <div className="mt-16 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-surface-sunken grid place-items-center mb-4">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-ink-faint" aria-hidden>
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
            <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </div>
        <p className="text-base font-semibold text-ink">Order not found.</p>
        <p className="mt-1.5 text-sm text-ink-muted">
          Double-check the code on your receipt — it looks like TRUST-XXXX.
        </p>
      </div>
    );
  }
  if (!data) return <Skeleton className="mt-8 h-96" />;

  const { order, checkpoints, delays, driver, eta } = data;
  const latestKind = checkpoints[checkpoints.length - 1]?.kind;
  const reachedIdx = STEPS.findIndex((s) => s.k === latestKind);
  const currentIdx = reachedIdx;

  return (
    <article className="mt-7">
      {/* Top: tracking code + status */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-mono text-ink-faint">{order.trackingCode}</p>
        {order.priority === "urgent" && <Badge tone="urgent" size="sm">Urgent</Badge>}
      </div>

      <h1 className="mt-3 font-display font-bold text-4xl tracking-[-0.025em] text-ink leading-tight">
        On its way to{" "}
        <span className="text-violet-fill">{order.recipientName}</span>
      </h1>

      <p className="mt-3 text-[15px] text-ink-soft leading-relaxed">
        <span className="font-semibold text-ink">{order.pickupBusiness}</span>
        <span className="mx-2 text-ink-faint">→</span>
        {order.recipientArea}
      </p>

      {/* Driver card */}
      {driver && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-6 flex items-center gap-4 p-4 rounded-3xl bg-white border border-surface-line shadow-card"
        >
          <Avatar name={`${driver.initial} D`} size="lg" />
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.14em] font-bold text-ink-muted">
              Your driver
            </p>
            <p className="font-display font-bold text-lg text-ink tracking-tight mt-0.5">
              {driver.initial}.
            </p>
            {driver.area && (
              <p className="text-xs text-ink-muted">{driver.area} team</p>
            )}
          </div>
          <Badge tone="trust" size="sm">
            <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3 -ml-0.5" aria-hidden>
              <path
                d="M12 2l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6z"
                fill="currentColor"
              />
            </svg>
            Verified
          </Badge>
        </motion.div>
      )}

      {/* Status timeline card */}
      <section className="mt-5 bg-white border border-surface-line rounded-3xl shadow-card p-6">
        <ol className="space-y-5">
          {STEPS.map((s, i) => {
            const reached = i <= currentIdx;
            const isCurrent = i === currentIdx && order.status !== "delivered";
            const cp = checkpoints.find((c) => c.kind === s.k);
            const isLast = i === STEPS.length - 1;
            return (
              <motion.li
                key={s.k}
                layout
                className="flex items-start gap-4 relative"
              >
                {!isLast && (
                  <span
                    aria-hidden
                    className={cn(
                      "absolute left-[11px] top-7 bottom-[-1.5rem] w-0.5 transition-colors",
                      i < currentIdx ? "bg-trust" : "bg-surface-line"
                    )}
                  />
                )}
                <span className="relative mt-0.5 z-10">
                  <span
                    className={cn(
                      "block h-6 w-6 rounded-full grid place-items-center transition-colors",
                      reached
                        ? "bg-trust"
                        : "bg-white border-2 border-surface-line"
                    )}
                  >
                    {reached && i < currentIdx && (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3 text-white"
                        fill="none"
                      >
                        <path
                          d="M2.5 6.5l2.5 2.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </span>
                  {isCurrent && (
                    <span className="absolute inset-0 rounded-full animate-pulse-ring" />
                  )}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={cn(
                        "font-semibold tracking-tight",
                        reached ? "text-ink text-[15px]" : "text-ink-faint text-sm"
                      )}
                    >
                      {s.label}
                    </span>
                    {cp && (
                      <time className="text-xs text-ink-faint tabular-nums font-mono">
                        {timeOnly(cp.at)}
                      </time>
                    )}
                  </div>
                  <p
                    className={cn(
                      "text-sm mt-0.5",
                      reached ? "text-ink-muted" : "text-ink-faint"
                    )}
                  >
                    {s.long}
                  </p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </section>

      {/* Delay banners */}
      <AnimatePresence>
        {delays.map((d, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 rounded-2xl bg-warn-soft border border-warn/15 text-warn px-4 py-3 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-warn" />
              <span className="font-semibold">{kindLabel(d.kind)}</span>
              <span className="text-warn/70">· {timeOnly(d.at)}</span>
            </div>
            {d.note && <div className="text-xs mt-1 text-warn/80">{d.note}</div>}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ETA + Confirmation code */}
      <section className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-white border border-surface-line p-5 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-bold">
            Estimated arrival
          </div>
          <div className="mt-1.5 font-display font-bold text-xl text-ink tabular-nums tracking-tight">
            {eta.label}
          </div>
        </div>
        <div className="rounded-3xl bg-white border border-surface-line p-5 shadow-card">
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-bold">
            Distance
          </div>
          <div className="mt-1.5 font-display font-bold text-xl text-ink tracking-tight">
            ~3.2 km
          </div>
        </div>
      </section>

      {order.status !== "delivered" ? (
        <section className="mt-5 relative overflow-hidden rounded-3xl bg-violet-grad text-white p-6 shadow-glow button-inner-glow">
          <div
            aria-hidden
            className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative">
            <div className="text-[10px] uppercase tracking-[0.18em] opacity-85 font-bold">
              Confirmation code
            </div>
            <div className="mt-2 font-mono tracking-[0.4em] text-4xl font-bold tabular-nums">
              {order.confirmationCode}
            </div>
            <p className="mt-3 text-[13px] text-white/85 leading-relaxed max-w-sm">
              Read this to the driver when your order is handed over. No
              signature, no photo — just the four digits.
            </p>
          </div>
        </section>
      ) : (
        <section className="mt-5 rounded-3xl bg-success-soft border border-success/15 text-success-ink p-7 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-white grid place-items-center mb-3 shadow-card">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-success" aria-hidden>
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="font-display font-bold text-2xl">Delivered.</p>
          <p className="mt-1.5 text-sm text-success-ink/80">
            Thank you for ordering through Yalla Wassel.
          </p>
        </section>
      )}
    </article>
  );
}

function kindLabel(k: string): string {
  return (
    {
      traffic: "Traffic delay",
      store_delay: "The store is preparing your order",
      customer_unavailable: "Couldn't reach you",
      vehicle: "Driver vehicle issue",
      other: "Update",
    }[k] ?? k
  );
}
