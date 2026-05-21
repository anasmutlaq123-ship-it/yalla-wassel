"use client";

import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

// Polling hook used everywhere realtime is needed. In production the
// same components would subscribe to Socket.io rooms — but we want the
// demo runnable from a single clone.
export function usePoll<T = unknown>(
  url: string | null,
  intervalMs = 3000
) {
  return useSWR<T>(url, fetcher, {
    refreshInterval: intervalMs,
    revalidateOnFocus: true,
  });
}
