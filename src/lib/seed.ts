import type {
  AreaFamiliarity,
  AreaTravelStat,
  AssignmentLog,
  Checkpoint,
  DelayReason,
  HelpAlert,
  Order,
  User,
  WeeklyRating,
} from "./types";

// All demo IDs are deterministic so URLs are stable across restarts.
// Times are anchored to "today at 08:00 Asia/Amman" so the dashboard
// looks alive on first load.

function todayAt(hours: number, minutes = 0): string {
  // Asia/Amman is UTC+3.
  const now = new Date();
  const ammNow = new Date(now.getTime() + 3 * 3600_000);
  ammNow.setUTCHours(hours, minutes, 0, 0);
  return new Date(ammNow.getTime() - 3 * 3600_000).toISOString();
}

function daysAgo(days: number, hours = 12, minutes = 0): string {
  const now = new Date(Date.now() - days * 24 * 3600_000);
  const ammNow = new Date(now.getTime() + 3 * 3600_000);
  ammNow.setUTCHours(hours, minutes, 0, 0);
  return new Date(ammNow.getTime() - 3 * 3600_000).toISOString();
}

export const seedUsers: User[] = [
  {
    id: "user_dispatcher_hadeel",
    username: "hadeel",
    name: "Hadeel",
    role: "dispatcher",
  },
  // Drivers
  {
    id: "user_driver_mahmoud",
    username: "mahmoud",
    name: "Mahmoud",
    role: "driver",
    area: "West Amman",
    availability: "available",
  },
  {
    id: "user_driver_youssef",
    username: "youssef",
    name: "Youssef",
    role: "driver",
    area: "West Amman",
    availability: "on_delivery",
  },
  {
    id: "user_driver_hamza",
    username: "hamza",
    name: "Hamza",
    role: "driver",
    area: "Central",
    availability: "available",
  },
  {
    id: "user_driver_amjad",
    username: "amjad",
    name: "Amjad",
    role: "driver",
    area: "Central",
    availability: "available",
  },
  {
    id: "user_driver_wael",
    username: "wael",
    name: "Wael",
    role: "driver",
    area: "East",
    availability: "on_delivery",
  },
  {
    id: "user_driver_khaled",
    username: "khaled",
    name: "Khaled",
    role: "driver",
    area: "East",
    availability: "off_duty",
  },
  // ── Customers ────────────────────────────────────────────────────
  // Each customer maps to the recipient name on one or more orders.
  {
    id: "user_customer_mona",
    username: "mona",
    name: "Mona K.",
    role: "customer",
  },
  {
    id: "user_customer_ahmad",
    username: "ahmad",
    name: "Ahmad S.",
    role: "customer",
  },
  {
    id: "user_customer_layla",
    username: "layla",
    name: "Layla H.",
    role: "customer",
  },
  {
    id: "user_customer_tareq",
    username: "tareq",
    name: "Tareq M.",
    role: "customer",
  },
  {
    id: "user_customer_hala",
    username: "hala",
    name: "Hala D.",
    role: "customer",
  },
  {
    id: "user_customer_noor",
    username: "noor",
    name: "Noor F.",
    role: "customer",
  },
];

