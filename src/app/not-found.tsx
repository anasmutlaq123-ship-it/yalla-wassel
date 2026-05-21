import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-canvas relative grid place-items-center px-6 text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-hero-radial"
      />
      <div className="max-w-md">
        <Logo />
        <h1 className="mt-10 font-display font-bold text-5xl text-ink tracking-[-0.025em] leading-none">
          Nothing here.
        </h1>
        <p className="mt-4 text-ink-muted leading-relaxed">
          We don't fabricate routes that don't exist —
          <br />
          same way we don't fabricate driver locations.
        </p>
        <Link href="/" className="inline-block mt-7">
          <Button variant="gradient" size="lg">
            Take me home →
          </Button>
        </Link>
      </div>
    </main>
  );
}
