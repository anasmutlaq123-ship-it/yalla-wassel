"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function OnShiftToggle({
  driverId,
  currentlyOnShift,
  onChange,
}: {
  driverId: string;
  currentlyOnShift: boolean;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function flip() {
    setBusy(true);
    await fetch(`/api/drivers/${driverId}/availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: currentlyOnShift ? "off_duty" : "available",
      }),
    });
    setBusy(false);
    onChange();
  }

  return (
    <div className="mt-7 flex items-center justify-between rounded-3xl border border-surface-line bg-white px-5 py-4 shadow-card">
      <div>
        <div className="text-[15px] font-semibold text-ink">
          {currentlyOnShift ? "On shift" : "Off duty"}
        </div>
        <div className="text-xs text-ink-muted mt-0.5">
          {currentlyOnShift
            ? "Ready for deliveries."
            : "Tap to come on shift."}
        </div>
      </div>
      <button
        onClick={flip}
        disabled={busy}
        aria-label="Toggle shift"
        className={cn(
          "h-9 w-16 rounded-full p-1 transition-colors relative shrink-0",
          currentlyOnShift ? "bg-violet-grad" : "bg-surface-line"
        )}
      >
        <span
          className={cn(
            "block h-7 w-7 rounded-full bg-white shadow transition-transform",
            currentlyOnShift ? "translate-x-7" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
