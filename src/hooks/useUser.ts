"use client";

import useSWR from "swr";
import type { User } from "@/lib/types";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUser() {
  const { data, isLoading, mutate } = useSWR<{ user: User | null }>(
    "/api/auth/me",
    fetcher
  );
  return { user: data?.user ?? null, isLoading, mutate };
}
