import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadCardPack, loadGame, loadManifest, loadTheme } from '../src/engine/gameLoader.ts';
import { loadDefaultGame } from '../src/data/defaultGame.ts';

test('loads the actual default JSON files with the expected development summary', () => {
  const { manifest, cards, theme } = loadDefaultGame();
  assert.equal(manifest.name, 'Spill or Sip');
  assert.equal(manifest.edition, 'Girls Night Edition');
  assert.equal(cards.length, 125);
  assert.equal(theme.id, 'girls-night-hybrid-premium');
});

test('accepts absent optional fields and an empty card pack', () => {
  const { manifest, theme } = loadDefaultGame();
  for (const key of ['edition', 'maxPlayers', 'allowedIntensities', 'ageNotice']) {
    delete manifest[key];
  }
  assert.deepEqual(loadGame(manifest, [], theme).cards, []);
  assert.equal(Object.hasOwn(loadManifest(manifest), 'edition'), false);
});

test('accepts all optional card/media fields and target variants without running game logic', () => {
  const card = loadDefaultGame().cards[0];
  for (const type of ['none', 'current-player', 'random-player', 'all-players', 'named-player']) {
    const input = {
      ...card,
      target: type === 'named-player' ? { type, playerId: 'player-1' } : { type },
      actionIds: ['spill'], points: 1, penalty: 'Example', timerSeconds: 30,
      tags: ['example'],
      media: ['image', 'gif', 'video'].map(type => ({
        id: type, type, src: '/example', alt: 'Example',
        poster: '/poster.webp', aspectRatio: '16/9',
      })),
    };
    assert.deepEqual(loadCardPack([input]), [input]);
  }
});

const invalidCases = [
  ['missing manifest name', 'manifest', data => { delete data.name; }, /manifest.name/],
  ['wrong boolean', 'manifest', data => { data.timerEnabled = 'false'; }, /manifest.timerEnabled/],
  ['invalid turn mode', 'manifest', data => { data.turnMode = 'random'; }, /manifest.turnMode/],
  ['invalid end condition', 'manifest', data => { data.endCondition = 'forever'; }, /manifest.endCondition/],
  ['invalid intensity list', 'manifest', data => { data.allowedIntensities = ['hot']; }, /allowedIntensities\[0\]/],
  ['invalid nested config', 'manifest', data => { data.categories[0].label = 1; }, /categories\[0\].label/],
  ['null optional field', 'manifest', data => { data.edition = null; }, /manifest.edition/],
  ['non-finite number', 'manifest', data => { data.minPlayers = Infinity; }, /manifest.minPlayers/],
  ['missing card text', 'cards', data => { delete data[0].text; }, /cards\[0\].text/],
  ['invalid card type', 'cards', data => { data[0].type = 'unknown'; }, /cards\[0\].type/],
  ['invalid card intensity', 'cards', data => { data[0].intensity = 'hot'; }, /cards\[0\].intensity/],
  ['invalid active flag', 'cards', data => { data[0].active = 1; }, /cards\[0\].active/],
  ['missing target player', 'cards', data => { data[0].target = { type: 'named-player' }; }, /target.playerId/],
  ['invalid target type', 'cards', data => { data[0].target = { type: 'nobody' }; }, /target.type/],
  ['invalid optional number', 'cards', data => { data[0].timerSeconds = '30'; }, /timerSeconds/],
  ['invalid optional array', 'cards', data => { data[0].tags = [1]; }, /tags\[0\]/],
  ['invalid media type', 'cards', data => { data[0].media = [{ id: 'a', type: 'audio', src: '/a' }]; }, /media\[0\].type/],
  ['missing media source', 'cards', data => { data[0].media = [{ id: 'a', type: 'image' }]; }, /media\[0\].src/],
  ['invalid nested color', 'theme', data => { data.colors.primary = 123; }, /theme.colors.primary/],
  ['missing font', 'theme', data => { delete data.typography.bodyFont; }, /typography.bodyFont/],
  ['invalid button style', 'theme', data => { data.buttonStyle = 'round'; }, /buttonStyle/],
  ['invalid card style', 'theme', data => { data.cardStyle = 'round'; }, /cardStyle/],
];

const loaders = { manifest: loadManifest, cards: loadCardPack, theme: loadTheme };
for (const [name, kind, mutate, expected] of invalidCases) {
  test(`rejects ${name} with its field path`, () => {
    const data = loadDefaultGame()[kind];
    mutate(data);
    assert.throws(() => loaders[kind](data), expected);
  });
}

test('rejects invalid top-level shapes', () => {
  for (const value of [null, undefined, 'invalid', 42, false]) {
    for (const loader of Object.values(loaders)) assert.throws(() => loader(value));
  }
  assert.throws(() => loadManifest([]));
  assert.throws(() => loadTheme([]));
  assert.throws(() => loadCardPack({}));
});

test('rejects mismatched theme, category, and action references', () => {
  const { manifest, cards, theme } = loadDefaultGame();
  assert.throws(() => loadGame(manifest, cards, { ...theme, id: 'other' }), /themeId/);
  assert.throws(() => loadGame(manifest, [{ ...cards[0], categoryId: 'other' }], theme), /categoryId/);
  assert.throws(() => loadGame(manifest, [{ ...cards[0], actionIds: ['other'] }], theme), /actionIds/);
});

test('returns independent data and ignores extra fields without mutating inputs', () => {
  const { manifest, cards, theme } = loadDefaultGame();
  const input = { ...manifest, futureField: 'allowed' };
  const before = structuredClone({ input, cards, theme });
  const loaded = loadGame(input, cards, theme);
  assert.deepEqual({ input, cards, theme }, before);
  loaded.manifest.categories[0].label = 'Changed';
  loaded.cards[0].text = 'Changed';
  loaded.theme.colors.primary = 'Changed';
  assert.deepEqual(loadDefaultGame(), { manifest, cards, theme });
  assert.equal(Object.hasOwn(loaded.manifest, 'futureField'), false);
});
