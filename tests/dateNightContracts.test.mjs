import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from './fixtures/dateNightInfrastructure.ts';
import { loadGame } from '../src/engine/gameLoader.ts';
import { parseCard, parseCards } from '../src/engine/cardValidation.ts';
import { parseManifest } from '../src/engine/manifestValidation.ts';
import { parseQueue, parseSession } from '../src/engine/sessionValidation.ts';
import { createSession } from '../src/engine/sessionManager.ts';
import { isSessionCompatible } from '../src/engine/gameSession.ts';
import { createLocalStorageAdapter, SESSION_STORAGE_KEY } from '../src/storage/localStorageAdapter.ts';

const game = loadDefaultGame();
const configuration = { vibe: 'cozy', durationMinutes: 15, intensityCeiling: 'sweet' };
const queue = ['connect', 'predict', 'play', 'challenge', 'closer'].map((slot, i) => ({ slot, itemId: game.cards[i].id }));
function session(status = 'playing') {
  const result = createSession(game, configuration, queue);
  if (status !== 'setup') {
    result.status = status;
    result.displayedItemIds = [queue[0].itemId];
  }
  if (status === 'ended') {
    result.currentSlot = 4;
    result.displayedItemIds = queue.map(x => x.itemId);
    result.endedAt = result.startedAt;
    result.endedReason = 'completed';
  }
  return result;
}
function storageSetup(context = game) {
  const values = new Map([['social-game-engine:v1:session', 'leave untouched']]);
  const touched = [];
  const storage = {
    getItem(key) { touched.push(key); return values.get(key) ?? null; },
    setItem(key, value) { touched.push(key); values.set(key, value); },
    removeItem(key) { touched.push(key); values.delete(key); },
  };
  return { values, touched, adapter: createLocalStorageAdapter(context, () => storage) };
}

for (const intensity of ['sweet', 'flirty']) test(`card accepts ${intensity}`, () => {
  assert.equal(parseCard({ ...game.cards[0], intensity }).intensity, intensity);
});
test('card parses and retains all Date Night and supported optional metadata', () => {
  const value = { ...game.cards[0], isCloser: true, moods: ['cozy', 'funny'], revealText: 'Answer',
    actionIds: ['done'], tags: ['fixture'], media: [{ id: 'photo', type: 'image', src: '/photo.png', alt: 'Photo' }] };
  assert.deepEqual(parseCard(value), value);
});
for (const [label, change] of [
  ['mild', { intensity: 'mild' }], ['spicy', { intensity: 'spicy' }], ['wild', { intensity: 'wild' }],
  ['unknown mood', { moods: ['sad'] }], ['missing moods', { moods: undefined }],
  ['empty active moods', { moods: [] }], ['duplicate moods', { moods: ['cozy', 'cozy'] }],
  ['zero duration', { durationMinutes: 0 }], ['negative duration', { durationMinutes: -1 }],
  ['nonfinite duration', { durationMinutes: Infinity }], ['missing duration', { durationMinutes: undefined }],
  ['invalid closer', { isCloser: 'yes' }], ['missing closer', { isCloser: undefined }],
  ['invalid revealText', { revealText: 42 }], ['old category', { categoryId: 'confession' }],
  ['empty ID', { id: '' }], ['whitespace ID', { id: 'two words' }],
  ['unknown metadata', { arbitrary: true }], ['duplicate mode', { mode: 'sweet' }],
  ['legacy scoring', { points: 1 }], ['nested unknown media', { media: [{ id: 'm', type: 'image', src: '/', unknown: true }] }],
]) test(`card rejects ${label}`, () => assert.throws(() => parseCard({ ...game.cards[0], ...change })));
test('inactive card may have empty moods', () => assert.deepEqual(parseCard({ ...game.cards[0], active: false, moods: [] }).moods, []));
test('card accepts fractional positive duration', () => assert.equal(parseCard({ ...game.cards[0], durationMinutes: 0.5 }).durationMinutes, 0.5));
test('pack rejects duplicate IDs', () => assert.throws(() => parseCards([game.cards[0], game.cards[0]])));
test('manifest explicitly retains Date Night configuration', () => assert.deepEqual(parseManifest(game.manifest), game.manifest));
test('manifest rejects unsupported duration', () => assert.throws(() => parseManifest({ ...game.manifest, durations: [45] })));
test('manifest rejects unknown fields', () => assert.throws(() => parseManifest({ ...game.manifest, turnMode: 'sequential' })));
test('loader rejects unsupported manifest mood', () => assert.throws(() => loadGame(
  { ...game.manifest, vibes: ['romantic'] }, game.cards, game.theme)));

