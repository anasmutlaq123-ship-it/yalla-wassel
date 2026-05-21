"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton, EmptyState } from "@/components/ui/empty";
import { SignOut } from "@/components/sign-out";
import { cn, timeOnly } from "@/lib/utils";
import type { CheckpointKind, Order } from "@/lib/types";

type EnrichedOrder = {
  order: Order;
  checkpoints: { kind: CheckpointKind; at: string }[];
  delays: { kind: string; at: string; note?: string }[];
  driver: { initial: string; area?: string } | null;
  eta: { label: string };
};

const STEPS: { k: CheckpointKind; label: string }[] = [
  { k: "assigned", label: "Assigned" },
  { k: "picked_up", label: "Picked up" },
  { k: "arrived_nearby", label: "Nearby" },
  { k: "delivered", label: "Delivered" },
];

export function CustomerDashboard({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const { data } = usePoll<{ orders: EnrichedOrder[] }>(
    "/api/customer/orders",
    3000
  );

  const allOrders = data?.orders ?? [];

  const active = allOrders.filter(
    (e) => e.order.status !== "delivered" && e.order.status !== "cancelled"
  );
  const past = allOrders.filter(
    (e) => e.order.status === "delivered" || e.order.status === "cancelled"
  );

  const stats = useMemo(() => {
    const delivered30d = past.filter((p) => {
      if (!p.order.deliveredAt) return false;
      const days =
        (Date.now() - new Date(p.order.deliveredAt).getTime()) / 86400000;
      return days <= 30;
    });
    return {
      active: active.length,
      delivered30d: delivered30d.length,
      total: allOrders.length,
    };
  }, [active, past, allOrders]);

  return (
    <div>
      {/* Header */}
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-3">
          <Avatar name={userName} size="sm" />
          <div className="hidden sm:block">
            <div className="text-xs font-semibold text-ink leading-none">
              {userName}
            </div>
            <div className="text-[10px] text-ink-muted">Customer</div>
          </div>
          <SignOut className="ml-1" />
        </div>
      </header>

      {/* Greeting */}
      <section className="mt-10">
        <p className="text-xs uppercase tracking-[0.16em] font-bold text-trust">
          Your orders
        </p>
        <h1 className="mt-2 font-display font-bold text-4xl tracking-[-0.025em] text-ink leading-none">
          Hi, {userName.split(" ")[0]}.
        </h1>
        <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">
          {stats.active > 0
            ? `${stats.active} order${stats.active === 1 ? "" : "s"} in flight. We'll keep this page in sync as your driver moves.`
            : "No active deliveries right now. Your past orders are below."}
        </p>
      </section>

      {/* Stat strip */}
      <section className="mt-7 grid grid-cols-3 gap-3">
        <StatTile label="Active" value={stats.active} accent="trust" />
        <StatTile label="Delivered (30d)" value={stats.delivered30d} accent="success" />
        <StatTile label="Lifetime" value={stats.total} accent="neutral" />
      </section>

      {/* Active orders */}
      <section className="mt-10">
        <SectionHeader title="In flight" sub="Live updates" />
        {!data ? (
          <Skeleton className="h-72" />
        ) : active.length === 0 ? (
          <div className="bg-white rounded-3xl border border-surface-line">
            <EmptyState
              title="No active deliveries."
              description="Order something from a Yalla Wassel partner shop and it'll appear here in real time."
            />
          </div>
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {active.map((e) => (
                <ActiveOrderCard key={e.order.id} entry={e} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* Past orders */}
      {past.length > 0 && (
        <section className="mt-12">
          <SectionHeader title="Past orders" sub={`${past.length} total`} />
          <div className="space-y-2.5">
            {past.map((e) => (
              <PastOrderRow key={e.order.id} entry={e} />
            ))}
          </div>
        </section>
      )}

      <footer className="mt-16 text-center text-xs text-ink-muted leading-relaxed">
        We don't track our drivers.
        <br />
        We keep our promises to you.
      </footer>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="font-display font-bold text-xl tracking-tight text-ink">
        {title}
      </h2>
      <p className="text-xs text-ink-muted">{sub}</p>
    </div>
  );
}

function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "trust" | "success" | "neutral";
}) {
  return (
    <div className="bg-white rounded-2xl border border-surface-line p-4 shadow-card">
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            accent === "trust" && "bg-trust",
            accent === "success" && "bg-success",
            accent === "neutral" && "bg-ink-faint"
          )}
        />
        <p className="text-[10px] uppercase tracking-[0.12em] text-ink-muted font-bold">
          {label}
        </p>
      </div>
      <p className="mt-1.5 text-2xl font-bold tabular-nums text-ink tracking-tight">
        {value}
      </p>
    </div>
  );
}

// ── Active order card — full track-style ──────────────────────────

function ActiveOrderCard({ entry }: { entry: EnrichedOrder }) {
  const { order, checkpoints, delays, driver, eta } = entry;
  const latest = checkpoints[checkpoints.length - 1]?.kind;
  const reachedIdx = STEPS.findIndex((s) => s.k === latest);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white border border-surface-line rounded-3xl shadow-soft overflow-hidden"
    >
      {/* Top strip */}
      <div className="px-5 sm:px-6 pt-5 pb-3 flex items-center justify-between">
        <span className="text-[11px] font-mono text-ink-faint">
          {order.trackingCode}
        </span>
        {order.priority === "urgent" && <Badge tone="urgent" size="sm">Urgent</Badge>}
      </div>

      {/* From / To */}
      <div className="px-5 sm:px-6 pb-4">
        <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-ink-muted">
          From
        </div>
        <div className="mt-1 text-base font-semibold text-ink">
          {order.pickupBusiness}
        </div>
        <div className="text-xs text-ink-muted">{order.pickupArea}</div>

        <div className="my-3 h-px bg-surface-line" />

        <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-trust">
          To you
        </div>
        <div className="mt-1 text-base font-semibold text-ink">
          {order.recipientArea}
        </div>
        {order.recipientNotes && (
          <div className="text-xs text-ink-muted mt-0.5">
            {order.recipientNotes}
          </div>
        )}
      </div>

      {/* Stepper */}
      <div className="px-5 sm:px-6 pb-5">
        <ol className="flex items-center gap-2">
          {STEPS.map((s, i) => {
            const reached = i <= reachedIdx;
            return (
              <li key={s.k} className="flex-1">
                <span
                  className={cn(
                    "block h-1.5 rounded-full transition-colors",
                    reached ? "bg-trust" : "bg-surface-line"
                  )}
                />
                <span
                  className={cn(
                    "block mt-2 text-[10px] font-bold uppercase tracking-[0.06em] text-center",
                    reached ? "text-trust-ink" : "text-ink-faint"
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      </div>

      {/* ETA + Driver row */}
      <div className="px-5 sm:px-6 pb-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-surface border border-surface-line p-3.5">
          <div className="text-[10px] uppercase tracking-[0.12em] text-ink-muted font-bold">
            ETA
          </div>
          <div className="mt-1 text-base font-bold text-ink tabular-nums">
            {eta.label}
          </div>
        </div>
        <div className="rounded-2xl bg-surface border border-surface-line p-3.5">
          <div className="text-[10px] uppercase tracking-[0.12em] text-ink-muted font-bold">
            Driver
          </div>
          {driver ? (
            <div className="mt-1 flex items-center gap-2">
              <span className="h-7 w-7 rounded-full bg-violet-grad text-white text-xs font-bold grid place-items-center">
                {driver.initial}
              </span>
              <div className="text-sm font-semibold text-ink">
                {driver.initial}.
              </div>
            </div>
          ) : (
            <div className="mt-1 text-sm text-ink-faint italic">Awaiting</div>
          )}
        </div>
      </div>

      {/* Delays */}
      {delays.length > 0 && (
        <div className="px-5 sm:px-6 pb-5 space-y-2">
          {delays.map((d, i) => (
            <div
              key={i}
              className="rounded-2xl bg-warn-soft border border-warn/15 text-warn px-3.5 py-2.5 text-sm flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-warn" />
              <span className="font-semibold">{delayLabel(d.kind)}</span>
              <time className="ml-auto font-mono text-[11px] text-warn/80">
                {timeOnly(d.at)}
              </time>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation code */}
      <div className="px-5 sm:px-6 pb-6">
        <div className="relative overflow-hidden rounded-3xl bg-violet-grad text-white p-5 shadow-soft button-inner-glow">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          />
          <div className="relative flex items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.16em] opacity-85 font-bold">
                Read to the driver
              </div>
              <div className="mt-1.5 font-mono tracking-[0.4em] text-3xl font-bold tabular-nums">
                {order.confirmationCode}
              </div>
            </div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-9 w-9 opacity-80 shrink-0"
              aria-hidden
            >
              <path
                d="M12 18.5c0 1.4 1.1 2.5 2.5 2.5S17 19.9 17 18.5 15.9 16 14.5 16 12 17.1 12 18.5z"
                stroke="currentColor"
                strokeWidth="1.6"
              />
              <path
                d="M14.5 16V6a3 3 0 016 0v10"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ── Compact past order row ────────────────────────────────────────

function PastOrderRow({ entry }: { entry: EnrichedOrder }) {
  const { order } = entry;
  const when = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
      })
    : "—";
  return (
    <div className="bg-white border border-surface-line rounded-2xl p-4 flex items-center gap-3.5 hover:shadow-card transition-shadow">
      <span className="h-10 w-10 rounded-2xl bg-success-soft text-success-ink grid place-items-center shrink-0">
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
          <path
            d="M5 12l5 5L20 7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-ink-faint">
            {order.trackingCode}
          </span>
        </div>
        <div className="text-sm font-semibold text-ink truncate">
          {order.pickupBusiness}
        </div>
      </div>
      <div className="text-right shrink-0">
        <div className="text-xs font-semibold text-success-ink">Delivered</div>
        <div className="text-[11px] text-ink-muted tabular-nums">{when}</div>
      </div>
    </div>
  );
}

function delayLabel(k: string): string {
  return (
    {
      traffic: "Traffic delay",
      store_delay: "Shop is preparing your order",
      customer_unavailable: "Couldn't reach you",
      vehicle: "Driver vehicle issue",
      other: "Update",
    }[k] ?? k
  );
}
