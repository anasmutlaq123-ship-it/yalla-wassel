import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { assignOrder, getOrder } from "@/lib/store";
import { rankDriversForOrder } from "@/lib/dispatch-engine";

const schema = z.object({
  orderId: z.string().min(1),
  driverId: z.string().min(1),
  override: z
    .object({
      reason: z.string().min(2),
    })
    .optional(),
});

export async function POST(req: Request) {
  let user;
  try {
    user = await requireRole("dispatcher");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_request" } },
      { status: 400 }
    );

  const order = getOrder(parsed.data.orderId);
  if (!order)
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 }
    );

  // Snapshot the engine's ranking at decision time so the audit log is
  // a real "what did the engine recommend" record, not a retroactive one.
  const ranked = rankDriversForOrder(order);

  // If we're not picking the top suggestion, require a reason.
  const top = ranked[0];
  const isOverride = top !== undefined && top.driverId !== parsed.data.driverId;
  if (isOverride && !parsed.data.override?.reason) {
    return NextResponse.json(
      {
        error: {
          code: "override_reason_required",
          message:
            "You chose a different driver than the engine suggested. Please add a one-line reason — it helps the team learn.",
        },
      },
      { status: 400 }
    );
  }

  const r = assignOrder(
    parsed.data.orderId,
    parsed.data.driverId,
    user.id,
    ranked,
    parsed.data.override?.reason
  );
  if (!r.ok)
    return NextResponse.json(
      { error: { code: r.error } },
      { status: 409 }
    );
  return NextResponse.json({ order: r.order, log: r.log });
}
