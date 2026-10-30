import type { GameSession, Player, PlayerSessionStats } from '../types/session.ts';
import { array, intensity, number, object, oneOf, optional, string } from './validation.ts';
import type { Parser } from './validation.ts';

const timestamp: Parser<string> = (value, path) => {
  const result = string(value, path);
  if (!Number.isFinite(Date.parse(result))) throw new Error(`${path}: invalid timestamp.`);
  return result;
};
const scores: Parser<Record<string, number>> = (value, path) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path}: expected a score record.`);
  }
  return Object.fromEntries(Object.entries(value).map(([id, score]) =>
    [id, number(score, `${path}.${id}`)],
  ));
};
const playerStat = object<PlayerSessionStats>({
  spillCount: number,
  sipCount: number,
  skipCount: number,
});
const playerStats: Parser<Record<string, PlayerSessionStats>> = (value, path) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${path}: expected a player stats record.`);
  }
  return Object.fromEntries(Object.entries(value).map(([id, stats]) =>
    [id, playerStat(stats, `${path}.${id}`)],
  ));
};
const player = object<Player>({ id: string, name: string, score: optional(number) });
const session = object<GameSession>({
  id: string,
  gameId: string,
  gameVersion: string,
  startedAt: timestamp,
  endedAt: optional(timestamp),
  modeId: string,
  manualFilters: optional(object({ selectedCategoryIds: array(string), selectedIntensities: array(intensity) })),
  selectedCategoryIds: array(string),
  selectedIntensities: array(intensity),
  players: array(player),
  currentPlayerIndex: optional(number),
  sessionLengthMode: optional(oneOf('quick', 'standard', 'long', 'all')),
  effectiveTarget: optional(number),
  playerStats: optional(playerStats),
  consumedCardCount: optional(number),
  playedCardIds: array(string),
  scores: optional(scores),
  currentCardId: optional(string),
  status: oneOf('setup', 'playing', 'ended'),
});

export function parseSession(value: unknown): GameSession {
  const result = session(value, 'session');
  if (result.consumedCardCount !== undefined &&
      (!Number.isInteger(result.consumedCardCount) || result.consumedCardCount < 0)) {
    throw new Error('session.consumedCardCount: invalid consumed card count.');
  }
  if (result.playerStats) {
    const playerIds = new Set(result.players.map(item => item.id));
    if (Object.keys(result.playerStats).some(id => !playerIds.has(id)) ||
        Object.values(result.playerStats).some(stats =>
          Object.values(stats).some(count => !Number.isInteger(count) || count < 0))) {
      throw new Error('session.playerStats: invalid player stats.');
    }
  }
  if (result.effectiveTarget !== undefined &&
      (!Number.isInteger(result.effectiveTarget) || result.effectiveTarget < 1 ||
        result.playedCardIds.length > result.effectiveTarget || !result.sessionLengthMode ||
        !result.players.length || result.status === 'setup')) {
    throw new Error('session.effectiveTarget: invalid session target.');
  }
  if (result.currentCardId !== undefined && !result.playedCardIds.includes(result.currentCardId)) {
    throw new Error('session.currentCardId: must be included in playedCardIds.');
  }
  if ((result.status === 'ended') !== (result.endedAt !== undefined)) {
    throw new Error('session.endedAt: must be present only for ended sessions.');
  }
  if (result.currentPlayerIndex !== undefined &&
      (!Number.isInteger(result.currentPlayerIndex) || result.currentPlayerIndex < 0 ||
        result.currentPlayerIndex >= result.players.length)) {
    throw new Error('session.currentPlayerIndex: invalid player index.');
  }
  return result;
}
