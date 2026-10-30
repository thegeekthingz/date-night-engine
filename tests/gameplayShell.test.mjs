import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from '../src/legacy/data/defaultGame.ts';
import { advanceGame, createSetupSession, getPlayView, playAgain, restoreShellSession, setupError, startGame } from '../src/legacy/engine/gameplayShell.ts';
import { endSession, restartSession, updateSessionSettings } from '../src/legacy/engine/sessionManager.ts';
import { createLocalStorageAdapter } from '../src/legacy/storage/localStorageAdapter.ts';

test('home has no session; setup stores choices and starts with an eligible card', () => {
  const game = loadDefaultGame();
  assert.equal(restoreShellSession(game, null), null);
  const setup = updateSessionSettings(createSetupSession(game), {
    modeId: 'random-mix', selectedCategoryIds: ['dating'], selectedIntensities: ['mild'],
    players: [{ id: 'a', name: 'Alex' }],
  });
  assert.equal(setup.status, 'setup');
  assert.equal(setupError(setup, game), null);
  const playing = startGame(setup, game, () => 0);
  assert.equal(playing.status, 'playing');
  assert.equal(playing.playedCardIds.length, 1);
  assert.equal(getPlayView(playing, game).category, 'Dating');
  assert.equal(playing.modeId, 'random-mix');
  assert.deepEqual(playing.players, setup.players);
  assert.deepEqual(setup.playedCardIds, []);
});

test('optional names may be empty and intensity-disabled games have no intensity restriction', () => {
  const game = loadDefaultGame();
  game.manifest.intensityEnabled = false;
  const setup = createSetupSession(game);
  assert.deepEqual(setup.selectedIntensities, []);
  assert.deepEqual(startGame(setup, game).players, []);
});

test('invalid or empty selections give actionable setup errors', () => {
  const game = loadDefaultGame();
  const setup = createSetupSession(game);
  assert.match(setupError(setup, { ...game, cards: [] }), /No cards match/);
  assert.throws(() => startGame(setup, { ...game, cards: [] }), /No cards match/);
  for (const [patch, message] of [
    [{ selectedCategoryIds: [] }, /category/],
    [{ selectedIntensities: [] }, /intensity/],
    [{ modeId: 'unknown' }, /valid game settings/],
    [{ players: Array.from({ length: 21 }, (_, i) => ({ id: String(i), name: 'A' })) }, /20/],
  ]) {
    const changed = updateSessionSettings(setup, patch);
    assert.match(setupError(changed, game), message);
    assert.throws(() => startGame(changed, game), message);
  }
});

test('active session restores the exact current card and history through storage', () => {
  const game = loadDefaultGame();
  let value = null;
  const storage = createLocalStorageAdapter(() => ({
    getItem: () => value, setItem: (_, text) => { value = text; }, removeItem: () => { value = null; },
  }));
  const session = advanceGame(startGame(createSetupSession(game), game, () => 0), game, () => 0);
  storage.saveSession(session);
  const restored = restoreShellSession(game, storage.loadSession());
  assert.deepEqual(restored, session);
  assert.equal(restored.status, 'playing');
  assert.equal(getPlayView(restored, game).card.id, session.currentCardId);
  assert.equal(restoreShellSession(game, { ...session, gameVersion: 'old' }), null);
});

test('end, play again, and change mode retain settings and reset progress appropriately', () => {
  const game = loadDefaultGame();
  const playing = advanceGame(startGame(createSetupSession(game), game, () => 0), game, () => 0);
  const ended = endSession(playing);
  assert.equal(ended.status, 'ended');
  assert.equal(ended.playedCardIds.length, 2);
  assert.deepEqual(restoreShellSession(game, ended), ended);
  const again = playAgain(ended, game, () => 0);
  assert.equal(again.status, 'playing');
  assert.notEqual(again.id, ended.id);
  assert.equal(again.playedCardIds.length, 1);
  assert.deepEqual(again.selectedCategoryIds, ended.selectedCategoryIds);
  const setup = restartSession(ended);
  assert.equal(setup.status, 'setup');
  assert.equal(setup.currentCardId, undefined);
  assert.deepEqual(setup.playedCardIds, []);
});

test('manual exhaustion offers recovery without repeating or ending automatically', () => {
  const game = loadDefaultGame();
  let session = startGame(createSetupSession(game), game, () => 0);
  for (let i = 1; i < game.cards.length; i++) session = advanceGame(session, game, () => 0);
  assert.equal(getPlayView(session, game).exhausted, true);
  assert.equal(new Set(session.playedCardIds).size, game.cards.length);
  assert.deepEqual(advanceGame(session, game), session);
  assert.equal(playAgain(session, game).playedCardIds.length, 1);
});

test('deck_complete ends when advancing beyond the last card', () => {
  const game = loadDefaultGame();
  game.manifest.endCondition = 'deck_complete';
  game.cards = game.cards.slice(0, 1);
  const session = startGame(createSetupSession(game), game);
  assert.equal(advanceGame(session, game).status, 'ended');
});

test('card action overrides use manifest labels and do not duplicate Skip', () => {
  const game = loadDefaultGame();
  game.cards[0].actionIds = ['sip', 'skip'];
  const session = startGame(createSetupSession(game), game, () => 0);
  assert.deepEqual(getPlayView(session, game).actions, [{ id: 'sip', label: 'SIP' }]);
});
