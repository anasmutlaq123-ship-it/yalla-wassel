import { NextResponse } from "next/server";
import { login } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "bad_request", message: "Missing username or password." } },
      { status: 400 }
    );
  }
  const user = await login(parsed.data.username, parsed.data.password);
  if (!user) {
    return NextResponse.json(
      { error: { code: "invalid_credentials", message: "Wrong username or password." } },
      { status: 401 }
    );
  }
  return NextResponse.json({ user });
}
