import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import {
  getActiveOrderForDriver,
  listCheckpointsForOrder,
  listDelaysForOrder,
  getUser,
} from "@/lib/store";
import { estimateEta } from "@/lib/eta";

export async function GET() {
  let user;
  try {
    user = await requireRole("driver");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const order = getActiveOrderForDriver(user.id);
  // Always return the current driver record — the shell needs availability
  // even when there's no active order, to render the on-shift toggle.
  if (!order) return NextResponse.json({ order: null, driver: user });
  const checkpoints = listCheckpointsForOrder(order.id);
  const delays = listDelaysForOrder(order.id);
  const eta = estimateEta(order);
  return NextResponse.json({
    order,
    checkpoints,
    delays,
    eta,
    driver: user,
  });
}
