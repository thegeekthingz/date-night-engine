import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from './fixtures/dateNightInfrastructure.ts';
import { buildSlotPools, checkCompositionCoverage, composeSession, DURATION_BUDGETS,
  getQueueDuration, selectReplacementForSlot } from '../src/engine/sessionComposer.ts';
import { restoreDateNight, startDateNight } from '../src/engine/sessionStart.ts';
import { createSession } from '../src/engine/sessionManager.ts';
import { parseQueue, parseSession } from '../src/engine/sessionValidation.ts';
import { createLocalStorageAdapter, SESSION_STORAGE_KEY } from '../src/storage/localStorageAdapter.ts';

const slots = ['connect', 'predict', 'play', 'challenge', 'closer'];
const config = { vibe: 'cozy', durationMinutes: 15, intensityCeiling: 'sweet' };
function smallGame() { const game = loadDefaultGame(); game.cards = game.cards.slice(0, 5); return game; }
function add(game, index = 0, changes = {}) {
  const card = { ...structuredClone(game.cards[index]), id: `alternative-${game.cards.length}`, ...changes };
  game.cards.push(card); return card;
}
function memory(context) {
  const values = new Map([['social-game-engine:v1:session', 'untouched']]);
  const calls = [];
  const adapter = createLocalStorageAdapter(context, () => ({
    getItem: key => { calls.push(['read', key]); return values.get(key) ?? null; },
    setItem: (key, value) => { calls.push(['save', key]); values.set(key, value); },
    removeItem: key => { calls.push(['remove', key]); values.delete(key); },
  }));
  return { values, calls, adapter };
}
function playing(game, configuration = config, index = 0) {
  const result = composeSession(game, configuration, () => 0.99999);
  assert.equal(result.ok, true);
  const setup = createSession(game, configuration, result.queue);
  return parseSession({ ...setup, status: 'playing', currentSlot: index,
    displayedItemIds: result.queue.slice(0, index + 1).map(x => x.itemId) }, game);
}
function pool(game, configuration = config) {
  const result = buildSlotPools(game, configuration); assert.equal(result.ok, true); return result.pools;
}
function seeded(seed) {
  return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 2 ** 32; };
}

