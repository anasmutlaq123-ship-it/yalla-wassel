// ────────────────────────────────────────────────────────────────────
// TrustOS in-memory store
// ────────────────────────────────────────────────────────────────────
//
// Every method in this file has a one-line Prisma equivalent commented
// above it. To go to production, swap this module's import for a thin
// Prisma adapter and the rest of the app keeps working.
//
// The store is a module-level singleton — it persists for the lifetime
// of the Next.js dev server. Server restarts reset to the seed.

import {
  seedUsers,
  seedOrders,
  seedCheckpoints,
  seedDelays,
  seedHelpAlerts,
  seedAssignmentLog,
  seedWeeklyRatings,
  seedFamiliarities,
  seedTravel,
} from "./seed";
import type {
  AreaFamiliarity,
  AreaTravelStat,
  AssignmentLog,
  Checkpoint,
  CheckpointKind,
  DelayKind,
  DelayReason,
  HelpAlert,
  HelpKind,
  Order,
  OrderStatus,
  Priority,
  User,
  WeeklyRating,
} from "./types";
import { genConfirmationCode, genId, startOfWeekISO } from "./utils";

interface Store {
  users: User[];
  orders: Order[];
  checkpoints: Checkpoint[];
  delays: DelayReason[];
  helpAlerts: HelpAlert[];
  assignmentLog: AssignmentLog[];
  weeklyRatings: WeeklyRating[];
  familiarities: AreaFamiliarity[];
  travel: AreaTravelStat[];
  sessions: Record<string, string>; // token -> userId
}

// Persisted across hot reloads by hanging off globalThis.
declare global {
  // eslint-disable-next-line no-var
  var __trustos_store: Store | undefined;
}

function freshStore(): Store {
  return {
    users: [...seedUsers],
    orders: [...seedOrders],
    checkpoints: [...seedCheckpoints],
    delays: [...seedDelays],
    helpAlerts: [...seedHelpAlerts],
    assignmentLog: [...seedAssignmentLog],
    weeklyRatings: [...seedWeeklyRatings],
    familiarities: [...seedFamiliarities],
    travel: [...seedTravel],
    sessions: {},
  };
}

export const store: Store = (globalThis.__trustos_store ??= freshStore());

// ── Users ───────────────────────────────────────────────────────────

// Prisma: prisma.user.findMany()
export function listUsers(): User[] {
  return store.users;
}

// Prisma: prisma.user.findUnique({ where: { id } })
export function getUser(id: string): User | undefined {
  return store.users.find((u) => u.id === id);
}

// Prisma: prisma.user.findUnique({ where: { username } })
export function getUserByUsername(username: string): User | undefined {
  return store.users.find(
    (u) => u.username.toLowerCase() === username.toLowerCase()
  );
}

// Prisma: prisma.user.findMany({ where: { role: "driver" } })
export function listDrivers(): User[] {
  return store.users.filter((u) => u.role === "driver");
}

export function setDriverAvailability(
  driverId: string,
  availability: "available" | "on_delivery" | "off_duty"
): User | undefined {
  const u = getUser(driverId);
  if (!u) return undefined;
  u.availability = availability;
  return u;
}

export function setDriverCap(
  driverId: string,
  maxActiveOrders: number | undefined,
  until: string | undefined
): User | undefined {
  const u = getUser(driverId);
  if (!u) return undefined;
  u.workloadCapMax = maxActiveOrders;
  u.workloadCapUntil = until;
  return u;
}

// ── Orders ──────────────────────────────────────────────────────────

// Prisma: prisma.order.findMany({ orderBy: { createdAt: "desc" } })
export function listOrders(filter?: { status?: OrderStatus }): Order[] {
  let xs = store.orders.slice();
  if (filter?.status) xs = xs.filter((o) => o.status === filter.status);
  return xs.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function getOrder(id: string): Order | undefined {
  return store.orders.find((o) => o.id === id);
}

export function getOrderByCode(code: string): Order | undefined {
  return store.orders.find(
    (o) => o.trackingCode.toLowerCase() === code.toLowerCase()
  );
}

export function getActiveOrderForDriver(driverId: string): Order | undefined {
  return store.orders
    .filter(
      (o) =>
        o.driverId === driverId &&
        (o.status === "assigned" || o.status === "in_progress")
    )
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))[0];
}

export function activeOrderCountForDriver(driverId: string): number {
  return store.orders.filter(
    (o) =>
      o.driverId === driverId &&
      (o.status === "assigned" || o.status === "in_progress")
  ).length;
}

