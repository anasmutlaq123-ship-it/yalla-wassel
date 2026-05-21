# UX Structure — TrustOS

> Visual language: **warm, calm, decisive**. Off-white canvas (#FAF7F2), deep teal-green for action (#15734C), amber-rust only for urgent (#C2410C). Red is reserved exclusively for the Help alert.

---

## 1. Screen Hierarchy

```
TrustOS
├── /                              Landing — pitch + role chooser
├── /login                         Single form, role chosen by username
├── /track/[code]                  Customer — public, no auth
│
├── /driver                        Driver — Silent Mode
│   ├── /driver                    Active order card (or "On shift" toggle)
│   ├── /driver/help               Help reasons
│   └── /driver/profile            Trust profile + weekly system rating
│
└── /dispatcher                    Dispatcher — role gated
    ├── /dispatcher                Timeline dashboard
    ├── /dispatcher/dispatch       Dispatch board (explainable suggestions)
    ├── /dispatcher/orders         All orders, filterable
    └── /dispatcher/drivers        Driver trust + system score
```

---

## 2. Navigation Model

### Dispatcher (desktop-first)
Persistent left rail with four icons (Timeline · Dispatch · Orders · Drivers). Active route gets a 2px left border in `trust-green`. No breadcrumbs. No nested menus.

### Driver (mobile-first)
**No persistent nav.** Silent Mode is fullscreen. A single ghost-button bottom-right `…` opens a 3-item sheet: Profile · Help · Sign off. That is all.

### Customer
No nav. The track page is the whole product surface.

---

## 3. Wireframe Descriptions

### 3.1 Landing (`/`)
```
┌─────────────────────────────────────────────────────────┐
│ TrustOS                                          Sign in │
├─────────────────────────────────────────────────────────┤
│                                                          │
│   Accountability without surveillance.                   │
│   Trust without micromanagement.                         │
│                                                          │
│   Built for same-day delivery teams that refuse          │
│   to choose between visibility and dignity.              │
│                                                          │
│   [ I am a Dispatcher ]   [ I am a Driver ]              │
│   [ Track an order ] →                                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│  THREE PILLARS                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │ Ledger   │  │ Mutual   │  │ Explain. │                │
│  │ checkpts │  │ Trust    │  │ dispatch │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────┘
```

### 3.2 Dispatcher Timeline (`/dispatcher`)
```
┌────┬────────────────────────────────────────────────────┐
│ ▮  │  Today · Tue 21 May            Mutual Trust: 87 ↑  │
│    │  ──────────────────────────────────────────────    │
│ Tl │  YOUSSEF        West Amman          ● On delivery  │
│ Dp │   08:14  Assigned   #1002 Bloom → Ahmad → Abdoun   │
│ Or │   08:28  Picked Up                                 │
│ Dr │   08:41  Arrived Nearby                            │
│    │  ──────────────────────────────────────────────    │
│    │  WAEL           East                ● On delivery  │
│    │   07:55  Assigned   #1006                          │
│    │   08:12  Picked Up                                 │
│    │   08:25  ⚠ Delay — Traffic                         │
│    │  ──────────────────────────────────────────────    │
│    │  MAHMOUD        West Amman          ○ Available    │
│    │   (no active deliveries)                           │
└────┴────────────────────────────────────────────────────┘
```

- **No map.** No driver pins. Timeline events stack vertically per driver.
- The "Mutual Trust" pill in the header opens the trust drawer.

### 3.3 Dispatch Board (`/dispatcher/dispatch`)
```
┌──────────────────────────────────────────────────────────┐
│ Pending orders (2)                                        │
├──────────────────────────────────────────────────────────┤
│ #1005 · URGENT · Reem Pharmacy → Hala D. → Jabal Amman   │
│                                                           │
│   ╭─ The engine suggests ─────────────────────────────╮  │
│   │  HAMZA        Central                              │  │
│   │                                                    │  │
│   │  ✓ Area match — Jabal Amman in Central coverage    │  │
│   │  ✓ Workload — 0 active orders                      │  │
│   │  ✓ Urgent fit — 96% on-time on urgent              │  │
│   │  ✓ Familiarity — last 4 to Jabal Amman             │  │
│   │                                                    │  │
│   │  [ Assign Hamza ]   [ Pick someone else ]          │  │
│   ╰────────────────────────────────────────────────────╯  │
│                                                           │
│ #1003 · NORMAL · Mama's Kitchen → Layla H. → Shmeisani   │
│   ╭─ The engine suggests ─────────────────────────────╮  │
│   │  AMJAD        Central                              │  │
│   │  ...                                               │  │
│   ╰────────────────────────────────────────────────────╯  │
└──────────────────────────────────────────────────────────┘
```

### 3.4 Driver Silent Mode (`/driver`)
```
        ┌──────────────────────────┐
        │  ●  On shift              │
        │                          │
        │  ──────────────────────  │
        │                          │
        │  ORDER #1001 · URGENT    │
        │                          │
        │  Reem Pharmacy           │
        │      ↓                   │
        │  Mona K.                 │
        │  Khalda, Apt 4B          │
        │                          │
        │  ETA range 12–18 min     │
        │                          │
        │  ╭──────────────────╮    │
        │  │                  │    │
        │  │   I'VE PICKED    │    │
        │  │      IT UP       │    │
        │  │                  │    │
        │  ╰──────────────────╯    │
        │                          │
        │  Delay reason            │
        │                          │
        │                       …  │
        └──────────────────────────┘
```

- One screen. One order. One large primary button. Subtle "Delay reason" link below.
- The bottom-right `…` opens Profile · Help · Sign off.
- The button label advances through: *I've picked it up* → *I'm nearby* → *Delivered*.

### 3.5 Driver Help (`/driver/help`)
Four cards. Tap one. Done.

```
┌────────────────┐  ┌────────────────┐
│   Traffic       │  │   Customer       │
│   blocked       │  │   unavailable    │
└────────────────┘  └────────────────┘
┌────────────────┐  ┌────────────────┐
│   Store delay  │  │   Vehicle issue │
└────────────────┘  └────────────────┘
                 Cancel
```

After tap: a calm confirmation. *"Dispatcher notified. Amjad is 8 min away if you need to hand off."*

### 3.6 Driver Profile (`/driver/profile`)
```
        Mahmoud  ·  West Amman

        On-time     94%
        Streak      11 deliveries
        This week   18 / 22 done

        Familiarity
          Khalda  ★★★★
          Abdoun  ★★★

        ─────────────────────────

        How did the system treat you this week?

        Fairness          [────●──────] 4
        Assignment fit    [─────●─────] 4
        Pressure          [──●────────] 2

        [ Submit weekly rating ]
```

### 3.7 Customer Track (`/track/[code]`)
```
        Yalla Wassel · TRUST-1001

        ▢ Assigned         08:14
        ▢ Picked Up        08:28
        ▣ Arrived Nearby   08:41 ← now
        ▢ Delivered        —

        Reem Pharmacy
            ↓
        Khalda

        Driver M. · West Amman team
        ETA  ~3 minutes

        Confirmation code:  4 7 2 1
```

- Soft animation: pulse on the current checkpoint.
- Delay reasons surface as a row inside the timeline.

---

## 4. Micro-interactions & Motion

| Surface | Interaction | Motion |
|---|---|---|
| Checkpoint tap (driver) | Big button morphs to next state | 0.4s spring; brief haptic-like flash |
| Suggested driver card (dispatcher) | Mount | 0.32s fade-in + 4px translateY |
| Timeline new event | Append | New row slides down from top of its driver group |
| Help button (driver) | Tap | Card lifts 6px, shadow softens, color shifts to amber |
| Trust score change | Number rolls | 0.6s number tween |
| ETA updates | Range tightens | Range bar smoothly narrows |

All animation respects `prefers-reduced-motion`. Drivers in motion-sensitive contexts get instant transitions.

---

## 5. State Coverage

| State | Pattern |
|---|---|
| Empty | Illustration + one-line guidance. *"No active deliveries. The dispatcher will assign you when something comes in."* — never a "Get started" CTA on the driver side. |
| Loading | Skeleton blocks matching final layout. No spinners on driver UI — they create anxiety. |
| Error | Soft amber banner with a clear human sentence and a single retry action. We never blame the user. |
| Offline | Driver-side: the checkpoint button stores its tap locally and replays when reconnected. The UI tells the user: *"Saved. Will sync when you're back online."* |

---

## 6. Accessibility

- WCAG AA contrast on every text element.
- Touch targets ≥ 56px on driver UI.
- Arabic RTL: layout direction inherits from `<html dir>`. All flex/grid flips correctly.
- Driver UI is one-thumb operable.
- Screen reader: timeline events are an ordered list of `<time>` + description.

---

## 7. Tone & Microcopy Rules

1. **Address drivers as adults, not as resources.** Never "You must" — always "Tap when you're ready".
2. **Never blame.** "Couldn't reach the customer" not "Customer error".
3. **State, don't celebrate.** No confetti, no "Amazing work!". A simple *"Delivered."* respects the work.
4. **Quantify when it helps; never when it shames.** We tell a driver their on-time is 94%. We do not tell them they are ranked 4th out of 8.
5. **One verb per button.** *"Picked Up"*, not *"Click here to confirm pickup"*.

---

## 8. Dashboard Layout Rules

- **One decision per screen.** The timeline dashboard answers "what's happening". The dispatch board answers "who gets this". They are not merged into a god-view.
- **Information density rises with role expertise.** Customer page is sparse. Driver is minimal. Dispatcher is dense but calm — generous line-height, consistent vertical rhythm.
- **No badges or red dots** anywhere except active Help alerts. The system should not feel like an inbox.

---

## 9. Responsive Breakpoints

| Breakpoint | Surface |
|---|---|
| < 640px | Driver Silent Mode optimized here. Dispatcher pages collapse to a single timeline column with bottom-tab nav. |
| 640–1024px | Tablet — dispatch board adapts to 1-up cards; timeline stays vertical. |
| > 1024px | Desktop — left rail nav, full timeline grid. |

---

## 10. The Pixel That Earns the Trust

If a judge remembers one pixel of TrustOS, it should be this: **the dispatcher screen has no map.** That deliberate absence is the entire product thesis.