test('sweet ceiling excludes flirty items', () => {
  const game = smallGame(); const alternative = add(game, 0, { intensity: 'flirty' });
  assert.ok(!pool(game).connect.some(x => x.id === alternative.id));
});
test('flirty ceiling includes both sweet and flirty', () => {
  const game = smallGame(); const alternative = add(game, 0, { intensity: 'flirty' });
  const ids = pool(game, { ...config, intensityCeiling: 'flirty' }).connect.map(x => x.id);
  assert.deepEqual(ids, [game.cards[0].id, alternative.id]);
});
test('vibe membership includes multiple moods without widening', () => {
  const game = smallGame();
  const multi = add(game, 0, { moods: ['cozy', 'romantic'] });
  const wrong = add(game, 0, { moods: ['funny', 'competitive'] });
  const ids = pool(game, { ...config, vibe: 'romantic' }).connect.map(x => x.id);
  assert.ok(ids.includes(multi.id)); assert.ok(!ids.includes(wrong.id));
});
test('inactive cards are excluded', () => {
  const game = smallGame(); const inactive = add(game, 0, { active: false });
  assert.ok(!pool(game).connect.some(x => x.id === inactive.id));
});
test('closer is excluded from ordinary activity pool even with connect category', () => {
  const game = smallGame(); assert.deepEqual(pool(game).connect.map(x => x.id), [game.cards[0].id]);
  assert.deepEqual(pool(game).closer.map(x => x.id), [game.cards[4].id]);
});
test('ordinary activity never enters closer-only pool', () => {
  const game = smallGame(); add(game, 0); assert.ok(pool(game).closer.every(x => x.isCloser));
});
test('composition validates a unique, ordered, category-compatible five-slot recipe', () => {
  const game = loadDefaultGame(); const before = structuredClone(game);
  const result = composeSession(game, config, seeded(7)); assert.equal(result.ok, true);
  assert.deepEqual(result.queue.map(x => x.slot), slots);
  assert.equal(new Set(result.queue.map(x => x.itemId)).size, 5);
  assert.deepEqual(parseQueue(result.queue, game.cards), result.queue);
  for (const [index, entry] of result.queue.entries()) {
    const card = game.cards.find(x => x.id === entry.itemId);
    assert.equal(card.isCloser, index === 4);
    if (index < 4) assert.equal(card.categoryId, entry.slot);
  }
  assert.deepEqual(game, before);
});
for (const durationMinutes of [15, 30]) test(`${durationMinutes}-minute fixture hits target within policy`, () => {
  const game = loadDefaultGame(); const result = composeSession(game, { ...config, durationMinutes }, seeded(2));
  assert.equal(result.ok, true); assert.equal(result.totalDurationMinutes, durationMinutes);
  assert.equal(getQueueDuration(result.queue, game), result.totalDurationMinutes);
});
test('target preference beats an earlier valid but less suitable recipe', () => {
  const game = smallGame(); game.cards[0].durationMinutes = 2;
  const exact = add(game, 0, { durationMinutes: 3 });
  const result = composeSession(game, config, () => 0.99);
  assert.equal(result.ok, true); assert.equal(result.queue[0].itemId, exact.id);
  assert.equal(result.totalDurationMinutes, 15);
});
test('all closer choices are explored before declaring duration unavailable', () => {
  const game = smallGame(); game.cards[4].durationMinutes = 100;
  const valid = add(game, 4, { durationMinutes: 3 });
  const result = composeSession(game, config, () => 0.99);
  assert.equal(result.ok, true); assert.equal(result.queue[4].itemId, valid.id);
});
test('injected seeded RNG makes composition deterministic', () => {
  const game = loadDefaultGame();
  assert.deepEqual(composeSession(game, config, seeded(42)), composeSession(game, config, seeded(42)));
});
test('RNG breaks equal-target ties without changing pacing', () => {
  const game = smallGame(); const alternative = add(game);
  const first = composeSession(game, config, () => 0.99);
  const last = composeSession(game, config, () => 0);
  assert.equal(first.queue[0].itemId, game.cards[0].id); assert.equal(last.queue[0].itemId, alternative.id);
  assert.equal(first.totalDurationMinutes, last.totalDurationMinutes);
});
test('finite search calls RNG at most once per tied leaf, never retries constant RNG', () => {
  const game = smallGame(); for (let i = 0; i < 5; i++) add(game, i);
  let calls = 0;
  const result = composeSession(game, config, () => { calls++; return 0; });
  assert.equal(result.ok, true); assert.equal(calls, 2 ** 5 - 1);
});
for (const invalid of [-0.1, 1, NaN, Infinity]) test(`invalid injected RNG ${invalid} throws on tie`, () => {
  const game = smallGame(); add(game); assert.throws(() => composeSession(game, config, () => invalid), /random/);
});
for (const [index, slot] of slots.entries()) test(`controlled missing_${slot} failure`, () => {
  const game = smallGame(); game.cards.splice(index, 1);
  assert.deepEqual(composeSession(game, config), { ok: false, reason: `missing_${slot}` });
});
test('missing vibe coverage never silently widens', () => {
  const game = smallGame(); game.cards[0].moods = ['funny'];
  assert.deepEqual(composeSession(game, config), { ok: false, reason: 'missing_connect' });
});
test('all-flirty connect cannot satisfy sweet ceiling', () => {
  const game = smallGame(); game.cards[0].intensity = 'flirty';
  assert.deepEqual(composeSession(game, config), { ok: false, reason: 'missing_connect' });
});
for (const durationMinutes of [15, 30]) test(`impossible duration for ${durationMinutes} returns explicit failure without RNG`, () => {
  const game = smallGame(); for (const card of game.cards) card.durationMinutes = 100;
  assert.deepEqual(composeSession(game, { ...config, durationMinutes }, () => { throw new Error('must not randomize'); }),
    { ok: false, reason: 'duration_unavailable' });
});
test('35-minute recipe is never accepted for 15 minutes', () => {
  const game = smallGame(); game.cards.forEach(card => card.durationMinutes = 7);
  assert.deepEqual(composeSession(game, config), { ok: false, reason: 'duration_unavailable' });
});
test('duplicate pack IDs cannot produce a valid unique recipe', () => {
  const game = smallGame(); game.cards[1].id = game.cards[0].id;
  assert.deepEqual(composeSession(game, config), { ok: false, reason: 'no_valid_recipe' });
});
test('invalid card metadata is a contract error, not missing content', () => {
  const game = smallGame(); game.cards[0].intensity = 'mild'; assert.throws(() => composeSession(game, config));
});
test('unsupported configuration is a contract error', () => {
  assert.throws(() => composeSession(smallGame(), { ...config, durationMinutes: 20 }));
});
test('duration search detects gaps even when pool min/max bounds overlap the budget', () => {
  const game = smallGame(); game.cards.forEach(card => card.durationMinutes = 1);
  add(game, 4, { durationMinutes: 20 });
  assert.deepEqual(composeSession(game, config), { ok: false, reason: 'duration_unavailable' });
});
test('closest-target result agrees with independent exhaustive totals for fractional durations', () => {
  const game = smallGame();
  const options = [[1.5, 4.5], [2, 7], [1, 3.5], [1, 4], [2, 6]];
  options.forEach(([first, second], i) => {
    game.cards[i].durationMinutes = first; add(game, i, { durationMinutes: second });
  });
  const totals = options.reduce((sums, durations) => sums.flatMap(sum => durations.map(n => sum + n)), [0]);
  for (const durationMinutes of [15, 30]) {
    const budget = DURATION_BUDGETS[durationMinutes];
    const expected = Math.min(...totals.filter(n => n >= budget.min && n <= budget.max).map(n => Math.abs(n - durationMinutes)));
    const result = composeSession(game, { ...config, durationMinutes }, seeded(4));
    assert.equal(result.ok, true); assert.equal(Math.abs(result.totalDurationMinutes - durationMinutes), expected);
  }
});
test('fractional totals are identical during composition, replacement and after restore', () => {
  const game = smallGame();
  [0.1, 0.2, 0.3, 0.4, 14].forEach((duration, i) => game.cards[i].durationMinutes = duration);
  const { adapter } = memory(game);
  const result = startDateNight(game, config, adapter);
  assert.equal(result.ok, true);
  assert.equal(result.totalDurationMinutes, getQueueDuration(result.session.queue, game));
  assert.equal(result.totalDurationMinutes, getQueueDuration(restoreDateNight(game, adapter).queue, game));
  add(game, 0, { durationMinutes: 0.2 });
  const replacement = selectReplacementForSlot(game, result.session);
  assert.equal(replacement.ok, true);
  assert.equal(replacement.totalDurationMinutes, getQueueDuration(replacement.queue, game));
});
test('72-item fixture terminates with constant RNG without retrying tied solutions', () => {
  const game = smallGame(); const base = structuredClone(game.cards);
  game.cards = base.flatMap((card, i) => Array.from({ length: i < 2 ? 15 : 14 }, (_, j) =>
    ({ ...card, id: `scale-${i}-${j}` })));
  assert.equal(game.cards.length, 72);
  let calls = 0;
  const result = composeSession(game, config, () => { calls++; return 0; });
  assert.equal(result.ok, true); assert.equal(result.totalDurationMinutes, 15);
  assert.equal(calls, 15 * 15 * 14 * 14 * 14 - 1);
});
for (const [durationMinutes, total, accepted] of [
  [15, 10, true], [15, 18, true], [15, 9, false], [15, 19, false],
  [30, 20, true], [30, 35, true], [30, 19, false], [30, 36, false],
]) test(`budget ${durationMinutes}: aggregate ${total} is ${accepted ? 'accepted' : 'rejected'}`, () => {
  const game = smallGame(); game.cards.forEach(card => card.durationMinutes = 1);
  game.cards[4].durationMinutes = total - 4;
  const result = composeSession(game, { ...config, durationMinutes }); assert.equal(result.ok, accepted);
  if (accepted) assert.equal(result.totalDurationMinutes, total);
});

