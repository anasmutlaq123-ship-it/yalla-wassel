# API Architecture — TrustOS

REST over HTTPS, JSON bodies, cookie-based session in demo (JWT-ready). All routes live under `/api`.

---

## Role Permissions

| Role | Can read | Can write |
|---|---|---|
| `customer` (anonymous via track code) | `/api/track/[code]` only | — |
| `driver` | own orders, own trust profile, public driver list | own checkpoints, own help alerts, own weekly ratings |
| `dispatcher` | everything | assign orders, override suggestions, resolve help alerts, cap workloads |

Every write logs the actor and the reason (where applicable) to the immutable event log.

---

## Conventions

- **Timestamps**: ISO 8601, server timezone `Asia/Amman`.
- **Errors**: `{ "error": { "code": "...", "message": "..." } }` with appropriate HTTP status.
- **Pagination**: cursor-based via `?cursor=...&limit=...`.
- **Realtime**: production uses Socket.io rooms `dispatcher`, `driver:<id>`, `track:<code>`. Demo polls at 3s via SWR.

---

## Endpoints

### Auth

| Method | Path | Body | Role |
|---|---|---|---|
| POST | `/api/auth/login` | `{ username, password }` | public |
| POST | `/api/auth/logout` | — | any |
| GET | `/api/auth/me` | — | any |

**POST /api/auth/login** — example
```http
POST /api/auth/login
{ "username": "hadeel", "password": "trustos" }

200 OK
Set-Cookie: trustos_session=...; HttpOnly; SameSite=Lax
{
  "user": {
    "id": "user_dispatcher_hadeel",
    "username": "hadeel",
    "name": "Hadeel",
    "role": "dispatcher"
  }
}
```

---

### Orders

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/orders` | dispatcher | filter `?status=pending|assigned|in_progress|delivered` |
| POST | `/api/orders` | dispatcher | create new order |
| GET | `/api/orders/:id` | dispatcher \| assigned driver | full order + timeline |
| GET | `/api/orders/active` | driver | the current driver's active order, or `null` |
| POST | `/api/orders/:id/checkpoint` | driver | append a checkpoint |
| POST | `/api/orders/:id/delay-reason` | driver | append a delay reason |

**Checkpoint append** — example
```http
POST /api/orders/order_1001/checkpoint
{ "kind": "picked_up", "note": null }

200 OK
{
  "order": { ...full order... },
  "event": {
    "id": "evt_...",
    "kind": "picked_up",
    "at": "2026-05-21T08:28:11+03:00",
    "actorId": "user_driver_mahmoud"
  }
}
```

Server rules:
- Checkpoints must be appended in canonical order: `assigned → picked_up → arrived_nearby → delivered`.
- Skipping a state returns `409 invalid_transition`.
- A delivered order cannot be reopened.

---

### Dispatch

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/dispatch/suggest?orderId=...` | dispatcher | returns ranked drivers with explanations |
| POST | `/api/dispatch/assign` | dispatcher | `{ orderId, driverId, override?: { reason } }` |

**Suggest** — example
```http
GET /api/dispatch/suggest?orderId=order_1005

200 OK
{
  "orderId": "order_1005",
  "suggestions": [
    {
      "driverId": "user_driver_hamza",
      "driverName": "Hamza",
      "score": 0.94,
      "reasons": [
        { "kind": "area_match", "label": "Jabal Amman is in Central coverage" },
        { "kind": "workload", "label": "0 active orders" },
        { "kind": "urgent_fit", "label": "96% on-time on urgent" },
        { "kind": "familiarity", "label": "Last 4 to Jabal Amman were his" }
      ]
    },
    { "driverId": "user_driver_amjad", "score": 0.82, ... }
  ]
}
```

**Assign** — example
```http
POST /api/dispatch/assign
{ "orderId": "order_1005", "driverId": "user_driver_hamza" }

200 OK
{ "order": {...}, "assignment": { "at": "...", "explanation": "..." } }
```

When the dispatcher overrides the top suggestion, the request must include `override.reason`. This is logged to the order's history and feeds back into the engine (a signal that the engine got it wrong).

---

### Drivers

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/drivers` | dispatcher | list with availability + trust score |
| GET | `/api/drivers/:id` | dispatcher \| self | full trust profile |
| POST | `/api/drivers/:id/availability` | self | `{ status: "available" \| "off_duty" }` |
| POST | `/api/drivers/:id/cap` | dispatcher | `{ maxActiveOrders, until }` — workload cap |

---

### Trust

| Method | Path | Role | Notes |
|---|---|---|---|
| GET | `/api/trust/system` | driver | system trust score (avg of weekly ratings) |
| POST | `/api/trust/system` | driver | submit a weekly rating |
| GET | `/api/trust/driver/:id` | dispatcher \| self | driver trust breakdown |
| GET | `/api/trust/mutual` | dispatcher | mutual trust index for whole team |

**Submit weekly rating** — example
```http
POST /api/trust/system
{
  "fairness": 4,
  "assignmentQuality": 4,
  "pressure": 2,
  "note": "Wednesday was tight."
}

200 OK
{ "rating": {...}, "systemScore": 82 }
```

---

### Help

| Method | Path | Role | Notes |
|---|---|---|---|
| POST | `/api/help` | driver | raise alert; `{ orderId?, kind, note? }` |
| GET | `/api/help` | dispatcher | active alerts |
| POST | `/api/help/:id/resolve` | dispatcher | `{ action: "handoff" \| "acknowledged", handoffTo?: driverId }` |

Help `kind` is one of: `traffic`, `customer_unavailable`, `store_delay`, `vehicle`, `other`.

---

### Customer Track

| Method | Path | Role |
|---|---|---|
| GET | `/api/track/:code` | public |

Returns a *redacted* view of the order — no driver phone, no precise dispatcher notes, no other orders. Driver name appears as first-name initial + team area.

---

## Migrating from In-Memory to Postgres

The demo uses `src/lib/store.ts` — a single module-level object with the same shape as the Prisma schema in `prisma/schema.prisma`.

To swap to Postgres:

1. `npx prisma generate && npx prisma db push`
2. Run `npx prisma db seed` (uses `prisma/seed.ts`)
3. Replace `import { store } from "@/lib/store"` with `import { prisma } from "@/lib/prisma"` and translate accessors. Every store method has a documented Prisma equivalent in `src/lib/store.ts`.

The API surface above is identical before and after.

---

## Production Realtime (Socket.io)

A separate Node service (Railway or Render) exposes the following channels:

| Room | Events emitted |
|---|---|
| `dispatcher` | `order.created`, `order.assigned`, `checkpoint.appended`, `help.raised`, `help.resolved` |
| `driver:<id>` | `order.assigned`, `order.unassigned`, `workload.capped` |
| `track:<code>` | `checkpoint.appended`, `delay.reported`, `eta.updated` |

Clients reconnect on disconnect. Every emitted event also writes to the event log — sockets are an *optimization*, not the source of truth.
