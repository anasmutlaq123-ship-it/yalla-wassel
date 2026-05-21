"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePoll } from "@/hooks/usePoll";
import { Logo } from "@/components/ui/logo";
import { Avatar } from "@/components/ui/avatar";
import { StatusPill } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ActiveOrderCard } from "./active-order-card";
import { OnShiftToggle } from "./on-shift-toggle";

type ActiveResp = {
  order: {
    id: string;
    trackingCode: string;
    pickupBusiness: string;
    pickupArea: string;
    recipientName: string;
    recipientArea: string;
    recipientNotes?: string;
    priority: "normal" | "urgent";
    status: string;
    confirmationCode: string;
    driverId?: string;
  } | null;
  checkpoints?: { kind: string; at: string }[];
  delays?: { kind: string; at: string }[];
  eta?: { label: string };
  driver?: { id: string; name: string; availability?: string };
};

export function DriverShell({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  const { data, mutate } = usePoll<ActiveResp>("/api/orders/active");
  const [menuOpen, setMenuOpen] = useState(false);

  const driver = data?.driver;
  const isOnShift = driver?.availability !== "off_duty";

  return (
    <div className="flex flex-col flex-1 px-5 sm:px-6 pt-7 pb-12 relative">
      <header className="flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-2 rounded-full bg-white border border-surface-line shadow-card px-3.5 py-1.5">
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              isOnShift ? "bg-success" : "bg-ink-faint"
            )}
          />
          <span className="text-xs font-semibold text-ink-soft">
            {isOnShift ? "On shift" : "Off duty"}
          </span>
        </div>
      </header>

      <div className="mt-10 flex items-center gap-3.5">
        <Avatar name={userName} size="lg" />
        <div>
          <p className="text-xs uppercase tracking-[0.14em] font-bold text-ink-muted">
            Welcome back
          </p>
          <h1 className="font-display font-bold text-3xl tracking-[-0.02em] text-ink leading-none mt-1">
            {userName}
          </h1>
        </div>
      </div>

      <OnShiftToggle
        driverId={userId}
        currentlyOnShift={isOnShift}
        onChange={mutate}
      />

      <AnimatePresence mode="wait">
        {data?.order ? (
          <motion.div
            key="order"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
            className="mt-7 flex-1"
          >
            <ActiveOrderCard
              order={data.order}
              checkpoints={data.checkpoints ?? []}
              delays={data.delays ?? []}
              eta={data.eta?.label}
              onUpdate={mutate}
            />
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-12 flex-1 grid place-items-center text-center"
          >
            <div className="max-w-xs">
              <div className="relative mx-auto mb-6 h-20 w-20 rounded-3xl bg-violet-grad-soft grid place-items-center">
                <div className="h-12 w-12 rounded-2xl bg-white shadow-card grid place-items-center">
                  <span className="h-3 w-3 rounded-full bg-trust animate-pulse-soft" />
                </div>
              </div>
              <p className="font-display font-bold text-xl text-ink tracking-tight">
                {isOnShift
                  ? "Nothing to deliver yet."
                  : "You're off duty."}
              </p>
              <p className="mt-2 text-sm text-ink-muted leading-relaxed">
                {isOnShift
                  ? "We'll show your next order here the moment a dispatch is made."
                  : "Flip the switch above when you're ready."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating menu trigger */}
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-violet-grad text-white shadow-glow grid place-items-center text-xl hover:scale-105 active:scale-95 transition-transform button-inner-glow"
        aria-label="Open menu"
      >
        <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
          <circle cx="5" cy="12" r="1.6" fill="currentColor" />
          <circle cx="12" cy="12" r="1.6" fill="currentColor" />
          <circle cx="19" cy="12" r="1.6" fill="currentColor" />
        </svg>
      </button>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/45 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          >
            <motion.div
              initial={{ y: 60 }}
              animate={{ y: 0 }}
              exit={{ y: 60 }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-5 max-w-md mx-auto shadow-lift"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="h-1 w-12 rounded-full bg-surface-line mx-auto mb-5" />
              <div className="space-y-2">
                <Link
                  href="/driver/help"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left px-4 py-4 rounded-2xl bg-surface hover:bg-trust-soft text-base font-semibold text-ink transition-colors"
                >
                  <span className="h-10 w-10 rounded-2xl bg-accent-soft text-accent-ink grid place-items-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.7"
                      />
                      <path
                        d="M12 8v5M12 16.5v.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  Help · Report an issue
                </Link>
                <Link
                  href="/driver/profile"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 w-full text-left px-4 py-4 rounded-2xl bg-surface hover:bg-trust-soft text-base font-semibold text-ink transition-colors"
                >
                  <span className="h-10 w-10 rounded-2xl bg-trust-soft text-trust-ink grid place-items-center">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      className="h-5 w-5"
                      aria-hidden
                    >
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                      <path
                        d="M8 14l3-3 3 3 3-5"
                        stroke="currentColor"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  My trust profile
                </Link>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/login";
                  }}
                >
                  <button
                    type="submit"
                    className="flex items-center gap-3 w-full text-left px-4 py-4 rounded-2xl bg-surface hover:bg-surface-sunken text-base font-semibold text-ink-muted transition-colors"
                  >
                    <span className="h-10 w-10 rounded-2xl bg-surface-sunken grid place-items-center">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        className="h-5 w-5"
                        aria-hidden
                      >
                        <path
                          d="M15 8v-1a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2h7a2 2 0 002-2v-1m-4-4h10m0 0l-3-3m3 3l-3 3"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    Sign out
                  </button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
