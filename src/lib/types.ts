// Shared domain types — mirror the Prisma schema so the demo and the
// production database speak the same language.

export type Role = "customer" | "driver" | "dispatcher";

export type DriverAvailability = "available" | "on_delivery" | "off_duty";

export type Priority = "normal" | "urgent";

export type OrderStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "delivered"
  | "cancelled";

export type CheckpointKind =
  | "assigned"
  | "picked_up"
  | "arrived_nearby"
  | "delivered";

export type DelayKind =
  | "traffic"
  | "store_delay"
  | "customer_unavailable"
  | "vehicle"
  | "other";

export type HelpKind = DelayKind;

export type HelpStatus = "open" | "acknowledged" | "resolved_handoff";

export interface User {
  id: string;
  username: string;
  name: string;
  role: Role;
  area?: string;
  availability?: DriverAvailability;
  workloadCapMax?: number;
  workloadCapUntil?: string;
}

export interface Checkpoint {
  id: string;
  orderId: string;
  kind: CheckpointKind;
  at: string;
  actorId: string;
  note?: string;
}

export interface DelayReason {
  id: string;
  orderId: string;
  kind: DelayKind;
  at: string;
  note?: string;
}

export interface Order {
  id: string;
  trackingCode: string;
  externalRef?: string;
  pickupBusiness: string;
  pickupArea: string;
  recipientName: string;
  recipientArea: string;
  recipientNotes?: string;
  priority: Priority;
  status: OrderStatus;
  confirmationCode: string;
  // Logged-in customer who owns this order. Optional so legacy
  // "delivery without an account" still works via the public track URL.
  customerId?: string;
  driverId?: string;
  createdAt: string;
  assignedAt?: string;
  deliveredAt?: string;
}

export interface AssignmentLog {
  id: string;
  orderId: string;
  dispatcherId: string;
  assignedDriverId: string;
  rankedSuggestions: SuggestedDriver[];
  overrideReason?: string;
  at: string;
}

export interface HelpAlert {
  id: string;
  driverId: string;
  orderId?: string;
  kind: HelpKind;
  note?: string;
  status: HelpStatus;
  raisedAt: string;
  resolvedAt?: string;
  resolverId?: string;
  handoffToId?: string;
}

export interface WeeklyRating {
  id: string;
  driverId: string;
  weekOf: string; // YYYY-MM-DD (Monday)
  fairness: number; // 1..5
  assignmentQuality: number; // 1..5
  pressure: number; // 1..5 (lower is better)
  note?: string;
  submittedAt: string;
}

export interface AreaFamiliarity {
  driverId: string;
  area: string;
  deliveries: number;
  lastAt?: string;
}

export interface AreaTravelStat {
  fromArea: string;
  toArea: string;
  meanMin: number;
  p80Min: number;
  samples: number;
}

// ── Dispatch engine outputs ─────────────────────────────────────────

export type SuggestionReasonKind =
  | "area_match"
  | "workload"
  | "availability"
  | "urgent_fit"
  | "familiarity"
  | "fairness_balance";

export interface SuggestionReason {
  kind: SuggestionReasonKind;
  label: string;
  weight: number; // 0..1 contribution
}

export interface SuggestedDriver {
  driverId: string;
  driverName: string;
  area?: string;
  score: number; // 0..1
  reasons: SuggestionReason[];
  workload: number;
}

// ── Trust score outputs ─────────────────────────────────────────────

export interface DriverTrustBreakdown {
  driverId: string;
  driverName: string;
  onTimePct: number; // 0..100
  completionPct: number; // 0..100
  streak: number; // consecutive on-time deliveries
  totalDeliveries: number;
  score: number; // 0..100 composite
}

export interface SystemTrustBreakdown {
  fairness: number; // 0..100 (avg of weekly ratings)
  assignmentQuality: number;
  pressure: number; // INVERTED so higher = less pressure
  score: number; // composite
  basedOn: number; // number of weekly ratings considered
}

export interface MutualTrustIndex {
  driverSide: number; // 0..100 (avg driver score)
  systemSide: number; // 0..100 (system trust)
  mutual: number; // geometric mean
  trend: "up" | "flat" | "down";
}
