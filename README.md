# TrustOS

> **An accountability system for delivery teams that replaces surveillance with transparency.**

Built for **Yalla Wassel** — Hadeel's same-day delivery operation in Amman, after her GPS rollout caused drivers to resign.

---

## The Problem

> "I installed GPS to be a better manager. I ended up losing two drivers in a week."

Surveillance answers the wrong question. Knowing *where* a driver is at 9:47:12 doesn't tell you whether the delivery will arrive on time, whether the customer was reachable, or whether the driver is overloaded. It just tells the driver: **you are being watched.**

## The Insight

**Accountability is the result of clear commitments, not constant observation.**

TrustOS replaces continuous location tracking with three primitives:

1. **A small set of intentional checkpoints** drivers tap themselves — public commitments instead of passive coordinates.
2. **A two-way trust score** — drivers rate the system on fairness, assignment quality, and pressure. The dispatcher's score is visible to drivers.
3. **An explainable dispatch engine** — every assignment ships with a one-sentence reason. No black box.

## Three Pillars

### 1. The Trust Ledger
Four checkpoints per delivery: `Assigned → Picked Up → Arrived Nearby → Delivered`. Optional delay reasons (traffic, store delay, customer unavailable, vehicle) explain reality without demanding it. Every event is appended, never edited.

### 2. Mutual Trust Score
The dispatcher sees a driver's **on-time rate, completion streak, and reliability**. The driver sees the system's **fairness score, pressure index, and assignment quality** — and submits weekly ratings. When trust drops on either side, you see it before the resignation email.

### 3. Explainable Dispatch
The dispatch engine ranks drivers by `area match + current workload + availability + urgency`. Every suggestion is rendered as a sentence: *"Suggesting Hamza — Central area match, 1 active order, urgent priority handled fastest here."* The algorithm is on trial alongside the human.

### Plus
- **Silent Driver Mode** — one screen, one order, four buttons. No notifications, no map, no chat noise.
- **Help Button** — four reasons, one tap, dispatcher sees alert immediately, nearby support suggested.
- **Predictive ETA** — historical neighborhood-to-neighborhood durations, not live GPS.
- **Area Ownership** — drivers specialize by neighborhood and earn familiarity bonuses.
- **Customer Track Link** — public, code-only, shows checkpoint timeline (no map, no driver location).

---

## Run It

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts (all password: `trustos`)

| Role | Username | Try |
|---|---|---|
| Dispatcher | `hadeel` | Timeline, dispatch board, driver trust |
| Driver | `mahmoud` | Silent mode, checkpoints, help |
| Driver | `youssef` | In-progress delivery view |
| Customer | (no login) | <http://localhost:3000/track/TRUST-1001> |

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui primitives |
| Motion | Framer Motion |
| Forms | React Server Actions + native forms |
| DB (production design) | PostgreSQL + Prisma — schema in `prisma/schema.prisma` |
| DB (demo) | In-memory store seeded from `src/lib/seed.ts` |
| Auth | Cookie-based session (HTTP-only, signed) — JWT-ready |
| Realtime (production) | Socket.io rooms per role |
| Realtime (demo) | SWR polling at 3s |

> **Why an in-memory store for the demo?** Judges should be able to clone and run in 30 seconds, not configure Postgres. The Prisma schema is production-shaped; swapping the store layer is a single file change documented in `docs/API.md`.

---

## Project Layout

```
trustos/
├── docs/
│   ├── PRODUCT_STRATEGY.md   ← vision, pain points, why we win
│   ├── USER_JOURNEYS.md      ← customer / driver / dispatcher flows
│   ├── UX_STRUCTURE.md       ← screen hierarchy, wireframes, states
│   └── API.md                ← endpoints, role permissions, examples
├── prisma/
│   └── schema.prisma         ← production database design
├── src/
│   ├── app/
│   │   ├── page.tsx          ← landing
│   │   ├── login/            ← single sign-in form
│   │   ├── dispatcher/       ← timeline · dispatch · drivers · orders
│   │   ├── driver/           ← silent mode · help · profile
│   │   ├── track/[code]/     ← customer tracking
│   │   └── api/              ← REST endpoints
│   ├── components/
│   │   ├── ui/               ← shadcn-style primitives
│   │   ├── dispatcher/
│   │   ├── driver/
│   │   └── customer/
│   ├── lib/
│   │   ├── store.ts          ← in-memory data layer
│   │   ├── dispatch-engine.ts
│   │   ├── trust-score.ts
│   │   ├── eta.ts
│   │   ├── auth.ts
│   │   ├── seed.ts
│   │   └── types.ts
│   └── hooks/                ← SWR-based polling
└── README.md
```

---

## Deployment

| Surface | Target |
|---|---|
| Web app | Vercel — `vercel --prod` |
| Database | Supabase Postgres — set `DATABASE_URL` and run `npx prisma db push` |
| Realtime | Socket.io on Railway or Render — separate service, documented in `docs/API.md` |

`.env.example` lists all variables.

---

## What This is *Not*

- Not a tracker. We never store driver locations.
- Not a chat app. Drivers should not be in their phone all day.
- Not a CRUD admin. Every screen is designed around a decision the user is making *right now*.

---

## License

MIT — built for the hackathon. Take the ideas, please.
