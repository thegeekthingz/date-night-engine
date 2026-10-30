import assert from 'node:assert/strict';
import { test, before, after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { loadDefaultGame } from './fixtures/dateNightInfrastructure.ts';
import { presentItem } from '../src/components/dateNightPresentation.ts';
import { loadTheme } from '../src/engine/gameLoader.ts';
let server, App, Setup;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false, ws: false }, appType: 'custom' });
  App = (await server.ssrLoadModule('/src/App.tsx')).default;
  Setup = (await server.ssrLoadModule('/src/components/DateNightSetup.tsx')).default;
});
after(async () => { await server?.close(); });
test('Date Night Home renders the promise, product CTA, five stages and production inventory label', () => {
  const html = renderToStaticMarkup(createElement(App));
  for (const copy of ['Stop planning.', 'Start your date.', 'BUILD YOUR DATE', 'Five activities. Zero planning.',
    '72 activities', 'Made for two', 'CONNECT', 'PREDICT', 'PLAY', 'CHALLENGE', 'CLOSER']) assert.ok(html.includes(copy), copy);
  assert.ok(!/Girls Night|Spill or Sip|Secrets\. Stories|How honest|Infrastructure fixture/.test(html));
});
test('Setup uses three named native radio groups with checked choices and no native selects', () => {
  const html = renderToStaticMarkup(createElement(Setup, { value: { vibe: 'romantic', durationMinutes: 30, intensityCeiling: 'flirty' },
    onChange() {}, onStart() {}, onHome() {}, headingRef: { current: null } }));
  assert.equal((html.match(/type="radio"/g) ?? []).length, 8);
  assert.equal((html.match(/checked=""/g) ?? []).length, 3);
  assert.equal((html.match(/name="vibe"/g) ?? []).length, 4);
  assert.equal((html.match(/name="time"/g) ?? []).length, 2);
  assert.equal((html.match(/name="intensity"/g) ?? []).length, 2);
  assert.ok(!html.includes('<select')); assert.ok(!html.includes('ceiling'));
  for (const text of ['Quick Date', 'Full Date', 'Warm, playful, easygoing', 'A little bolder, still couple-friendly', 'BUILD MY DATE']) assert.ok(html.includes(text));
});
test('document metadata identifies Date Night without legacy product names', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.ok(html.includes('<title>Date Night — Build Your Night</title>'));
  assert.ok(html.includes('name="description"')); assert.ok(!/Girls Night|Spill or Sip/.test(html));
});
test('warm theme parses through the canonical theme contract', async () => {
  const theme = JSON.parse(await readFile(new URL('../src/data/themes/date-night-warm.json', import.meta.url), 'utf8'));
  assert.equal(loadTheme(theme).id, 'date-night-warm');
});
for (const slot of ['connect','predict','play','challenge','closer']) test('preview presentation remains distinct for all eight ' + slot + ' alternatives', () => {
  const game = loadDefaultGame();
  const cards = game.cards.filter(card => slot === 'closer' ? card.isCloser : !card.isCloser && card.categoryId === slot);
  assert.equal(cards.length, 8); const before = structuredClone(cards);
  const shown = cards.map(card => presentItem(card, slot));
  assert.equal(new Set(shown.map(x => x.prompt)).size, 8);
  assert.ok(shown.every(x => x.sample && !x.prompt.includes('Infrastructure fixture')));
  assert.deepEqual(cards, before);
});
test('real content text and reveal pass through unchanged', () => {
  const card = { ...loadDefaultGame().cards[0], id: 'real-connect', text: 'The actual prompt.', revealText: 'The actual reveal.' };
  assert.deepEqual(presentItem(card,'connect'), { prompt: card.text, reveal: card.revealText, sample: false });
});
test('preview presentation never introduces reveal where contract has none', () => {
  const card = loadDefaultGame().cards[0]; delete card.revealText;
  assert.equal(presentItem(card,'connect').reveal, undefined);
});
test('unknown fixture-like IDs are not silently reinterpreted', () => {
  const card = { ...loadDefaultGame().cards[0], id: 'fixture-unknown' };
  assert.equal(presentItem(card,'connect').prompt, card.text);
});
