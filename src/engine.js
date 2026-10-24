// Receipts — grounding engine.
// Pure functions, no DOM, no network. Checks each sentence of an AI answer
// against source text using BM25 + IDF-weighted term coverage, plus
// detectors for changed numbers and flipped negations.

export const THRESHOLDS = { supported: 0.6, partial: 0.35 };

export const VERDICTS = {
  supported: { label: 'Supported', icon: '✅' },
  partial: { label: 'Partial', icon: '🟡' },
  unsupported: { label: 'No receipt', icon: '❌' },
  number: { label: 'Number mismatch', icon: '🔢' },
  negation: { label: 'Negation flip', icon: '⚠️' },
  duplicate: { label: 'Duplicate', icon: '🔁' },
  short: { label: 'Too short to check', icon: '·' },
};

const STOPWORDS = new Set(`a about above after again against all also am an and any are as at be because been
before being below between both but by can could did do does doing down during each few for from further had
has have having he her here hers herself him himself his how i if in into is it its itself just me more most my
myself now of off on once only or other our ours ourselves out over own same she should so some such than that
the their theirs them themselves then there these they this those through to too under until up very was we were
what when where which while who whom why will with would you your yours yourself yourselves new its it's
including include includes like well many much via per one's versus vs compared compare against still now
about approximately roughly around nearly almost`.split(/\s+/));

// Tiny canonical map for words reports and summaries swap all the time.
const CANON = new Map(Object.entries({
  rose: 'increas', ris: 'increas', grew: 'increas', grow: 'increas', increas: 'increas', climb: 'increas', jump: 'increas', gain: 'increas', up: 'increas',
  fell: 'decreas', fall: 'decreas', drop: 'decreas', declin: 'decreas', decreas: 'decreas', down: 'decreas',
  cost: 'price', pric: 'price', price: 'price', fee: 'fee',
  ebook: 'ebook', ebik: 'ebik',
  approximate: 'about', roughly: 'about', around: 'about',
}));

