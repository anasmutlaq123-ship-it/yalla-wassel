import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import { computeMutualTrust, computeSystemTrust } from "@/lib/trust-score";

export async function GET() {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const mutual = computeMutualTrust();
  const system = computeSystemTrust();
  return NextResponse.json({ mutual, system });
}
