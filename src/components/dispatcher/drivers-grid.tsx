"use client";

import { motion } from "framer-motion";
import { usePoll } from "@/hooks/usePoll";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/empty";
import type {
  AreaFamiliarity,
  DriverTrustBreakdown,
  SystemTrustBreakdown,
} from "@/lib/types";
import { cn } from "@/lib/utils";

type Resp = {
  drivers: Array<{
    id: string;
    name: string;
    area?: string;
    availability?: "available" | "on_delivery" | "off_duty";
    activeOrders: number;
    familiarity: AreaFamiliarity[];
    trust: DriverTrustBreakdown;
    systemRating: SystemTrustBreakdown;
    pressureSpike: boolean;
    workloadCap: { max: number; until?: string } | null;
  }>;
};

export function DriversGrid() {
  const { data } = usePoll<Resp>("/api/drivers", 5000);
  if (!data)
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-64" />
        ))}
      </div>
    );

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.drivers.map((d) => (
        <motion.article
          key={d.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-surface-line rounded-2xl shadow-card p-5"
        >
          <header className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    d.availability === "on_delivery"
                      ? "bg-trust animate-pulse-soft"
                      : d.availability === "available"
                        ? "bg-ink-faint"
                        : "bg-surface-line"
                  )}
                />
                <h3 className="text-base font-semibold tracking-tight">
                  {d.name}
                </h3>
              </div>
              <div className="mt-0.5 text-xs text-ink-muted">
                {d.area} ·{" "}
                {d.availability === "available"
                  ? "Available"
                  : d.availability === "on_delivery"
                    ? "On delivery"
                    : "Off duty"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
                Trust
              </div>
              <div className="text-2xl font-semibold tabular-nums tracking-tight text-trust">
                {d.trust.score}
              </div>
            </div>
          </header>

          {d.pressureSpike && (
            <div className="mt-3 rounded-xl bg-warn-soft text-warn text-xs px-3 py-2">
              Pressure rating ↑ this week — consider a check-in.
            </div>
          )}

          <dl className="mt-4 grid grid-cols-3 gap-3 text-center">
            <Stat label="On-time" value={`${d.trust.onTimePct}%`} />
            <Stat label="Completion" value={`${d.trust.completionPct}%`} />
            <Stat label="Streak" value={`${d.trust.streak}`} />
          </dl>

          <div className="mt-4">
            <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold mb-1.5">
              What they think of us
            </div>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <Mini label="Fairness" v={d.systemRating.fairness} />
              <Mini label="Fit" v={d.systemRating.assignmentQuality} />
              <Mini label="Calm" v={d.systemRating.pressure} />
            </div>
            {d.systemRating.basedOn === 0 && (
              <p className="mt-1.5 text-[11px] text-ink-faint italic">
                No rating submitted yet this week.
              </p>
            )}
          </div>

          {d.familiarity.length > 0 && (
            <div className="mt-4">
              <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold mb-1.5">
                Familiar with
              </div>
              <div className="flex flex-wrap gap-1.5">
                {d.familiarity.map((f) => (
                  <Badge key={f.area} tone="outline">
                    {f.area} · {f.deliveries}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {d.workloadCap && (
            <div className="mt-4 rounded-xl bg-info-soft text-info text-xs px-3 py-2">
              Capped at {d.workloadCap.max} orders
            </div>
          )}
        </motion.article>
      ))}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-lg font-semibold tabular-nums tracking-tight">
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-ink-faint font-semibold">
        {label}
      </div>
    </div>
  );
}

function Mini({ label, v }: { label: string; v: number }) {
  const tone =
    v >= 80
      ? "bg-trust-soft text-trust-ink"
      : v >= 60
        ? "bg-info-soft text-info"
        : "bg-warn-soft text-warn";
  return (
    <div className={cn("rounded-lg px-2 py-1.5 text-center", tone)}>
      <div className="text-sm font-semibold tabular-nums">{v}</div>
      <div className="text-[10px] uppercase tracking-wider opacity-80">
        {label}
      </div>
    </div>
  );
}
