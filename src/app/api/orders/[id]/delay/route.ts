import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { appendDelay, getOrder } from "@/lib/store";

const schema = z.object({
  kind: z.enum([
    "traffic",
    "store_delay",
    "customer_unavailable",
    "vehicle",
    "other",
  ]),
  note: z.string().optional(),
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
      { error: { code: "forbidden" } },
      { status: 403 }
    );

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_request" } },
      { status: 400 }
    );

  const delay = appendDelay(id, parsed.data.kind, parsed.data.note);
  return NextResponse.json({ delay });
}
