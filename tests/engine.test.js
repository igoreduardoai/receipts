import test from 'node:test';
import assert from 'node:assert/strict';
import { splitSentences, splitDocuments, extractNumbers, hasNegation, stem, checkAnswer, toMarkdownReport } from '../src/engine.js';
import { SAMPLE_SOURCES, SAMPLE_ANSWER, BILL_QUOTE, BILLS } from '../src/sample.js';

test('sentence splitter keeps abbreviations and decimals together', () => {
  const s = splitSentences('Visits hit 1.2 million, e.g. at Dr. Smith St. branch. Next sentence here! And a third?');
  assert.deepEqual(s, ['Visits hit 1.2 million, e.g. at Dr. Smith St. branch.', 'Next sentence here!', 'And a third?']);
});

test('bullets and newlines become sentences', () => {
  assert.deepEqual(splitSentences('- first point\n- second point'), ['first point', 'second point']);
});

test('documents split on --- with optional # titles', () => {
  const d = splitDocuments('# A\nOne.\n---\nTwo.');
  assert.equal(d.length, 2);
  assert.equal(d[0].title, 'A');
  assert.equal(d[1].title, 'Source 2');
});

test('numbers are normalized and 3D-style tokens ignored', () => {
  assert.deepEqual(extractNumbers('1,240 items, 8% up, 1.2 million, 3D printing'), ['1240', '8', '1.2']);
});

test('negation detector', () => {
  assert.equal(hasNegation('The library did not raise fees'), true);
  assert.equal(hasNegation("It didn’t happen"), true);
  assert.equal(hasNegation('The library raised fees'), false);
});

test('stemmer aligns inflections', () => {
  assert.equal(stem('raised'), stem('raise'));
  assert.equal(stem('visits'), stem('visit'));
  assert.equal(stem('libraries'), 'library');
});

test('sample: each sentence gets the expected stamp', () => {
  const r = checkAnswer(SAMPLE_SOURCES, SAMPLE_ANSWER);
  assert.deepEqual(r.results.map((x) => x.verdict), [
    'number', 'supported', 'supported', 'negation', 'supported', 'supported', 'partial', 'unsupported', 'supported',
  ]);
  assert.deepEqual(r.results[0].numbers, { claim: ['12'], source: ['11'] });
  assert.equal(r.supported, 5);
  assert.equal(r.checked, 9);
});

test('evidence points at the right source sentence', () => {
  const r = checkAnswer(SAMPLE_SOURCES, SAMPLE_ANSWER);
  assert.match(r.results[3].matches[0].text, /did not raise late fees/);
  assert.match(r.results[8].matches[0].text, /county budget/);
});

test('empty inputs do not crash', () => {
  const r = checkAnswer('', '');
  assert.equal(r.results.length, 0);
  assert.equal(r.score, 0);
  const r2 = checkAnswer('', 'The library opened a branch downtown.');
  assert.equal(r2.results[0].verdict, 'unsupported');
});

test('markdown report lists every sentence', () => {
  const md = toMarkdownReport(checkAnswer(SAMPLE_SOURCES, SAMPLE_ANSWER));
  assert.match(md, /Receipt score: 5\/9/);
  assert.match(md, /Answer says 12 · Source says 11/);
});

test('document title words count as context, and bullet answers work', () => {
  const src = '# City Bike Share Q3 Update\nThe program now has 340 stations and 4,100 bikes. Ridership grew 22% compared with Q2. Helmets are not provided at stations.';
  const ans = 'Bike share now has 340 stations and about 4,100 bikes.\n- Ridership rose 25% versus Q2.\n- Helmets are provided at every station.\n- The city plans to add scooters next spring.';
  const v = checkAnswer(src, ans).results.map((r) => r.verdict);
  assert.deepEqual(v, ['supported', 'number', 'negation', 'unsupported']);
});

test('bill case 1: a changed amount is a number mismatch', () => {
  const r = checkAnswer(BILL_QUOTE, BILLS.amount);
  assert.deepEqual(r.results.map((x) => x.verdict), ['number', 'supported', 'supported']);
  assert.deepEqual(r.results[0].numbers, { claim: ['380'], source: ['280'] });
});

test('bill case 2: a bill that matches the quote passes every line', () => {
  const r = checkAnswer(BILL_QUOTE, BILLS.ok);
  assert.equal(r.supported, 3);
  assert.equal(r.checked, 3);
});