test('start saves full valid playing queue before caller can render Play', () => {
  const game = smallGame(); let saved;
  const storage = { saveSession(s) {
    saved = structuredClone(s); assert.equal(s.queue.length, 5); assert.equal(s.currentSlot, 0);
    assert.equal(s.status, 'playing'); assert.deepEqual(s.displayedItemIds, [s.queue[0].itemId]);
    assert.deepEqual(parseSession(s, game), s); return true;
  }, loadSession() { return null; } };
  const result = startDateNight(game, config, storage);
  assert.equal(result.ok, true); assert.deepEqual(result.session, saved);
  assert.equal(result.session.revealState, 'hidden');
});
test('start refuses to expose Play when persistence fails', () => {
  const game = smallGame(); const result = startDateNight(game, config, {
    saveSession() { return false; }, loadSession() { return null; },
  });
  assert.deepEqual(result, { ok: false, reason: 'storage_unavailable' });
});
test('composition failure does not write or destroy previous storage', () => {
  const game = smallGame(); game.cards.pop(); let writes = 0;
  const result = startDateNight(game, config, { saveSession() { writes++; return true; }, loadSession() { return null; } });
  assert.deepEqual(result, { ok: false, reason: 'missing_closer' }); assert.equal(writes, 0);
});
test('complete queue round trips and repeated refresh restores exact IDs, order, closer and duration', () => {
  const game = loadDefaultGame(); const { adapter, values, calls } = memory(game);
  const result = startDateNight(game, config, adapter, seeded(22)); assert.equal(result.ok, true);
  const before = values.get(SESSION_STORAGE_KEY);
  for (let i = 0; i < 4; i++) {
    const restored = restoreDateNight(game, adapter);
    assert.deepEqual(restored, result.session);
    assert.equal(getQueueDuration(restored.queue, game), result.totalDurationMinutes);
  }
  assert.equal(values.get(SESSION_STORAGE_KEY), before);
  assert.equal(calls.filter(x => x[0] === 'save').length, 1);
  assert.equal(values.get('social-game-engine:v1:session'), 'untouched');
});
test('restore does not invoke Math.random or save', () => {
  const game = smallGame(); const s = playing(game);
  const original = Math.random;
  try {
    Math.random = () => { throw new Error('restore rerolled'); };
    const restored = restoreDateNight(game, { loadSession: () => s, saveSession() { throw new Error('unexpected save'); } });
    assert.deepEqual(restored, s);
  } finally { Math.random = original; }
});
test('missing save restores null without composing', () => {
  assert.equal(restoreDateNight(smallGame(), { loadSession: () => null, saveSession: () => false }), null);
});

