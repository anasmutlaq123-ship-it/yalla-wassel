// ────────────────────────────────────────────────────────────────────
// Explainable Dispatch Engine
// ────────────────────────────────────────────────────────────────────
//
// Every suggestion ships with a human-readable explanation. The engine
// never returns just a number — it returns the *reasons* that built the
// number. That is the entire trust contract.
//
// Scoring components (all 0..1, weighted, summed):
//   area_match       — does the driver's territory cover the recipient?
//   workload         — fewer active orders is better
//   availability     — must be available; off-duty is excluded entirely
//   urgent_fit       — for urgent orders, prefer drivers with strong on-time
//   familiarity      — driver has done deliveries to this area before
//   fairness_balance — drivers behind on today's count get a small lift,
//                      so workload distributes evenly across the team

import { areaCoverage } from "./seed";
import {
  activeOrderCountForDriver,
  familiarityFor,
  listDrivers,
  listOrders,
} from "./store";
import { computeDriverTrust } from "./trust-score";
import type {
  Order,
  SuggestedDriver,
  SuggestionReason,
  User,
} from "./types";

const WEIGHTS = {
  area_match: 0.32,
  workload: 0.2,
  urgent_fit: 0.15,
  familiarity: 0.13,
  fairness_balance: 0.1,
  availability: 0.1, // hard-cut: 0 means excluded, 1 means OK
};

function areaMatchScore(driver: User, recipientArea: string): number {
  if (!driver.area) return 0;
  const covered = areaCoverage[driver.area] ?? [];
  return covered.includes(recipientArea) ? 1 : 0;
}

function workloadScore(driver: User): number {
  // 0 active = 1.0, 1 = 0.66, 2 = 0.33, 3+ = 0.1
  const active = activeOrderCountForDriver(driver.id);
  if (active === 0) return 1;
  if (active === 1) return 0.66;
  if (active === 2) return 0.33;
  return 0.1;
}

function urgentFitScore(driver: User, order: Order): number {
  if (order.priority !== "urgent") return 0.7; // not relevant — neutral
  const trust = computeDriverTrust(driver.id);
  // map 0..100 → 0..1; reward >85% on-time strongly
  return Math.max(0, Math.min(1, (trust.onTimePct - 70) / 30));
}

function familiarityScore(driver: User, recipientArea: string): number {
  const n = familiarityFor(driver.id, recipientArea);
  if (n >= 15) return 1;
  if (n >= 8) return 0.75;
  if (n >= 3) return 0.5;
  if (n >= 1) return 0.25;
  return 0;
}

// "Have other drivers been getting more work today?" If yes, give this
// driver a small lift so workload distributes evenly.
function fairnessBalanceScore(driver: User): number {
  const todaysOrders = listOrders().filter(
    (o) =>
      o.assignedAt &&
      new Date(o.assignedAt).toDateString() === new Date().toDateString()
  );
  const counts = new Map<string, number>();
  for (const o of todaysOrders) {
    if (o.driverId) counts.set(o.driverId, (counts.get(o.driverId) ?? 0) + 1);
  }
  const myCount = counts.get(driver.id) ?? 0;
  const max = Math.max(0, ...counts.values());
  if (max === 0) return 0.5;
  // If I'm at zero and someone else is at max, I get a large boost.
  return 1 - myCount / (max + 1);
}

// ── Public API ──────────────────────────────────────────────────────

export function rankDriversForOrder(order: Order): SuggestedDriver[] {
  const drivers = listDrivers();
  const ranked: SuggestedDriver[] = [];

  for (const d of drivers) {
    // Hard-exclude off-duty drivers entirely. Don't include them in the
    // ranking — drivers off-shift never appear as suggestions.
    if (d.availability === "off_duty") continue;

    // Respect dispatcher workload caps.
    const cap = d.workloadCapMax;
    const active = activeOrderCountForDriver(d.id);
    if (cap !== undefined && active >= cap) continue;

    const reasons: SuggestionReason[] = [];

    const am = areaMatchScore(d, order.recipientArea);
    reasons.push({
      kind: "area_match",
      label:
        am === 1
          ? `${order.recipientArea} is in ${d.area} coverage`
          : `${order.recipientArea} is outside ${d.area ?? "—"}`,
      weight: am * WEIGHTS.area_match,
    });

    const wl = workloadScore(d);
    reasons.push({
      kind: "workload",
      label:
        active === 0
          ? "No active orders"
          : `${active} active order${active === 1 ? "" : "s"}`,
      weight: wl * WEIGHTS.workload,
    });

    const av = d.availability === "available" ? 1 : 0.5;
    reasons.push({
      kind: "availability",
      label:
        d.availability === "available"
          ? "Available now"
          : "Currently on a delivery",
      weight: av * WEIGHTS.availability,
    });

    if (order.priority === "urgent") {
      const uf = urgentFitScore(d, order);
      reasons.push({
        kind: "urgent_fit",
        label: `${Math.round(computeDriverTrust(d.id).onTimePct)}% on-time on urgent`,
        weight: uf * WEIGHTS.urgent_fit,
      });
    }

    const fam = familiarityScore(d, order.recipientArea);
    const famN = familiarityFor(d.id, order.recipientArea);
    if (fam > 0) {
      reasons.push({
        kind: "familiarity",
        label: `${famN} prior deliveries to ${order.recipientArea}`,
        weight: fam * WEIGHTS.familiarity,
      });
    }

    const fb = fairnessBalanceScore(d);
    if (fb > 0.5) {
      reasons.push({
        kind: "fairness_balance",
        label: "Behind on today's workload — keeps things fair",
        weight: fb * WEIGHTS.fairness_balance,
      });
    }

    const score = reasons.reduce((sum, r) => sum + r.weight, 0);

    ranked.push({
      driverId: d.id,
      driverName: d.name,
      area: d.area,
      score,
      reasons: reasons.filter((r) => r.weight > 0),
      workload: active,
    });
  }

  return ranked.sort((a, b) => b.score - a.score);
}

// Produce a single human-readable sentence for a suggestion. Used in
// notification copy and audit logs.
export function explainSuggestion(s: SuggestedDriver): string {
  const top = s.reasons
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 2)
    .map((r) => r.label.toLowerCase())
    .join(", ");
  return `Suggesting ${s.driverName} — ${top}.`;
}