// Prisma: prisma.order.findMany({ where: { customerId }, orderBy: { createdAt: "desc" } })
export function listOrdersForCustomer(customerId: string): Order[] {
  return store.orders
    .filter((o) => o.customerId === customerId)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export function createOrder(input: {
  pickupBusiness: string;
  pickupArea: string;
  recipientName: string;
  recipientArea: string;
  recipientNotes?: string;
  priority?: Priority;
}): Order {
  const id = genId("order");
  const num = 1000 + store.orders.length + 1;
  const order: Order = {
    id,
    trackingCode: `TRUST-${num}`,
    pickupBusiness: input.pickupBusiness,
    pickupArea: input.pickupArea,
    recipientName: input.recipientName,
    recipientArea: input.recipientArea,
    recipientNotes: input.recipientNotes,
    priority: input.priority ?? "normal",
    status: "pending",
    confirmationCode: genConfirmationCode(),
    createdAt: new Date().toISOString(),
  };
  store.orders.unshift(order);
  return order;
}

// ── Checkpoints ─────────────────────────────────────────────────────

export function listCheckpointsForOrder(orderId: string): Checkpoint[] {
  return store.checkpoints
    .filter((c) => c.orderId === orderId)
    .sort((a, b) => (a.at < b.at ? -1 : 1));
}

export function listAllCheckpoints(): Checkpoint[] {
  return store.checkpoints.slice().sort((a, b) => (a.at < b.at ? -1 : 1));
}

const CHECKPOINT_ORDER: CheckpointKind[] = [
  "assigned",
  "picked_up",
  "arrived_nearby",
  "delivered",
];

export function appendCheckpoint(
  orderId: string,
  kind: CheckpointKind,
  actorId: string,
  note?: string
):
  | { ok: true; checkpoint: Checkpoint; order: Order }
  | { ok: false; error: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, error: "order_not_found" };

  const existing = listCheckpointsForOrder(orderId);
  const lastKind = existing[existing.length - 1]?.kind;
  const lastIdx = lastKind ? CHECKPOINT_ORDER.indexOf(lastKind) : -1;
  const nextIdx = CHECKPOINT_ORDER.indexOf(kind);

  if (nextIdx !== lastIdx + 1) {
    return { ok: false, error: "invalid_transition" };
  }

  const cp: Checkpoint = {
    id: genId("ck"),
    orderId,
    kind,
    at: new Date().toISOString(),
    actorId,
    note,
  };
  store.checkpoints.push(cp);

  if (kind === "picked_up" || kind === "arrived_nearby") {
    order.status = "in_progress";
  }
  if (kind === "delivered") {
    order.status = "delivered";
    order.deliveredAt = cp.at;
    // Bump area familiarity for this driver
    bumpFamiliarity(order.driverId!, order.recipientArea, cp.at);
    // Free the driver back to available, unless they're capped
    const driver = getUser(order.driverId!);
    if (driver && activeOrderCountForDriver(driver.id) === 0) {
      driver.availability = "available";
    }
  }

  return { ok: true, checkpoint: cp, order };
}

// ── Delay reasons ───────────────────────────────────────────────────

export function listDelaysForOrder(orderId: string): DelayReason[] {
  return store.delays
    .filter((d) => d.orderId === orderId)
    .sort((a, b) => (a.at < b.at ? -1 : 1));
}

export function appendDelay(
  orderId: string,
  kind: DelayKind,
  note?: string
): DelayReason {
  const dr: DelayReason = {
    id: genId("dly"),
    orderId,
    kind,
    at: new Date().toISOString(),
    note,
  };
  store.delays.push(dr);
  return dr;
}

// ── Assignment ──────────────────────────────────────────────────────

export function assignOrder(
  orderId: string,
  driverId: string,
  dispatcherId: string,
  rankedSuggestions: AssignmentLog["rankedSuggestions"],
  overrideReason?: string
):
  | { ok: true; order: Order; log: AssignmentLog }
  | { ok: false; error: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, error: "order_not_found" };
  const driver = getUser(driverId);
  if (!driver || driver.role !== "driver")
    return { ok: false, error: "driver_not_found" };
  if (order.status !== "pending")
    return { ok: false, error: "order_not_pending" };

  order.driverId = driverId;
  order.status = "assigned";
  order.assignedAt = new Date().toISOString();
  driver.availability = "on_delivery";

  // Append the assigned checkpoint atomically.
  store.checkpoints.push({
    id: genId("ck"),
    orderId,
    kind: "assigned",
    at: order.assignedAt,
    actorId: dispatcherId,
  });

  const log: AssignmentLog = {
    id: genId("asgn"),
    orderId,
    dispatcherId,
    assignedDriverId: driverId,
    rankedSuggestions,
    overrideReason,
    at: order.assignedAt,
  };
  store.assignmentLog.push(log);

  return { ok: true, order, log };
}

export function listAssignmentLogs(): AssignmentLog[] {
  return store.assignmentLog
    .slice()
    .sort((a, b) => (a.at < b.at ? 1 : -1));
}

/** Revert an order back to "pending". Wipes checkpoints and delay
 *  reasons so a future re-assignment starts from a clean slate. The
 *  assignment audit log entry stays — that's the history. */
