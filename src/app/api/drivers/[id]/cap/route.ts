import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { setDriverCap } from "@/lib/store";

const schema = z.object({
  maxActiveOrders: z.number().int().min(0).max(20).nullable(),
  until: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole("dispatcher");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_request" } },
      { status: 400 }
    );
  const updated = setDriverCap(
    id,
    parsed.data.maxActiveOrders === null ? undefined : parsed.data.maxActiveOrders,
    parsed.data.until
  );
  if (!updated)
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 }
    );
  return NextResponse.json({ driver: updated });
}
