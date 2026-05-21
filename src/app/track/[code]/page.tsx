import { TrackView } from "@/components/customer/track-view";
import { Logo } from "@/components/ui/logo";

export default async function TrackPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return (
    <main className="min-h-screen bg-canvas relative">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[400px] bg-hero-radial"
      />
      <div className="max-w-md mx-auto px-5 py-7">
        <header className="flex items-center justify-between">
          <Logo size="sm" />
          <span className="text-[11px] uppercase tracking-[0.14em] font-bold text-ink-muted">
            Live tracking
          </span>
        </header>
        <TrackView code={code} />
        <footer className="mt-14 text-center text-xs text-ink-muted leading-relaxed">
          We don't track our drivers.
          <br />
          We keep our promises to you.
        </footer>
      </div>
    </main>
  );
}