test('queue accepts exactly five compatible unique items including category-bearing closer', () => {
  assert.deepEqual(parseQueue(queue, game.cards), queue);
  assert.equal(game.cards[4].categoryId, 'connect');
});
for (const [label, mutate] of [
  ['four entries', q => q.pop()], ['six entries', q => q.push(q[4])],
  ['wrong order', q => [q[0], q[1]] = [q[1], q[0]]],
  ['duplicate IDs', q => q[1].itemId = q[0].itemId],
  ['unknown reference', q => q[0].itemId = 'missing'],
  ['category mismatch', q => q[0].itemId = game.cards[1].id],
  ['unknown slot', q => q[4].slot = 'end'],
  ['unknown entry metadata', q => q[0].card = game.cards[0]],
]) test(`queue rejects ${label}`, () => {
  const q = structuredClone(queue); mutate(q); assert.throws(() => parseQueue(q, game.cards));
});
for (const [label, index, change] of [
  ['early closer', 0, { isCloser: true }], ['noncloser last', 4, { isCloser: false }],
  ['inactive reference', 2, { active: false }], ['invalid closer category', 4, { categoryId: 'closer' }],
  ['invalid closer mood', 4, { moods: [] }],
]) test(`queue rejects ${label}`, () => {
  const cards = structuredClone(game.cards); Object.assign(cards[index], change);
  assert.throws(() => parseQueue(queue, cards));
});

for (const status of ['setup', 'playing', 'ended']) test(`session accepts ${status}`, () => {
  const s = session(status); assert.deepEqual(parseSession(s, game), s);
});
test('session accepts cancelled ending at current item with persisted reveal', () => {
  const s = { ...session(), status: 'ended', endedAt: new Date().toISOString(), endedReason: 'cancelled', revealState: 'revealed' };
  assert.deepEqual(parseSession(s, game), s);
});
test('session defaults absent reveal state to hidden', () => {
  const s = session(); delete s.revealState; assert.equal(parseSession(s, game).revealState, 'hidden');
});
test('session accepts all supported configuration values', () => {
  for (const vibe of game.manifest.vibes) for (const durationMinutes of [15, 30]) for (const intensityCeiling of ['sweet', 'flirty']) {
    assert.deepEqual(parseSession({ ...session(), configuration: { vibe, durationMinutes, intensityCeiling } }, game).configuration,
      { vibe, durationMinutes, intensityCeiling });
  }
});
for (const [label, mutate] of [
  ['negative currentSlot', s => s.currentSlot = -1], ['large currentSlot', s => s.currentSlot = 5],
  ['fractional currentSlot', s => s.currentSlot = 0.5], ['invalid reveal', s => s.revealState = 'open'],
  ['invalid vibe', s => s.configuration.vibe = 'wild'], ['invalid duration', s => s.configuration.durationMinutes = 20],
  ['old intensity ceiling', s => s.configuration.intensityCeiling = 'mild'],
  ['unknown config metadata', s => s.configuration.selectedCategoryIds = []],
  ['stale schema', s => s.schemaVersion = 2], ['missing schema', s => delete s.schemaVersion],
  ['missing reference', s => s.queue[0].itemId = 'missing'],
  ['duplicate displayed history', s => s.displayedItemIds.push(s.displayedItemIds[0])],
  ['duplicate swapped history', s => s.swappedItemIds = ['retired', 'retired']],
  ['malformed history ID', s => s.displayedItemIds.push(' ')],
  ['unknown history ID', s => s.displayedItemIds.push('missing')],
  ['swapped queue member', s => s.swappedItemIds = [s.queue[0].itemId]],
  ['swapped without display', s => s.swappedItemIds = ['retired']],
  ['missing current display', s => s.displayedItemIds = []],
  ['future display', s => s.displayedItemIds.push(s.queue[1].itemId)],
  ['premature completed ending', s => { s.status = 'ended'; s.endedReason = 'completed'; s.endedAt = s.startedAt; }],
  ['ended without reason', s => { s.status = 'ended'; s.endedAt = s.startedAt; }],
  ['playing with endedAt', s => s.endedAt = s.startedAt],
  ['setup with progress', s => s.status = 'setup'],
  ['unknown session metadata', s => s.playerStats = {}],
  ['legacy currentCardId', s => s.currentCardId = s.queue[0].itemId],
  ['invalid timestamp', s => s.startedAt = 'yesterday'],
  ['invalid calendar date', s => s.startedAt = '2026-02-30T10:00:00Z'],
]) test(`session rejects ${label}`, () => {
  const s = session(); mutate(s); assert.throws(() => parseSession(s, game));
});
test('history accepts a displayed retired item outside the queue', () => {
  const retired = { ...game.cards[0], id: 'retired' };
  const context = { ...game, cards: [...game.cards, retired] };
  const s = session(); s.displayedItemIds.unshift('retired'); s.swappedItemIds.push('retired');
  assert.deepEqual(parseSession(s, context), s);
});
test('history rejects unaccounted retired display', () => {
  const context = { ...game, cards: [...game.cards, { ...game.cards[0], id: 'retired' }] };
  const s = session(); s.displayedItemIds.push('retired');
  assert.throws(() => parseSession(s, context));
});
test('compatibility safely rejects malformed and stale sessions', () => {
  assert.equal(isSessionCompatible(null, game), false);
  assert.equal(isSessionCompatible({ ...session(), gameVersion: 'old' }, game), false);
  assert.equal(isSessionCompatible(session(), game), true);
});

