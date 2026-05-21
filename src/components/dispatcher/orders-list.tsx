"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/empty";
import { cn, timeOnly } from "@/lib/utils";
import type { CheckpointKind } from "@/lib/types";

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
  createdAt: string;
};

const ALL_FILTERS: Array<{ k: Order["status"] | "all"; label: string }> = [
  { k: "all", label: "All" },
  { k: "pending", label: "Pending" },
  { k: "in_progress", label: "In progress" },
  { k: "delivered", label: "Delivered" },
];

export function OrdersList() {
  const [filter, setFilter] = useState<(typeof ALL_FILTERS)[number]["k"]>("all");
  const { data } = usePoll<{ orders: Order[] }>("/api/orders");
  const filtered = (data?.orders ?? []).filter((o) =>
    filter === "all" ? true : o.status === filter
  );

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ALL_FILTERS.map((f) => (
          <button
            key={f.k}
            onClick={() => setFilter(f.k)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
              filter === f.k
                ? "bg-ink text-canvas"
                : "bg-surface text-ink-muted hover:bg-surface-sunken border border-surface-line"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!data ? (
        <Skeleton className="h-64" />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((o) => (
              <OrderRow key={o.id} order={o} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="bg-surface border border-surface-line rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-surface-sunken/40"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-ink-muted shrink-0">
            #{order.trackingCode.replace(/^TRUST-/, "")}
          </span>
          <span className="text-sm truncate">
            <span className="font-medium">{order.pickupBusiness}</span>
            <span className="text-ink-faint mx-1">→</span>
            <span>{order.recipientName}</span>
            <span className="text-ink-muted">, {order.recipientArea}</span>
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {order.priority === "urgent" && <Badge tone="urgent">Urgent</Badge>}
          <StatusBadge status={order.status} />
        </div>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-surface-line"
          >
            <OrderDetail orderId={order.id} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const map: Record<Order["status"], { tone: any; label: string }> = {
    pending: { tone: "outline", label: "Pending" },
    assigned: { tone: "info", label: "Assigned" },
    in_progress: { tone: "trust", label: "In progress" },
    delivered: { tone: "neutral", label: "Delivered" },
    cancelled: { tone: "warn", label: "Cancelled" },
  };
  const m = map[status];
  return <Badge tone={m.tone}>{m.label}</Badge>;
}

function OrderDetail({ orderId }: { orderId: string }) {
  const { data } = usePoll<{
    order: Order;
    checkpoints: { kind: CheckpointKind; at: string }[];
    delays: { kind: string; at: string; note?: string }[];
    eta?: { label: string };
  }>(`/api/orders/${orderId}`);
  if (!data) return <div className="p-4 text-sm text-ink-faint">Loading…</div>;
  return (
    <div className="p-5 grid sm:grid-cols-2 gap-5 bg-surface-sunken/30">
      <div>
        <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold mb-2">
          Timeline
        </div>
        <ol className="relative pl-4 border-l border-surface-line space-y-1.5">
          {data.checkpoints.map((c, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-trust" />
              <time className="font-mono text-xs text-ink-faint tabular-nums w-12">
                {timeOnly(c.at)}
              </time>
              <span>{checkpointLabel(c.kind)}</span>
            </li>
          ))}
          {data.delays.map((d, i) => (
            <li
              key={`d${i}`}
              className="flex items-center gap-3 text-sm text-warn"
            >
              <span className="absolute -left-[5px] h-2.5 w-2.5 rounded-full bg-warn-soft border border-warn" />
              <time className="font-mono text-xs text-ink-faint tabular-nums w-12">
                {timeOnly(d.at)}
              </time>
              <span>Delay — {d.kind.replace(/_/g, " ")}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="text-sm space-y-2">
        <div>
          <span className="text-ink-faint">Pickup: </span>
          {data.order.pickupBusiness}, {data.order.pickupArea}
        </div>
        <div>
          <span className="text-ink-faint">Recipient: </span>
          {data.order.recipientName}, {data.order.recipientArea}
        </div>
        {data.eta && (
          <div>
            <span className="text-ink-faint">ETA: </span>
            {data.eta.label}
          </div>
        )}
      </div>
    </div>
  );
}

function checkpointLabel(k: CheckpointKind) {
  return (
    {
      assigned: "Assigned",
      picked_up: "Picked up",
      arrived_nearby: "Arrived nearby",
      delivered: "Delivered",
    }[k] ?? k
  );
}
