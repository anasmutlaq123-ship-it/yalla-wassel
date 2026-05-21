import { NextResponse } from "next/server";
import { z } from "zod";
import { requireRole, AuthError } from "@/lib/auth";
import { createOrder, listOrders } from "@/lib/store";
import type { OrderStatus } from "@/lib/types";

const createSchema = z.object({
  pickupBusiness: z.string().min(1),
  pickupArea: z.string().min(1),
  recipientName: z.string().min(1),
  recipientArea: z.string().min(1),
  recipientNotes: z.string().optional(),
  priority: z.enum(["normal", "urgent"]).optional(),
});

export async function GET(req: Request) {
  try {
    await requireRole("dispatcher");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const url = new URL(req.url);
  const status = url.searchParams.get("status") as OrderStatus | null;
  const orders = listOrders(status ? { status } : undefined);
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    await requireRole("dispatcher");
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json(
      { error: { code: "bad_request", details: parsed.error.flatten() } },
      { status: 400 }
    );
  const order = createOrder(parsed.data);
  return NextResponse.json({ order }, { status: 201 });
}
