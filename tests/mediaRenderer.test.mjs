import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readdir, stat } from 'node:fs/promises';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import mediaCards from './fixtures/media-cards.json' with { type: 'json' };
import { loadCardPack } from '../src/legacy/engine/gameLoader.ts';
const fixtureCards = () => loadCardPack(mediaCards);

let server, MediaRenderer, GameCard;
before(async () => {
  server = await createServer({ server: { middlewareMode: true, hmr: false }, appType: 'custom' });
  MediaRenderer = (await server.ssrLoadModule('/src/components/MediaRenderer.tsx')).default;
  GameCard = (await server.ssrLoadModule('/src/components/GameCard.tsx')).default;
});
after(async () => { await server?.close(); });
const render = assets => renderToStaticMarkup(createElement(MediaRenderer, { assets }));

test('text-only card keeps its prompt and renders no media elements', () => {
  const card = fixtureCards()[3];
  const html = renderToStaticMarkup(createElement(GameCard, { card, category: 'Example' }));
  assert.ok(html.includes(card.text));
  assert.doesNotMatch(html, /<img|<video|preload/);
  assert.equal(render(undefined), '');
  assert.equal(render([]), '');
});

for (const type of ['image', 'gif']) {
  test(`${type} uses a lazy asynchronously decoded image with alternative text`, () => {
    const html = render([{ id: 'test', type, src: `/media/test.${type}`, alt: 'Example' }]);
    assert.match(html, /<img/);
    assert.match(html, /loading="lazy"/);
    assert.match(html, /decoding="async"/);
    assert.match(html, /alt="Example"/);
    assert.doesNotMatch(html, /<link|<video/);
  });
}

test('video is muted, has controls/poster, and neither preloads nor autoplays', () => {
  const html = render(fixtureCards()[2].media);
  assert.match(html, /<video/);
  assert.match(html, /controls=""/);
  assert.match(html, /muted=""/);
  assert.match(html, /playsInline=""/);
  assert.match(html, /preload="none"/);
  assert.match(html, /poster="\/media\/sample-image.webp"/);
  assert.doesNotMatch(html, /autoPlay|autoplay|<link/);
});

test('empty/missing URLs and unsupported types render a safe fallback', () => {
  for (const asset of [
    { id: 'a', type: 'image', src: '' }, { id: 'a', type: 'gif', src: ' ' },
    { id: 'a', type: 'video' }, { id: 'a', type: 'audio', src: '/media/test' },
  ]) {
    const html = render([asset]);
    assert.match(html, /Media unavailable/);
    assert.doesNotMatch(html, /<img|<video/);
  }
});

test('exactly three small local assets are referenced by three of five cards', async () => {
  const cards = fixtureCards();
  assert.equal(cards.length, 5);
  assert.equal(cards.filter(card => !card.media).length, 2);
  assert.deepEqual(cards.flatMap(card => card.media ?? []).map(asset => asset.type).sort(), ['gif', 'image', 'video']);
  const files = await readdir('public/media');
  for (const filename of ['sample-image.webp', 'sample-animation.gif', 'sample-video.mp4']) {
    assert.ok(files.includes(filename), `Missing expected media asset: ${filename}`);
  }
  assert.equal(files.some(filename => filename.endsWith('.test-backup')), false);
  for (const asset of cards.flatMap(card => card.media ?? [])) {
    const size = (await stat(`public${asset.src}`)).size;
    assert.ok(size > 0 && size < 100_000, `${asset.src} should remain below 100 KB`);
  }
});
