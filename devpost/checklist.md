---
doc: checklist
status: draft
---
# Build Checklist

Build mode: fast (agent-executed from Igor's brief; Igor does hands-on checks)

## Slices

- [x] **1. Engine gives a verdict per sentence**
  Becomes usable: `checkAnswer(sources, answer)` returns stamps for every sentence of the sample, covered by tests.
  Why now: The kernel (receipt + number/negation detection) is the riskiest part.
  PRD ref: `prd.md > Checking`
  Spec ref: `spec.md > Engine (src/engine.js)`
  Build: engine.js, sample.js, tests, package.json.
  Verify (mechanical): `npm test` passes; sample yields the expected verdict per sentence.
  Learner check: Read the test names and confirm the verdicts match your intuition.
  Commit: `Add grounding engine with number and negation checks`

- [x] **2. One page: paste, check, see stamps and score**
  Becomes usable: index.html runs the core journey steps 1–6.
  Why now: Turns the engine into the product.
  PRD ref: `prd.md > The Core Journey`
  Spec ref: `spec.md > UI`
  Build: index.html, app.js, styles.css.
  Verify (mechanical): headless browser load sample → check → stamps render, no console errors.
  Learner check: Open the page, load the sample, press Check.
  Commit: `Add Receipts page with stamps and score`

- [x] **3. Evidence panel, copy report, local save**
  Becomes usable: core journey steps 7–9.
  PRD ref: `prd.md > Evidence`, `prd.md > Convenience`
  Spec ref: `spec.md > UI`
  Build: evidence rendering with highlights, clipboard report, localStorage.
  Verify (mechanical): headless click on the mismatch sentence shows "Answer says 12 · Source says 11"; reload restores inputs.
  Learner check: Click the red sentence, then reload the page.
  Commit: `Add evidence panel, report and local save`

## Hands-on Checkpoints
- [ ] Early usable behavior explored — shared final-review session (tiny build)
- [ ] Final kick-the-tires exploration and feedback completed (Igor)

## Final Review
- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map
- [ ] Learning activity complete
- [ ] Optional edit and transfer reflection addressed
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown

Activity and evidence: pending
Route and stops: pending
Edit outcome: pending
Reflection: pending
Activity mode: pending

## Revisions
- Document titles now count toward coverage — a second, non-sample test ("Bike share now has 340 stations") scored Partial only because "bike share" lived in the title, not the sentence.
