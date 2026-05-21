import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthError } from "@/lib/auth";
import { listOpenHelp, raiseHelp } from "@/lib/store";

const schema = z.object({
  kind: z.enum([
    "traffic",
    "store_delay",
    "customer_unavailable",
    "vehicle",
    "other",
  ]),
  orderId: z.string().optional(),
  note: z.string().optional(),
});

export async function GET() {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  if (user.role !== "dispatcher")
    return NextResponse.json(
      { error: { code: "forbidden" } },
      { status: 403 }
    );
  return NextResponse.json({ alerts: listOpenHelp() });
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  if (user.role !== "driver")
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
  const alert = raiseHelp(
    user.id,
    parsed.data.kind,
    parsed.data.orderId,
    parsed.data.note
  );
  return NextResponse.json({ alert });
}
