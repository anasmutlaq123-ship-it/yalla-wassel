import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { resolveHelp } from "@/lib/store";

const schema = z.object({
  action: z.enum(["acknowledged", "resolved_handoff"]),
  handoffToId: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let user;
  try {
    user = await requireRole("dispatcher");
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
  const a = resolveHelp(id, user.id, parsed.data.action, parsed.data.handoffToId);
  if (!a)
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 }
    );
  return NextResponse.json({ alert: a });
}
