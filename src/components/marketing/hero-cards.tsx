"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

const FLOAT = {
  card: (delay = 0) => ({
    initial: { opacity: 0, y: 24, scale: 0.96 },
    animate: { opacity: 1, y: 0, scale: 1 },
    transition: {
      duration: 0.7,
      delay,
      ease: [0.2, 0.8, 0.2, 1] as const,
    },
  }),
};

export function HeroCards() {
  return (
    <div className="relative h-[520px] sm:h-[560px] w-full">
      {/* Soft decorative blobs */}
      <div
        aria-hidden
        className="absolute -inset-10 -z-10"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 40%, rgba(168, 85, 247, 0.22), rgba(255,255,255,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="absolute right-0 top-12 -z-10 h-72 w-72 rounded-full bg-violet-grad opacity-25 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-6 left-4 -z-10 h-56 w-56 rounded-full bg-trust-soft blur-3xl"
      />

      {/* ── Driver status — top-left ─────────────────────────────── */}
      <motion.div
        {...FLOAT.card(0.15)}
        className="absolute top-2 left-2 sm:left-6 z-30"
      >
        <div className="animate-float-slow">
          <div className="bg-white rounded-3xl shadow-lift border border-surface-line p-4 w-[260px] -rotate-[2deg]">
            <div className="flex items-center gap-3">
              <Avatar name="Mahmoud" size="md" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-ink truncate">
                  Mahmoud
                </div>
                <div className="text-[11px] text-ink-muted">West Amman</div>
              </div>
              <span className="relative inline-flex h-2.5 w-2.5">
                <span className="absolute inset-0 rounded-full bg-success opacity-50 animate-ping" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-success" />
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <Badge tone="success" size="sm">
                On delivery
              </Badge>
              <span className="font-mono text-[10px] text-ink-faint">
                #1018
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Delivered confirmation — top-right ───────────────────── */}
      <motion.div
        {...FLOAT.card(0.3)}
        className="absolute top-8 right-0 sm:right-4 z-20"
      >
        <div className="animate-float">
          <div className="bg-white rounded-3xl shadow-lift border border-surface-line p-4 w-[240px] rotate-[3deg]">
            <div className="flex items-center gap-3">
              <span className="h-10 w-10 rounded-2xl bg-success-soft text-success-ink grid place-items-center">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path
                    d="M5 12l5 5L20 7"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <div>
                <div className="text-sm font-semibold text-ink">
                  Delivered
                </div>
                <div className="text-[11px] text-ink-muted">
                  to Layla H. · Shmeisani
                </div>
              </div>
            </div>
            <div className="mt-3 h-1 rounded-full bg-success" />
          </div>
        </div>
      </motion.div>

      {/* ── Big trust score card — center ────────────────────────── */}
      <motion.div
        {...FLOAT.card(0.4)}
        className="absolute top-[160px] left-1/2 -translate-x-1/2 z-40"
      >
        <div className="animate-float-slow">
          <div className="bg-white rounded-4xl shadow-glow border border-surface-line p-6 w-[300px] sm:w-[340px] rotate-[-1deg]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint font-bold">
                  Mutual trust
                </p>
                <p className="text-xs text-ink-muted mt-0.5">Today's index</p>
              </div>
              <Badge tone="success" size="sm">
                ↑ 4
              </Badge>
            </div>
            <div className="flex items-end gap-4">
              <div className="relative">
                <TrustRing value={87} />
              </div>
              <div className="space-y-2 flex-1">
                <Bar label="Drivers" value={88} />
                <Bar label="System" value={85} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Timeline event — lower left ──────────────────────────── */}
      <motion.div
        {...FLOAT.card(0.55)}
        className="absolute bottom-12 left-0 sm:left-2 z-20"
      >
        <div className="animate-float">
          <div className="bg-white rounded-3xl shadow-lift border border-surface-line p-4 w-[230px] rotate-[-3deg]">
            <p className="text-[10px] uppercase tracking-[0.16em] text-ink-faint font-bold">
              Latest event
            </p>
            <div className="mt-2.5 flex items-start gap-3">
              <div className="relative shrink-0 mt-0.5">
                <span className="h-2.5 w-2.5 rounded-full bg-trust block" />
                <span className="absolute inset-0 rounded-full bg-trust/40 animate-pulse-ring" />
              </div>
              <div>
                <div className="text-sm font-semibold text-ink leading-tight">
                  Arrived nearby
                </div>
                <div className="text-[11px] text-ink-muted mt-0.5">
                  08:41 · #1002 · Youssef
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── ETA — lower right ────────────────────────────────────── */}
      <motion.div
        {...FLOAT.card(0.7)}
        className="absolute bottom-2 right-2 sm:right-8 z-30"
      >
        <div className="animate-float-slow">
          <div className="bg-violet-grad rounded-3xl shadow-glow p-5 w-[230px] text-white rotate-[2.5deg] button-inner-glow">
            <p className="text-[10px] uppercase tracking-[0.18em] font-bold opacity-80">
              ETA
            </p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">
              12–18 min
            </p>
            <div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-white/85"
                style={{ width: "62%" }}
              />
            </div>
            <p className="mt-2 text-[11px] text-white/80">
              Wadi Saqra → Khalda
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TrustRing({ value }: { value: number }) {
  const R = 30;
  const C = 2 * Math.PI * R;
  const offset = C - (value / 100) * C;
  return (
    <svg viewBox="0 0 72 72" className="h-20 w-20">
      <circle
        cx="36"
        cy="36"
        r={R}
        stroke="#EDE9FE"
        strokeWidth="8"
        fill="none"
      />
      <circle
        cx="36"
        cy="36"
        r={R}
        stroke="url(#trustRing)"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
        strokeDasharray={C}
        strokeDashoffset={offset}
        transform="rotate(-90 36 36)"
      />
      <defs>
        <linearGradient id="trustRing" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#5B21B6" />
        </linearGradient>
      </defs>
      <text
        x="36"
        y="38"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="20"
        fontWeight="700"
        fill="#111827"
        fontFamily="Inter, sans-serif"
      >
        {value}
      </text>
    </svg>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] text-ink-muted mb-1">
        <span className="font-medium uppercase tracking-wider">{label}</span>
        <span className="tabular-nums font-semibold text-ink">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-surface-sunken overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1.1, delay: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
          className="h-full rounded-full bg-violet-grad"
        />
      </div>
    </div>
  );
}
