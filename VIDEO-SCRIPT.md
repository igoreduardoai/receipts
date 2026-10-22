# Receipts — demo video script (target 1:45–2:15, hard limit < 3:00)

Setup: `npm start`, Chrome at http://localhost:5173, window ~1400×900, zoom 110%, Clear pressed, no other tabs/bookmarks visible. Record screen + voice (OBS or Loom). Upload to YouTube as **Public** or **Unlisted-but-public link**, no music.

| Time | On screen | Voice (say it your way) |
|---|---|---|
| 0:00–0:15 | Empty Receipts page | "When an AI summarizes a report for you, the dangerous mistakes aren't the obvious ones. It's a number that quietly changed, or a 'not' that disappeared. Checking means re-reading the whole source. This is Receipts." |
| 0:15–0:30 | Click **Load sample**; scroll the two boxes | "On the left, the sources — here a fictional library annual report and board notes. On the right, an AI summary of it." |
| 0:30–0:45 | Click **Check receipts**; score bar animates | "One click. Every sentence gets a stamp. Five of nine are supported." |
| 0:45–1:05 | Click sentence 1 (🔢 Number mismatch) | "This one reads exactly like the report — but the AI says 12 branches and the source says 11. Receipts shows both numbers side by side and the exact source line." |
| 1:05–1:20 | Click sentence 4 (⚠️ Negation flip) | "Here the AI says the library raised late fees. The source says it did *not*. Same words, opposite meaning — flagged." |
| 1:20–1:35 | Click sentence 7 (🟡 Partial) then 8 (❌ No receipt) | "Partial: 3D printing and the studio are real, the laser-cutting classes aren't. And this award? There's no receipt anywhere." |
| 1:35–1:50 | Edit sentence 1 in the answer box to "11 branches", Ctrl+Enter | "Fix it, re-check — stamp turns green." |
| 1:50–2:05 | Click **Copy report**, paste into a notes app briefly | "Copy a Markdown checklist to keep with your work." |
| 2:05–2:20 | Point at the 🔒 badge, then show `devpost/` folder and `npm test` passing in a terminal | "It runs entirely in your browser: no model, no API key, nothing uploaded — every verdict is explained by highlighted words. Built from an empty folder with the Devpost Learn skill pack: scope, PRD and spec are in the repo. Receipts — show me the receipts." |

Checklist before upload: no email/keys/notifications on screen; video < 3:00; shows the app actually running.
