import { NextResponse } from "next/server";
import {
  getOrderByCode,
  getUser,
  listCheckpointsForOrder,
  listDelaysForOrder,
} from "@/lib/store";
import { estimateEta } from "@/lib/eta";

// Public, no auth. We return a *redacted* view — no driver phone, no
// other orders, no dispatcher notes. Driver appears as "[First name
// initial]. · [team area]".

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const order = getOrderByCode(code);
  if (!order)
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 }
    );

  const checkpoints = listCheckpointsForOrder(order.id);
  const delays = listDelaysForOrder(order.id);
  const driver = order.driverId ? getUser(order.driverId) : undefined;
  const eta = estimateEta(order);

  return NextResponse.json({
    order: {
      trackingCode: order.trackingCode,
      pickupBusiness: order.pickupBusiness,
      pickupArea: order.pickupArea,
      recipientName: order.recipientName,
      recipientArea: order.recipientArea,
      priority: order.priority,
      status: order.status,
      confirmationCode: order.confirmationCode,
      createdAt: order.createdAt,
      deliveredAt: order.deliveredAt,
    },
    checkpoints: checkpoints.map((c) => ({
      kind: c.kind,
      at: c.at,
    })),
    delays: delays.map((d) => ({ kind: d.kind, at: d.at, note: d.note })),
    driver: driver
      ? {
          initial: driver.name[0],
          area: driver.area,
        }
      : null,
    eta,
  });
}
