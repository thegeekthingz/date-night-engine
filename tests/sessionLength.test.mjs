import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from '../src/data/defaultGame.ts';
import { getLengthTarget } from '../src/engine/sessionLength.ts';
import { consumeCard, createSetupSession, getEligiblePoolTotal, getPlayView, getSessionCardTotal, playAgain, restoreShellSession, setupError, startGame } from '../src/engine/gameplayShell.ts';
import { restartSession, updateSessionSettings } from '../src/engine/sessionManager.ts';
import { parseSession } from '../src/engine/sessionValidation.ts';
import { createLocalStorageAdapter } from '../src/storage/localStorageAdapter.ts';

const game = loadDefaultGame();
const players = count => Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `Player ${i + 1}` }));
const setup = (count, patch = {}) => updateSessionSettings(createSetupSession(game), { players: players(count), ...patch });

for (const count of [1, 3, 12]) {
  for (const [mode, turns] of [['quick', 2], ['standard', 4], ['long', 6]]) {
    test(`${count} players: ${mode} fixes target at ${count * turns}`, () => {
      const session = startGame(setup(count, { sessionLengthMode: mode }), game, () => 0);
      assert.equal(session.effectiveTarget, count * turns);
      assert.equal(getSessionCardTotal(session, game), count * turns);
      assert.equal(session.playedCardIds.length, 1);
    });
  }
}

test('anonymous uses full filtered pool; named All Cards uses all 125', () => {
  const anonymous = startGame(setup(0, { selectedIntensities: ['wild'] }), game);
  assert.equal(getSessionCardTotal(anonymous, game), 31);
  assert.equal(anonymous.effectiveTarget, undefined);
  assert.equal(anonymous.sessionLengthMode, undefined);
  assert.equal(startGame(setup(3, { sessionLengthMode: 'all' }), game).effectiveTarget, 125);
});

test('caps are explicit, and filters/players immediately recalculate targets', () => {
  let session = setup(12, { sessionLengthMode: 'long', selectedIntensities: ['wild'] });
  assert.deepEqual(getLengthTarget('long', 12, getEligiblePoolTotal(session, game)), { raw: 72, effective: 31, capped: true });
  assert.equal(startGame(session, game).effectiveTarget, 31);
  session = updateSessionSettings(session, { selectedCategoryIds: ['funny'] });
  assert.equal(getEligiblePoolTotal(session, game), 4);
  assert.equal(startGame(session, game).effectiveTarget, 4);
  session = updateSessionSettings(session, { players: players(1), sessionLengthMode: 'quick' });
  assert.equal(startGame(session, game).effectiveTarget, 2);
});

test('Standard is default; removing/readding valid names resets it', () => {
  let session = setup(3);
  assert.equal(session.sessionLengthMode, 'standard');
  session = updateSessionSettings(session, { sessionLengthMode: 'long' });
  session = updateSessionSettings(session, { players: [{ id: 'blank', name: '  ' }] });
  assert.equal(session.sessionLengthMode, undefined);
  session = updateSessionSettings(session, { players: players(1) });
  assert.equal(session.sessionLengthMode, 'standard');
});

for (const kind of ['answer', 'skip']) {
  test(`${kind} ends on the target card action, never draws an extra card, survives refresh`, () => {
    let session = startGame(setup(3), game, () => 0);
    let value;
    const storage = createLocalStorageAdapter(() => ({ getItem: () => value ?? null, setItem: (_, text) => { value = text; }, removeItem: () => { value = undefined; } }));
    for (let action = 1; action <= 12; action++) {
      const before = structuredClone(session);
      assert.equal(session.status, 'playing');
      assert.equal(session.playedCardIds.length, action);
      assert.equal(getPlayView(session, game).exhausted, false);
      session = consumeCard(session, game, kind, () => 0);
      assert.equal(session.currentPlayerIndex, kind === 'skip' || action === 12 ? before.currentPlayerIndex : (before.currentPlayerIndex + 1) % 3);
      assert.equal(getSessionCardTotal(session, game), 12);
      assert.ok(session.playedCardIds.includes(before.currentCardId));
      assert.equal(new Set(session.playedCardIds).size, session.playedCardIds.length);
      assert.equal(storage.saveSession(session), true);
      assert.deepEqual(restoreShellSession(game, storage.loadSession()), session);
    }
    assert.equal(session.status, 'ended');
    assert.equal(session.playedCardIds.length, 12);
    assert.equal(consumeCard(session, game, kind), session);
    assert.equal(playAgain(session, game).playedCardIds.length, 1);
    const restarted = restartSession(session);
    assert.equal(restarted.effectiveTarget, undefined);
    assert.equal(restarted.sessionLengthMode, 'standard');
    assert.equal(startGame(updateSessionSettings(restarted, { players: players(1) }), game).effectiveTarget, 4);
  });
}

test('all presets cap at four; fourth card stays actionable and closes on consumption', () => {
  for (const mode of ['quick', 'standard', 'long', 'all']) {
    let session = startGame(setup(4, { sessionLengthMode: mode, selectedCategoryIds: ['funny'], selectedIntensities: ['wild'] }), game, () => 0);
    assert.equal(session.effectiveTarget, 4);
    for (let i = 0; i < 3; i++) session = consumeCard(session, game, 'skip', () => 0);
    assert.equal(session.status, 'playing');
    assert.equal(getPlayView(session, game).exhausted, false);
    assert.equal(consumeCard(session, game, 'skip').status, 'ended');
  }
});

test('legacy named session restores full pool without opting into new target', () => {
  const legacy = startGame(setup(3), game, () => 0);
  delete legacy.sessionLengthMode; delete legacy.effectiveTarget;
  const restored = restoreShellSession(game, parseSession(legacy));
  assert.deepEqual(restored, legacy);
  assert.equal(getSessionCardTotal(restored, game), 125);
  assert.equal(consumeCard(restored, game, 'answer', () => 0).effectiveTarget, undefined);
});

test('zero pool blocks start and malformed persisted targets are rejected', () => {
  const empty = setup(3, { selectedCategoryIds: [] });
  assert.match(setupError(empty, game), /category/);
  assert.throws(() => startGame(empty, game));
  const session = startGame(setup(3), game);
  for (const effectiveTarget of [0, -1, 1.5, NaN]) assert.throws(() => parseSession({ ...session, effectiveTarget }));
  assert.throws(() => parseSession({ ...session, sessionLengthMode: 'custom' }));
  assert.equal(restoreShellSession(game, { ...session, effectiveTarget: 126 }), null);
});
