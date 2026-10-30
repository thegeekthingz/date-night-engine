import assert from 'node:assert/strict';
import { test } from 'node:test';
import { loadDefaultGame } from '../src/legacy/data/defaultGame.ts';
import { consumeCard, createSetupSession, playAgain, restoreShellSession, startGame } from '../src/legacy/engine/gameplayShell.ts';
import { getNightHighlights } from '../src/engine/nightHighlights.ts';
import { restartSession, updateSessionSettings } from '../src/legacy/engine/sessionManager.ts';
import { createLocalStorageAdapter } from '../src/legacy/storage/localStorageAdapter.ts';

const game = loadDefaultGame();
const players = ['Pam', 'Joy', 'Sarah'].map((name, index) => ({ id: `p${index}`, name }));
const namedSetup = (count = 3) => updateSessionSettings(createSetupSession(game), {
  players: players.slice(0, count), sessionLengthMode: count === 1 ? 'quick' : 'standard',
});

test('SPILL, SIP and Skip increment the current player and preserve turn rules', () => {
  let session = startGame(namedSetup(), game, () => 0);
  session = consumeCard(session, game, 'spill', () => 0);
  assert.deepEqual(session.playerStats.p0, { spillCount: 1, sipCount: 0, skipCount: 0 });
  assert.equal(session.currentPlayerIndex, 1);
  session = consumeCard(session, game, 'sip', () => 0);
  assert.deepEqual(session.playerStats.p1, { spillCount: 0, sipCount: 1, skipCount: 0 });
  assert.equal(session.currentPlayerIndex, 2);
  session = consumeCard(session, game, 'skip', () => 0);
  assert.deepEqual(session.playerStats.p2, { spillCount: 0, sipCount: 0, skipCount: 1 });
  assert.equal(session.currentPlayerIndex, 2);
  assert.equal(session.consumedCardCount, 3);
});

for (const action of ['spill', 'sip', 'skip']) {
  test(`final-card ${action} is recorded before completion`, () => {
    let session = startGame(namedSetup(1), game, () => 0);
    session = consumeCard(session, game, action, () => 0);
    assert.equal(session.status, 'playing');
    session = consumeCard(session, game, action, () => 0);
    assert.equal(session.status, 'ended');
    assert.equal(session.consumedCardCount, 2);
    assert.equal(session.playerStats.p0[`${action}Count`], 2);
  });
}

test('refresh preserves exact counts without double-counting; replay and setup reset them', () => {
  let session = consumeCard(startGame(namedSetup(), game, () => 0), game, 'spill', () => 0);
  let stored;
  const storage = createLocalStorageAdapter(() => ({ getItem: () => stored ?? null,
    setItem: (_, value) => { stored = value; }, removeItem: () => { stored = undefined; } }));
  storage.saveSession(session);
  session = restoreShellSession(game, storage.loadSession());
  assert.equal(session.playerStats.p0.spillCount, 1);
  assert.equal(session.consumedCardCount, 1);
  assert.deepEqual(restoreShellSession(game, storage.loadSession()), session);
  const replay = playAgain(session, game, () => 0);
  assert.equal(replay.consumedCardCount, 0);
  assert.ok(Object.values(replay.playerStats).every(value =>
    value.spillCount + value.sipCount + value.skipCount === 0));
  const setup = restartSession(session);
  assert.equal(setup.playerStats, undefined);
  assert.equal(setup.consumedCardCount, undefined);
});

test('legacy and anonymous sessions remain compatible without player stats', () => {
  const legacy = startGame(namedSetup(), game, () => 0);
  delete legacy.playerStats;
  delete legacy.consumedCardCount;
  assert.deepEqual(restoreShellSession(game, legacy), legacy);
  const anonymous = consumeCard(startGame(createSetupSession(game), game, () => 0), game, 'skip', () => 0);
  assert.equal(anonymous.playerStats, undefined);
  assert.equal(anonymous.consumedCardCount, 1);
});

test('highlights are stable Sip, Spill, Skip; handle ties and omit zero metrics', () => {
  const stats = {
    p0: { spillCount: 2, sipCount: 3, skipCount: 0 },
    p1: { spillCount: 2, sipCount: 3, skipCount: 1 },
    p2: { spillCount: 1, sipCount: 1, skipCount: 1 },
  };
  assert.deepEqual(getNightHighlights(players, stats).map(item => item.text), [
    '👑 Pam & Joy shared the Sip crown',
    '💋 Pam & Joy spilled the most tea',
    '😏 Joy & Sarah hit Skip the most',
  ]);
  stats.p0.sipCount = 4;
  assert.equal(getNightHighlights(players, stats)[0].text, '👑 Pam was the Queen of Sips');
  for (const value of Object.values(stats)) value.sipCount = value.spillCount = value.skipCount = 0;
  assert.deepEqual(getNightHighlights(players, stats), []);
});

test('three-way ties use compact joined names and never exceed three highlights', () => {
  const tied = Object.fromEntries(players.map(player => [player.id,
    { spillCount: 1, sipCount: 1, skipCount: 1 }]));
  const highlights = getNightHighlights(players, tied);
  assert.equal(highlights.length, 3);
  assert.match(highlights[0].text, /Pam, Joy & Sarah shared the Sip crown/);
  assert.deepEqual(highlights.map(item => item.metric), ['sip', 'spill', 'skip']);
});
