import type { DateNightConfiguration } from '../types/game.ts';
import type { GameSession } from '../types/session.ts';
import { composeSession } from './sessionComposer.ts';
import type { CompositionFailure, Random } from './sessionComposer.ts';
import { createSession } from './sessionManager.ts';
import { parseSession } from './sessionValidation.ts';
import type { SessionContext } from './sessionValidation.ts';

type SessionStorage = { saveSession: (session: GameSession) => boolean; loadSession: () => GameSession | null };
export type StartResult = { ok: true; session: GameSession; totalDurationMinutes: number } |
  { ok: false; reason: CompositionFailure | 'storage_unavailable' };

export function startDateNight(context: SessionContext, configuration: DateNightConfiguration,
  storage: SessionStorage, random: Random = Math.random): StartResult {
  const result = composeSession(context, configuration, random);
  if (!result.ok) return result;
  const setup = createSession(context, configuration, result.queue);
  const session = parseSession({ ...setup, status: 'playing',
    displayedItemIds: [result.queue[0].itemId] }, context);
  // Return a playable state only after the complete validated queue was saved successfully.
  if (!storage.saveSession(session)) return { ok: false, reason: 'storage_unavailable' };
  return { ok: true, session, totalDurationMinutes: result.totalDurationMinutes };
}

// Restore has no dependency on randomness or composition. Never replace a saved queue.
export function restoreDateNight(context: SessionContext, storage: SessionStorage): GameSession | null {
  const saved = storage.loadSession();
  if (!saved) return null;
  return parseSession(saved, context);
}
