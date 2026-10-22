---
doc: spec
status: draft
---
# Receipts — Technical Spec

## How This Works, In Plain Language
Receipts is one web page. When you press Check, a small JavaScript "engine" cuts the sources and the answer into sentences, turns each sentence into a bag of meaningful words (dropping words like "the" and trimming endings like "-ing"), and for every answer sentence finds the source sentence that shares the most rare, meaningful words (BM25 is the classic search-engine formula for this). The share of the claim's words found in that best source sentence is its **coverage**; coverage decides the stamp. Two extra detectors look for changed numbers and flipped negations. Everything runs in your browser, so there is no server, key or cost.

## The Core Journey Through the System
User pastes text → `app.js` reads both boxes → `engine.js: checkAnswer(sources, answer)` → `splitDocuments` → `splitSentences` → `buildIndex` (passages = sentences + adjacent pairs) → for each claim `bestMatches` (BM25 ranks, coverage re-scores) → `verdictFor` (thresholds + number/negation overrides) → result objects → `app.js` renders stamps, score and evidence. PRD ref: `prd.md > The Core Journey`.

## Stack
- HTML + CSS + vanilla JavaScript (ES modules). No framework, no build step — smallest thing that delivers a polished page.
- Tests: Node 20 built-in `node:test` (`npm test`). No dependencies.
- Optional local server: `npx serve` or `python3 -m http.server` (ES modules need http:// in some browsers).

## Where It Runs and How Someone Tries It
Browser. `npm start` (runs `python3 -m http.server 5173`) then open http://localhost:5173. Or open `index.html` via any static host (GitHub Pages works). Demo: Load sample → Check receipts → click the red sentence.

## Look and Feel
Off-white paper background, dark ink, accent stamps: green #1f8a4c, amber #b7791f, red #c53030, purple #6b46c1, gray for "too short". Font stack: system sans for body, `ui-monospace` for stamps, numbers and score. Generous spacing, max width 1200px. Copy tone: plain, a little playful ("No receipt").

## Components

### Engine (`src/engine.js`)
Pure functions, no DOM: `splitDocuments`, `splitSentences`, `tokenize`, `stem`, `extractNumbers`, `hasNegation`, `buildIndex`, `bestMatches`, `verdictFor`, `checkAnswer`, `toMarkdownReport`. PRD ref: `prd.md > Checking`.

### UI (`src/app.js`, `index.html`, `src/styles.css`)
Wires buttons, renders annotated sentences and evidence, score bar, localStorage, clipboard. PRD ref: `prd.md > Evidence`, `prd.md > Convenience`.

### Sample (`src/sample.js`)
A fictional "Riverbend Public Library 2026 Annual Report" and an AI summary containing 1 number change, 1 negation flip, 1 invented claim, 1 partial and 4 supported sentences. Entirely synthetic.

## Data Model
In-memory only. `Result = { sentence, verdict, coverage, matches:[{docTitle, text, coverage, matchedTerms}], numbers:{claim:[], source:[]}, }`. localStorage key `receipts:v1` = `{sources, answer}`.

## File Structure
```
ai-basics-submission/
├── index.html          # the page
├── src/engine.js       # matching engine (pure, tested)
├── src/app.js          # UI wiring
├── src/sample.js       # synthetic sample data
├── src/styles.css
├── tests/engine.test.js
├── package.json        # npm test / npm start
├── devpost/            # scope, prd, spec, checklist, app-map
├── README.md, LICENSE, VIDEO-SCRIPT.md, SUBMISSION.md
```

## External Services and Dependencies
None. No network calls, no API keys.

## Important Failure Modes
- **Paraphrase with different words** → shows Partial/No receipt; UI footer explains lexical matching, evidence panel still shows closest passage.
- **Very long sources (100+ pages)** → indexing is O(n) passages; fine up to ~1 MB text; show a "large input" note above that.
- **ES modules blocked on file://** → README says to use `npm start`; also ship a fallback message.

## What Was Simplified and Why
- **Lexical BM25 + coverage** instead of embeddings or an LLM judge — free, instant, explainable; fuller version would add an on-device embedding model.

## Decisions and Open Issues
- No LLM, static page (from Igor's brief: free tiers only, light RAM).
- Threshold tuning on sample + tests during build.
