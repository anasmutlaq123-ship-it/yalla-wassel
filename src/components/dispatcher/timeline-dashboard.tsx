"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Badge, StatusPill } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/empty";
import { Avatar } from "@/components/ui/avatar";
import { cn, timeOnly } from "@/lib/utils";
import type {
  CheckpointKind,
  MutualTrustIndex,
  SystemTrustBreakdown,
} from "@/lib/types";
import { HelpAlertBanner } from "./help-alert-banner";

// ────────────────────────────────────────────────────────────────────
// Types from the API
// ────────────────────────────────────────────────────────────────────

type Order = {
  id: string;
  trackingCode: string;
  pickupBusiness: string;
  pickupArea: string;
  recipientName: string;
  recipientArea: string;
  priority: "normal" | "urgent";
  status: "pending" | "assigned" | "in_progress" | "delivered" | "cancelled";
  driverId?: string;
  assignedAt?: string;
};

type Driver = {
  id: string;
  name: string;
  area?: string;
  availability?: "available" | "on_delivery" | "off_duty";
  activeOrders: number;
  trust: { score: number; onTimePct: number };
};

type TrustResp = { mutual: MutualTrustIndex; system: SystemTrustBreakdown };

export function TimelineDashboard() {
  const { data: orders } = usePoll<{ orders: Order[] }>("/api/orders");
  const { data: drivers } = usePoll<{ drivers: Driver[] }>("/api/drivers");
  const { data: trust } = usePoll<TrustResp>("/api/trust/mutual", 5000);

  const allOrders = orders?.orders ?? [];
  const allDrivers = drivers?.drivers ?? [];
  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  const stats = useMemo(() => {
    const active = allOrders.filter(
      (o) => o.status === "assigned" || o.status === "in_progress"
    );
    const onShift = allDrivers.filter((d) => d.availability !== "off_duty");
    const inProgress = active.filter((o) => o.status === "in_progress");
    const onTimeAvg =
      allDrivers.length === 0
        ? 0
        : Math.round(
            allDrivers.reduce((s, d) => s + d.trust.onTimePct, 0) /
              allDrivers.length
          );
    return {
      active: active.length,
      inProgress: inProgress.length,
      onShift: onShift.length,
      onTime: onTimeAvg,
    };
  }, [allOrders, allDrivers]);

  return (
    <div className="p-6 md:p-10 max-w-[1240px]">
      {/* Header */}
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.16em] font-bold text-ink-muted">
          {today}
        </p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-ink tracking-[-0.025em] leading-none">
            Command center
          </h1>
          {trust && <TrustPill trust={trust.mutual} />}
        </div>
      </header>

      <HelpAlertBanner />

      {/* Stats row */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        <StatCard
          label="Active deliveries"
          value={stats.active}
          accent={stats.active > 0 ? "trust" : "neutral"}
        />
        <StatCard
          label="In motion"
          value={stats.inProgress}
          accent="success"
          pulse
        />
        <StatCard
          label="Drivers on shift"
          value={stats.onShift}
          suffix={`/ ${allDrivers.length}`}
          accent="neutral"
        />
        <StatCard
          label="On-time"
          value={`${stats.onTime}%`}
          accent={stats.onTime >= 90 ? "success" : "neutral"}
        />
      </section>

      {/* Main grid */}
      <div className="grid lg:grid-cols-[1.6fr_1fr] gap-6">
        <ActiveDeliveries
          orders={allOrders}
          drivers={allDrivers}
          loading={!orders}
        />
        <ActivityFeed orders={allOrders} drivers={allDrivers} />
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────
// Sub-components
// ────────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  suffix,
  accent = "neutral",
  pulse = false,
}: {
  label: string;
  value: number | string;
  suffix?: string;
  accent?: "neutral" | "trust" | "success";
  pulse?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
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
        <p className="text-[11px] uppercase tracking-[0.12em] text-ink-muted font-bold">
          {label}
        </p>
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-ink tracking-tight tabular-nums">
          {value}
        </span>
        {suffix && (
          <span className="text-sm text-ink-faint tabular-nums">{suffix}</span>
        )}
      </div>
    </motion.div>
  );
}