for (const [index, slot] of slots.entries()) test(`swap ${slot} preserves family, other four entries, inputs and canonical queue`, () => {
  const game = smallGame(); const s = playing(game, config, index);
  const alternative = add(game, index, slot === 'closer' ? { categoryId: 'challenge' } : {});
  const before = structuredClone({ s, game });
  const result = selectReplacementForSlot(game, s, index, () => 0);
  assert.equal(result.ok, true); assert.equal(result.replacementItemId, alternative.id);
  assert.equal(result.retiredItemId, s.queue[index].itemId);
  for (let i = 0; i < 5; i++) {
    if (i !== index) assert.deepEqual(result.queue[i], s.queue[i]);
    else assert.deepEqual(result.queue[i], { slot, itemId: alternative.id });
  }
  assert.deepEqual(parseQueue(result.queue, game.cards), result.queue);
  assert.deepEqual({ s, game }, before);
});
test('default swap slot is current slot', () => {
  const game = smallGame(); const s = playing(game, config, 2); const alternative = add(game, 2);
  assert.equal(selectReplacementForSlot(game, s).replacementItemId, alternative.id);
});
test('explicit future-slot selection does not invent displayed/swapped history', () => {
  const game = smallGame(); const s = playing(game); const alternative = add(game, 2);
  const result = selectReplacementForSlot(game, s, 2);
  assert.equal(result.ok, true); assert.equal(result.replacementItemId, alternative.id);
  assert.deepEqual(s.displayedItemIds, [s.queue[0].itemId]); assert.deepEqual(s.swappedItemIds, []);
});
test('swap excludes wrong vibe, flirty above ceiling, inactive and early closer alternatives', () => {
  const game = smallGame(); const s = playing(game);
  add(game, 0, { moods: ['romantic'] }); add(game, 0, { intensity: 'flirty' });
  add(game, 0, { active: false }); add(game, 0, { isCloser: true });
  const valid = add(game); assert.equal(selectReplacementForSlot(game, s).replacementItemId, valid.id);
});
test('flirty swap can choose sweet as well as flirty alternatives', () => {
  const game = smallGame(); const s = playing(game, { ...config, intensityCeiling: 'flirty' });
  const sweet = add(game); const flirty = add(game, 0, { intensity: 'flirty' });
  assert.equal(selectReplacementForSlot(game, s, 0, () => 0.99).replacementItemId, sweet.id);
  assert.equal(selectReplacementForSlot(game, s, 0, () => 0).replacementItemId, flirty.id);
});
test('swap rejects replacements that push aggregate outside budget', () => {
  const game = smallGame(); const s = playing(game); add(game, 0, { durationMinutes: 100 });
  assert.deepEqual(selectReplacementForSlot(game, s), { ok: false, reason: 'no_replacement' });
});
test('swap prefers replacement closest to target duration', () => {
  const game = smallGame(); const s = playing(game);
  add(game, 0, { durationMinutes: 5 }); const exact = add(game, 0, { durationMinutes: 3 });
  const result = selectReplacementForSlot(game, s); assert.equal(result.replacementItemId, exact.id);
  assert.equal(result.totalDurationMinutes, 15);
});
test('30-minute swap preserves the longer budget', () => {
  const game = smallGame(); game.cards.forEach(card => card.durationMinutes = 6);
  const s = playing(game, { ...config, durationMinutes: 30 }); add(game, 0, { durationMinutes: 0.5 });
  const result = selectReplacementForSlot(game, s); assert.equal(result.ok, true);
  assert.equal(result.totalDurationMinutes, 24.5);
});
test('swap excludes all current queued IDs, including the retired item', () => {
  const game = smallGame(); const s = playing(game); const before = structuredClone(s);
  assert.deepEqual(selectReplacementForSlot(game, s), { ok: false, reason: 'no_replacement' });
  assert.deepEqual(s, before);
});
test('swap excludes displayed and swapped IDs and preserves representable retirement history', () => {
  const game = smallGame(); const retired = add(game); const fresh = add(game);
  const s = playing(game); s.displayedItemIds.push(retired.id); s.swappedItemIds.push(retired.id);
  const result = selectReplacementForSlot(game, s); assert.equal(result.ok, true);
  assert.equal(result.replacementItemId, fresh.id);
  const applied = parseSession({ ...s, queue: result.queue, revealState: 'hidden',
    displayedItemIds: [...s.displayedItemIds, fresh.id], swappedItemIds: [...s.swappedItemIds, result.retiredItemId] }, game);
  assert.ok(applied.displayedItemIds.includes(result.retiredItemId));
  assert.ok(applied.swappedItemIds.includes(result.retiredItemId));
  assert.deepEqual(selectReplacementForSlot(game, applied), { ok: false, reason: 'no_replacement' });
});
test('closer swap cannot choose a noncloser of any activity category', () => {
  const game = smallGame(); const s = playing(game, config, 4); add(game, 0); add(game, 3);
  assert.deepEqual(selectReplacementForSlot(game, s), { ok: false, reason: 'no_replacement' });
});
test('no replacement never mutates the session or removes a slot', () => {
  const game = smallGame(); const s = playing(game); const before = structuredClone(s);
  assert.deepEqual(selectReplacementForSlot(game, s), { ok: false, reason: 'no_replacement' });
  assert.deepEqual(s, before); assert.equal(s.queue.length, 5);
});
test('swap RNG is deterministic and invalid indices are rejected', () => {
  const game = loadDefaultGame(); const s = playing(game);
  assert.deepEqual(selectReplacementForSlot(game, s, 0, seeded(2)), selectReplacementForSlot(game, s, 0, seeded(2)));
  for (const index of [-1, 5, 0.5]) assert.throws(() => selectReplacementForSlot(game, s, index));
});
test('swap rejects a setup session', () => {
  const game = smallGame(); const composed = composeSession(game, config);
  assert.throws(() => selectReplacementForSlot(game, createSession(game, config, composed.queue)));
});