const NEGATIONS = /\b(not|no|never|without|none|nor|neither|cannot|isn't|wasn't|aren't|weren't|didn't|doesn't|don't|hasn't|haven't|hadn't|won't|wouldn't|can't|couldn't|shouldn't)\b|n't\b/i;

const ABBREVIATIONS = new Set(['e.g', 'i.e', 'dr', 'mr', 'mrs', 'ms', 'prof', 'st', 'vs', 'etc', 'inc', 'ltd', 'co',
  'jr', 'sr', 'no', 'fig', 'approx', 'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov',
  'dec', 'u.s', 'u.k', 'a.m', 'p.m', 'dept', 'est', 'mt']);

/** Split pasted sources into documents. `---` on its own line separates documents; a leading `# Title` names one. */
export function splitDocuments(text) {
  const chunks = String(text || '').split(/^\s*-{3,}\s*$/m).map((c) => c.trim()).filter(Boolean);
  return chunks.map((chunk, i) => {
    const lines = chunk.split('\n');
    let title = `Source ${i + 1}`;
    if (/^#\s+/.test(lines[0])) {
      title = lines.shift().replace(/^#\s+/, '').trim();
    }
    return { id: i, title, text: lines.join('\n').trim() };
  });
}

/** Split text into sentences, protecting abbreviations and decimals. Newlines/bullets also break sentences. */
export function splitSentences(text) {
  const out = [];
  const blocks = String(text || '').split(/\n+/).map((b) => b.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, '').trim()).filter(Boolean);
  for (const block of blocks) {
    let start = 0;
    const re = /[.!?]+["')\]]*(?=\s+["'(\[]?[A-Z0-9])/g;
    let m;
    while ((m = re.exec(block)) !== null) {
      const end = m.index + m[0].length;
      const before = block.slice(start, m.index);
      const lastWord = (before.match(/([A-Za-z.]+)$/) || [''])[0].toLowerCase().replace(/\.$/, '');
      if (m[0].startsWith('.') && (ABBREVIATIONS.has(lastWord) || /^[a-z]$/.test(lastWord))) continue;
      const s = block.slice(start, end).trim();
      if (s) out.push(s);
      start = end;
    }
    const rest = block.slice(start).trim();
    if (rest) out.push(rest);
  }
  return out;
}

/** Very light English stemmer: enough to match visit/visits/visited, raise/raised. */
export function stem(word) {
  let w = word;
  if (w.length <= 3) return w;
  if (w.endsWith("'s")) w = w.slice(0, -2);
  if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
  if (w.endsWith('sses')) return w.slice(0, -2);
  if (w.endsWith('ing') && w.length > 5) w = w.slice(0, -3);
  else if (w.endsWith('ed') && w.length > 4) w = w.slice(0, -2);
  else if (w.endsWith('es') && w.length > 4 && /(ch|sh|x|z|ss)es$/.test(w)) w = w.slice(0, -2);
  else if (w.endsWith('s') && !w.endsWith('ss') && !w.endsWith('us') && !w.endsWith('is')) w = w.slice(0, -1);
  if (w.endsWith('e') && w.length > 4) w = w.slice(0, -1);
  if (w.endsWith('ly') && w.length > 5) w = w.slice(0, -2);
  return w;
}

/** Content terms (stemmed, no stopwords, no pure numbers). */
export function tokenize(text) {
  const words = String(text || '').toLowerCase().replace(/[’]/g, "'").match(/[a-z][a-z0-9'-]*[a-z0-9]|[a-z]|\d+[a-z]+/g) || [];
  const terms = [];
  for (const raw of words) {
    const compact = raw.replace(/-/g, '');
    if (CANON.has(raw) || CANON.has(stem(compact))) { terms.push(CANON.get(raw) || CANON.get(stem(compact))); continue; }
    for (const part of raw.split('-')) {
      if (!part || STOPWORDS.has(part) || NEGATIONS.test(part)) continue;
      const st = stem(part);
      terms.push(CANON.get(st) || CANON.get(part) || st);
    }
  }
  return terms;
}

/** Numbers as normalized strings: "1,240" -> "1240", "8%" -> "8", "1.2" stays. Ignores "3D"-style tokens. */
export function extractNumbers(text) {
  const found = String(text || '').match(/(?<![\w.])\d[\d,]*(?:\.\d+)?(?![\d,]*[A-Za-z])/g) || [];
  return [...new Set(found.map((n) => n.replace(/,/g, '').replace(/\.0+$/, '')))];
}

export function hasNegation(text) {
  return NEGATIONS.test(String(text || '').replace(/[’]/g, "'"));
}

/** Index source documents into passages: single sentences plus adjacent pairs. */
export function buildIndex(sourcesText) {
  const docs = splitDocuments(sourcesText);
  const passages = [];
  for (const doc of docs) {
    const sents = splitSentences(doc.text);
    const titleTerms = doc.title.startsWith('Source ') ? [] : tokenize(doc.title);
    sents.forEach((s, i) => {
      passages.push({ docId: doc.id, docTitle: doc.title, text: s, span: [i, i], terms: tokenize(s), titleTerms });
      if (i + 1 < sents.length) {
        const pair = `${s} ${sents[i + 1]}`;
        passages.push({ docId: doc.id, docTitle: doc.title, text: pair, span: [i, i + 1], terms: tokenize(pair), titleTerms, pair: true });
      }
    });
  }
  const singles = passages.filter((p) => !p.pair);
  const df = new Map();
  for (const p of singles) for (const t of new Set(p.terms)) df.set(t, (df.get(t) || 0) + 1);
  const N = Math.max(singles.length, 1);
  const idf = (t) => Math.log(1 + (N - (df.get(t) || 0) + 0.5) / ((df.get(t) || 0) + 0.5));
  const avgLen = singles.reduce((a, p) => a + p.terms.length, 0) / N || 1;
  return { docs, passages, idf, avgLen };
}

function bm25(queryTerms, passage, index, k1 = 1.2, b = 0.75) {
  const tf = new Map();
  for (const t of passage.terms) tf.set(t, (tf.get(t) || 0) + 1);
  let score = 0;
  for (const q of new Set(queryTerms)) {
    const f = tf.get(q);
    if (!f) continue;
    score += index.idf(q) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * passage.terms.length) / index.avgLen)));
  }
  return score;
}

/** IDF-weighted share of the claim's unique terms that appear in the passage (or its document title). */
export function coverage(claimTerms, passage, index) {
  const uniq = [...new Set(claimTerms)];
  if (!uniq.length) return { value: 0, matched: [] };
  const pTerms = new Set([...passage.terms, ...(passage.titleTerms || [])]);
  let total = 0;
  let hit = 0;
  const matched = [];
  for (const t of uniq) {
    const w = index.idf(t);
    total += w;
    if (pTerms.has(t)) { hit += w; matched.push(t); }
  }
  return { value: total ? hit / total : 0, matched };
}

