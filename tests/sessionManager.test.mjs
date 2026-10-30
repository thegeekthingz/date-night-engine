import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSession, updateSessionSettings, recordPlayedCard, endSession, restartSession } from '../src/engine/sessionManager.ts';
import { isSessionCompatible, restoreOrCreateSession, selectSessionCard } from '../src/engine/gameSession.ts';
import { loadDefaultGame } from '../src/data/defaultGame.ts';

const settings = {
  gameId: 'example', gameVersion: '1.0.0', modeId: 'free',
  selectedCategoryIds: ['one'], selectedIntensities: ['mild'],
};

test('creates a setup session with settings, identity, timestamp, and optional players', () => {
  const session = createSession(settings);
  assert.deepEqual({ ...session, id: undefined, startedAt: undefined }, {
    ...settings, id: undefined, startedAt: undefined, players: [], playedCardIds: [], status: 'setup',
  });
  assert.ok(session.id);
  assert.ok(Number.isFinite(Date.parse(session.startedAt)));
  assert.notEqual(session.id, createSession(settings).id);
  assert.deepEqual(createSession({ ...settings, players: [{ id: 'p', name: 'Sam' }] }).players,
    [{ id: 'p', name: 'Sam' }]);
});

test('updates setup settings without mutating or sharing nested inputs', () => {
  const session = createSession(settings);
  const before = structuredClone(session);
  const patch = { modeId: 'other', selectedCategoryIds: ['two'], selectedIntensities: ['wild'], players: [{ id: 'p', name: 'Sam' }] };
  const updated = updateSessionSettings(session, patch);
  assert.equal(updated.id, session.id);
  assert.equal(updated.modeId, 'other');
  assert.deepEqual(updated.players, patch.players);
  updated.players[0].name = 'Changed';
  updated.selectedCategoryIds.push('three');
  assert.equal(patch.players[0].name, 'Sam');
  assert.deepEqual(patch.selectedCategoryIds, ['two']);
  assert.deepEqual(session, before);
});

test('records current card and unique played IDs, transitioning to playing', () => {
  const session = createSession(settings);
  const before = structuredClone(session);
  const first = recordPlayedCard(session, 'a');
  const next = recordPlayedCard(first, 'b');
  const repeat = recordPlayedCard(next, 'a');
  assert.equal(repeat.currentCardId, 'a');
  assert.deepEqual(repeat.playedCardIds, ['a', 'b']);
  assert.equal(repeat.status, 'playing');
  assert.deepEqual(first.playedCardIds, ['a']);
  assert.deepEqual(session, before);
  assert.throws(() => updateSessionSettings(first, { modeId: 'other' }), /setup/);
});

test('ends a session immutably, retains progress, and does not allow further draws', () => {
  const session = recordPlayedCard(createSession(settings), 'a');
  const ended = endSession(session);
  assert.equal(ended.status, 'ended');
  assert.ok(Number.isFinite(Date.parse(ended.endedAt)));
  assert.equal(ended.currentCardId, 'a');
  assert.deepEqual(ended.playedCardIds, ['a']);
  assert.equal(session.status, 'playing');
  assert.equal(session.endedAt, undefined);
  assert.equal(endSession(ended).endedAt, ended.endedAt);
  assert.throws(() => recordPlayedCard(ended, 'b'), /ended/);
});

test('restart retains settings and names but clears every progress field', () => {
  const previous = {
    ...endSession(recordPlayedCard(createSession(settings), 'a')),
    players: [{ id: 'p', name: 'Sam', score: 10 }], currentPlayerIndex: 0, scores: { p: 10 },
  };
  const before = structuredClone(previous);
  const restarted = restartSession(previous);
  assert.notEqual(restarted.id, previous.id);
  assert.equal(restarted.status, 'setup');
  assert.deepEqual(restarted.playedCardIds, []);
  assert.equal(restarted.currentCardId, undefined);
  assert.equal(restarted.endedAt, undefined);
  assert.equal(restarted.currentPlayerIndex, undefined);
  assert.equal(restarted.scores, undefined);
  assert.deepEqual(restarted.players, [{ id: 'p', name: 'Sam' }]);
  for (const key of Object.keys(settings)) assert.deepEqual(restarted[key], settings[key]);
  restarted.players[0].name = 'Changed';
  assert.deepEqual(previous, before);
});

test('creation copies caller arrays and player objects', () => {
  const input = { ...settings, selectedCategoryIds: ['one'], selectedIntensities: ['mild'], players: [{ id: 'p', name: 'Sam' }] };
  const before = structuredClone(input);
  const session = createSession(input);
  session.selectedCategoryIds.push('two');
  session.selectedIntensities.push('wild');
  session.players[0].name = 'Changed';
  assert.deepEqual(input, before);
});

test('preview restores progress and preserves clean restart across reloads', () => {
  const game = loadDefaultGame();
  const initial = restoreOrCreateSession(game, null);
  assert.equal(initial.playedCardIds.length, 1);
  const next = selectSessionCard(initial, game, () => 0);
  assert.equal(next.playedCardIds.length, 2);
  assert.notEqual(next.currentCardId, initial.currentCardId);
  assert.deepEqual(restoreOrCreateSession(game, structuredClone(next)), next);
  const restarted = restartSession(next);
  assert.deepEqual(restoreOrCreateSession(game, restarted), restarted);
  assert.equal(restarted.currentCardId, undefined);
  assert.equal(selectSessionCard(restarted, game, () => 0).playedCardIds.length, 1);
});

test('draws through session history without repeats and retains final card on exhaustion', () => {
  const game = loadDefaultGame();
  let session = restoreOrCreateSession(game, null);
  for (let count = 2; count <= game.cards.length; count++) {
    session = selectSessionCard(session, game, () => 0);
    assert.equal(session.playedCardIds.length, count);
  }
  assert.equal(new Set(session.playedCardIds).size, game.cards.length);
  assert.deepEqual(selectSessionCard(session, game), session);
  const ended = endSession(session);
  assert.deepEqual(selectSessionCard(ended, game), ended);
  assert.deepEqual(restoreOrCreateSession(game, ended), ended);
});

test('rejects stored sessions incompatible with loaded game data', () => {
  const game = loadDefaultGame();
  const session = restoreOrCreateSession(game, null);
  for (const patch of [
    { gameId: 'other' }, { gameVersion: 'old' }, { modeId: 'missing' },
    { selectedCategoryIds: ['missing'] }, { playedCardIds: ['missing'] }, { currentCardId: 'missing' },
  ]) {
    const stale = { ...session, ...patch };
    assert.equal(isSessionCompatible(stale, game), false);
    const replacement = restoreOrCreateSession(game, stale);
    assert.notEqual(replacement.id, session.id);
    assert.equal(isSessionCompatible(replacement, game), true);
  }
});
