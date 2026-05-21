import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, AuthError } from "@/lib/auth";
import { setDriverAvailability } from "@/lib/store";

const schema = z.object({
  status: z.enum(["available", "off_duty"]),
});

export async function POST(
  req: Request,
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
  // A driver may only change their own availability.
  if (user.role !== "dispatcher" && user.id !== id)
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
  const updated = setDriverAvailability(id, parsed.data.status);
  if (!updated)
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 }
    );
  return NextResponse.json({ driver: updated });
}
