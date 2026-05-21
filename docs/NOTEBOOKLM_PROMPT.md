# NotebookLM Pitch-Deck Prompt — Yalla Wassel

Use this with [NotebookLM](https://notebooklm.google.com) to generate a polished
10-slide pitch deck.

## Step 1 — Attach these sources

Drag-drop or upload the following files as NotebookLM sources:

- `README.md`
- `docs/PRODUCT_STRATEGY.md`
- `docs/USER_JOURNEYS.md`
- `docs/UX_STRUCTURE.md`
- `docs/API.md`

## Step 2 — Paste this prompt

```
You're a senior pitch coach helping me build a 10-slide pitch deck for
Yalla Wassel — a same-day delivery operation in Amman with a built-in
trust system. Use ONLY the attached source files. Do not invent metrics,
customer counts, or dates that aren't in the sources.

Audience: hackathon judges and investors who've seen 20 delivery
startups today. We need to be the one they remember.

Thesis: Accountability without surveillance. The dispatcher screen has
no map — and that absence is the entire product. Make sure this line
lands at least twice in the deck.

Tone: Confident, plainspoken, founder-voice. No buzzwords
("disruption", "synergy", "AI-powered", "best-in-class"). One idea per
slide. Hadeel's voice when it helps; pitch-deck voice otherwise. Never
use the word "AI" — the dispatch engine is rule-based and explainable,
that's the point.

Build exactly 10 slides in this order:

 1. Title — product name, one-line positioning, place + year.
 2. The problem — Hadeel, eight drivers, WhatsApp + sticky-note
    dispatch. The moment GPS broke it. Use the real quote from the
    sources.
 3. The insight — Reframe the category: surveillance and accountability
    are different problems. Accountability is the result of
    commitments, not observation.
 4. The solution — Yalla Wassel runs on three primitives. Name them:
    Trust Ledger · Mutual Trust Score · Explainable Dispatch. One
    sentence each.
 5. Pillar 1: Trust Ledger — four checkpoint taps per delivery,
    append-only, no coordinates stored, optional delay reasons.
 6. Pillar 2: Mutual Trust Score — drivers rate the system back weekly
    (fairness, fit, pressure). Geometric mean of both sides — you can't
    trade one for the other.
 7. Pillar 3: Explainable Dispatch — every assignment ships with one
    sentence. Use a real example sentence from the sources. Overrides
    require a reason, which trains the engine.
 8. Three roles — Dispatcher (command center, no map), Driver (Silent
    Mode, one screen, one button), Customer (timeline, not a map;
    no driver location ever shared).
 9. Why we win — three short comparisons: vs generic delivery
    software, vs WhatsApp + spreadsheets, vs full GPS surveillance.
    End with the North-Star Metric (Mutual Trust Index) and what
    "winning" looks like.
10. Roadmap + closing — where we are (v0.1), where this goes
    (v0.2 multi-tenant, v1.0 trust infrastructure as API), close
    on the no-map line.

For each slide, return:
- Slide N — [headline title]
- 3 to 5 punchy bullets (max 12 words each)
- Visual: one-line image / mock-UI concept
- Voiceover: one short sentence (max 25 words) the speaker says
  while this slide is up

After slide 10, add:
- A 3-sentence elevator pitch combining the sharpest beats
- A single closing line the speaker can use to end the talk

Constraints:
- 10 slides total, no more, no fewer
- No invented numbers — only what appears in the sources
- No clichés, no jargon, no emoji
- Every claim should be traceable to the attached sources
```

## Step 3 — Build the deck

Take NotebookLM's slide-by-slide output and paste each one into Google Slides,
Keynote, or Pitch. For each slide:

1. Use the headline title verbatim.
2. Use the bullets as on-slide copy (keep them tight).
3. Use the *Visual* description to source/design the image.
4. Memorise the *Voiceover* line — that's what you say out loud.

## Optional: ask NotebookLM for follow-ups

After the deck, you can ask NotebookLM in the same notebook:

- *"Give me three questions a skeptical judge would ask, with crisp
  one-line answers grounded in the sources."*
- *"Rewrite the title slide for a 30-second elevator pitch in a hallway."*
- *"What's the single weakest claim in this deck? Why?"*
