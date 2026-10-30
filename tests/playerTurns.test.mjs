import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from '../src/legacy/data/defaultGame.ts';
import { consumeCard, createSetupSession, getPlayView, getSessionCardTotal, playAgain, restoreShellSession, startGame } from '../src/legacy/engine/gameplayShell.ts';
import { restartSession, updateSessionSettings } from '../src/legacy/engine/sessionManager.ts';
import { createLocalStorageAdapter } from '../src/legacy/storage/localStorageAdapter.ts';

const game = loadDefaultGame();
function begin(names = [' Pamela ', '', 'Jessica', 'Sarah']) {
  return startGame(updateSessionSettings(createSetupSession(game), {
    players: names.map((name, index) => ({ id: String(index), name })),
  }), game, () => 0);
}

test('names are trimmed and blanks ignored without changing order; anonymous stays anonymous', () => {
  assert.deepEqual(begin().players.map(player => player.name), ['Pamela', 'Jessica', 'Sarah']);
  assert.equal(begin().currentPlayerIndex, 0);
  const anonymous = consumeCard(begin(['  ']), game, 'answer', () => 0);
  assert.equal(anonymous.currentPlayerIndex, undefined);
  assert.equal(getPlayView(anonymous, game).currentPlayer, undefined);
});

test('one player remains current through answers and skips', () => {
  let session = begin(['Sam']);
  for (const kind of ['answer', 'answer', 'skip']) {
    session = consumeCard(session, game, kind, () => 0);
    assert.equal(session.currentPlayerIndex, 0);
  }
});

test('answers rotate, skip keeps player, each advances progress once without repeats or mutation', () => {
  let session = begin();
  for (const [kind, expected] of [['answer', 'Jessica'], ['answer', 'Sarah'], ['skip', 'Sarah'], ['answer', 'Pamela']]) {
    const before = structuredClone(session);
    const next = consumeCard(session, game, kind, () => 0);
    assert.deepEqual(session, before);
    assert.equal(getPlayView(next, game).currentPlayer.name, expected);
    assert.equal(next.playedCardIds.length, before.playedCardIds.length + 1);
    assert.ok(next.playedCardIds.includes(before.currentCardId));
    assert.ok(!before.playedCardIds.includes(next.currentCardId));
    assert.equal(getSessionCardTotal(next, game), 12);
    session = next;
  }
});

test('storage restores player/card/progress after a skipped replacement; legacy index defaults to zero', () => {
  let session = begin();
  for (const kind of ['answer', 'answer', 'skip']) session = consumeCard(session, game, kind, () => 0);
  let value;
  const storage = createLocalStorageAdapter(() => ({ getItem: () => value ?? null, setItem: (_, text) => { value = text; }, removeItem: () => { value = undefined; } }));
  assert.equal(storage.saveSession(session), true);
  assert.deepEqual(restoreShellSession(game, storage.loadSession()), session);
  delete session.currentPlayerIndex;
  assert.equal(storage.saveSession(session), true);
  assert.equal(restoreShellSession(game, storage.loadSession()).currentPlayerIndex, 0);
  assert.equal(session.currentPlayerIndex, undefined);
});

test('Play Again and Change Vibe/new start reset to first player and retain names', () => {
  const current = consumeCard(begin(), game, 'answer', () => 0);
  for (const restarted of [playAgain(current, game, () => 0), startGame(restartSession(current), game, () => 0)]) {
    assert.equal(restarted.currentPlayerIndex, 0);
    assert.equal(restarted.playedCardIds.length, 1);
    assert.deepEqual(restarted.players, current.players);
  }
});

test('legacy exhausted manual deck neither rotates nor repeats; ended sessions stay ended', () => {
  const single = { ...game, cards: game.cards.slice(0, 1) };
  const session = startGame(updateSessionSettings(createSetupSession(single), { players: [{ id: 'a', name: 'A' }, { id: 'b', name: 'B' }] }), single, () => 0);
  delete session.sessionLengthMode;
  delete session.effectiveTarget;
  assert.equal(consumeCard(session, single, 'answer'), session);
  const ended = { ...session, status: 'ended' };
  assert.equal(consumeCard(ended, single, 'skip'), ended);
});