export const seedOrders: Order[] = [
  {
    id: "order_1001",
    trackingCode: "TRUST-1001",
    externalRef: "1001",
    pickupBusiness: "Reem Pharmacy",
    pickupArea: "Wadi Saqra",
    recipientName: "Mona K.",
    recipientArea: "Khalda",
    recipientNotes: "Apt 4B · ring twice",
    priority: "urgent",
    status: "pending",
    confirmationCode: "4721",
    customerId: "user_customer_mona",
    createdAt: todayAt(8, 6),
  },
  {
    id: "order_1002",
    trackingCode: "TRUST-1002",
    externalRef: "1002",
    pickupBusiness: "Bloom Flowers",
    pickupArea: "Sweifieh",
    recipientName: "Ahmad S.",
    recipientArea: "Abdoun",
    recipientNotes: "Bouquet — handle upright",
    priority: "normal",
    status: "in_progress",
    confirmationCode: "1188",
    customerId: "user_customer_ahmad",
    driverId: "user_driver_youssef",
    createdAt: todayAt(8, 10),
    assignedAt: todayAt(8, 14),
  },
  {
    id: "order_1003",
    trackingCode: "TRUST-1003",
    externalRef: "1003",
    pickupBusiness: "Mama's Kitchen",
    pickupArea: "Shmeisani",
    recipientName: "Layla H.",
    recipientArea: "Shmeisani",
    recipientNotes: "Office reception · ask for Layla",
    priority: "normal",
    status: "pending",
    confirmationCode: "5302",
    customerId: "user_customer_layla",
    createdAt: todayAt(8, 20),
  },
  {
    id: "order_1004",
    trackingCode: "TRUST-1004",
    externalRef: "1004",
    pickupBusiness: "FixIt Electronics",
    pickupArea: "Tla' Al Ali",
    recipientName: "Tareq M.",
    recipientArea: "Tla' Al Ali",
    priority: "normal",
    status: "delivered",
    confirmationCode: "9094",
    customerId: "user_customer_tareq",
    driverId: "user_driver_mahmoud",
    createdAt: todayAt(7, 30),
    assignedAt: todayAt(7, 35),
    deliveredAt: todayAt(8, 5),
  },
  {
    id: "order_1005",
    trackingCode: "TRUST-1005",
    externalRef: "1005",
    pickupBusiness: "Reem Pharmacy",
    pickupArea: "Wadi Saqra",
    recipientName: "Hala D.",
    recipientArea: "Jabal Amman",
    recipientNotes: "1st rainbow st. · bldg 14",
    priority: "urgent",
    status: "pending",
    confirmationCode: "6655",
    customerId: "user_customer_hala",
    createdAt: todayAt(8, 32),
  },
  {
    id: "order_1006",
    trackingCode: "TRUST-1006",
    externalRef: "1006",
    pickupBusiness: "Mama's Kitchen",
    pickupArea: "Shmeisani",
    recipientName: "Noor F.",
    recipientArea: "Jabal Hussein",
    priority: "normal",
    status: "in_progress",
    confirmationCode: "3320",
    customerId: "user_customer_noor",
    driverId: "user_driver_wael",
    createdAt: todayAt(7, 50),
    assignedAt: todayAt(7, 55),
  },

  // ── Historical orders — populate customer dashboards with a track record ──
  {
    id: "order_h_mona_1",
    trackingCode: "TRUST-0992",
    externalRef: "0992",
    pickupBusiness: "Reem Pharmacy",
    pickupArea: "Wadi Saqra",
    recipientName: "Mona K.",
    recipientArea: "Khalda",
    priority: "normal",
    status: "delivered",
    confirmationCode: "0044",
    customerId: "user_customer_mona",
    driverId: "user_driver_mahmoud",
    createdAt: daysAgo(1, 14, 5),
    assignedAt: daysAgo(1, 14, 10),
    deliveredAt: daysAgo(1, 14, 38),
  },
  {
    id: "order_h_mona_2",
    trackingCode: "TRUST-0985",
    externalRef: "0985",
    pickupBusiness: "Bloom Flowers",
    pickupArea: "Sweifieh",
    recipientName: "Mona K.",
    recipientArea: "Khalda",
    priority: "normal",
    status: "delivered",
    confirmationCode: "7311",
    customerId: "user_customer_mona",
    driverId: "user_driver_youssef",
    createdAt: daysAgo(4, 11, 20),
    assignedAt: daysAgo(4, 11, 25),
    deliveredAt: daysAgo(4, 11, 52),
  },
  {
    id: "order_h_layla_1",
    trackingCode: "TRUST-0997",
    externalRef: "0997",
    pickupBusiness: "Mama's Kitchen",
    pickupArea: "Shmeisani",
    recipientName: "Layla H.",
    recipientArea: "Shmeisani",
    priority: "normal",
    status: "delivered",
    confirmationCode: "2208",
    customerId: "user_customer_layla",
    driverId: "user_driver_amjad",
    createdAt: daysAgo(1, 12, 30),
    assignedAt: daysAgo(1, 12, 35),
    deliveredAt: daysAgo(1, 12, 53),
  },
  {
    id: "order_h_hala_1",
    trackingCode: "TRUST-0989",
    externalRef: "0989",
    pickupBusiness: "Reem Pharmacy",
    pickupArea: "Wadi Saqra",
    recipientName: "Hala D.",
    recipientArea: "Jabal Amman",
    priority: "normal",
    status: "delivered",
    confirmationCode: "5546",
    customerId: "user_customer_hala",
    driverId: "user_driver_hamza",
    createdAt: daysAgo(3, 9, 15),
    assignedAt: daysAgo(3, 9, 18),
    deliveredAt: daysAgo(3, 9, 33),
  },
];