function TrustPill({ trust }: { trust: MutualTrustIndex }) {
  const arrow =
    trust.trend === "up" ? "↑" : trust.trend === "down" ? "↓" : "→";
  const trendColor =
    trust.trend === "up"
      ? "text-success"
      : trust.trend === "down"
        ? "text-accent"
        : "text-ink-faint";

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex items-center gap-4 bg-white border border-trust-soft rounded-2xl px-5 py-3 shadow-soft overflow-hidden"
    >
      <span
        aria-hidden
        className="absolute -left-8 -top-8 h-24 w-24 rounded-full bg-trust/10 blur-2xl"
      />
      <div className="relative">
        <div className="text-[10px] uppercase tracking-[0.14em] text-trust-ink font-bold">
          Mutual trust
        </div>
        <div className="flex items-baseline gap-1.5 mt-0.5">
          <span className="text-2xl font-bold text-violet-fill tabular-nums">
            {trust.mutual}
          </span>
          <span className={cn("text-xs font-bold", trendColor)}>{arrow}</span>
        </div>
      </div>
      <div className="relative h-9 w-px bg-surface-line" />
      <div className="relative text-xs space-y-0.5">
        <div className="text-ink-muted flex justify-between gap-3">
          <span>Drivers</span>
          <span className="font-bold text-ink tabular-nums">
            {trust.driverSide}
          </span>
        </div>
        <div className="text-ink-muted flex justify-between gap-3">
          <span>System</span>
          <span className="font-bold text-ink tabular-nums">
            {trust.systemSide}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Active deliveries section ──────────────────────────────────────

function ActiveDeliveries({
  orders,
  drivers,
  loading,
}: {
  orders: Order[];
  drivers: Driver[];
  loading: boolean;
}) {
  const driverMap = new Map(drivers.map((d) => [d.id, d]));
  const active = orders.filter(
    (o) => o.status === "assigned" || o.status === "in_progress"
  );
  const pending = orders.filter((o) => o.status === "pending");

  if (loading) return <Skeleton className="h-96" />;

  return (
    <section>
      <SectionHeader
        title="Active deliveries"
        sub={`${active.length} in flight · ${pending.length} pending`}
      />
      {active.length === 0 && pending.length === 0 ? (
        <div className="bg-white rounded-3xl border border-surface-line p-12 text-center">
          <div className="h-14 w-14 rounded-2xl bg-success-soft text-success-ink grid place-items-center mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path
                d="M5 12l5 5L20 7"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="text-base font-semibold text-ink">All caught up.</p>
          <p className="mt-1 text-sm text-ink-muted">
            Nothing in flight, nothing pending. Take a breath.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {active.map((o) => (
              <ActiveCard
                key={o.id}
                order={o}
                driver={o.driverId ? driverMap.get(o.driverId) : undefined}
              />
            ))}
            {pending.map((o) => (
              <PendingCard key={o.id} order={o} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </section>
  );
}

function ActiveCard({ order, driver }: { order: Order; driver?: Driver }) {
  const { data } = usePoll<{
    checkpoints: { kind: CheckpointKind; at: string }[];
    delays: { kind: string; at: string }[];
    eta?: { label: string };
  }>(`/api/orders/${order.id}`);

  const checkpoints = data?.checkpoints ?? [];
  const STEPS: CheckpointKind[] = [
    "assigned",
    "picked_up",
    "arrived_nearby",
    "delivered",
  ];
  const lastIdx = checkpoints.length
    ? STEPS.indexOf(checkpoints[checkpoints.length - 1].kind)
    : -1;
  const hasDelay = (data?.delays ?? []).length > 0;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-white rounded-3xl border border-surface-line p-5 shadow-card hover:shadow-soft transition-shadow"
    >
      <div className="flex items-start gap-4">
        {driver && <Avatar name={driver.name} size="md" />}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-ink truncate">
              {driver?.name ?? "—"}
            </span>
            {driver?.area && (
              <span className="text-xs text-ink-muted">· {driver.area}</span>
            )}
            <span className="text-[11px] text-ink-faint font-mono ml-auto">
              #{order.trackingCode.replace(/^TRUST-/, "")}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-soft truncate">
            <span className="font-medium">{order.pickupBusiness}</span>
            <span className="text-ink-faint mx-1.5">→</span>
            <span>{order.recipientName}</span>
            <span className="text-ink-muted">, {order.recipientArea}</span>
          </p>

          <div className="mt-3.5 flex items-center gap-2.5">
            <Stepper last={lastIdx} />
            <div className="flex items-center gap-2 ml-1 shrink-0">
              {hasDelay && <Badge tone="warn" size="sm">Delay</Badge>}
              {order.priority === "urgent" && (
                <Badge tone="urgent" size="sm">Urgent</Badge>
              )}
              {data?.eta && (
                <span className="text-xs text-ink-muted tabular-nums">
                  {data.eta.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

function PendingCard({ order }: { order: Order }) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-violet-grad-soft rounded-3xl border border-trust-soft p-5"
    >
      <div className="flex items-center gap-3">
        <span className="h-10 w-10 rounded-2xl bg-white text-trust-ink grid place-items-center shadow-card border border-trust-soft">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path
              d="M12 6v6l4 2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-trust-ink">
              Awaiting driver
            </span>
            <span className="text-[11px] text-trust-ink/70 font-mono ml-auto">
              #{order.trackingCode.replace(/^TRUST-/, "")}
            </span>
          </div>
          <p className="mt-1 text-sm text-trust-ink/85 truncate">
            <span className="font-medium">{order.pickupBusiness}</span>
            <span className="opacity-60 mx-1.5">→</span>
            <span>{order.recipientName}, {order.recipientArea}</span>
          </p>
        </div>
        {order.priority === "urgent" && (
          <Badge tone="urgent" size="sm">Urgent</Badge>
        )}
      </div>
    </motion.article>
  );
}

function Stepper({ last }: { last: number }) {
  return (
    <div className="flex items-center gap-1.5 flex-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i <= last ? "bg-trust" : "bg-surface-line"
          )}
        />
      ))}
    </div>
  );
}

// ── Activity feed ──────────────────────────────────────────────────

type FeedEvent = {
  id: string;
  at: string;
  kind: "checkpoint" | "delay" | "assigned";
  label: string;
  sub: string;
  orderCode: string;
};

function ActivityFeed({
  orders,
  drivers,
}: {
  orders: Order[];
  drivers: Driver[];
}) {
  const driverMap = new Map(drivers.map((d) => [d.id, d]));

  // Pull all checkpoints from each active order via in-flight cache.
  // For simplicity we just show the most recent visible events derived
  // from the order list itself.
  const events: FeedEvent[] = useMemo(() => {
    const e: FeedEvent[] = [];
    for (const o of orders) {
      if (o.assignedAt && o.driverId) {
        e.push({
          id: `${o.id}-asg`,
          at: o.assignedAt,
          kind: "assigned",
          label: "Assigned",
          sub: `${driverMap.get(o.driverId)?.name ?? "—"} · ${o.recipientArea}`,
          orderCode: o.trackingCode,
        });
      }
    }
    return e.sort((a, b) => (a.at < b.at ? 1 : -1)).slice(0, 12);
  }, [orders, driverMap]);

  return (
    <aside className="lg:sticky lg:top-6 self-start">
      <SectionHeader title="Live activity" sub="Latest events first" />
      <div className="bg-white rounded-3xl border border-surface-line shadow-card p-5">
        {events.length === 0 ? (
          <p className="text-sm text-ink-muted italic">No activity yet.</p>
        ) : (
          <ol className="relative space-y-4">
            {events.map((ev, idx) => (
              <motion.li
                key={ev.id}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.03 }}
                className="relative pl-7"
              >
                <span className="absolute left-1.5 top-1.5 h-2 w-2 rounded-full bg-trust" />
                {idx < events.length - 1 && (
                  <span className="absolute left-[9px] top-4 bottom-[-1rem] w-px bg-surface-line" />
                )}
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-ink-faint tabular-nums">
                    {timeOnly(ev.at)}
                  </span>
                  <span className="text-sm font-semibold text-ink">
                    {ev.label}
                  </span>
                  <span className="ml-auto text-[10px] font-mono text-ink-faint">
                    #{ev.orderCode.replace(/^TRUST-/, "")}
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">{ev.sub}</p>
              </motion.li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

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
