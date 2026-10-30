import type { DateNightConfiguration } from '../types/game.ts';
import type { GameSession, SessionQueue } from '../types/session.ts';
import { SESSION_SCHEMA_VERSION } from '../types/session.ts';
import { createId } from '../utils/createId.ts';
import { parseSession } from './sessionValidation.ts';
import type { SessionContext } from './sessionValidation.ts';

// The caller must supply the complete queue. This does not select or advance items.
export function createSession(context: SessionContext, configuration: DateNightConfiguration,
  queue: SessionQueue): GameSession {
  return parseSession({
    id: createId(), gameId: context.manifest.id, gameVersion: context.manifest.version,
    schemaVersion: SESSION_SCHEMA_VERSION, startedAt: new Date().toISOString(), status: 'setup',
    configuration, queue, currentSlot: 0, displayedItemIds: [], swappedItemIds: [], revealState: 'hidden',
  }, context);
}
