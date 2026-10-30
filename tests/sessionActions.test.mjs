import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from './fixtures/dateNightInfrastructure.ts';
import { applySessionAction, getProgress, hasReveal } from '../src/engine/sessionActions.ts';
import { createGameplayController } from '../src/engine/gameplayController.ts';
import { startDateNight } from '../src/engine/sessionStart.ts';
import { parseSession } from '../src/engine/sessionValidation.ts';
import { createLocalStorageAdapter, SESSION_STORAGE_KEY } from '../src/storage/localStorageAdapter.ts';

const config = { vibe: 'cozy', durationMinutes: 15, intensityCeiling: 'sweet' };
const inputs = { at: '2099-01-01T00:00:00.000Z', random: () => 0.99 };
function gameFixture() {
  const game = loadDefaultGame();
  game.cards = game.cards.map(card => ({ ...card, revealText: `Reveal ${card.id}` }));
  return game;
}
function storageFixture(game) {
  const values = new Map([['social-game-engine:v1:session', 'girls save'], ['unrelated', 'keep']]);
  const writes = [];
  const control = { failWrite: false, failRemove: false };
  const adapter = createLocalStorageAdapter(game, () => ({
    getItem: key => values.get(key) ?? null,
    setItem(key, value) {
      if (control.failWrite) throw new Error('denied');
      writes.push(['save', key]); values.set(key, value);
    },
    removeItem(key) {
      if (control.failRemove) throw new Error('denied');
      writes.push(['remove', key]); values.delete(key);
    },
  }));
  return { adapter, values, writes, control };
}
function sessionAt(game, index = 0) {
  const result = startDateNight(game, config, { saveSession: () => true, loadSession: () => null }, inputs.random);
  assert.equal(result.ok, true);
  return parseSession({ ...result.session, currentSlot: index,
    displayedItemIds: result.session.queue.slice(0, index + 1).map(x => x.itemId) }, game);
}
function apply(game, s, action) { return applySessionAction(game, s, action, inputs); }
function setup(index = 0, endedReason) {
  const game = gameFixture(); let s = sessionAt(game, index);
  if (endedReason) s = { ...s, status: 'ended', endedReason, endedAt: inputs.at };
  const store = storageFixture(game); assert.equal(store.adapter.saveSession(s), true);
  const controller = createGameplayController(game, store.adapter, { random: inputs.random, now: () => inputs.at });
  return { game, s, store, controller };
}
function dispatch(controller, action) { return controller.perform(action, controller.getState().revision); }

