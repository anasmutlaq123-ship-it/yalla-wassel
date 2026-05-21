import { NextResponse } from "next/server";
import { requireUser, AuthError } from "@/lib/auth";
import {
  activeOrderCountForDriver,
  listDrivers,
  listFamiliaritiesForDriver,
} from "@/lib/store";
import { computeDriverTrust, computeSystemTrust, pressureSpike } from "@/lib/trust-score";

export async function GET() {
  try {
    await requireUser();
  } catch (e) {
    if (e instanceof AuthError)
      return NextResponse.json({ error: { code: e.code } }, { status: 401 });
    throw e;
  }
  const drivers = listDrivers().map((d) => {
    const trust = computeDriverTrust(d.id);
    const system = computeSystemTrust(d.id);
    return {
      id: d.id,
      name: d.name,
      username: d.username,
      area: d.area,
      availability: d.availability,
      activeOrders: activeOrderCountForDriver(d.id),
      familiarity: listFamiliaritiesForDriver(d.id).slice(0, 3),
      trust,
      systemRating: system,
      pressureSpike: pressureSpike(d.id),
      workloadCap:
        d.workloadCapMax !== undefined
          ? { max: d.workloadCapMax, until: d.workloadCapUntil }
          : null,
    };
  });
  return NextResponse.json({ drivers });
}
