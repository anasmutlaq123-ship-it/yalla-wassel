// ────────────────────────────────────────────────────────────────────
// Cookie-based session auth — demo grade
// ────────────────────────────────────────────────────────────────────
//
// In production: swap createSession/getSessionUser for signed JWTs
// (using jose, already in deps). The route handlers don't need to
// change — they only call requireUser / getCurrentUser from here.
//
// Demo password for every account: "trustos".

import { cookies } from "next/headers";
import {
  createSession,
  destroySession,
  getSessionUser,
  getUserByUsername,
} from "./store";
import type { Role, User } from "./types";

const COOKIE_NAME = "trustos_session";
const DEMO_PASSWORD = "trustos";

export async function login(
  username: string,
  password: string
): Promise<User | null> {
  if (password !== DEMO_PASSWORD) return null;
  const user = getUserByUsername(username);
  if (!user) return null;
  const token = createSession(user.id);
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return user;
}

export async function logout() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  destroySession(token);
  jar.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<User | undefined> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  return getSessionUser(token);
}

export async function requireUser(): Promise<User> {
  const u = await getCurrentUser();
  if (!u) {
    throw new AuthError("unauthenticated");
  }
  return u;
}

export async function requireRole(role: Role): Promise<User> {
  const u = await requireUser();
  if (u.role !== role) {
    throw new AuthError("forbidden");
  }
  return u;
}

export class AuthError extends Error {
  constructor(public code: "unauthenticated" | "forbidden") {
    super(code);
  }
}