for (const vibe of ['cozy', 'funny', 'romantic', 'competitive']) for (const durationMinutes of [15, 30]) {
  for (const intensityCeiling of ['sweet', 'flirty']) test(`coverage ${vibe}/${durationMinutes}/${intensityCeiling}`, () => {
    const game = loadDefaultGame(); const configuration = { vibe, durationMinutes, intensityCeiling };
    const result = composeSession(game, configuration, seeded(17)); assert.equal(result.ok, true);
    const budget = DURATION_BUDGETS[durationMinutes];
    assert.ok(result.totalDurationMinutes >= budget.min && result.totalDurationMinutes <= budget.max);
    assert.deepEqual(parseQueue(result.queue, game.cards), result.queue);
    const s = playing(game, configuration); assert.deepEqual(parseSession(s, game), s);
    assert.equal(game.cards.find(card => card.id === result.queue[4].itemId).isCloser, true);
    for (let slot = 0; slot < 5; slot++) assert.equal(selectReplacementForSlot(game, s, slot, seeded(4)).ok, true);
  });
}
test('coverage helper reports exactly the 16 supported configurations', () => {
  const results = checkCompositionCoverage(loadDefaultGame(), seeded(11)); assert.equal(results.length, 16);
  assert.equal(new Set(results.map(x => JSON.stringify(x.configuration))).size, 16);
  assert.ok(results.every(x => x.result.ok));
});
test('coverage helper exposes intentionally incomplete fixture failures', () => {
  const game = smallGame(); game.cards[0].moods = ['cozy'];
  const results = checkCompositionCoverage(game, () => 0.5);
  assert.ok(results.some(x => !x.result.ok && x.result.reason === 'missing_connect'));
});
