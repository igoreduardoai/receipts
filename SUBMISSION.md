# Devpost submission — fact sheet for Igor

> The skill pack's `6-ship` step asks that **you write the public submission text in your own words** (the agent may only fix spelling/grammar after). So this file is a fact sheet + field checklist, not finished copy. Turn the bullets into your own sentences.

## Form fields → facts to use

**Project name:** Receipts

**Tagline (fill in yourself):** idea — "receipts for every AI claim", sentence-level check against sources.

**Inspiration (your story):**
- You build retrieval / clinical-AI systems; the question you care about most is "is this claim actually in the source?" (grounding / faithfulness).
- Everyday people now paste AI summaries into school work, reports and articles without that check.

**What it does (facts):**
- Paste sources + AI answer → each sentence stamped: Supported / Partial / No receipt / Number mismatch / Negation flip.
- Click a sentence → closest source sentence, document title, shared words highlighted, numbers side by side.
- Receipt score, Markdown report, local save. 100% in-browser; no model, no key, no upload.

**Who it's for:** students, analysts, journalists, anyone reusing AI-written text from a known document.

**How we built it (facts):**
- Started from an empty folder with the Devpost Learn skill pack (1-start → 2-scope → 3-prd → 4-spec → 5-build); docs in `devpost/`.
- Vanilla HTML/CSS/JS, zero dependencies. Engine: sentence splitting, stopwords + light stemming + small synonym map, IDF-weighted coverage with BM25 tiebreak, number and negation detectors. 11 `node:test` tests.
- Coding agent used for implementation (disclose: built with an AI coding assistant, Grok Bot).

**Challenges (facts):** abbreviation/decimal-safe sentence splitting; a second test case (bike-share) exposed that synonyms (rose vs grew) hid a number change → added a tiny synonym map; avoiding false "number mismatch" from years in titles.

**Accomplishments / what you learned / what's next:** your words. Next-step facts: URL/PDF sources, optional on-device embeddings for paraphrases, browser extension, pt/es support.

**Built with:** javascript, html5, css3, node.js (tests)

**Links:**
- Public GitHub repo (MIT, license visible in About): `https://github.com/igoreduardoai/receipts` (created/pushed: pending GitHub auth for igoreduardoai)
- Demo video (YouTube/Vimeo, public, < 3 min): ← to record from VIDEO-SCRIPT.md
- Optional live demo: GitHub Pages of the repo → `https://igoreduardoai.github.io/receipts/` (after push + Pages enabled)

**Testing instructions:** `npm start` → http://localhost:5173 → Load sample → Check receipts. Or open the GitHub Pages link. `npm test` runs the engine suite.

**Pre-existing code disclosure:** none. Only the Devpost Learn skill pack (`.agents/skills`) and Node/Python built-ins.

## Before submitting
- [x] Read scope/prd/spec in `devpost/` — approved by Igor 2026-10-22 (status: approved)
- [ ] Try the app yourself (Load sample → Check → click red/purple/orange sentences)
- [ ] Create public repo + push (agent can do it after your OK); confirm MIT shows in About
- [ ] Record + upload video (public)
- [ ] Write the description fields in your words; fill exit survey
- [ ] Submit on learn-ai-basics.devpost.com before **Mon 26/10, 16:00 CT**