/** Rank passages for a claim. Pairs only win if they add real coverage. */
export function bestMatches(claim, index, k = 2) {
  const terms = tokenize(claim);
  const scored = index.passages.map((p) => {
    const cov = coverage(terms, p, index);
    return { ...p, coverage: cov.value, matchedTerms: cov.matched, bm25: bm25(terms, p, index) };
  });
  scored.sort((a, b) => {
    const pa = a.coverage - (a.pair ? 0.1 : 0);
    const pb = b.coverage - (b.pair ? 0.1 : 0);
    return pb - pa || b.bm25 - a.bm25;
  });
  const out = [];
  for (const p of scored) {
    if (out.length >= k) break;
    if (p.coverage <= 0) break;
    if (out.some((o) => o.docId === p.docId && o.span[0] <= p.span[1] && p.span[0] <= o.span[1])) continue;
    out.push(p);
  }
  return { terms, matches: out };
}

/** Decide the stamp for one claim. */
export function verdictFor(claim, terms, matches, index) {
  const distinct = new Set(terms).size;
  if (distinct < 2 || (distinct < 3 && !extractNumbers(claim).length)) return { verdict: 'short', coverage: 0, numbers: null };
  const best = matches[0];
  const cov = best ? best.coverage : 0;
  let verdict = cov >= THRESHOLDS.supported ? 'supported' : cov >= THRESHOLDS.partial ? 'partial' : 'unsupported';
  let numbers = null;
  if (best && verdict !== 'unsupported') {
    const claimNums = extractNumbers(claim);
    const titleNums = new Set(index.docs.flatMap((d) => extractNumbers(d.title)));
    const near = new Set(matches.flatMap((m) => extractNumbers(m.text)));
    const missing = claimNums.filter((n) => !near.has(n) && !titleNums.has(n));
    if (missing.length) {
      verdict = 'number';
      numbers = { claim: missing, source: extractNumbers(best.text).filter((n) => !claimNums.includes(n)) };
    } else if (hasNegation(claim) !== hasNegation(best.text)) {
      verdict = 'negation';
    }
  }
  return { verdict, coverage: cov, numbers };
}

/** A checked line that repeats an earlier one (same content words, same numbers) is a Duplicate, e.g. a fee billed twice. */
export function markDuplicates(results) {
  const seen = new Map();
  for (const r of results) {
    if (r.verdict === 'short') continue;
    const key = `${[...r.terms].sort().join(' ')}|${extractNumbers(r.sentence).sort().join(',')}`;
    if (seen.has(key)) {
      r.verdict = 'duplicate';
      r.duplicateOf = seen.get(key);
    } else {
      seen.set(key, r.id);
    }
  }
  return results;
}

/** Main entry: check every sentence of `answer` against `sources`. */
export function checkAnswer(sources, answer) {
  const index = buildIndex(sources);
  const sentences = splitSentences(answer);
  const results = sentences.map((sentence, i) => {
    const { terms, matches } = bestMatches(sentence, index);
    const v = verdictFor(sentence, terms, matches, index);
    return { id: i, sentence, terms, matches, ...v };
  });
  markDuplicates(results);
  const checked = results.filter((r) => r.verdict !== 'short');
  const counts = Object.fromEntries(Object.keys(VERDICTS).map((k) => [k, results.filter((r) => r.verdict === k).length]));
  return {
    results,
    counts,
    checked: checked.length,
    supported: counts.supported,
    score: checked.length ? counts.supported / checked.length : 0,
    docs: index.docs.length,
    passages: index.passages.filter((p) => !p.pair).length,
  };
}

/** Markdown report for the clipboard. */
export function toMarkdownReport(report) {
  const lines = [`# Receipts report`, '', `Receipt score: ${report.supported}/${report.checked} sentences supported`, ''];
  for (const r of report.results) {
    const v = VERDICTS[r.verdict];
    lines.push(`- [${r.verdict === 'supported' ? 'x' : ' '}] ${v.icon} **${v.label}** — ${r.sentence}`);
    if (r.matches[0] && r.verdict !== 'short') {
      lines.push(`  - Closest source (${r.matches[0].docTitle}, ${Math.round(r.coverage * 100)}%): "${r.matches[0].text}"`);
    }
    if (r.verdict === 'duplicate') lines.push(`  - Repeats line ${r.duplicateOf + 1}`);
    if (r.numbers) lines.push(`  - Answer says ${r.numbers.claim.join(', ')} · Source says ${r.numbers.source.join(', ') || '—'}`);
  }
  lines.push('', '_Receipts checks whether claims appear in the sources, not whether they are true._');
  return lines.join('\n');
}
