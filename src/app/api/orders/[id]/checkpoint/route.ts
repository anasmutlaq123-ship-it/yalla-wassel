import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { appendCheckpoint, getOrder } from "@/lib/store";

const schema = z.object({
  kind: z.enum(["picked_up", "arrived_nearby", "delivered"]),
  note: z.string().optional(),
  confirmationCode: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireRole("driver");
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
  if (order.driverId !== user.id)
    return NextResponse.json(
      { error: { code: "forbidden", message: "Not your delivery." } },
      { status: 403 }
    );

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_request" } },
      { status: 400 }
    );

  // For 'delivered', require confirmation code match.
  if (parsed.data.kind === "delivered") {
    if (parsed.data.confirmationCode !== order.confirmationCode) {
      return NextResponse.json(
        {
          error: {
            code: "bad_confirmation_code",
            message:
              "That code doesn't match. Ask the customer to read the 4-digit code on their tracking page.",
          },
        },
        { status: 400 }
      );
    }
  }

  const r = appendCheckpoint(id, parsed.data.kind, user.id, parsed.data.note);
  if (!r.ok)
    return NextResponse.json(
      { error: { code: r.error } },
      { status: 409 }
    );
  return NextResponse.json({ order: r.order, checkpoint: r.checkpoint });
}
