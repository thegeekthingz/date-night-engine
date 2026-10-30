import type { GameSession, Player } from '../types/session.ts';
import { validPlayerCount } from './sessionLength.ts';
import { createId } from '../utils/createId.ts';

export type SessionSettings = Pick<GameSession,
  'modeId' | 'selectedCategoryIds' | 'selectedIntensities'
> & Pick<GameSession, 'sessionLengthMode'> & { players?: Player[] };
export type NewSessionOptions = SessionSettings & Pick<GameSession, 'gameId' | 'gameVersion'>;

export function createSession(options: NewSessionOptions): GameSession {
  return {
    id: createId(),
    gameId: options.gameId,
    gameVersion: options.gameVersion,
    startedAt: new Date().toISOString(),
    modeId: options.modeId,
    selectedCategoryIds: [...options.selectedCategoryIds],
    selectedIntensities: [...options.selectedIntensities],
    players: (options.players ?? []).map(({ id, name }) => ({ id, name })),
    ...(options.sessionLengthMode !== undefined && validPlayerCount(options.players ?? [])
      ? { sessionLengthMode: options.sessionLengthMode } : {}),
    playedCardIds: [],
    status: 'setup',
  };
}

// Settings can change during setup; restart first to change an active game.
export function updateSessionSettings(
  session: GameSession,
  settings: Partial<SessionSettings>,
): GameSession {
  if (session.status !== 'setup') throw new Error('Session settings can only change during setup.');
  const next = structuredClone({ ...session, ...settings });
  delete next.effectiveTarget;
  if (!validPlayerCount(next.players)) delete next.sessionLengthMode;
  else if (!validPlayerCount(session.players) || next.sessionLengthMode === undefined) {
    next.sessionLengthMode = settings.sessionLengthMode ?? 'standard';
  }
  return next;
}

export function recordPlayedCard(session: GameSession, cardId: string): GameSession {
  if (session.status === 'ended') throw new Error('Cannot select a card in an ended session.');
  return {
    ...structuredClone(session),
    currentCardId: cardId,
    playedCardIds: session.playedCardIds.includes(cardId)
      ? [...session.playedCardIds]
      : [...session.playedCardIds, cardId],
    status: 'playing',
  };
}

export function endSession(session: GameSession): GameSession {
  return {
    ...structuredClone(session),
    status: 'ended',
    endedAt: session.endedAt ?? new Date().toISOString(),
  };
}

// A new identity and timestamp, retaining settings/names but no progress.
export function restartSession(session: GameSession): GameSession {
  return createSession({ ...session, ...session.manualFilters });
}
