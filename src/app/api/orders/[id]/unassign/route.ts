import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { unassignOrder } from "@/lib/store";

export async function POST(
  _req: Request,
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
  const r = unassignOrder(id, user.id);
  if (!r.ok)
    return NextResponse.json(
      { error: { code: r.error } },
      { status: 409 }
    );
  return NextResponse.json({ order: r.order });
}
