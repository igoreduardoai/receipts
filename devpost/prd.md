---
doc: prd
status: draft
---
# Receipts — Product Requirements

A one-page browser tool for anyone reusing AI-written text: it shows which sentences of an AI answer have a "receipt" in the source material. Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
1. The user opens `index.html` (or the hosted page). They see two text boxes — **Sources** and **AI answer** — and a big **Check receipts** button. A "Load sample" link fills both boxes.
2. They paste the source text (one or more documents; a line `---` separates documents, an optional first line `# Title` names each).
3. They paste the AI answer.
4. They press **Check receipts** (or Ctrl/Cmd+Enter).
5. The answer is re-rendered sentence by sentence, each with a colored stamp: ✅ Supported, 🟡 Partial, ❌ No receipt, 🔢 Number mismatch, ⚠️ Negation flip.
6. A score bar shows "Receipt score: 5/8 sentences supported" plus counts per verdict.
7. Clicking a sentence opens the **Evidence** panel: the best-matching source sentence(s), document title, shared words highlighted, and for mismatches the conflicting numbers side by side.
8. They edit the answer and press Check again; stamps update. Success = they know exactly which lines to fix or cite.
9. Optional: **Copy report** puts a Markdown checklist of all sentences and verdicts on the clipboard.

## Screens and Layout
Single page. Header (logo, tagline, privacy note "runs locally — nothing is uploaded"). Two-column input area (stacks on mobile). Results area below: score bar, annotated answer on the left, evidence panel on the right (sticky).

## Look and Feel
Receipt paper off-white (#fbfaf6), ink near-black, monospace for stamps and numbers, a clean sans-serif for body. Stamps are rotated rubber-stamp style badges in green / amber / red / purple. Spacious, calm, no clutter. Source: `scope.md > Inspiration & Identity`.

## Features and Behavior

### Checking
- Sentences are split robustly (abbreviations like "e.g.", "Dr.", decimals "3.5" don't split).
- Each answer sentence is compared with every source sentence (and pairs of adjacent sentences) using BM25 + content-word coverage.
- Verdicts: Supported (coverage ≥ 0.6), Partial (≥ 0.35), No receipt (below). Overrides: if the best match is at least Partial but a number in the claim is absent from that passage and from the claim's matched document → Number mismatch; if exactly one side contains a negation (not, no, never, without, n't) → Negation flip.
- Very short sentences (< 3 content words) are marked "Too short to check" and excluded from the score.

### Evidence
- Clicking a sentence highlights it and shows top-2 source passages with matched words marked, the coverage %, and the document title.
- Number mismatch shows "Answer says 12 · Source says 11".

### Convenience
- Load sample, Clear, Copy report (Markdown).
- Last inputs saved in localStorage and restored on reload.

## States and Boundaries
- **First use** — empty boxes with placeholder hints and a visible "Load sample".
- **Missing input** — Check with an empty box shows an inline message, no results.
- **Normal** — stamps and score.
- **Privacy** — nothing is sent anywhere; no network calls at all.
- **Boundary** — Receipts checks whether a claim is *in the sources*, not whether it is *true*. Stated in the UI footer.

## Product Decisions
- No LLM (assumption from Igor's brief: free, light, auditable) — every verdict is explainable by highlighted words.
- Pure static page — judges and users can open it with zero install.

## What We're Building
The full Core Journey above, with the sample, the five verdicts, evidence panel, score, copy report, local save, and tests for the matching engine.

## Deferred From the POC
- URL/PDF ingestion — needs fetching/parsing; paste is enough to prove the kernel.
- Semantic (embedding) matching — would catch paraphrases; adds a model download.

## Possible Later Enhancements
Browser extension; inline "insert citation" button; multi-language stopwords (pt/es).

## Non-Goals
- Judging truth or giving medical/legal/financial advice.
- Storing or uploading user text.

## Open Questions
- Thresholds (0.6 / 0.35) — tune on the sample during build; can wait.
