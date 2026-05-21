import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import {
  listOrdersForCustomer,
  listCheckpointsForOrder,
  listDelaysForOrder,
  getUser,
} from "@/lib/store";
import { estimateEta } from "@/lib/eta";

// Returns every order belonging to the currently logged-in customer,
// each enriched with its checkpoint timeline, delays, ETA, and a
// redacted driver identity (first-name initial + team area).
//
// We intentionally never leak the driver's full name, phone, or area
// detail beyond what the public track endpoint already exposes.

export async function GET() {
  let user;
  try {
    user = await requireRole("customer");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const orders = listOrdersForCustomer(user.id);
  const enriched = orders.map((o) => {
    const checkpoints = listCheckpointsForOrder(o.id);
    const delays = listDelaysForOrder(o.id);
    const driver = o.driverId ? getUser(o.driverId) : undefined;
    const eta = estimateEta(o);
    return {
      order: o,
      checkpoints: checkpoints.map((c) => ({ kind: c.kind, at: c.at })),
      delays: delays.map((d) => ({ kind: d.kind, at: d.at, note: d.note })),
      driver: driver ? { initial: driver.name[0], area: driver.area } : null,
      eta,
    };
  });
  return NextResponse.json({ customer: user, orders: enriched });
}
