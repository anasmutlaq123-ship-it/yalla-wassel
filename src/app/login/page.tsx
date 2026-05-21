import { Suspense } from "react";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/ui/logo";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-canvas relative grid place-items-center px-5 py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-hero-radial"
      />
      <div className="w-full max-w-md">
        <div className="mb-10">
          <Logo />
        </div>
        <div className="bg-white border border-surface-line rounded-3xl shadow-soft p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.14em] font-bold text-trust">
            Sign in
          </p>
          <h1 className="mt-2 font-display font-bold text-3xl tracking-[-0.025em] text-ink leading-tight">
            Welcome back.
          </h1>
          <p className="mt-2 text-sm text-ink-muted leading-relaxed">
            Use your team username and password.
          </p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
