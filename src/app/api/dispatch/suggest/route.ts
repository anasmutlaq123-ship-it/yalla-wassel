import { NextResponse } from "next/server";
import { requireRole, AuthError } from "@/lib/auth";
import { getOrder } from "@/lib/store";
import { explainSuggestion, rankDriversForOrder } from "@/lib/dispatch-engine";

export async function GET(req: Request) {
  try {
    await requireRole("dispatcher");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const url = new URL(req.url);
  const orderId = url.searchParams.get("orderId");
  if (!orderId)
    return NextResponse.json(
      { error: { code: "bad_request" } },
      { status: 400 }
    );
  const order = getOrder(orderId);
  if (!order)
    return NextResponse.json(
      { error: { code: "not_found" } },
      { status: 404 }
    );
  const suggestions = rankDriversForOrder(order);
  return NextResponse.json({
    orderId,
    suggestions,
    explanation:
      suggestions[0] !== undefined ? explainSuggestion(suggestions[0]) : null,
  });
}
