// ────────────────────────────────────────────────────────────────────
// Predictive ETA — without GPS
// ────────────────────────────────────────────────────────────────────
//
// We never know where the driver is. We only know what they've told us
// (their last checkpoint) and historical neighborhood-to-neighborhood
// travel times. From these two we compute a range, not a point — the
// honesty of a range is the whole point.

import { listCheckpointsForOrder, getTravelStat } from "./store";
import type { CheckpointKind, Order } from "./types";

const DEFAULT_PICKUP_BUFFER_MIN = 8;
const DEFAULT_HANDOFF_MIN = 3;

export interface EtaEstimate {
  // ISO timestamp range — earliest and latest expected delivery time.
  earliestAt: string;
  latestAt: string;
  // Human label like "12–18 min" or "in your area"
  label: string;
  // Internal — for debugging
  basis: "historical" | "fallback";
  remainingMin: number;
}

function isoFromNow(min: number): string {
  return new Date(Date.now() + min * 60_000).toISOString();
}

export function estimateEta(order: Order): EtaEstimate {
  const cps = listCheckpointsForOrder(order.id);
  const last = cps[cps.length - 1]?.kind as CheckpointKind | undefined;

  const stat = getTravelStat(order.pickupArea, order.recipientArea);
  const meanTravel = stat?.meanMin ?? 18;
  const p80Travel = stat?.p80Min ?? Math.round(meanTravel * 1.4);

  let earliest = 0;
  let latest = 0;
  let label = "";

  if (order.status === "delivered") {
    return {
      earliestAt: order.deliveredAt!,
      latestAt: order.deliveredAt!,
      label: "Delivered",
      basis: stat ? "historical" : "fallback",
      remainingMin: 0,
    };
  }

  if (!last || last === "assigned") {
    // Not picked up yet — pickup buffer + travel
    earliest = DEFAULT_PICKUP_BUFFER_MIN + meanTravel + DEFAULT_HANDOFF_MIN;
    latest = DEFAULT_PICKUP_BUFFER_MIN + p80Travel + DEFAULT_HANDOFF_MIN + 4;
    label = `${earliest}–${latest} min`;
  } else if (last === "picked_up") {
    earliest = meanTravel + DEFAULT_HANDOFF_MIN;
    latest = p80Travel + DEFAULT_HANDOFF_MIN + 3;
    label = `${earliest}–${latest} min`;
  } else if (last === "arrived_nearby") {
    earliest = 1;
    latest = DEFAULT_HANDOFF_MIN + 2;
    label = "in your area";
  } else {
    earliest = latest = 0;
    label = "—";
  }

  return {
    earliestAt: isoFromNow(earliest),
    latestAt: isoFromNow(latest),
    label,
    basis: stat ? "historical" : "fallback",
    remainingMin: Math.round((earliest + latest) / 2),
  };
}
