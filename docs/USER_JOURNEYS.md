# User Journeys — Yalla Wassel

Three roles. Three distinct emotional contracts.

---

## Journey 1 — Customer (Mona K., Khalda)

**Emotional contract:** *"Tell me where my medicine is. Don't make me chase you."*

| Step | Trigger | Screen | What the system does |
|---|---|---|---|
| 1 | Mona orders from Reem Pharmacy via WhatsApp | — | Reem Pharmacy creates order 1001 in Yalla Wassel, shares link `yallawassel.app/track/TRUST-1001` |
| 2 | Mona taps the link | `/track/TRUST-1001` | Public page loads — no login. Shows order summary, current status, predictive ETA range |
| 3 | Order is `Assigned` | Track page | First checkpoint chip lights up. Anonymous driver tag: "Driver M., West Amman" — first name initial only |
| 4 | Driver taps "Picked Up" | Track page (poll updates) | Timeline grows; ETA tightens from a 15-min range to a 7-min range |
| 5 | Store delay reported | Track page | Soft amber chip appears: "Store delay — pharmacy preparing prescription". No noise. No call. |
| 6 | Driver taps "Arrived Nearby" | Track page | Page shows: "Driver is in your area — expect knock in ~3 min" |
| 7 | Delivered | Track page | Confirmation banner. Optional 3-tap rating (Driver was respectful · On time · Order correct). |

**What we deliberately do NOT show:**
- Live driver location on a map
- Driver phone number (call routes through dispatcher)
- Other orders in the queue ahead of theirs

**Why:** dignity for the driver, anxiety-free for the customer.

---

## Journey 2 — Driver (Mahmoud, West Amman)

**Emotional contract:** *"Tell me what to do next. Don't make me argue to be believed."*

### Morning — Going on shift
1. Mahmoud opens `yallawassel.app` on his phone, taps "I'm on shift". One screen, two buttons: `On shift` / `Off duty`.
2. Silent Mode is now active. Background is calm off-white. No badges, no red dots.

### First assignment
3. Dispatcher accepts the engine's suggestion. Mahmoud's screen shows a single card:

   ```
   ORDER 1001 · Urgent
   Reem Pharmacy  →  Mona K.
   Khalda · Apt 4B
   Tap to accept
   ```

4. Mahmoud taps "Accept". The card transitions into the checkpoint view.

### The four checkpoints (the entire driver UX)
5. Big button reads: **"I've picked it up"**. He taps it on the way out of the pharmacy.
6. Card refreshes. New big button: **"I'm nearby"**. He taps when he turns onto Mona's street.
7. New big button: **"Delivered"**. He hands the package over. He taps. He types the customer's 4-digit confirmation code. Done.

### Things go wrong (this is where Yalla Wassel earns its keep)
8. The pharmacy is slow. He taps the small "Delay reason" link → 4 chips (Traffic · Store delay · Customer unavailable · Vehicle). One tap. The customer's track page updates. No phone call needed.
9. His scooter has a flat. He taps the **Help** button → 4 chips → "Vehicle issue". The dispatcher sees the alert instantly. The engine suggests Amjad (nearby, low workload) for handoff.

### End of shift — Trust
10. Friday afternoon, Mahmoud sees a small banner: *"Quick check — how was this week?"*. 3 sliders (Fairness · Assignment quality · Pressure). 10 seconds. Submitted.
11. He sees his own dashboard: on-time 94%, streak 11 deliveries, area familiarity badge for Khalda earned. He sees the **system score** he submitted — averaged with his teammates' — back to him. "The team rated assignment quality 4.1/5 this week."

**What we deliberately do NOT do:**
- No notifications between checkpoints. The phone is silent.
- No GPS request. Browser never asks for location.
- No leaderboards. Comparison breeds resentment.
- No chat. Drivers should not be customer-service agents.

---

## Journey 3 — Dispatcher (Hadeel)

**Emotional contract:** *"Give me one clear screen and trust me to act on it."*

### The morning sweep — Timeline Dashboard (`/dispatcher`)
1. Hadeel opens her laptop. The screen shows a vertical timeline grouped by driver, *not* a map.

   ```
   YOUSSEF · West Amman · On delivery
     08:14  Assigned   #1002 Bloom Flowers → Ahmad S. → Abdoun
     08:28  Picked Up
     08:41  Arrived Nearby

   WAEL · East · On delivery
     07:55  Assigned   #1006 Mama's → ... → Jabal Hussein
     08:12  Picked Up
     08:25  Delay — Traffic
   ```

2. Each event is a row. Tap a row to expand: full event detail, customer code, delay context.
3. There is no map. Maps create the illusion of control — and the impulse to use that control as surveillance. We refuse the affordance.

### A new order comes in — Dispatch Board (`/dispatcher/dispatch`)
4. Reem Pharmacy adds order 1005 (Hala D., Jabal Amman, urgent).
5. The dispatch board shows the order at top, with the engine's recommendation underneath:

   ```
   1005 · Urgent · Reem → Hala D., Jabal Amman

   Suggested: HAMZA  (Central)
     ✓ area match — Jabal Amman is within Central coverage
     ✓ available — 0 active orders right now
     ✓ urgent priority — Hamza's on-time rate on urgent is 96%
     ✓ familiarity — last 4 deliveries to Jabal Amman were his

   [ Assign Hamza ]    [ Pick someone else ]
   ```

6. Hadeel reads the explanation in 5 seconds. She clicks "Assign Hamza". Done.
7. If she clicks "Pick someone else", she sees the next 2 ranked options *with their own explanations* and a free-text "why I overrode" field. That free text becomes a feedback signal.

### A driver needs help — Help Alert
8. A red dot — the only red on the entire UI — appears in the corner. Mahmoud reported a vehicle issue.
9. Modal: "Mahmoud · order #1001 · vehicle. Nearest available: Amjad (0.4 area-distance, 1 active order)." Two buttons: `Reassign to Amjad` or `Call Mahmoud`.

### Friday — Trust Dashboard (`/dispatcher/drivers`)
10. Each driver card shows: on-time %, completion rate, current streak, familiarity badges, AND **what they rated the system this week**.
11. If a driver's pressure score spikes, the card shows an amber banner: *"Mahmoud rated pressure 4/5 this week — up from 2/5. Take a look."*
12. Hadeel can reduce his workload for the next 24h with one toggle: "Cap Mahmoud at 3 active orders today."

**What we deliberately do NOT do:**
- No driver locations.
- No phone-the-driver-now button (escalation costs friction by design — friction prevents micromanagement).
- No leaderboards or rankings shown to dispatcher. Trust scores are diagnostic, not competitive.

---

## Cross-Journey Promises

These three promises bind the whole product:

1. **Every checkpoint is voluntary, public, and append-only.** Once written, it stays. Drivers cannot be quietly edited out of their own story. Dispatchers cannot revise history.
2. **Every assignment is explained.** Both sides can audit the reasoning.
3. **Trust is measured on both sides, weekly, with the same weight.** A driver's rating of fairness counts as much as a customer's rating of timeliness.