export function unassignOrder(
  orderId: string,
  _dispatcherId: string
):
  | { ok: true; order: Order }
  | { ok: false; error: string } {
  const order = getOrder(orderId);
  if (!order) return { ok: false, error: "order_not_found" };
  if (order.status === "delivered" || order.status === "cancelled")
    return { ok: false, error: "cannot_unassign_completed" };
  if (!order.driverId) return { ok: false, error: "not_assigned" };

  const oldDriverId = order.driverId;

  order.status = "pending";
  order.driverId = undefined;
  order.assignedAt = undefined;

  // Drop checkpoints + delays — the ledger for THIS attempt is closed.
  // The assignment_log row remains for audit.
  store.checkpoints = store.checkpoints.filter((c) => c.orderId !== orderId);
  store.delays = store.delays.filter((d) => d.orderId !== orderId);

  // Free the driver if they have nothing else active.
  const driver = getUser(oldDriverId);
  if (driver && activeOrderCountForDriver(driver.id) === 0) {
    driver.availability = "available";
  }

  return { ok: true, order };
}

// ── Help alerts ─────────────────────────────────────────────────────

export function raiseHelp(
  driverId: string,
  kind: HelpKind,
  orderId?: string,
  note?: string
): HelpAlert {
  const a: HelpAlert = {
    id: genId("help"),
    driverId,
    orderId,
    kind,
    note,
    status: "open",
    raisedAt: new Date().toISOString(),
  };
  store.helpAlerts.push(a);
  return a;
}

export function listOpenHelp(): HelpAlert[] {
  return store.helpAlerts
    .filter((a) => a.status === "open")
    .sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1));
}

export function listAllHelp(): HelpAlert[] {
  return store.helpAlerts
    .slice()
    .sort((a, b) => (a.raisedAt < b.raisedAt ? 1 : -1));
}

export function resolveHelp(
  alertId: string,
  resolverId: string,
  action: "acknowledged" | "resolved_handoff",
  handoffToId?: string
): HelpAlert | undefined {
  const a = store.helpAlerts.find((x) => x.id === alertId);
  if (!a) return undefined;
  a.status = action;
  a.resolverId = resolverId;
  a.handoffToId = handoffToId;
  a.resolvedAt = new Date().toISOString();
  return a;
}

// ── Weekly ratings ──────────────────────────────────────────────────

export function submitWeeklyRating(input: {
  driverId: string;
  fairness: number;
  assignmentQuality: number;
  pressure: number;
  note?: string;
}): WeeklyRating {
  const weekOf = startOfWeekISO();
  const existing = store.weeklyRatings.find(
    (w) => w.driverId === input.driverId && w.weekOf === weekOf
  );
  if (existing) {
    existing.fairness = input.fairness;
    existing.assignmentQuality = input.assignmentQuality;
    existing.pressure = input.pressure;
    existing.note = input.note;
    existing.submittedAt = new Date().toISOString();
    return existing;
  }
  const wr: WeeklyRating = {
    id: genId("wr"),
    driverId: input.driverId,
    weekOf,
    fairness: input.fairness,
    assignmentQuality: input.assignmentQuality,
    pressure: input.pressure,
    note: input.note,
    submittedAt: new Date().toISOString(),
  };
  store.weeklyRatings.push(wr);
  return wr;
}

export function listWeeklyRatings(): WeeklyRating[] {
  return store.weeklyRatings.slice();
}

// ── Familiarity ─────────────────────────────────────────────────────

export function listFamiliaritiesForDriver(driverId: string): AreaFamiliarity[] {
  return store.familiarities
    .filter((f) => f.driverId === driverId)
    .sort((a, b) => b.deliveries - a.deliveries);
}

export function familiarityFor(driverId: string, area: string): number {
  return (
    store.familiarities.find((f) => f.driverId === driverId && f.area === area)
      ?.deliveries ?? 0
  );
}

function bumpFamiliarity(driverId: string, area: string, at: string) {
  const existing = store.familiarities.find(
    (f) => f.driverId === driverId && f.area === area
  );
  if (existing) {
    existing.deliveries += 1;
    existing.lastAt = at;
  } else {
    store.familiarities.push({ driverId, area, deliveries: 1, lastAt: at });
  }
}

// ── Travel stats (for ETA) ──────────────────────────────────────────

export function getTravelStat(from: string, to: string): AreaTravelStat | undefined {
  return store.travel.find((t) => t.fromArea === from && t.toArea === to);
}

// ── Sessions ────────────────────────────────────────────────────────

export function createSession(userId: string): string {
  const token = genId("sess");
  store.sessions[token] = userId;
  return token;
}

export function getSessionUser(token: string | undefined): User | undefined {
  if (!token) return undefined;
  const userId = store.sessions[token];
  if (!userId) return undefined;
  return getUser(userId);
}

export function destroySession(token: string | undefined): void {
  if (!token) return;
  delete store.sessions[token];
}
