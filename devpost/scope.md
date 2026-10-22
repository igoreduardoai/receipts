---
doc: scope
status: approved
approved_by: Igor Eduardo
approved_on: 2026-10-22
---
<!-- Drafted 2026-10-22 from Igor's delegated brief; approved by Igor 2026-10-22. -->

# Receipts

Paste an AI answer and the sources it should come from; Receipts shows, sentence by sentence, which claims have a receipt in the sources and which don't.

## The Unique Kernel
Every sentence of the AI answer gets a verdict (Supported / Partial / No receipt / Number mismatch) **and the exact source sentence that backs it**, with the shared words highlighted. It also catches the most dangerous quiet hallucination: the answer is worded like the source but **a number or a negation changed** ("12 branches" vs "11 branches", "is" vs "is not"). Runs 100% in the browser, no model, no API key, nothing leaves the page.

## Who It's For
A student, analyst or journalist who asked ChatGPT/Claude to summarize a report and now has to paste that summary into their own work. Today they re-read the whole source and Ctrl+F word by word, or they just trust it.

## The Core Loop
Paste the source text, paste the AI answer, press **Check receipts**. Scan the colored answer, click any red/amber sentence to see the closest source sentence, fix it, re-check. They come back every time they reuse AI-written text.

## Inspiration & Identity
Feels like a receipt printer meets a code linter: off-white paper, monospace accents, green/amber/red stamps. Calm, fast, trustworthy. Grounding / citation-checking ideas from retrieval evaluation (RAG faithfulness metrics), but made concrete for a non-technical person.

## Why This Matters to the Learner
Igor builds retrieval systems; grounding ("is this claim actually in the source?") is the question he cares most about. This is the smallest honest tool that answers it for everyday people.

## What "Working" Looks Like
Load the sample (a fictional library annual report + an AI summary of it), press Check: 8 sentences get stamps, overall "Receipt score" appears. The "oh, that's cool" beat: a sentence that *sounds* exactly like the report is flagged red because it says "12 branches" while the report says 11, and clicking it shows the source line with the number highlighted.

## The POC Boundary
- One page: source box, answer box, Check button, annotated answer, evidence panel, score.
- Lexical matching (BM25 + term coverage) with number and negation checks.
- Built-in sample, local save of last inputs, copy a Markdown report.

## Later
- Paste a URL or PDF as a source.
- Optional small local embedding model for paraphrases.
- Browser extension that checks text inside chat apps.

## Explicitly Cut
- LLM-as-judge: costs money/keys and makes the verdict itself unauditable.
- Accounts / cloud storage: no need; privacy is a feature.
- Medical or legal use claims: this flags missing receipts, it does not judge truth.
