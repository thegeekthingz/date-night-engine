import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLocalStorageAdapter, SESSION_STORAGE_KEY } from '../src/storage/localStorageAdapter.ts';
import { createSession, recordPlayedCard, endSession, restartSession } from '../src/engine/sessionManager.ts';

function setup() {
  const values = new Map();
  const storage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  };
  return { values, storage, adapter: createLocalStorageAdapter(() => storage) };
}
const newSession = () => createSession({
  gameId: 'example', gameVersion: '1', modeId: 'free',
  selectedCategoryIds: ['one'], selectedIntensities: ['mild'], players: [{ id: 'p', name: 'Sam' }],
});

test('missing storage entry returns null', () => {
  assert.equal(setup().adapter.loadSession(), null);
});

test('saves and restores current card, history, settings, and status without mutation', () => {
  const { adapter, storage } = setup();
  const session = recordPlayedCard(newSession(), 'a');
  const before = structuredClone(session);
  assert.equal(adapter.saveSession(session), true);
  const restored = createLocalStorageAdapter(() => storage).loadSession();
  assert.deepEqual(restored, session);
  restored.players[0].name = 'Changed';
  assert.deepEqual(session, before);
  assert.deepEqual(adapter.loadSession(), before);
});

test('round trips ended sessions and all optional model fields', () => {
  const { adapter } = setup();
  const session = {
    ...endSession(recordPlayedCard(newSession(), 'a')),
    players: [{ id: 'p', name: 'Sam', score: 3 }], currentPlayerIndex: 0, scores: { p: 3 },
  };
  assert.equal(adapter.saveSession(session), true);
  assert.deepEqual(adapter.loadSession(), session);
});

test('restart replaces saved history and current card', () => {
  const { adapter } = setup();
  const session = recordPlayedCard(newSession(), 'a');
  adapter.saveSession(session);
  const restarted = restartSession(session);
  adapter.saveSession(restarted);
  assert.deepEqual(adapter.loadSession(), restarted);
  assert.deepEqual(adapter.loadSession().playedCardIds, []);
  assert.equal(adapter.loadSession().currentCardId, undefined);
});

test('removes only the session key', () => {
  const { adapter, values } = setup();
  values.set('unrelated', 'keep');
  adapter.saveSession(newSession());
  assert.equal(adapter.removeSession(), true);
  assert.equal(adapter.loadSession(), null);
  assert.equal(values.get('unrelated'), 'keep');
});

test('corrupt JSON and invalid session shapes are discarded safely', () => {
  const { adapter, values } = setup();
  const session = newSession();
  const badValues = ['{broken', '', 'null', '[]', '{}', ...[
    { ...session, gameVersion: 1 }, { ...session, status: 'bad' },
    { ...session, players: [{ id: 'p', name: 4 }] },
    { ...session, selectedIntensities: ['hot'] }, { ...session, playedCardIds: [1] },
    { ...session, currentCardId: 'unplayed' }, { ...session, startedAt: 'bad date' },
    { ...session, status: 'ended' }, { ...session, endedAt: session.startedAt },
    { ...session, scores: { p: '3' } }, { ...session, currentPlayerIndex: 2 },
  ].map(value => JSON.stringify(value))];
  for (const raw of badValues) {
    values.set(SESSION_STORAGE_KEY, raw);
    assert.equal(adapter.loadSession(), null);
    assert.equal(values.has(SESSION_STORAGE_KEY), false);
  }
});

test('invalid save does not overwrite previously valid data', () => {
  const { adapter } = setup();
  const session = newSession();
  adapter.saveSession(session);
  assert.equal(adapter.saveSession({ ...session, status: 'invalid' }), false);
  assert.deepEqual(adapter.loadSession(), session);
});

test('storage access, quota, read, and removal failures never throw', () => {
  const fail = () => { throw new Error('Storage unavailable'); };
  for (const provider of [fail, () => ({ getItem: fail, setItem: fail, removeItem: fail })]) {
    const adapter = createLocalStorageAdapter(provider);
    assert.equal(adapter.loadSession(), null);
    assert.equal(adapter.saveSession(newSession()), false);
    assert.equal(adapter.removeSession(), false);
  }
  const adapter = createLocalStorageAdapter(() => ({ getItem: () => '{bad', setItem: fail, removeItem: fail }));
  assert.equal(adapter.loadSession(), null);
});
