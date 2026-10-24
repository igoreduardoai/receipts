import { checkAnswer, VERDICTS, toMarkdownReport, tokenize, extractNumbers } from './engine.js';
import { SAMPLES } from './sample.js';

const $ = (id) => document.getElementById(id);
const els = {
  sources: $('sources'), answer: $('answer'), check: $('check'), sample: $('sample'), clear: $('clear'),
  message: $('message'), results: $('results'), scoreValue: $('score-value'), meter: $('meter-fill'),
  counts: $('counts'), sentences: $('sentences'), evidence: $('evidence'), copy: $('copy'),
};

let report = null;
let activeId = null;
const STORE = 'receipts:v1';

const WHY = {
  supported: 'The words that carry this claim appear together in one source passage.',
  partial: 'Part of this claim is in the sources; the rest (unmarked words) has no receipt.',
  unsupported: 'No source passage covers this claim. It may be invented, or phrased very differently.',
  number: 'This sentence matches a source passage, but its number does not.',
  negation: 'This sentence matches a source passage, but one of them says “not/no/never” and the other does not.',
  duplicate: 'This line repeats an earlier one word for word and number for number. On a bill, that usually means you are charged twice.',
  short: 'Too few meaningful words to check reliably.',
};

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function say(text, ok = false) {
  els.message.textContent = text;
  els.message.className = ok ? 'message ok' : 'message';
}

function highlight(text, matchedTerms, flagNumbers = []) {
  const terms = new Set(matchedTerms);
  const nums = new Set(flagNumbers);
  return text.split(/(\s+)/).map((tok) => {
    if (/^\s+$/.test(tok)) return tok;
    const core = tok.replace(/^[^\w]+|[^\w%]+$/g, '');
    const num = extractNumbers(core)[0];
    if (num && nums.has(num)) return `<mark class="num">${esc(tok)}</mark>`;
    if (/^(not|no|never|without|none|nor|neither|cannot)$/i.test(core) || /n['’]t$/i.test(core)) return `<mark class="neg">${esc(tok)}</mark>`;
    const t = tokenize(core);
    if (t.length && t.every((x) => terms.has(x))) return `<mark>${esc(tok)}</mark>`;
    return esc(tok);
  }).join('');
}

function showEvidence(id) {
  const r = report.results[id];
  activeId = id;
  els.sentences.querySelectorAll('.sentence').forEach((li) => li.classList.toggle('active', Number(li.dataset.id) === id));
  const v = VERDICTS[r.verdict];
  let html = `<h2>Receipt</h2><p class="sub">Line ${id + 1} of ${report.results.length}</p>`;
  html += `<p class="claim v-${r.verdict}"><span class="stamp">${v.icon} ${esc(v.label)}</span><br>${highlight(r.sentence, r.matches[0]?.matchedTerms || [], r.numbers?.claim || [])}</p>`;
  html += `<p class="why">${esc(WHY[r.verdict])}</p>`;
  if (r.numbers) {
    html += `<p class="diff"><span>Your text says ${esc(r.numbers.claim.join(', '))}</span><span class="src">Source says ${esc(r.numbers.source.join(', ') || '—')}</span></p>`;
  }
  if (r.verdict === 'duplicate') {
    html += `<p class="diff"><span>Same as line ${r.duplicateOf + 1}: ${esc(report.results[r.duplicateOf].sentence)}</span></p>`;
  }
  if (r.verdict !== 'short') {
    if (!r.matches.length) html += '<p class="sub">No source sentence shares meaningful words with this claim.</p>';
    r.matches.filter((m, i) => i === 0 || m.coverage >= 0.35).forEach((m, i) => {
      const srcNums = r.numbers && i === 0 ? r.numbers.source : [];
      html += `<div class="match"><div class="match-head"><span>${i === 0 ? 'Closest source' : 'Also related'} · ${esc(m.docTitle)}</span><span>${Math.round(m.coverage * 100)}% of claim covered</span></div><p>${highlight(m.text, m.matchedTerms, srcNums)}</p></div>`;
    });
  }
  els.evidence.innerHTML = html;
}

function save() {
  try { localStorage.setItem(STORE, JSON.stringify({ sources: els.sources.value, answer: els.answer.value })); } catch { /* storage may be disabled */ }
}

function run() {
  const sources = els.sources.value.trim();
  const answer = els.answer.value.trim();
  if (!sources || !answer) {
    say(!sources ? 'Paste some sources first.' : 'Paste the text to check.');
    els.results.hidden = true;
    return;
  }
  report = checkAnswer(sources, answer);
  save();
  say(`Checked ${report.results.length} lines against ${report.passages} source sentences in ${report.docs} document${report.docs === 1 ? '' : 's'}.`, true);
  render();
}

function render() {
  const pct = report.checked ? Math.round(report.score * 100) : 0;
  els.scoreValue.textContent = `${report.supported}/${report.checked} supported`;
  els.meter.style.width = `${pct}%`;
  els.meter.style.background = pct >= 80 ? 'var(--green)' : pct >= 50 ? 'var(--amber)' : 'var(--red)';
  els.counts.innerHTML = Object.entries(report.counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `<li class="v-${k}">${VERDICTS[k].icon} ${n} ${esc(VERDICTS[k].label)}</li>`).join('');
  els.sentences.innerHTML = report.results.map((r) => `
    <li class="sentence v-${r.verdict}" tabindex="0" data-id="${r.id}">
      <span class="stamp">${VERDICTS[r.verdict].icon} ${esc(VERDICTS[r.verdict].label)}</span>
      <span class="text">${esc(r.sentence)}</span>
    </li>`).join('');
  els.results.hidden = false;
  const first = report.results.find((r) => !['supported', 'short'].includes(r.verdict)) || report.results[0];
  if (first) showEvidence(activeId !== null && report.results[activeId] ? activeId : first.id);
}

els.sentences.addEventListener('click', (e) => {
  const li = e.target.closest('.sentence');
  if (li) showEvidence(Number(li.dataset.id));
});
els.sentences.addEventListener('keydown', (e) => {
  const li = e.target.closest('.sentence');
  if (!li) return;
  const id = Number(li.dataset.id);
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); showEvidence(id); }
  if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
    e.preventDefault();
    const next = els.sentences.querySelector(`.sentence[data-id="${id + (e.key === 'ArrowDown' ? 1 : -1)}"]`);
    if (next) { next.focus(); showEvidence(Number(next.dataset.id)); }
  }
});
els.copy.addEventListener('click', async () => {
  if (!report) return;
  const md = toMarkdownReport(report);
  try { await navigator.clipboard.writeText(md); say('Report copied as Markdown.', true); }
  catch { say('Could not access the clipboard in this browser.'); }
});
[els.sources, els.answer].forEach((t) => t.addEventListener('input', save));

els.check.addEventListener('click', run);
els.sample.addEventListener('change', () => {
  const s = SAMPLES[els.sample.value];
  if (!s) return;
  els.sources.value = s.sources;
  els.answer.value = s.answer;
  activeId = null;
  els.results.hidden = true;
  save();
  say(`${s.note} Press Check receipts.`, true);
  els.sample.value = '';
});
els.clear.addEventListener('click', () => {
  els.sources.value = '';
  els.answer.value = '';
  els.results.hidden = true;
  activeId = null;
  save();
  say('');
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
});

// Restore the last session.
try {
  const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
  if (saved && (saved.sources || saved.answer)) {
    els.sources.value = saved.sources || '';
    els.answer.value = saved.answer || '';
    if (saved.sources && saved.answer) run();
  }
} catch { /* ignore corrupt storage */ }

window.__receiptsReady = true;
