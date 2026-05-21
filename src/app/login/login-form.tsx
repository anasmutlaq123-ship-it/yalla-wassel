"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const hint = params.get("as");

  const [username, setUsername] = useState(
    hint === "dispatcher"
      ? "hadeel"
      : hint === "driver"
        ? "mahmoud"
        : hint === "customer"
          ? "mona"
          : ""
  );
  const [password, setPassword] = useState("trustos");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => null);
        setError(j?.error?.message ?? "Could not sign you in.");
        return;
      }
      const j = await res.json();
      const role: string = j.user.role;
      router.push(
        role === "dispatcher"
          ? "/dispatcher"
          : role === "customer"
            ? "/customer"
            : "/driver"
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-7 space-y-4">
      <div>
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          autoFocus
          autoCapitalize="off"
          autoComplete="username"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="hadeel, mahmoud, youssef…"
        />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && (
        <div
          role="alert"
          className="text-sm text-warn bg-warn-soft rounded-lg p-3"
        >
          {error}
        </div>
      )}
      <Button
        type="submit"
        variant="gradient"
        size="xl"
        full
        disabled={pending}
        className="mt-2"
      >
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
