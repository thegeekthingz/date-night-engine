import type { DateNightConfiguration } from '../types/game.ts';
import type { GameSession } from '../types/session.ts';
import type { CompositionFailure, Random } from './sessionComposer.ts';
import { applySessionAction } from './sessionActions.ts';
import type { ActionFailure, SessionAction } from './sessionActions.ts';
import { restoreDateNight, startDateNight } from './sessionStart.ts';
import type { SessionContext } from './sessionValidation.ts';

export type GameplayState = {
  screen: 'home' | 'setup' | 'playing' | 'ended';
  configuration: DateNightConfiguration;
  session: GameSession | null;
  // In-memory concurrency guard only, never added to the persisted schema.
  revision: number;
};
type StoragePort = {
  loadSession: () => GameSession | null;
  saveSession: (session: GameSession) => boolean;
  removeSession: () => boolean;
};
type Failure = ActionFailure | CompositionFailure | 'stale_action' | 'storage_unavailable' | 'invalid_configuration';
export type GameplayResult = { ok: true; state: GameplayState } | { ok: false; reason: Failure };

export function createGameplayController(context: SessionContext, storage: StoragePort,
  options: { random?: Random; now?: () => string } = {}) {
  const random = options.random ?? Math.random;
  const now = options.now ?? (() => new Date().toISOString());
  const restored = restoreDateNight(context, storage);
  let state: GameplayState = {
    screen: restored?.status === 'playing' ? 'playing' : restored?.status === 'ended' ? 'ended' : restored ? 'setup' : 'home',
    configuration: restored?.configuration ?? { vibe: 'cozy', durationMinutes: 15, intensityCeiling: 'sweet' },
    session: restored?.status === 'setup' ? null : restored,
    revision: 0,
  };
  function getState(): GameplayState { return structuredClone(state); }
  function success(): GameplayResult { return { ok: true, state: getState() }; }
  function stale(revision: number) { return revision !== state.revision; }
  function safeWrite(operation: () => boolean): boolean {
    try { return operation(); } catch { return false; }
  }
  function expose(session: GameSession) {
    state = { screen: session.status === 'ended' ? 'ended' : 'playing', session,
      configuration: structuredClone(session.configuration), revision: state.revision + 1 };
  }
  function perform(action: SessionAction, expectedRevision: number): GameplayResult {
    if (stale(expectedRevision)) return { ok: false, reason: 'stale_action' };
    if (!state.session) return { ok: false, reason: 'invalid_state' };
    const result = applySessionAction(context, state.session, action, { at: now(), random });
    if (!result.ok) return result;
    if (!result.changed) return success();
    if (!safeWrite(() => storage.saveSession(result.session))) return { ok: false, reason: 'storage_unavailable' };
    expose(result.session);
    return success();
  }
  function composeAndSave(configuration: DateNightConfiguration): GameplayResult {
    // The existing start path validates and persists before returning a playable candidate.
    // Guard throwing storage ports as well as the normal guarded localStorage adapter.
    const guarded = { loadSession: storage.loadSession,
      saveSession: (session: GameSession) => safeWrite(() => storage.saveSession(session)) };
    let result;
    try { result = startDateNight(context, configuration, guarded, random); }
    catch { return { ok: false, reason: 'invalid_configuration' }; }
    if (!result.ok) return result;
    expose(result.session);
    return success();
  }
  function start(configuration: DateNightConfiguration, expectedRevision: number): GameplayResult {
    if (stale(expectedRevision)) return { ok: false, reason: 'stale_action' };
    if (state.session) return { ok: false, reason: 'invalid_state' };
    return composeAndSave(configuration);
  }
  function newDate(expectedRevision: number): GameplayResult {
    if (stale(expectedRevision)) return { ok: false, reason: 'stale_action' };
    if (!state.session) return { ok: false, reason: 'invalid_state' };
    return composeAndSave(state.configuration);
  }
  function leave(screen: 'home' | 'setup', expectedRevision: number): GameplayResult {
    if (stale(expectedRevision)) return { ok: false, reason: 'stale_action' };
    if (!safeWrite(() => storage.removeSession())) return { ok: false, reason: 'storage_unavailable' };
    state = { screen, configuration: structuredClone(state.configuration), session: null, revision: state.revision + 1 };
    return success();
  }
  return { getState, perform, start, newDate,
    changeVibe: (revision: number) => leave('setup', revision),
    home: (revision: number) => leave('home', revision) };
}