test('storage round trips stable IDs with no full card objects and leaves Social Game key untouched', () => {
  const { values, touched, adapter } = storageSetup(); const s = session();
  assert.equal(SESSION_STORAGE_KEY, 'date-night-engine:v1:session');
  assert.equal(adapter.saveSession(s), true); assert.deepEqual(adapter.loadSession(), s);
  assert.deepEqual(JSON.parse(values.get(SESSION_STORAGE_KEY)), s);
  assert.equal(adapter.removeSession(), true);
  assert.equal(values.get('social-game-engine:v1:session'), 'leave untouched');
  assert.ok(touched.every(key => key === SESSION_STORAGE_KEY));
});
test('storage does not read legacy saves when Date Night save is absent', () => assert.equal(storageSetup().adapter.loadSession(), null));
test('storage rejects and clears corrupt JSON', () => {
  const { values, adapter } = storageSetup(); values.set(SESSION_STORAGE_KEY, '{bad');
  assert.equal(adapter.loadSession(), null); assert.equal(values.has(SESSION_STORAGE_KEY), false);
});
for (const [label, mutate] of [
  ['game ID', s => s.gameId = 'other'], ['game version', s => s.gameVersion = 'old'],
  ['schema version', s => s.schemaVersion = 99], ['unknown item', s => s.queue[0].itemId = 'missing'],
  ['duplicate queue', s => s.queue[1].itemId = s.queue[0].itemId],
  ['wrong order', s => s.queue.reverse()], ['noncloser last', s => s.queue[4].itemId = s.queue[0].itemId],
  ['invalid config', s => s.configuration.durationMinutes = 45],
  ['invalid history', s => s.swappedItemIds = ['missing']],
]) test(`storage rejects and clears incompatible ${label}`, () => {
  const { values, adapter } = storageSetup(); const s = session(); mutate(s);
  values.set(SESSION_STORAGE_KEY, JSON.stringify(s));
  assert.equal(adapter.loadSession(), null); assert.equal(values.has(SESSION_STORAGE_KEY), false);
});
test('storage rejects queue item deactivated since save', () => {
  const context = structuredClone(game); context.cards[0].active = false;
  const { values, adapter } = storageSetup(context); values.set(SESSION_STORAGE_KEY, JSON.stringify(session()));
  assert.equal(adapter.loadSession(), null); assert.equal(values.has(SESSION_STORAGE_KEY), false);
});
test('invalid save preserves previous valid data', () => {
  const { adapter } = storageSetup(); const s = session(); assert.equal(adapter.saveSession(s), true);
  assert.equal(adapter.saveSession({ ...s, schemaVersion: 2 }), false); assert.deepEqual(adapter.loadSession(), s);
});
for (const operation of ['access', 'getItem', 'setItem', 'removeItem']) test(`storage denied at ${operation} never crashes`, () => {
  const adapter = createLocalStorageAdapter(game, () => {
    if (operation === 'access') throw new Error('denied');
    return {
      getItem() { if (operation === 'getItem') throw new Error('denied'); return '{bad'; },
      setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); },
    };
  });
  assert.equal(adapter.loadSession(), null); assert.equal(adapter.saveSession(session()), false);
  assert.equal(adapter.removeSession(), false);
});
