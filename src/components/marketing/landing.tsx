"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Badge } from "@/components/ui/badge";
import { TopNav } from "./top-nav";
import { HeroCards } from "./hero-cards";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.4 },
  transition: { duration: 0.6, ease: [0.2, 0.8, 0.2, 1] as const },
};

export function Landing() {
  return (
    <main className="min-h-screen bg-canvas relative overflow-hidden">
      {/* Background gradient mesh */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[820px] bg-hero-radial"
      />

      <TopNav />

      {/* ── HERO ───────────────────────────────────────────────────── */}
      <section className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-28 sm:pt-36 pb-24">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-10 items-center">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-flex items-center gap-2 rounded-full glass border border-trust-soft px-3.5 py-1.5 shadow-card"
            >
              <span className="relative inline-flex h-1.5 w-1.5">
                <span className="absolute inset-0 rounded-full bg-trust opacity-50 animate-ping" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-trust" />
              </span>
              <span className="text-xs font-semibold text-trust-ink tracking-tight">
                Trusted by 30+ Amman shops
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.08,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="mt-6 font-display font-black text-[44px] xs:text-5xl sm:text-6xl lg:text-[72px] leading-[0.96] tracking-[-0.035em] text-ink"
            >
              <span className="block">Accountability</span>
              <span className="block text-violet-fill">without</span>
              <span className="block">surveillance.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.2,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="mt-7 text-[17px] sm:text-lg text-ink-muted leading-relaxed max-w-xl"
            >
              Yalla Wassel is a same-day delivery shop in Amman. Drivers tap
              four checkpoints per order, the dispatch board explains every
              assignment in one line, and trust runs in both directions —
              no GPS, no map, no surveillance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.55,
                delay: 0.32,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="mt-9 flex flex-wrap gap-3"
            >
              <Link href="/login?as=dispatcher">
                <Button variant="gradient" size="xl">
                  Get started →
                </Button>
              </Link>
              <Link href="/track/TRUST-1001">
                <Button variant="secondary" size="xl">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    className="h-4 w-4 -ml-1"
                    aria-hidden
                  >
                    <path
                      d="M8 5v14l11-7L8 5z"
                      fill="currentColor"
                    />
                  </svg>
                  Watch demo
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="mt-12 flex flex-wrap items-center gap-x-7 gap-y-4 text-xs text-ink-muted"
            >
              <Stat n="8" label="active drivers" />
              <Divider />
              <Stat n="200+" label="deliveries / week" />
              <Divider />
              <Stat n="94%" label="on-time rate" />
            </motion.div>
          </div>

          {/* Right — floating cards composition */}
          <div className="hidden lg:block">
            <HeroCards />
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────── */}
      <section id="features" className="relative py-24 sm:py-28">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp} className="max-w-2xl mb-14">
            <Badge tone="trust" size="md">
              The system
            </Badge>
            <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-[-0.025em] text-ink leading-[1.02]">
              Trust scales when it's measured both ways.
            </h2>
            <p className="mt-5 text-[17px] text-ink-muted leading-relaxed">
              Three primitives. One job — keep the team accountable to the
              customer and the system accountable to the team.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            <FeatureCard
              n="01"
              title="Trust Ledger"
              body="Four taps per delivery — Assigned, Picked Up, Nearby, Delivered. Append-only. No location data ever stored."
              accent="ledger"
            />
            <FeatureCard
              n="02"
              title="Mutual Trust Score"
              body="Drivers rate the system weekly on fairness, fit, and pressure. The dispatcher sees the score next to their own."
              accent="mutual"
            />
            <FeatureCard
              n="03"
              title="Explainable Dispatch"
              body="Every suggestion ships with one sentence. Overrides require a reason — the engine learns from them."
              accent="dispatch"
            />
          </div>
        </div>
      </section>

      {/* ── ROLE DOORS ─────────────────────────────────────────────── */}
      <section className="relative py-24 sm:py-28 bg-surface">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div {...fadeUp} className="max-w-2xl mb-12">
            <Badge tone="trust" size="md">
              Three doors
            </Badge>
            <h2 className="mt-4 font-display font-bold text-4xl sm:text-5xl tracking-[-0.025em] text-ink leading-[1.02]">
              Designed for the way work actually happens.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-5">
            <DoorCard
              href="/login?as=dispatcher"
              label="Dispatcher"
              body="Live command center, explainable dispatch, mutual trust insights."
            />
            <DoorCard
              href="/login?as=driver"
              label="Driver"
              body="Silent Mode — one screen, one order, one tap. No notifications."
            />
            <DoorCard
              href="/track/TRUST-1001"
              label="Customer"
              body="Public tracking. Timeline, not a map. No driver location ever shared."
            />
          </div>
        </div>
      </section>

      {/* ── ABOUT ──────────────────────────────────────────────────── */}
      <section id="about" className="relative py-24 sm:py-28">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <motion.div {...fadeUp}>
            <Badge tone="trust" size="md">
              The thesis
            </Badge>
            <p className="mt-6 font-display font-bold text-3xl sm:text-[40px] tracking-[-0.02em] text-ink leading-[1.1]">
              The dispatcher screen has{" "}
              <span className="text-violet-fill">no map.</span>
              <br />
              That deliberate absence is the entire point.
            </p>
            <p className="mt-8 text-ink-muted">
              Yalla Wassel · Amman · since 2024
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────── */}
      <section className="relative pb-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <motion.div
            {...fadeUp}
            className="relative overflow-hidden rounded-4xl bg-violet-grad p-10 sm:p-14 text-white shadow-glow"
          >
            <div
              aria-hidden
              className="absolute inset-0 dot-grid opacity-25"
            />
            <div
              aria-hidden
              className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] font-bold opacity-80">
                  Ready when you are
                </p>
                <h2 className="mt-3 font-display font-bold text-3xl sm:text-5xl tracking-[-0.02em] leading-[1.05]">
                  Start delivering on trust.
                </h2>
                <p className="mt-3 text-white/85 max-w-md">
                  Open the dispatch room, accept the engine's first suggestion,
                  watch the timeline fill itself. Five minutes to first delivery.
                </p>
              </div>
              <Link href="/login?as=dispatcher">
                <Button
                  variant="secondary"
                  size="xl"
                  className="!bg-white !text-trust-ink !border-transparent hover:!bg-canvas"
                >
                  Open the dispatch room →
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-surface-line">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-8 flex flex-wrap items-center justify-between gap-3">
          <Logo size="sm" />
          <p className="text-xs text-ink-muted">
            © Yalla Wassel · Built by hand
          </p>
        </div>
      </footer>
    </main>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-bold text-ink tracking-tight tabular-nums">
        {n}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-ink-muted font-medium mt-0.5">
        {label}
      </div>
    </div>
  );
}

