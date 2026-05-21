import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Amman",
  });
}

export function relativeFromNow(iso: string, nowMs = Date.now()): string {
  const diff = (new Date(iso).getTime() - nowMs) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return diff > 0 ? "in <1 min" : "just now";
  const mins = Math.round(abs / 60);
  if (mins < 60) return diff > 0 ? `in ${mins} min` : `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  return diff > 0 ? `in ${hrs} h` : `${hrs} h ago`;
}

export function genConfirmationCode(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export function genId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export function startOfWeekISO(d = new Date()): string {
  // Asia/Amman is UTC+3 (no DST since 2022). Compute Monday midnight.
  const local = new Date(d.getTime() + 3 * 3600_000);
  const day = local.getUTCDay(); // 0=Sun
  const diff = (day + 6) % 7; // days since Monday
  local.setUTCDate(local.getUTCDate() - diff);
  local.setUTCHours(0, 0, 0, 0);
  return local.toISOString().slice(0, 10);
}

export function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}
