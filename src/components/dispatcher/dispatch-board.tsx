"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, Skeleton } from "@/components/ui/empty";
import { cn } from "@/lib/utils";
import type { SuggestedDriver } from "@/lib/types";

type Order = {
  id: string;
  trackingCode: string;
  pickupBusiness: string;
  pickupArea: string;
  recipientName: string;
  recipientArea: string;
  recipientNotes?: string;
  priority: "normal" | "urgent";
  status: "pending" | "assigned" | "in_progress" | "delivered" | "cancelled";
  driverId?: string;
  assignedAt?: string;
};

type Driver = {
  id: string;
  name: string;
  area?: string;
};

export function DispatchBoard() {
  const { data: ordersData, mutate: mutateOrders } = usePoll<{
    orders: Order[];
  }>("/api/orders");
  const { data: driversData } = usePoll<{ drivers: Driver[] }>(
    "/api/drivers",
    5000
  );

  if (!ordersData) return <Skeleton className="h-72" />;

  const active = ordersData.orders.filter(
    (o) =>
      o.status === "pending" ||
      o.status === "assigned" ||
      o.status === "in_progress"
  );
  const pending = active.filter((o) => o.status === "pending");
  const inFlight = active.filter((o) => o.status !== "pending");

  const driverMap = new Map(
    (driversData?.drivers ?? []).map((d) => [d.id, d])
  );

  return (
    <div className="space-y-12">
      {/* ── Pending ─────────────────────────────────────────────── */}
      <section>
        <SectionHeader
          eyebrow="Waiting on a driver"
          title={
            pending.length === 0
              ? "All caught up."
              : `${pending.length} need${pending.length === 1 ? "s" : ""} assignment`
          }
        />
        {pending.length === 0 ? (
          <EmptyState
            title="Inbox zero."
            description="No pending orders. The team is caught up."
          />
        ) : (
          <div className="space-y-5">
            <AnimatePresence>
              {pending.map((o) => (
                <PendingOrderCard
                  key={o.id}
                  order={o}
                  onAssigned={() => mutateOrders()}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── Currently assigned ───────────────────────────────────── */}
      {inFlight.length > 0 && (
        <section>
          <SectionHeader
            eyebrow="Out for delivery"
            title={`${inFlight.length} in flight`}
          />
          <div className="space-y-2.5">
            <AnimatePresence>
              {inFlight.map((o) => (
                <AssignedOrderRow
                  key={o.id}
                  order={o}
                  driver={o.driverId ? driverMap.get(o.driverId) : undefined}
                  onUnassigned={() => mutateOrders()}
                />
              ))}
            </AnimatePresence>
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="mb-5">
      <p className="font-hand text-xl text-trust rotate-[-1deg] origin-left">
        {eyebrow}
      </p>
      <h2 className="font-display text-2xl tracking-[-0.01em] text-ink">
        {title}
      </h2>
    </div>
  );
}

// ── Pending order card with engine suggestions ──────────────────────

function PendingOrderCard({
  order,
  onAssigned,
}: {
  order: Order;
  onAssigned: () => void;
}) {
  const { data } = usePoll<{
    suggestions: SuggestedDriver[];
  }>(`/api/dispatch/suggest?orderId=${order.id}`, 5000);

  const [showOthers, setShowOthers] = useState(false);
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [overrideReason, setOverrideReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestions = data?.suggestions ?? [];
  const top = suggestions[0];
  const rest = suggestions.slice(1, 4);
  const selected =
    pickedId !== null
      ? suggestions.find((s) => s.driverId === pickedId)
      : top;
  const isOverride =
    !!selected && !!top && selected.driverId !== top.driverId;

  async function assign() {
    if (!selected) return;
    if (isOverride && overrideReason.trim().length < 2) {
      setError("Add a short reason for choosing a different driver.");
      return;
    }
    setBusy(true);
    setError(null);
    const res = await fetch("/api/dispatch/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId: order.id,
        driverId: selected.driverId,
        override: isOverride ? { reason: overrideReason } : undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const j = await res.json().catch(() => null);
      setError(j?.error?.message ?? "Could not assign.");
      return;
    }
    onAssigned();
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white border border-surface-line rounded-2xl shadow-card overflow-hidden"
    >
      <OrderHeader order={order} />

      <div className="p-5">
        {!top ? (
          <p className="text-sm text-warn bg-warn-soft rounded-xl p-3">
            No available drivers right now. The team is fully booked.
          </p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-[0.14em] text-ink-faint font-semibold mb-3">
              The engine suggests
            </p>
            <SuggestionCard
              suggestion={top}
              selected={selected?.driverId === top.driverId}
              onClick={() => setPickedId(top.driverId)}
            />

            {rest.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowOthers((v) => !v)}
                  className="text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline"
                >
                  {showOthers
                    ? "Hide other options"
                    : `Show ${rest.length} other option${rest.length === 1 ? "" : "s"}`}
                </button>
                <AnimatePresence>
                  {showOthers && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3 space-y-3 overflow-hidden"
                    >
                      {rest.map((s) => (
                        <SuggestionCard
                          key={s.driverId}
                          suggestion={s}
                          compact
                          selected={selected?.driverId === s.driverId}
                          onClick={() => setPickedId(s.driverId)}
                        />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <AnimatePresence>
              {isOverride && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="mt-4"
                >
                  <label className="block text-xs font-medium text-ink-soft mb-1.5">
                    You're picking {selected!.driverName} over the engine's
                    top pick. One line — why?
                  </label>
                  <input
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="e.g. customer prefers female driver / Hamza is on break"
                    className="w-full h-11 px-3.5 rounded-xl border border-surface-line bg-surface focus:border-trust focus:bg-white transition-all text-sm"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {error && (
              <p role="alert" className="mt-3 text-sm text-warn">
                {error}
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-3">
              <Button onClick={assign} disabled={busy || !selected} size="lg">
                {busy
                  ? "Assigning…"
                  : `Assign ${selected?.driverName ?? "—"}`}
              </Button>
              {pickedId && pickedId !== top.driverId && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setPickedId(null);
                    setOverrideReason("");
                  }}
                >
                  Use the engine's pick
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </motion.article>
  );
}

// ── Assigned / in-flight order row with unassign ────────────────────

function AssignedOrderRow({
  order,
  driver,
  onUnassigned,
}: {
  order: Order;
  driver?: Driver;
  onUnassigned: () => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  // Auto-cancel a confirmation if the dispatcher hesitates.
  useEffect(() => {
    if (!confirming) return;
    const t = setTimeout(() => setConfirming(false), 4000);
    return () => clearTimeout(t);
  }, [confirming]);

  async function unassign() {
    setBusy(true);
    const res = await fetch(`/api/orders/${order.id}/unassign`, {
      method: "POST",
    });
    setBusy(false);
    setConfirming(false);
    if (res.ok) onUnassigned();
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white border border-surface-line rounded-2xl shadow-card px-4 sm:px-5 py-3.5 flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs font-mono text-ink-muted">
          #{order.trackingCode.replace(/^TRUST-/, "")}
        </span>
        {order.priority === "urgent" && <Badge tone="urgent">Urgent</Badge>}
      </div>

      <div className="min-w-0 flex-1 text-sm">
        <div className="truncate text-ink">
          <span className="font-medium">{order.pickupBusiness}</span>
          <span className="text-ink-faint mx-1.5">→</span>
          <span>{order.recipientName}</span>
          <span className="text-ink-muted">, {order.recipientArea}</span>
        </div>
        <div className="text-xs text-ink-muted mt-0.5 flex items-center gap-1.5">
          <span
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              order.status === "in_progress"
                ? "bg-trust animate-pulse-soft"
                : "bg-ink-faint"
            )}
          />
          <span>
            {order.status === "in_progress"
              ? "In progress"
              : "Assigned, not yet picked up"}
            {" · "}
            {driver?.name ?? "—"}
            {driver?.area ? ` · ${driver.area}` : ""}
          </span>
        </div>
      </div>

      <AnimatePresence mode="popLayout" initial={false}>
        {confirming ? (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-ink-muted">Sure?</span>
            <Button
              size="sm"
              variant="danger"
              onClick={unassign}
              disabled={busy}
            >
              {busy ? "…" : "Yes, unassign"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirming(false)}
              disabled={busy}
            >
              Cancel
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="action"
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => setConfirming(true)}
            >
              Unassign
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  );
}

// ── Shared bits ─────────────────────────────────────────────────────

function OrderHeader({ order }: { order: Order }) {
  return (
    <header className="px-5 py-4 flex flex-wrap items-center justify-between gap-2 border-b border-surface-line">
      <div className="flex items-center gap-2">
        <span className="text-xs font-mono text-ink-muted">
          #{order.trackingCode.replace(/^TRUST-/, "")}
        </span>
        {order.priority === "urgent" && <Badge tone="urgent">Urgent</Badge>}
        <span className="text-sm text-ink">
          <span className="font-medium">{order.pickupBusiness}</span>
          <span className="text-ink-faint mx-2">→</span>
          <span>{order.recipientName}</span>
          <span className="text-ink-muted">, {order.recipientArea}</span>
        </span>
      </div>
      {order.recipientNotes && (
        <span className="text-xs text-ink-muted italic truncate max-w-xs">
          {order.recipientNotes}
        </span>
      )}
    </header>
  );
}

function SuggestionCard({
  suggestion,
  compact = false,
  selected,
  onClick,
}: {
  suggestion: SuggestedDriver;
  compact?: boolean;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full text-left rounded-2xl border transition-all",
        compact ? "p-4" : "p-5",
        selected
          ? "border-trust bg-trust-soft/40 shadow-ring"
          : "border-surface-line bg-surface hover:bg-surface-sunken/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                selected ? "bg-trust" : "bg-ink-faint"
              )}
            />
            <span className="text-lg font-semibold tracking-tight">
              {suggestion.driverName}
            </span>
            {suggestion.area && (
              <span className="text-xs text-ink-muted">
                · {suggestion.area}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
            Score
          </div>
          <div className="text-xl font-semibold tabular-nums tracking-tight text-trust">
            {Math.round(suggestion.score * 100)}
          </div>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {suggestion.reasons.map((r, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-sm text-ink-soft"
          >
            <span className="mt-1.5 h-1 w-1 rounded-full bg-trust shrink-0" />
            <span>{r.label}</span>
          </li>
        ))}
      </ul>
    </button>
  );
}
