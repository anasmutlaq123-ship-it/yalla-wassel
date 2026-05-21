# Yalla Wassel

> **Accountability without surveillance. Trust without micromanagement.**

Yalla Wassel is a same-day delivery operation in Amman — and the trust system it runs on. Eight drivers, real customers, no GPS tracking.

---

## The Problem

> "I installed GPS to be a better manager. I ended up losing two drivers in a week."

Surveillance answers the wrong question. Knowing *where* a driver is at 9:47:12 doesn't tell you whether the delivery will arrive on time, whether the customer was reachable, or whether the driver is overloaded. It just tells the driver: **you are being watched.**

## The Insight

**Accountability is the result of clear commitments, not constant observation.**

Yalla Wassel replaces continuous location tracking with three primitives:

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
- **Customer Login & Dashboard** — customers see their own orders, ETA, and confirmation code. Privacy-scoped — no one sees another customer's data.
- **Help Button** — four reasons, one tap, dispatcher sees alert immediately, nearby support suggested.
- **Predictive ETA** — historical neighborhood-to-neighborhood durations, not live GPS.
- **Area Ownership** — drivers specialize by neighborhood and earn familiarity bonuses.
- **Customer Track Link** — public, code-only, shows checkpoint timeline (no map, no driver location).

---

## Run It

### Prerequisites
- **Node.js 20 or newer** — <https://nodejs.org> (LTS installer)
- *(Optional)* **Git** — <https://git-scm.com> — only needed if you want to clone instead of download

### From a fresh machine

**Easiest — download the ZIP:**
1. Open the repo on GitHub, click the green **`Code`** button → **`Download ZIP`**
2. Extract it anywhere
3. Open a terminal inside the extracted folder and run:
   ```bash
   npm install
   npm run dev
   ```

**Or clone with Git** (recommended if you'll keep editing):
```bash
git clone https://github.com/anasmutlaq123-ship-it/yalla-wassel.git
cd yalla-wassel
npm install
npm run dev
```

Open <http://localhost:3000>.

### Looking at the pitch deck

- **`pitch.html`** — double-click to open in any browser; arrow keys / spacebar to navigate
- **`pitch.pptx`** — open in PowerPoint, Keynote, or Google Slides

### Demo accounts (all password: `trustos`)

| Role | Username | What you see |
|---|---|---|
| **Dispatcher** | `hadeel` | Command center, dispatch board, mutual-trust dashboard |
| **Driver** | `mahmoud` | Silent Mode — one screen, one order |
| **Driver** | `youssef` | An in-flight delivery (already past pickup) |
| **Customer** | `mona` | Active urgent pharmacy delivery + 2 historical orders |
| **Customer** | `ahmad` | One in-flight flowers order |
| **Customer** | `layla` | One pending food order + 1 historical |
| **Customer** | `hala` | Urgent pharmacy delivery + 1 historical |
| **Public tracking** | _(no login)_ | <http://localhost:3000/track/TRUST-1001> |

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + handcrafted UI primitives |
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
yalla-wassel/
├── docs/
│   ├── PRODUCT_STRATEGY.md      ← vision, pain points, why we win
│   ├── USER_JOURNEYS.md         ← customer / driver / dispatcher flows
│   ├── UX_STRUCTURE.md          ← screen hierarchy, wireframes, states
│   ├── API.md                   ← endpoints, role permissions, examples
│   └── NOTEBOOKLM_PROMPT.md     ← pitch-deck prompt for NotebookLM
├── prisma/
│   └── schema.prisma            ← production database design
├── public/
│   └── logo.png                 ← brand mark
├── src/
│   ├── app/
│   │   ├── page.tsx             ← landing
│   │   ├── login/               ← single sign-in form (role-aware)
│   │   ├── dispatcher/          ← command center · dispatch · orders · drivers
│   │   ├── driver/              ← silent mode · help · profile
│   │   ├── customer/            ← customer dashboard
│   │   ├── track/[code]/        ← public order tracking (no login)
│   │   └── api/                 ← REST endpoints
│   ├── components/
│   │   ├── ui/                  ← shared primitives (Button, Card, Avatar...)
│   │   ├── marketing/           ← landing, nav, hero
│   │   ├── dispatcher/
│   │   ├── driver/
│   │   └── customer/
│   ├── lib/
│   │   ├── store.ts             ← in-memory data layer
│   │   ├── dispatch-engine.ts
│   │   ├── trust-score.ts
│   │   ├── eta.ts
│   │   ├── auth.ts
│   │   ├── seed.ts
│   │   └── types.ts
│   └── hooks/                   ← SWR-based polling
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