export const seedCheckpoints: Checkpoint[] = [
  // 1002 — Youssef
  {
    id: "ck_1002_a",
    orderId: "order_1002",
    kind: "assigned",
    at: todayAt(8, 14),
    actorId: "user_dispatcher_hadeel",
  },
  {
    id: "ck_1002_p",
    orderId: "order_1002",
    kind: "picked_up",
    at: todayAt(8, 28),
    actorId: "user_driver_youssef",
  },
  {
    id: "ck_1002_n",
    orderId: "order_1002",
    kind: "arrived_nearby",
    at: todayAt(8, 41),
    actorId: "user_driver_youssef",
  },
  // 1004 — Mahmoud (delivered)
  {
    id: "ck_1004_a",
    orderId: "order_1004",
    kind: "assigned",
    at: todayAt(7, 35),
    actorId: "user_dispatcher_hadeel",
  },
  {
    id: "ck_1004_p",
    orderId: "order_1004",
    kind: "picked_up",
    at: todayAt(7, 48),
    actorId: "user_driver_mahmoud",
  },
  {
    id: "ck_1004_n",
    orderId: "order_1004",
    kind: "arrived_nearby",
    at: todayAt(7, 58),
    actorId: "user_driver_mahmoud",
  },
  {
    id: "ck_1004_d",
    orderId: "order_1004",
    kind: "delivered",
    at: todayAt(8, 5),
    actorId: "user_driver_mahmoud",
  },
  // 1006 — Wael
  {
    id: "ck_1006_a",
    orderId: "order_1006",
    kind: "assigned",
    at: todayAt(7, 55),
    actorId: "user_dispatcher_hadeel",
  },
  {
    id: "ck_1006_p",
    orderId: "order_1006",
    kind: "picked_up",
    at: todayAt(8, 12),
    actorId: "user_driver_wael",
  },
  // ── Historical full timelines ──────────────────────────────────
  ...buildHistorical("order_h_mona_1", "user_driver_mahmoud", daysAgo(1, 14, 10), daysAgo(1, 14, 20), daysAgo(1, 14, 33), daysAgo(1, 14, 38)),
  ...buildHistorical("order_h_mona_2", "user_driver_youssef", daysAgo(4, 11, 25), daysAgo(4, 11, 34), daysAgo(4, 11, 48), daysAgo(4, 11, 52)),
  ...buildHistorical("order_h_layla_1", "user_driver_amjad", daysAgo(1, 12, 35), daysAgo(1, 12, 41), daysAgo(1, 12, 49), daysAgo(1, 12, 53)),
  ...buildHistorical("order_h_hala_1", "user_driver_hamza", daysAgo(3, 9, 18), daysAgo(3, 9, 23), daysAgo(3, 9, 30), daysAgo(3, 9, 33)),
];

function buildHistorical(
  orderId: string,
  driverId: string,
  assignedAt: string,
  pickedUpAt: string,
  arrivedAt: string,
  deliveredAt: string
): Checkpoint[] {
  return [
    { id: `${orderId}_a`, orderId, kind: "assigned", at: assignedAt, actorId: "user_dispatcher_hadeel" },
    { id: `${orderId}_p`, orderId, kind: "picked_up", at: pickedUpAt, actorId: driverId },
    { id: `${orderId}_n`, orderId, kind: "arrived_nearby", at: arrivedAt, actorId: driverId },
    { id: `${orderId}_d`, orderId, kind: "delivered", at: deliveredAt, actorId: driverId },
  ];
}

export const seedDelays: DelayReason[] = [
  {
    id: "dly_1006_traffic",
    orderId: "order_1006",
    kind: "traffic",
    at: todayAt(8, 25),
    note: "Shmeisani — bridge backed up",
  },
];

export const seedHelpAlerts: HelpAlert[] = [];