for (let slot = 0; slot < 4; slot++) test(`Done ${slot} advances exactly one, preserves queue/config and adds display once`, () => {
  const game = gameFixture(); const s = { ...sessionAt(game, slot), revealState: 'revealed' };
  const before = structuredClone(s); const result = apply(game, s, { type: 'done' }); assert.equal(result.ok, true);
  assert.equal(result.session.currentSlot, slot + 1); assert.equal(result.session.status, 'playing');
  assert.equal(result.session.revealState, 'hidden');
  assert.deepEqual(result.session.queue, s.queue); assert.deepEqual(result.session.configuration, s.configuration);
  assert.deepEqual(result.session.displayedItemIds, [...s.displayedItemIds, s.queue[slot + 1].itemId]);
  assert.equal(new Set(result.session.displayedItemIds).size, result.session.displayedItemIds.length);
  assert.deepEqual(s, before); assert.deepEqual(parseSession(result.session, game), result.session);
});
test('final Done ends completed without advancing or discarding final queue/history', () => {
  const game = gameFixture(); const s = { ...sessionAt(game, 4), revealState: 'revealed' };
  const result = apply(game, s, { type: 'done' }); assert.equal(result.ok, true);
  assert.equal(result.session.currentSlot, 4); assert.equal(result.session.status, 'ended');
  assert.equal(result.session.endedReason, 'completed'); assert.equal(result.session.endedAt, inputs.at);
  assert.equal(result.session.revealState, 'hidden'); assert.deepEqual(result.session.queue, s.queue);
  assert.deepEqual(result.session.displayedItemIds, s.displayedItemIds);
  assert.deepEqual(getProgress(result.session), { ordinal: 5, completed: 5, total: 5 });
});
test('Reveal changes only reveal state, not queue/history/configuration/progress', () => {
  const game = gameFixture(); const s = sessionAt(game, 1); const result = apply(game, s, { type: 'reveal' });
  assert.equal(result.ok, true); assert.deepEqual(result.session, { ...s, revealState: 'revealed' });
  assert.deepEqual(getProgress(result.session), getProgress(s)); assert.equal(s.revealState, 'hidden');
});
test('repeat Reveal is an explicit harmless no-op', () => {
  const game = gameFixture(); const s = { ...sessionAt(game), revealState: 'revealed' };
  const result = apply(game, s, { type: 'reveal' });
  assert.equal(result.ok, true); assert.equal(result.changed, false); assert.deepEqual(result.session, s);
});
for (const text of [undefined, '', '   ']) test(`unusable reveal ${JSON.stringify(text)} is unavailable with no state mutation`, () => {
  const game = gameFixture(); const s = sessionAt(game);
  const card = game.cards.find(card => card.id === s.queue[0].itemId);
  if (text === undefined) delete card.revealText; else card.revealText = text;
  const before = structuredClone(s); assert.equal(hasReveal(game, s), false);
  assert.deepEqual(apply(game, s, { type: 'reveal' }), { ok: false, reason: 'reveal_unavailable' });
  assert.deepEqual(s, before);
});
test('Done requires no Reveal completion gate', () => {
  const game = gameFixture(); assert.equal(apply(game, sessionAt(game), { type: 'done' }).session.currentSlot, 1);
});
for (let slot = 0; slot < 5; slot++) test(`Swap at ${slot} atomically represents retirement and preserves four other entries`, () => {
  const game = gameFixture(); const s = { ...sessionAt(game, slot), revealState: 'revealed' };
  const before = structuredClone(s); const retired = s.queue[slot].itemId;
  const result = apply(game, s, { type: 'swap' }); assert.equal(result.ok, true);
  const next = result.session; const replacement = next.queue[slot].itemId;
  assert.notEqual(replacement, retired); assert.equal(next.currentSlot, slot); assert.equal(next.status, 'playing');
  assert.equal(next.revealState, 'hidden'); assert.deepEqual(next.configuration, s.configuration);
  assert.deepEqual(next.displayedItemIds, [...s.displayedItemIds, replacement]);
  assert.deepEqual(next.swappedItemIds, [...s.swappedItemIds, retired]);
  assert.ok(next.displayedItemIds.includes(retired));
  for (let i = 0; i < 5; i++) if (i !== slot) assert.deepEqual(next.queue[i], s.queue[i]);
  assert.deepEqual(getProgress(next), getProgress(s)); assert.deepEqual(parseSession(next, game), next);
  assert.deepEqual(s, before);
});
test('no replacement leaves session untouched', () => {
  const game = gameFixture(); game.cards = game.cards.slice(0, 5); const s = sessionAt(game);
  const before = structuredClone(s);
  assert.deepEqual(apply(game, s, { type: 'swap' }), { ok: false, reason: 'no_replacement' }); assert.deepEqual(s, before);
});
test('closer Swap remains closer and completes via final Done', () => {
  const game = gameFixture(); const s = sessionAt(game, 4); const swapped = apply(game, s, { type: 'swap' }).session;
  assert.equal(swapped.queue[4].slot, 'closer');
  assert.equal(game.cards.find(x => x.id === swapped.queue[4].itemId).isCloser, true);
  const ended = apply(game, swapped, { type: 'done' }).session;
  assert.equal(ended.endedReason, 'completed'); assert.equal(ended.currentSlot, 4);
});
test('successive Swap never reuses queued, displayed or retired IDs', () => {
  const game = gameFixture(); let s = sessionAt(game); const seen = new Set(s.queue.map(x => x.itemId));
  for (let i = 0; i < 10; i++) {
    const result = apply(game, s, { type: 'swap' });
    if (!result.ok) { assert.equal(result.reason, 'no_replacement'); break; }
    const id = result.session.queue[0].itemId; assert.ok(!seen.has(id)); seen.add(id); s = result.session;
  }
  assert.ok(s.swappedItemIds.length > 0);
  assert.equal(new Set(s.displayedItemIds).size, s.displayedItemIds.length);
});
for (let slot = 0; slot < 5; slot++) test(`confirmed End at ${slot} cancels without slot cheating or unshown history`, () => {
  const game = gameFixture(); const s = { ...sessionAt(game, slot), revealState: 'revealed' };
  const result = apply(game, s, { type: 'end', confirmed: true }); assert.equal(result.ok, true);
  assert.deepEqual(result.session, { ...s, status: 'ended', endedReason: 'cancelled', endedAt: inputs.at });
  assert.equal(getProgress(result.session).completed, slot);
});
test('unconfirmed/cancelled End does not mutate session', () => {
  const game = gameFixture(); const s = sessionAt(game); const before = structuredClone(s);
  assert.deepEqual(apply(game, s, { type: 'end', confirmed: false }), { ok: false, reason: 'confirmation_required' });
  assert.deepEqual(s, before); assert.equal(s.endedAt, undefined);
});
test('End requires literal true confirmation, and malformed actions are structured failures', () => {
  const game = gameFixture(); const s = sessionAt(game);
  for (const confirmed of [undefined, 'yes', 'false', 1]) {
    assert.deepEqual(apply(game, s, { type: 'end', confirmed }), { ok: false, reason: 'confirmation_required' });
  }
  for (const action of [null, {}, { type: 'score' }]) {
    assert.deepEqual(apply(game, s, action), { ok: false, reason: 'invalid_state' });
  }
});
for (const reason of ['completed', 'cancelled']) for (const action of [
  { type: 'done' }, { type: 'reveal' }, { type: 'swap' }, { type: 'end', confirmed: true },
]) test(`${reason} session rejects ${action.type}`, () => {
  const { game, s } = setup(reason === 'completed' ? 4 : 2, reason);
  const before = structuredClone(s); assert.deepEqual(apply(game, s, action), { ok: false, reason: 'invalid_state' });
  assert.deepEqual(s, before);
});
test('malformed session and invalid ending timestamp return structured failures', () => {
  const game = gameFixture();
  assert.deepEqual(apply(game, { ...sessionAt(game), currentSlot: 9 }, { type: 'done' }), { ok: false, reason: 'invalid_state' });
  assert.deepEqual(applySessionAction(game, sessionAt(game, 4), { type: 'done' }, { ...inputs, at: 'bad' }),
    { ok: false, reason: 'invalid_state' });
});

