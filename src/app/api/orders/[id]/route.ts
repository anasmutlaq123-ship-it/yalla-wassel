import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import {
  getOrder,
  getUser,
  listCheckpointsForOrder,
  listDelaysForOrder,
} from "@/lib/store";
import { estimateEta } from "@/lib/eta";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const { id } = await params;
  const order = getOrder(id);
  if (!order)
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 }
    );
  if (
    user.role !== "dispatcher" &&
    !(user.role === "driver" && order.driverId === user.id)
  ) {
    return NextResponse.json(
      { error: { code: "forbidden" } },
      { status: 403 }
    );
  }
  const checkpoints = listCheckpointsForOrder(order.id);
  const delays = listDelaysForOrder(order.id);
  const driver = order.driverId ? getUser(order.driverId) : undefined;
  const eta = estimateEta(order);
  return NextResponse.json({ order, checkpoints, delays, driver, eta });
}
