// Run with: `npm run prisma:seed`
//
// Mirrors src/lib/seed.ts into Postgres. This file isn't used by the
// demo (the in-memory store is used instead). It exists so the
// production migration is one command away.

import { PrismaClient } from "@prisma/client";
import {
  seedUsers,
  seedOrders,
  seedCheckpoints,
  seedDelays,
  seedAssignmentLog,
  seedWeeklyRatings,
  seedFamiliarities,
  seedTravel,
} from "../src/lib/seed";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction([
    prisma.weeklyRating.deleteMany(),
    prisma.areaFamiliarity.deleteMany(),
    prisma.areaTravelStat.deleteMany(),
    prisma.assignmentLog.deleteMany(),
    prisma.helpAlert.deleteMany(),
    prisma.delayReason.deleteMany(),
    prisma.checkpoint.deleteMany(),
    prisma.order.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  await prisma.user.createMany({
    data: seedUsers.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role.toUpperCase() as any,
      passwordHash: "$2a$10$demo-only-not-a-real-hash",
      area: u.area ?? null,
      availability: u.availability
        ? (u.availability.toUpperCase() as any)
        : null,
    })),
  });

  await prisma.order.createMany({
    data: seedOrders.map((o) => ({
      id: o.id,
      trackingCode: o.trackingCode,
      externalRef: o.externalRef ?? null,
      pickupBusiness: o.pickupBusiness,
      pickupArea: o.pickupArea,
      recipientName: o.recipientName,
      recipientArea: o.recipientArea,
      recipientNotes: o.recipientNotes ?? null,
      priority: o.priority.toUpperCase() as any,
      status: o.status.toUpperCase() as any,
      confirmationCode: o.confirmationCode,
      driverId: o.driverId ?? null,
      createdAt: new Date(o.createdAt),
      assignedAt: o.assignedAt ? new Date(o.assignedAt) : null,
      deliveredAt: o.deliveredAt ? new Date(o.deliveredAt) : null,
    })),
  });

  await prisma.checkpoint.createMany({
    data: seedCheckpoints.map((c) => ({
      id: c.id,
      orderId: c.orderId,
      kind: c.kind.toUpperCase() as any,
      at: new Date(c.at),
      actorId: c.actorId,
      note: c.note ?? null,
    })),
  });

  await prisma.delayReason.createMany({
    data: seedDelays.map((d) => ({
      id: d.id,
      orderId: d.orderId,
      kind: d.kind.toUpperCase() as any,
      at: new Date(d.at),
      note: d.note ?? null,
    })),
  });

  await prisma.assignmentLog.createMany({
    data: seedAssignmentLog.map((a) => ({
      id: a.id,
      orderId: a.orderId,
      dispatcherId: a.dispatcherId,
      assignedDriverId: a.assignedDriverId,
      rankedSuggestionsJson: a.rankedSuggestions as any,
      overrideReason: a.overrideReason ?? null,
      at: new Date(a.at),
    })),
  });

  await prisma.weeklyRating.createMany({
    data: seedWeeklyRatings.map((w) => ({
      id: w.id,
      driverId: w.driverId,
      weekOf: new Date(w.weekOf),
      fairness: w.fairness,
      assignmentQuality: w.assignmentQuality,
      pressure: w.pressure,
      note: w.note ?? null,
      submittedAt: new Date(w.submittedAt),
    })),
  });

  await prisma.areaFamiliarity.createMany({
    data: seedFamiliarities.map((f) => ({
      driverId: f.driverId,
      area: f.area,
      deliveries: f.deliveries,
      lastAt: f.lastAt ? new Date(f.lastAt) : null,
    })),
  });

  await prisma.areaTravelStat.createMany({
    data: seedTravel.map((t) => ({
      fromArea: t.fromArea,
      toArea: t.toArea,
      meanMin: t.meanMin,
      p80Min: t.p80Min,
      samples: t.samples,
    })),
  });

  // eslint-disable-next-line no-console
  console.log("Seeded TrustOS demo data.");
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
