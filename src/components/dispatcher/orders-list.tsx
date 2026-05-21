"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton, EmptyState } from "@/components/ui/empty";
import { cn, relativeFromNow, timeOnly } from "@/lib/utils";
import type { CheckpointKind } from "@/lib/types";

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

type OrderStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "delivered"
  | "cancelled";

type Order = {
  id: string;
  trackingCode: string;
  pickupBusiness: string;
  pickupArea: string;
  recipientName: string;
  recipientArea: string;
  priority: "normal" | "urgent";
  status: OrderStatus;
  driverId?: string;
  createdAt: string;
};

type Driver = { id: string; name: string; area?: string };

const FILTERS: Array<{ k: OrderStatus | "all"; label: string }> = [
  { k: "all", label: "All" },
  { k: "pending", label: "Pending" },
  { k: "assigned", label: "Assigned" },
  { k: "in_progress", label: "In progress" },
  { k: "delivered", label: "Delivered" },
];

export function OrdersList() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["k"]>("all");
  const { data: ordersData } = usePoll<{ orders: Order[] }>("/api/orders");
  const { data: driversData } = usePoll<{ drivers: Driver[] }>(
    "/api/drivers",
    5000
  );

  const orders = ordersData?.orders ?? [];
  const driverMap = useMemo(
    () => new Map((driversData?.drivers ?? []).map((d) => [d.id, d])),
    [driversData]
  );

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      inFlight: orders.filter(
        (o) => o.status === "assigned" || o.status === "in_progress"
      ).length,
      delivered: orders.filter((o) => o.status === "delivered").length,
    };
  }, [orders]);

  const filtered = orders.filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  return (
    <div className="space-y-7">
      {/* ── Stat row ───────────────────────────────────────────── */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat
          label="Total today"
          value={stats.total}
          accent="neutral"
          loading={!ordersData}
        />
        <Stat
          label="Pending"
          value={stats.pending}
          accent={stats.pending > 0 ? "trust" : "neutral"}
          loading={!ordersData}
        />
        <Stat
          label="In flight"
          value={stats.inFlight}
          accent="success"
          pulse={stats.inFlight > 0}
          loading={!ordersData}
        />
        <Stat
          label="Delivered"
          value={stats.delivered}
          accent="neutral"
          loading={!ordersData}
        />
      </section>

      {/* ── Filter chips ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => {
          const count =
            f.k === "all"
              ? orders.length
              : orders.filter((o) => o.status === f.k).length;
          const active = filter === f.k;
          return (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl text-sm font-medium transition-all",
                active
                  ? "bg-trust text-white shadow-soft"
                  : "bg-white text-ink-soft hover:text-ink hover:bg-surface border border-surface-line"
              )}
            >
              <span>{f.label}</span>
              <span
                className={cn(
                  "tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded-full",
                  active
                    ? "bg-white/20 text-white"
                    : "bg-surface-sunken text-ink-muted"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Orders ─────────────────────────────────────────────── */}
      {!ordersData ? (
        <div className="space-y-2.5">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-surface-line rounded-3xl">
          <EmptyState
            title="Nothing here."
            description={
              filter === "all"
                ? "No orders yet. New ones will appear at the top."
                : `No ${filter.replace("_", " ")} orders right now.`
            }
          />
        </div>
      ) : (
        <div className="space-y-2.5">
          <AnimatePresence>
            {filtered.map((o) => (
              <OrderRow
                key={o.id}
                order={o}
                driver={o.driverId ? driverMap.get(o.driverId) : undefined}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  accent,
  pulse = false,
  loading = false,
}: {
  label: string;
  value: number;
  accent: "neutral" | "trust" | "success";
  pulse?: boolean;
  loading?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-surface-line p-5 shadow-card"
    >
      <div className="flex items-center gap-1.5">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            accent === "trust" && "bg-trust",
            accent === "success" && "bg-success",
            accent === "neutral" && "bg-ink-faint",
            pulse && "animate-pulse-soft"
          )}
        />
        <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-ink-muted">
          {label}
        </p>
      </div>
      <div className="mt-2 text-3xl font-bold text-ink tabular-nums tracking-tight">
        {loading ? "—" : value}
      </div>
    </motion.div>
  );
}

function OrderRow({ order, driver }: { order: Order; driver?: Driver }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={cn(
        "bg-white border rounded-3xl overflow-hidden transition-all duration-200",
        open
          ? "border-trust/40 shadow-soft"
          : "border-surface-line shadow-card hover:shadow-soft hover:border-trust/15"
      )}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 sm:px-5 py-4 flex items-center gap-4 text-left"
      >
        {/* Status block */}
        <StatusGlyph status={order.status} priority={order.priority} />

        {/* Main info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-mono text-ink-faint">
              #{order.trackingCode.replace(/^TRUST-/, "")}
            </span>
            {order.priority === "urgent" && (
              <Badge tone="urgent" size="sm">
                Urgent
              </Badge>
            )}
            <span className="text-[11px] text-ink-muted ml-auto sm:hidden">
              {relativeFromNow(order.createdAt)}
            </span>
          </div>
          <div className="mt-1 text-[15px] text-ink truncate">
            <span className="font-semibold">{order.pickupBusiness}</span>
            <span className="text-ink-faint mx-1.5">→</span>
            <span className="font-medium">{order.recipientName}</span>
            <span className="text-ink-muted">, {order.recipientArea}</span>
          </div>
        </div>

        {/* Driver chip */}
        <div className="hidden md:flex items-center gap-2 shrink-0 min-w-[140px]">
          {driver ? (
            <>
              <Avatar name={driver.name} size="sm" />
              <div className="text-xs">
                <div className="font-semibold text-ink leading-tight">
                  {driver.name}
                </div>
                {driver.area && (
                  <div className="text-ink-muted leading-tight">
                    {driver.area}
                  </div>
                )}
              </div>
            </>
          ) : (
            <span className="text-xs text-ink-faint italic">
              Awaiting driver
            </span>
          )}
        </div>

        {/* Right: status + time */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <StatusBadge status={order.status} />
          <span className="hidden sm:block text-[11px] text-ink-muted tabular-nums">
            {relativeFromNow(order.createdAt)}
          </span>
        </div>

        {/* Chevron */}
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="hidden sm:inline-flex h-7 w-7 rounded-full bg-surface text-ink-muted items-center justify-center shrink-0"
          aria-hidden
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path
              d="M9 6l6 6-6 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-surface-line bg-surface/50"
          >
            <OrderDetail orderId={order.id} order={order} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Status glyph (left-side colored block) ─────────────────────────

function StatusGlyph({
  status,
  priority,
}: {
  status: OrderStatus;
  priority: "normal" | "urgent";
}) {
  const tone = STATUS_VISUAL[status];
  return (
    <div className="relative shrink-0">
      <div
        className={cn(
          "h-11 w-11 rounded-2xl grid place-items-center",
          tone.bg,
          tone.text
        )}
      >
        {tone.icon}
      </div>
      {priority === "urgent" && (
        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent border-2 border-white" />
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const v = STATUS_VISUAL[status];
  return (
    <Badge tone={v.badgeTone} size="sm">
      {v.label}
    </Badge>
  );
}

const STATUS_VISUAL: Record<
  OrderStatus,
  {
    bg: string;
    text: string;
    badgeTone:
      | "neutral"
      | "trust"
      | "success"
      | "urgent"
      | "info"
      | "outline"
      | "warn";
    label: string;
    icon: React.ReactNode;
  }
> = {
  pending: {
    bg: "bg-trust-soft",
    text: "text-trust-ink",
    badgeTone: "trust",
    label: "Pending",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
        <path
          d="M12 7v5l3 2"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  assigned: {
    bg: "bg-info-soft",
    text: "text-info",
    badgeTone: "info",
    label: "Assigned",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M4 12l16-7-4 16-4-6-8-3z"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  in_progress: {
    bg: "bg-violet-grad",
    text: "text-white",
    badgeTone: "trust",
    label: "In flight",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M3 12h13l-3-3M3 12l3 3"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  delivered: {
    bg: "bg-success-soft",
    text: "text-success-ink",
    badgeTone: "success",
    label: "Delivered",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M5 12l5 5L20 7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  cancelled: {
    bg: "bg-surface-sunken",
    text: "text-ink-muted",
    badgeTone: "neutral",
    label: "Cancelled",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
        <path
          d="M6 6l12 12M18 6l-12 12"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
};

// ── Expanded detail ────────────────────────────────────────────────

function OrderDetail({
  orderId,
  order,
}: {
  orderId: string;
  order: Order;
}) {
  const { data } = usePoll<{
    order: Order;
    checkpoints: { kind: CheckpointKind; at: string }[];
    delays: { kind: string; at: string; note?: string }[];
    eta?: { label: string };
  }>(`/api/orders/${orderId}`);

  if (!data)
    return <div className="p-5 text-sm text-ink-faint">Loading…</div>;

  const STEPS: { k: CheckpointKind; label: string }[] = [
    { k: "assigned", label: "Assigned" },
    { k: "picked_up", label: "Picked up" },
    { k: "arrived_nearby", label: "Nearby" },
    { k: "delivered", label: "Delivered" },
  ];
  const latest = data.checkpoints[data.checkpoints.length - 1]?.kind;
  const reachedIdx = STEPS.findIndex((s) => s.k === latest);

  return (
    <div className="p-5 sm:p-6 grid lg:grid-cols-[1.2fr_1fr] gap-6">
      {/* Timeline */}
      <div>
        <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-bold mb-4">
          Timeline
        </div>
        {data.checkpoints.length === 0 ? (
          <p className="text-sm text-ink-muted italic">
            No events yet. The first checkpoint will land here as soon as the
            driver taps "Picked up".
          </p>
        ) : (
          <ol className="space-y-4">
            {STEPS.map((s, i) => {
              const reached = i <= reachedIdx;
              const cp = data.checkpoints.find((c) => c.kind === s.k);
              const isLast = i === STEPS.length - 1;
              return (
                <li key={s.k} className="relative flex items-start gap-3.5">
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn(
                        "absolute left-[11px] top-7 bottom-[-1.25rem] w-0.5 transition-colors",
                        i < reachedIdx ? "bg-trust" : "bg-surface-line"
                      )}
                    />
                  )}
                  <span className="relative z-10 mt-0.5">
                    <span
                      className={cn(
                        "block h-6 w-6 rounded-full grid place-items-center transition-colors",
                        reached
                          ? "bg-trust"
                          : "bg-white border-2 border-surface-line"
                      )}
                    >
                      {reached && i < reachedIdx && (
                        <svg
                          viewBox="0 0 12 12"
                          fill="none"
                          className="h-3 w-3 text-white"
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
                  </span>
                  <div className="flex-1 flex items-baseline justify-between gap-3 min-w-0">
                    <span
                      className={cn(
                        "text-sm font-semibold",
                        reached ? "text-ink" : "text-ink-faint"
                      )}
                    >
                      {s.label}
                    </span>
                    {cp && (
                      <time className="font-mono text-[11px] text-ink-faint tabular-nums">
                        {timeOnly(cp.at)}
                      </time>
                    )}
                  </div>
                </li>
              );
            })}
            {data.delays.map((d, i) => (
              <li
                key={`d${i}`}
                className="flex items-center gap-3.5 rounded-2xl bg-warn-soft border border-warn/15 px-3 py-2"
              >
                <span className="h-2 w-2 rounded-full bg-warn" />
                <span className="text-sm font-semibold text-warn">
                  Delay — {d.kind.replace(/_/g, " ")}
                </span>
                <time className="ml-auto font-mono text-[11px] text-warn/80 tabular-nums">
                  {timeOnly(d.at)}
                </time>
              </li>
            ))}
          </ol>
        )}
      </div>

      {/* Details panel */}
      <div className="space-y-4">
        <div className="rounded-2xl bg-white border border-surface-line p-4">
          <DetailRow
            label="Pickup"
            value={
              <>
                <span className="font-semibold text-ink">
                  {order.pickupBusiness}
                </span>
                <span className="block text-xs text-ink-muted">
                  {order.pickupArea}
                </span>
              </>
            }
          />
          <DividerH />
          <DetailRow
            label="Recipient"
            value={
              <>
                <span className="font-semibold text-ink">
                  {order.recipientName}
                </span>
                <span className="block text-xs text-ink-muted">
                  {order.recipientArea}
                </span>
              </>
            }
          />
          <DividerH />
          <DetailRow
            label="ETA"
            value={
              <span className="font-semibold text-ink tabular-nums">
                {data.eta?.label ?? "—"}
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="py-2.5">
      <div className="text-[10px] uppercase tracking-[0.14em] text-ink-muted font-bold mb-1">
        {label}
      </div>
      <div className="text-sm">{value}</div>
    </div>
  );
}

function DividerH() {
  return <div className="h-px bg-surface-line" />;
}
