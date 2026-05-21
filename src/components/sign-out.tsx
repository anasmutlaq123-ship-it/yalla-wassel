"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export function SignOut({ className }: { className?: string }) {
  const router = useRouter();
  async function go() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }
  return (
    <button
      type="button"
      onClick={go}
      className={cn(
        "text-xs text-ink-muted hover:text-ink underline-offset-2 hover:underline",
        className
      )}
    >
      Sign out
    </button>
  );
}