function Divider() {
  return <span className="h-8 w-px bg-surface-line" />;
}

function FeatureCard({
  n,
  title,
  body,
  accent,
}: {
  n: string;
  title: string;
  body: string;
  accent: "ledger" | "mutual" | "dispatch";
}) {
  return (
    <motion.div {...fadeUp}>
      <div className="group relative bg-white rounded-3xl border border-surface-line p-7 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 h-full">
        <FeatureGlyph kind={accent} />
        <p className="mt-6 text-xs font-mono text-trust">{n}</p>
        <h3 className="mt-2 font-display font-bold text-2xl tracking-tight text-ink">
          {title}
        </h3>
        <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">
          {body}
        </p>
      </div>
    </motion.div>
  );
}

function FeatureGlyph({ kind }: { kind: "ledger" | "mutual" | "dispatch" }) {
  return (
    <div className="h-12 w-12 rounded-2xl bg-trust-soft text-trust-ink grid place-items-center">
      {kind === "ledger" && (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <circle cx="5" cy="12" r="1.5" fill="currentColor" />
          <circle cx="10" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <circle cx="19.5" cy="12" r="2.2" fill="currentColor" />
          <path
            d="M6.5 12h2.0 M11.5 12h2 M16.5 12h.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      )}
      {kind === "mutual" && (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M7 7c-2.5 0-4 1.7-4 4s1.7 4 4 4M17 17c2.5 0 4-1.7 4-4s-1.7-4-4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M7 15l10-8M7 9l10 8"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
      {kind === "dispatch" && (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
          <path
            d="M4 6h13l-3-3M20 18H7l3 3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
  );
}

function DoorCard({
  href,
  label,
  body,
}: {
  href: string;
  label: string;
  body: string;
}) {
  return (
    <motion.div {...fadeUp}>
      <Link
        href={href}
        className="group relative block bg-white rounded-3xl border border-surface-line p-7 shadow-card hover:shadow-soft hover:-translate-y-1 transition-all duration-300 h-full"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-2xl tracking-tight text-ink">
            {label}
          </h3>
          <span className="h-9 w-9 rounded-full bg-trust-soft text-trust-ink grid place-items-center group-hover:bg-trust group-hover:text-white transition-colors">
            →
          </span>
        </div>
        <p className="mt-3 text-[15px] text-ink-muted leading-relaxed">
          {body}
        </p>
      </Link>
    </motion.div>
  );
}
