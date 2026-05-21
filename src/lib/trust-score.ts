// ────────────────────────────────────────────────────────────────────
// Mutual Trust Score
// ────────────────────────────────────────────────────────────────────
//
// Two-way trust. Driver scores are derived from delivery outcomes;
// system scores are derived from drivers' weekly ratings of the system.
// The Mutual Trust Index is a geometric mean — if either side fails,
// the index fails. You cannot trade one for the other.

import {
  listOrders,
  listWeeklyRatings,
  listDrivers,
  getUser,
  getTravelStat,
} from "./store";
import type {
  DriverTrustBreakdown,
  MutualTrustIndex,
  Order,
  SystemTrustBreakdown,
} from "./types";

// Considered "on-time" if assigned-to-delivered within 1.4x of the
// mean travel time for the route. Forgiving by design — a driver
// stuck behind a closed road should not be punished.
function isDeliveredOnTime(order: Order): boolean {
  if (order.status !== "delivered" || !order.assignedAt || !order.deliveredAt)
    return false;
  const ms = new Date(order.deliveredAt).getTime() - new Date(order.assignedAt).getTime();
  const mins = ms / 60000;
  const stat = getTravelStat(order.pickupArea, order.recipientArea);
  // Baseline: 25 min if no historical data; allowance: pickup + travel.
  const baseline = stat ? stat.meanMin + 8 : 25;
  return mins <= baseline * 1.4;
}

export function computeDriverTrust(driverId: string): DriverTrustBreakdown {
  const user = getUser(driverId);
  const allOrders = listOrders().filter((o) => o.driverId === driverId);
  const delivered = allOrders.filter((o) => o.status === "delivered");

  let onTime = 0;
  let streak = 0;
  let currentStreak = 0;
  const sorted = delivered
    .slice()
    .sort((a, b) =>
      (a.deliveredAt ?? "") < (b.deliveredAt ?? "") ? -1 : 1
    );
  for (const o of sorted) {
    const ok = isDeliveredOnTime(o);
    if (ok) {
      onTime++;
      currentStreak++;
      streak = Math.max(streak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }

  // Trust the seed data: drivers with zero delivered orders in the demo
  // get a sensible default so the dispatch engine doesn't punish them
  // on day one. Production would not need this fallback.
  const totalDeliveries = delivered.length;
  const onTimePct =
    totalDeliveries === 0 ? 92 : Math.round((onTime / totalDeliveries) * 100);

  const completionPct =
    allOrders.length === 0
      ? 100
      : Math.round((delivered.length / allOrders.length) * 100);

  const score = Math.round(
    0.55 * onTimePct + 0.3 * completionPct + 0.15 * Math.min(streak, 10) * 10
  );

  return {
    driverId,
    driverName: user?.name ?? "Unknown",
    onTimePct,
    completionPct,
    streak: currentStreak,
    totalDeliveries,
    score: Math.min(100, score),
  };
}

export function computeSystemTrust(driverId?: string): SystemTrustBreakdown {
  const all = listWeeklyRatings();
  const rows = driverId ? all.filter((r) => r.driverId === driverId) : all;

  if (rows.length === 0) {
    return {
      fairness: 70,
      assignmentQuality: 70,
      pressure: 70,
      score: 70,
      basedOn: 0,
    };
  }

  const avg = (k: "fairness" | "assignmentQuality" | "pressure") =>
    rows.reduce((s, r) => s + r[k], 0) / rows.length;

  // Pressure is inverted: rating 1 = no pressure (best), 5 = high pressure.
  // Convert to a 0..100 "calmness" score.
  const fairness = (avg("fairness") / 5) * 100;
  const assignmentQuality = (avg("assignmentQuality") / 5) * 100;
  const pressure = ((5 - avg("pressure")) / 4) * 100;

  const score = Math.round(0.4 * fairness + 0.35 * assignmentQuality + 0.25 * pressure);

  return {
    fairness: Math.round(fairness),
    assignmentQuality: Math.round(assignmentQuality),
    pressure: Math.round(pressure),
    score,
    basedOn: rows.length,
  };
}

export function computeMutualTrust(): MutualTrustIndex {
  const drivers = listDrivers();
  const driverScores = drivers.map((d) => computeDriverTrust(d.id).score);
  const driverSide =
    driverScores.length === 0
      ? 0
      : driverScores.reduce((a, b) => a + b, 0) / driverScores.length;

  const sys = computeSystemTrust();
  const systemSide = sys.score;

  // Geometric mean — penalizes asymmetry. A team that's 95 on driver
  // performance but 40 on system trust does not get a "well done".
  const mutual = Math.round(Math.sqrt(driverSide * systemSide));

  // Trend: compare this week's ratings vs prior. Naive: count vs older.
  const all = listWeeklyRatings();
  const recent = all.slice(-3);
  const earlier = all.slice(0, -3);
  const recentAvg = recent.length
    ? recent.reduce((s, r) => s + (r.fairness + r.assignmentQuality + (6 - r.pressure)) / 3, 0) /
      recent.length
    : 0;
  const earlierAvg = earlier.length
    ? earlier.reduce(
        (s, r) => s + (r.fairness + r.assignmentQuality + (6 - r.pressure)) / 3,
        0
      ) / earlier.length
    : recentAvg;
  let trend: "up" | "flat" | "down" = "flat";
  if (recentAvg > earlierAvg + 0.15) trend = "up";
  else if (recentAvg < earlierAvg - 0.15) trend = "down";

  return {
    driverSide: Math.round(driverSide),
    systemSide,
    mutual,
    trend,
  };
}

export function pressureSpike(driverId: string): boolean {
  // Returns true if this driver's *most recent* pressure rating jumped
  // by 2+ points vs their previous one. A leading indicator of attrition.
  const rows = listWeeklyRatings()
    .filter((r) => r.driverId === driverId)
    .sort((a, b) => (a.weekOf < b.weekOf ? -1 : 1));
  if (rows.length < 2) return false;
  const last = rows[rows.length - 1];
  const prev = rows[rows.length - 2];
  return last.pressure - prev.pressure >= 2;
}
