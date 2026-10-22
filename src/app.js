import { checkAnswer, VERDICTS } from './engine.js';
import { SAMPLE_SOURCES, SAMPLE_ANSWER } from './sample.js';

const $ = (id) => document.getElementById(id);
const els = {
  sources: $('sources'), answer: $('answer'), check: $('check'), sample: $('sample'), clear: $('clear'),
  message: $('message'), results: $('results'), scoreValue: $('score-value'), meter: $('meter-fill'),
  counts: $('counts'), sentences: $('sentences'), evidence: $('evidence'), copy: $('copy'),
};

let report = null;

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function say(text, ok = false) {
  els.message.textContent = text;
  els.message.className = ok ? 'message ok' : 'message';
}

function run() {
  const sources = els.sources.value.trim();
  const answer = els.answer.value.trim();
  if (!sources || !answer) {
    say(!sources ? 'Paste some sources first.' : 'Paste the AI answer to check.');
    els.results.hidden = true;
    return;
  }
  report = checkAnswer(sources, answer);
  say(`Checked ${report.results.length} sentences against ${report.passages} source sentences in ${report.docs} document${report.docs === 1 ? '' : 's'}.`, true);
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
}

els.check.addEventListener('click', run);
els.sample.addEventListener('click', () => {
  els.sources.value = SAMPLE_SOURCES;
  els.answer.value = SAMPLE_ANSWER;
  say('Sample loaded: a fictional library report and an AI summary of it. Press Check receipts.', true);
});
els.clear.addEventListener('click', () => {
  els.sources.value = '';
  els.answer.value = '';
  els.results.hidden = true;
  say('');
});
document.addEventListener('keydown', (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); run(); }
});
