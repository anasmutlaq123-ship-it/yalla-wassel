"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/empty";
import type {
  AreaFamiliarity,
  DriverTrustBreakdown,
  SystemTrustBreakdown,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function DriverProfile({
  driverId,
  driverName,
  area,
}: {
  driverId: string;
  driverName: string;
  area?: string;
}) {
  const { data } = usePoll<{
    drivers: Array<{
      id: string;
      familiarity: AreaFamiliarity[];
      trust: DriverTrustBreakdown;
      systemRating: SystemTrustBreakdown;
    }>;
  }>("/api/drivers", 5000);
  const me = data?.drivers.find((d) => d.id === driverId);

  return (
    <div className="mt-8 space-y-7">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">{driverName}</h1>
        <p className="text-sm text-ink-muted">{area ?? "Driver"}</p>
      </header>

      {!me ? (
        <Skeleton className="h-40" />
      ) : (
        <>
          <section>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Stat label="Trust" value={me.trust.score} accent />
              <Stat label="On-time" value={`${me.trust.onTimePct}%`} />
              <Stat label="Streak" value={me.trust.streak} />
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold mb-2">Familiar with</h2>
            {me.familiarity.length === 0 ? (
              <p className="text-sm text-ink-muted">
                You'll see neighborhoods here once you've done a few
                deliveries in them.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {me.familiarity.map((f) => (
                  <Badge key={f.area} tone="outline">
                    {f.area} · {f.deliveries}
                  </Badge>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-surface-line bg-surface p-5">
            <h2 className="text-sm font-semibold tracking-tight">
              How did the system treat you this week?
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              The dispatcher sees this. We take it seriously.
            </p>
            <WeeklyRatingForm />
            {me.systemRating.basedOn > 0 && (
              <div className="mt-5 pt-4 border-t border-surface-line">
                <p className="text-xs text-ink-faint">
                  Team's current system score
                </p>
                <p className="text-base font-medium text-ink mt-0.5">
                  Fairness {me.systemRating.fairness} · Fit{" "}
                  {me.systemRating.assignmentQuality} · Calm{" "}
                  {me.systemRating.pressure}
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-surface-line bg-surface p-4">
      <div
        className={cn(
          "text-3xl font-semibold tabular-nums tracking-tight",
          accent && "text-trust"
        )}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
        {label}
      </div>
    </div>
  );
}

function WeeklyRatingForm() {
  const [fairness, setFairness] = useState(4);
  const [assignmentQuality, setAssignmentQuality] = useState(4);
  const [pressure, setPressure] = useState(2);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/trust/system", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fairness, assignmentQuality, pressure, note }),
    });
    setBusy(false);
    if (res.ok) setSent(true);
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-4 rounded-xl bg-trust-soft text-trust-ink p-4 text-sm"
      >
        Thanks. Your weekly rating is on the dispatcher's screen.
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-4">
      <Slider
        label="Fairness"
        hint="Did assignments feel fair?"
        value={fairness}
        onChange={setFairness}
      />
      <Slider
        label="Assignment fit"
        hint="Did the orders match your skills and area?"
        value={assignmentQuality}
        onChange={setAssignmentQuality}
      />
      <Slider
        label="Pressure"
        hint="Lower is calmer. Higher means too much."
        value={pressure}
        onChange={setPressure}
        invert
      />
      <div>
        <label className="block text-xs font-medium text-ink-soft mb-1.5">
          Anything specific? (optional)
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="One sentence. The dispatcher reads these."
          className="w-full p-3 rounded-xl border border-surface-line bg-surface text-sm focus:border-trust focus:bg-white"
        />
      </div>
      <Button type="submit" disabled={busy} size="lg" full>
        {busy ? "Submitting…" : "Submit weekly rating"}
      </Button>
    </form>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
  invert = false,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (n: number) => void;
  invert?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-xs font-medium text-ink-soft">{label}</label>
        <span className="text-xs tabular-nums text-ink">
          {value} / 5{invert && " (lower is calmer)"}
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
        className="mt-2"
      />
      <p className="mt-1 text-[11px] text-ink-faint">{hint}</p>
    </div>
  );
}