test('controller rejects a duplicated Done callback from the same render revision', () => {
  const { controller, store } = setup(); const revision = controller.getState().revision;
  assert.equal(controller.perform({ type: 'done' }, revision).ok, true);
  const writes = store.writes.length;
  assert.deepEqual(controller.perform({ type: 'done' }, revision), { ok: false, reason: 'stale_action' });
  assert.equal(controller.getState().session.currentSlot, 1); assert.equal(store.writes.length, writes);
});
test('controller retains old public state while validating and saving a candidate', () => {
  const game = gameFixture(); const s = sessionAt(game); let controller; let saved;
  controller = createGameplayController(game, {
    loadSession: () => s, removeSession: () => true,
    saveSession(candidate) {
      assert.equal(controller.getState().session.currentSlot, 0);
      assert.equal(candidate.currentSlot, 1); assert.deepEqual(parseSession(candidate, game), candidate);
      saved = structuredClone(candidate); return true;
    },
  }, { now: () => inputs.at });
  const result = dispatch(controller, { type: 'done' }); assert.equal(result.ok, true);
  assert.deepEqual(result.state.session, saved); assert.equal(result.state.session.currentSlot, 1);
});
for (const [label, slot, action] of [
  ['Done', 0, { type: 'done' }], ['final Done', 4, { type: 'done' }],
  ['Reveal', 1, { type: 'reveal' }], ['Swap', 0, { type: 'swap' }],
  ['End', 2, { type: 'end', confirmed: true }],
]) test(`${label} write failure exposes no unpersisted state and restore remains exact`, () => {
  const { game, controller, store } = setup(slot); const before = controller.getState();
  const raw = store.values.get(SESSION_STORAGE_KEY); store.control.failWrite = true;
  assert.deepEqual(dispatch(controller, action), { ok: false, reason: 'storage_unavailable' });
  assert.deepEqual(controller.getState(), before); assert.equal(store.values.get(SESSION_STORAGE_KEY), raw);
  assert.deepEqual(createGameplayController(game, store.adapter).getState().session, before.session);
});
test('controller catches throwing storage ports without publishing advancement', () => {
  const game = gameFixture(); const s = sessionAt(game);
  const controller = createGameplayController(game, { loadSession: () => s,
    saveSession() { throw new Error('denied'); }, removeSession() { throw new Error('denied'); } });
  const before = controller.getState();
  assert.deepEqual(dispatch(controller, { type: 'done' }), { ok: false, reason: 'storage_unavailable' });
  assert.deepEqual(controller.home(before.revision), { ok: false, reason: 'storage_unavailable' });
  assert.deepEqual(controller.getState(), before);
});
test('repeat Reveal, unavailable Reveal and unconfirmed End do not write', () => {
  const { controller, store } = setup(); assert.equal(dispatch(controller, { type: 'reveal' }).ok, true);
  const writes = store.writes.length; const before = controller.getState();
  assert.equal(dispatch(controller, { type: 'reveal' }).ok, true);
  assert.deepEqual(dispatch(controller, { type: 'end', confirmed: false }), { ok: false, reason: 'confirmation_required' });
  assert.deepEqual(controller.getState(), before); assert.equal(store.writes.length, writes);
});
test('unavailable Swap performs no persistence mutation', () => {
  const game = gameFixture(); game.cards = game.cards.slice(0, 5); const s = sessionAt(game);
  const store = storageFixture(game); store.adapter.saveSession(s);
  const controller = createGameplayController(game, store.adapter); const before = controller.getState();
  const writes = store.writes.length;
  assert.deepEqual(dispatch(controller, { type: 'swap' }), { ok: false, reason: 'no_replacement' });
  assert.deepEqual(controller.getState(), before); assert.equal(store.writes.length, writes);
});
test('stale confirmation after another transition cannot cancel a later item', () => {
  const { controller, store } = setup(); const revision = controller.getState().revision;
  dispatch(controller, { type: 'done' }); const writes = store.writes.length;
  assert.deepEqual(controller.perform({ type: 'end', confirmed: true }, revision), { ok: false, reason: 'stale_action' });
  assert.equal(controller.getState().session.status, 'playing'); assert.equal(store.writes.length, writes);
});
test('full five-Done flow persists completed and refuses any extra Done', () => {
  const { game, controller, store } = setup(); const queue = controller.getState().session.queue;
  for (let i = 0; i < 5; i++) {
    assert.equal(dispatch(controller, { type: 'done' }).ok, true);
    const state = controller.getState(); assert.deepEqual(state.session.queue, queue);
    assert.deepEqual(store.adapter.loadSession(), state.session);
  }
  const ended = controller.getState(); assert.equal(ended.screen, 'ended');
  assert.equal(ended.session.endedReason, 'completed');
  assert.deepEqual(dispatch(controller, { type: 'done' }), { ok: false, reason: 'invalid_state' });
  assert.deepEqual(createGameplayController(game, store.adapter).getState().session, ended.session);
});
for (let slot = 0; slot < 5; slot++) test(`reload at slot ${slot} restores exact queue/item/history/reveal without randomness`, () => {
  const { game, controller, store } = setup(slot);
  assert.equal(dispatch(controller, { type: 'reveal' }).ok, true);
  assert.equal(dispatch(controller, { type: 'swap' }).ok, true);
  assert.equal(dispatch(controller, { type: 'reveal' }).ok, true);
  const before = controller.getState();
  const restored = createGameplayController(game, store.adapter, { random() { throw new Error('restore rerolled'); } }).getState();
  assert.equal(restored.screen, 'playing'); assert.deepEqual(restored.session, before.session);
  assert.equal(restored.session.revealState, 'revealed');
  assert.ok(restored.session.swappedItemIds.length); assert.equal(restored.session.currentSlot, slot);
});
test('reload after Done restores next item, never automatically advances', () => {
  const { game, controller, store } = setup(2); dispatch(controller, { type: 'done' });
  for (let i = 0; i < 3; i++) {
    const restored = createGameplayController(game, store.adapter).getState();
    assert.equal(restored.session.currentSlot, 3); assert.deepEqual(restored.session, controller.getState().session);
  }
});
for (const reason of ['completed', 'cancelled']) test(`${reason} ended save restores as ended, with no new composition`, () => {
  const { game, controller, store } = setup(reason === 'completed' ? 4 : 2);
  dispatch(controller, reason === 'completed' ? { type: 'done' } : { type: 'end', confirmed: true });
  const restored = createGameplayController(game, store.adapter, { random() { throw new Error('reroll'); } }).getState();
  assert.equal(restored.screen, 'ended'); assert.equal(restored.session.endedReason, reason);
  assert.deepEqual(restored.session, controller.getState().session);
});
test('New Date retains config but creates fresh identity/queue/reset history saved before exposure', () => {
  const { controller, store } = setup(4, 'completed'); const before = controller.getState();
  const result = controller.newDate(before.revision); assert.equal(result.ok, true);
  const s = result.state.session; assert.notEqual(s.id, before.session.id);
  assert.ok(Number.isFinite(Date.parse(s.startedAt))); assert.notStrictEqual(s.queue, before.session.queue);
  assert.deepEqual(s.configuration, before.configuration); assert.equal(s.currentSlot, 0);
  assert.deepEqual(s.swappedItemIds, []); assert.deepEqual(s.displayedItemIds, [s.queue[0].itemId]);
  assert.equal(s.revealState, 'hidden'); assert.equal(s.status, 'playing'); assert.equal(s.endedAt, undefined);
  assert.equal(s.endedReason, undefined); assert.deepEqual(store.adapter.loadSession(), s);
  assert.deepEqual(controller.newDate(before.revision), { ok: false, reason: 'stale_action' });
});
test('New Date storage failure preserves old ended result and save', () => {
  const { controller, store } = setup(4, 'completed'); const before = controller.getState();
  store.control.failWrite = true;
  assert.deepEqual(controller.newDate(before.revision), { ok: false, reason: 'storage_unavailable' });
  assert.deepEqual(controller.getState(), before); assert.deepEqual(store.adapter.loadSession(), before.session);
});
test('New Date after cancelled Swap/Reveal clears all old history and reveal', () => {
  const { controller, store } = setup(2);
  dispatch(controller, { type: 'swap' }); dispatch(controller, { type: 'reveal' });
  dispatch(controller, { type: 'end', confirmed: true });
  const previous = controller.getState();
  assert.ok(previous.session.swappedItemIds.length); assert.equal(previous.session.revealState, 'revealed');
  const result = controller.newDate(previous.revision); assert.equal(result.ok, true);
  const s = result.state.session;
  assert.notEqual(s.id, previous.session.id); assert.equal(s.currentSlot, 0); assert.equal(s.revealState, 'hidden');
  assert.deepEqual(s.swappedItemIds, []); assert.deepEqual(s.displayedItemIds, [s.queue[0].itemId]);
  assert.equal(s.endedReason, undefined); assert.deepEqual(store.adapter.loadSession(), s);
});
for (const reason of [undefined, 'completed', 'cancelled']) test(`Change Vibe discards ${reason ?? 'playing'} progress and starts fresh only on explicit Start`, () => {
  const { controller, store } = setup(reason === 'completed' ? 4 : 2, reason);
  const before = controller.getState(); const result = controller.changeVibe(before.revision); assert.equal(result.ok, true);
  assert.equal(result.state.screen, 'setup'); assert.equal(result.state.session, null);
  assert.deepEqual(result.state.configuration, before.configuration); assert.equal(store.adapter.loadSession(), null);
  const writes = store.writes.length;
  for (let i = 0; i < 3; i++) assert.equal(controller.getState().session, null);
  assert.equal(store.writes.length, writes);
  const started = controller.start({ ...before.configuration, vibe: 'romantic' }, result.state.revision);
  assert.equal(started.ok, true); assert.notEqual(started.state.session.id, before.session.id);
  assert.equal(started.state.session.configuration.vibe, 'romantic');
  assert.deepEqual(started.state.session.swappedItemIds, []);
  assert.deepEqual(started.state.session.displayedItemIds, [started.state.session.queue[0].itemId]);
});
for (const method of ['home', 'changeVibe']) test(`${method} removal failure leaves session intact`, () => {
  const { controller, store } = setup(); const before = controller.getState(); store.control.failRemove = true;
  assert.deepEqual(controller[method](before.revision), { ok: false, reason: 'storage_unavailable' });
  assert.deepEqual(controller.getState(), before); assert.deepEqual(store.adapter.loadSession(), before.session);
});
test('Home removes only Date Night key and returns to Home', () => {
  const { controller, store } = setup(); const result = controller.home(controller.getState().revision);
  assert.equal(result.ok, true); assert.equal(result.state.screen, 'home'); assert.equal(result.state.session, null);
  assert.equal(store.values.has(SESSION_STORAGE_KEY), false);
  assert.equal(store.values.get('social-game-engine:v1:session'), 'girls save'); assert.equal(store.values.get('unrelated'), 'keep');
  assert.ok(store.writes.every(([, key]) => key === SESSION_STORAGE_KEY));
});
test('Start is revision guarded and never twice composes/persists through one callback', () => {
  const game = gameFixture(); const store = storageFixture(game); const controller = createGameplayController(game, store.adapter);
  const revision = controller.getState().revision; assert.equal(controller.start(config, revision).ok, true);
  const writes = store.writes.length; assert.deepEqual(controller.start(config, revision), { ok: false, reason: 'stale_action' });
  assert.equal(store.writes.length, writes);
});
test('invalid configuration and failed Start leave previous Home unchanged', () => {
  const game = gameFixture(); const store = storageFixture(game); const controller = createGameplayController(game, store.adapter);
  const before = controller.getState();
  assert.deepEqual(controller.start({ ...config, vibe: 'bad' }, before.revision), { ok: false, reason: 'invalid_configuration' });
  store.control.failWrite = true;
  assert.deepEqual(controller.start(config, before.revision), { ok: false, reason: 'storage_unavailable' });
  assert.deepEqual(controller.getState(), before);
});
test('controller snapshots do not let UI mutate internal state', () => {
  const { controller } = setup(); const snapshot = controller.getState();
  snapshot.session.queue[0].itemId = 'tampered'; snapshot.configuration.vibe = 'funny';
  assert.notEqual(controller.getState().session.queue[0].itemId, 'tampered');
  assert.equal(controller.getState().configuration.vibe, 'cozy');
});
for (let slot = 0; slot < 5; slot++) test(`progress at ${slot} derives from slot, never enlarged Swap history`, () => {
  const game = gameFixture(); const s = sessionAt(game, slot); const swapped = apply(game, s, { type: 'swap' }).session;
  const revealed = apply(game, swapped, { type: 'reveal' }).session;
  assert.ok(swapped.displayedItemIds.length > s.displayedItemIds.length);
  assert.deepEqual(getProgress(s), { ordinal: slot + 1, completed: slot, total: 5 });
  assert.deepEqual(getProgress(swapped), getProgress(s)); assert.deepEqual(getProgress(revealed), getProgress(s));
});