export const seedAssignmentLog: AssignmentLog[] = [
  {
    id: "asgn_1002",
    orderId: "order_1002",
    dispatcherId: "user_dispatcher_hadeel",
    assignedDriverId: "user_driver_youssef",
    rankedSuggestions: [],
    at: todayAt(8, 14),
  },
  {
    id: "asgn_1004",
    orderId: "order_1004",
    dispatcherId: "user_dispatcher_hadeel",
    assignedDriverId: "user_driver_mahmoud",
    rankedSuggestions: [],
    at: todayAt(7, 35),
  },
  {
    id: "asgn_1006",
    orderId: "order_1006",
    dispatcherId: "user_dispatcher_hadeel",
    assignedDriverId: "user_driver_wael",
    rankedSuggestions: [],
    at: todayAt(7, 55),
  },
];

export const seedWeeklyRatings: WeeklyRating[] = [
  // Pretend a few drivers submitted last week — so the system score is non-zero on first load.
  {
    id: "wr_seed_1",
    driverId: "user_driver_mahmoud",
    weekOf: "2026-05-12",
    fairness: 4,
    assignmentQuality: 4,
    pressure: 2,
    note: "Tuesday felt heavy.",
    submittedAt: "2026-05-16T15:10:00+03:00",
  },
  {
    id: "wr_seed_2",
    driverId: "user_driver_youssef",
    weekOf: "2026-05-12",
    fairness: 4,
    assignmentQuality: 5,
    pressure: 2,
    submittedAt: "2026-05-16T16:00:00+03:00",
  },
  {
    id: "wr_seed_3",
    driverId: "user_driver_hamza",
    weekOf: "2026-05-12",
    fairness: 5,
    assignmentQuality: 4,
    pressure: 1,
    submittedAt: "2026-05-16T17:25:00+03:00",
  },
  {
    id: "wr_seed_4",
    driverId: "user_driver_amjad",
    weekOf: "2026-05-12",
    fairness: 3,
    assignmentQuality: 3,
    pressure: 3,
    note: "Wednesday was rough.",
    submittedAt: "2026-05-17T09:00:00+03:00",
  },
];

export const seedFamiliarities: AreaFamiliarity[] = [
  { driverId: "user_driver_mahmoud", area: "Khalda", deliveries: 18, lastAt: todayAt(8, 5) },
  { driverId: "user_driver_mahmoud", area: "Abdoun", deliveries: 9 },
  { driverId: "user_driver_mahmoud", area: "Tla' Al Ali", deliveries: 11, lastAt: todayAt(8, 5) },
  { driverId: "user_driver_youssef", area: "Abdoun", deliveries: 22 },
  { driverId: "user_driver_youssef", area: "Sweifieh", deliveries: 14 },
  { driverId: "user_driver_hamza", area: "Jabal Amman", deliveries: 16 },
  { driverId: "user_driver_hamza", area: "Shmeisani", deliveries: 11 },
  { driverId: "user_driver_amjad", area: "Shmeisani", deliveries: 19 },
  { driverId: "user_driver_amjad", area: "Jabal Amman", deliveries: 8 },
  { driverId: "user_driver_wael", area: "Jabal Hussein", deliveries: 20 },
  { driverId: "user_driver_wael", area: "Marka", deliveries: 12 },
];

// Historical neighborhood pairings (in minutes). Used for ETA ranges.
// In production these are learned from completed deliveries.
export const seedTravel: AreaTravelStat[] = [
  { fromArea: "Wadi Saqra", toArea: "Khalda", meanMin: 20, p80Min: 28, samples: 124 },
  { fromArea: "Wadi Saqra", toArea: "Jabal Amman", meanMin: 14, p80Min: 19, samples: 88 },
  { fromArea: "Sweifieh", toArea: "Abdoun", meanMin: 9, p80Min: 14, samples: 142 },
  { fromArea: "Shmeisani", toArea: "Shmeisani", meanMin: 6, p80Min: 11, samples: 60 },
  { fromArea: "Shmeisani", toArea: "Jabal Hussein", meanMin: 11, p80Min: 17, samples: 73 },
  { fromArea: "Tla' Al Ali", toArea: "Tla' Al Ali", meanMin: 8, p80Min: 13, samples: 41 },
];

// Areas that each region "owns" — used by the dispatch engine for area_match.
export const areaCoverage: Record<string, string[]> = {
  "West Amman": ["Khalda", "Abdoun", "Sweifieh", "Tla' Al Ali", "Um Al Summaq"],
  Central: ["Shmeisani", "Jabal Amman", "Wadi Saqra", "Abdali", "Jabal Al Webdeh"],
  East: ["Jabal Hussein", "Marka", "Hashemi", "Quaismeh", "Tabarbour"],
};
