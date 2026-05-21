import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { submitWeeklyRating } from "@/lib/store";
import { computeSystemTrust } from "@/lib/trust-score";

const schema = z.object({
  fairness: z.number().int().min(1).max(5),
  assignmentQuality: z.number().int().min(1).max(5),
  pressure: z.number().int().min(1).max(5),
  note: z.string().optional(),
});

export async function GET() {
  try {
    await requireRole("driver");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  // Driver-side system score is the team average — not their own only.
  // We want them to see what the team thinks, not navel-gaze.
  return NextResponse.json({ system: computeSystemTrust() });
}

export async function POST(req: Request) {
  let user;
  try {
    user = await requireRole("driver");
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
  const rating = submitWeeklyRating({ driverId: user.id, ...parsed.data });
  return NextResponse.json({ rating, system: computeSystemTrust() });
}
