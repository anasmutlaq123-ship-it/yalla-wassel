import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // ── Brand palette (locked to spec) ────────────────────────────
        violet: {
          primary: "#7C3AED",
          secondary: "#A855F7",
          soft: "#EDE9FE",
          dark: "#5B21B6",
        },
        // ── Semantic tokens (used across components) ──────────────────
        canvas: "#FFFFFF",
        surface: {
          DEFAULT: "#FAFAFA",
          raised: "#FFFFFF",
          sunken: "#F4F4F6",
          line: "#EFECF6",
        },
        ink: {
          DEFAULT: "#111827",
          soft: "#374151",
          muted: "#6B7280",
          faint: "#9CA3AF",
        },
        trust: {
          DEFAULT: "#7C3AED",
          soft: "#EDE9FE",
          ink: "#5B21B6",
          deep: "#4C1D95",
          glow: "#A855F7",
        },
        accent: {
          DEFAULT: "#E11D48",
          soft: "#FFE4E9",
          ink: "#9F1239",
        },
        success: {
          DEFAULT: "#22C55E",
          soft: "#DCFCE7",
          ink: "#166534",
        },
        warn: {
          DEFAULT: "#B45309",
          soft: "#FEF3C7",
        },
        info: {
          DEFAULT: "#2563EB",
          soft: "#DBEAFE",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Helvetica Neue",
          "sans-serif",
        ],
        display: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
        ],
        mono: [
          "JetBrains Mono",
          "ui-monospace",
          "SFMono-Regular",
          "monospace",
        ],
      },
      // Locked radii (20-28px per brief)
      borderRadius: {
        xl: "1rem",        // 16
        "2xl": "1.25rem",  // 20
        "3xl": "1.75rem",  // 28
        "4xl": "2rem",     // 32 — used on hero cards
      },
      boxShadow: {
        card: "0 1px 3px rgba(17, 24, 39, 0.04), 0 1px 2px rgba(17, 24, 39, 0.03)",
        soft: "0 8px 24px -10px rgba(91, 33, 182, 0.10), 0 3px 8px -3px rgba(17, 24, 39, 0.05)",
        lift: "0 20px 40px -16px rgba(91, 33, 182, 0.18), 0 8px 16px -8px rgba(17, 24, 39, 0.08)",
        ring: "0 0 0 4px rgba(124, 58, 237, 0.14)",
        glow: "0 0 0 1px rgba(124, 58, 237, 0.18), 0 24px 60px -20px rgba(124, 58, 237, 0.45)",
        "glow-soft": "0 20px 50px -20px rgba(168, 85, 247, 0.35)",
        // Subtle inset highlight used on gradient buttons
        "inset-top": "inset 0 1px 0 0 rgba(255, 255, 255, 0.18)",
      },
      backgroundImage: {
        "violet-grad":
          "linear-gradient(135deg, #A855F7 0%, #7C3AED 55%, #5B21B6 100%)",
        "violet-grad-soft":
          "linear-gradient(135deg, #F5F3FF 0%, #EDE9FE 100%)",
        "violet-text":
          "linear-gradient(180deg, #7C3AED 0%, #5B21B6 100%)",
        "hero-radial":
          "radial-gradient(60% 50% at 80% 0%, rgba(168, 85, 247, 0.16) 0%, rgba(255,255,255,0) 60%), radial-gradient(40% 30% at 0% 5%, rgba(124, 58, 237, 0.08) 0%, rgba(255,255,255,0) 60%)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "pulse-ring": {
          "0%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0.45)" },
          "70%": { boxShadow: "0 0 0 14px rgba(124, 58, 237, 0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(124, 58, 237, 0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.42s cubic-bezier(0.2, 0.8, 0.2, 1) both",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
        "pulse-ring": "pulse-ring 2.2s ease-out infinite",
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
      },
      transitionTimingFunction: {
        spring: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
    },
  },
  plugins: [animate],
};

export default config;
