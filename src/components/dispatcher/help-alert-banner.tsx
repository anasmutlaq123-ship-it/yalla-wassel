"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Alert = {
  id: string;
  driverId: string;
  orderId?: string;
  kind: string;
  note?: string;
  raisedAt: string;
};

export function HelpAlertBanner() {
  const { data, mutate } = usePoll<{ alerts: Alert[] }>("/api/help", 2500);
  const [busy, setBusy] = useState<string | null>(null);
  const alerts = data?.alerts ?? [];

  async function resolve(id: string) {
    setBusy(id);
    await fetch(`/api/help/${id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "acknowledged" }),
    });
    await mutate();
    setBusy(null);
  }

  return (
    <AnimatePresence>
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-8 rounded-3xl bg-white border border-accent/25 shadow-soft overflow-hidden"
        >
          <div className="bg-accent-soft px-5 py-3 flex items-center gap-2.5 border-b border-accent/15">
            <span className="relative inline-flex h-2.5 w-2.5">
              <span className="absolute inset-0 rounded-full bg-accent opacity-60 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-accent" />
            </span>
            <span className="text-sm font-bold text-accent-ink">
              {alerts.length === 1
                ? "A driver needs help"
                : `${alerts.length} drivers need help`}
            </span>
          </div>
          <ul className="p-3 space-y-2">
            {alerts.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-2xl hover:bg-surface transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Badge tone="urgent" size="sm">
                    {kindLabel(a.kind)}
                  </Badge>
                  <span className="text-sm text-ink truncate">
                    {a.note ? a.note : "No note added."}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={busy === a.id}
                  onClick={() => resolve(a.id)}
                >
                  {busy === a.id ? "…" : "Acknowledge"}
                </Button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function kindLabel(k: string): string {
  return (
    {
      traffic: "Traffic",
      store_delay: "Store delay",
      customer_unavailable: "Customer unavailable",
      vehicle: "Vehicle",
      other: "Other",
    }[k] ?? k
  );
}
