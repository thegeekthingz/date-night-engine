import type { LoadedGame } from './gameLoader.ts';
import type { GameSession } from '../types/session.ts';
import { createSession, endSession, restartSession } from './sessionManager.ts';
import { isSessionCompatible, selectSessionCard } from './gameSession.ts';
import { getLengthTarget } from '../../engine/sessionLength.ts';
import { setupFilters, usesFullMix } from '../../engine/modeFilters.ts';
import { getEligibleCards } from '../../engine/cardSelector.ts';

export function restoreShellSession(game: LoadedGame, saved: GameSession | null) {
  if (!saved || !isSessionCompatible(saved, game)) return null;
  if (saved.effectiveTarget !== undefined && saved.effectiveTarget > getEligiblePoolTotal(saved, game)) return null;
  return saved.players.length && saved.currentPlayerIndex === undefined
    ? { ...saved, currentPlayerIndex: 0 } : saved;
}

export function createSetupSession(game: LoadedGame): GameSession {
  const mode = game.manifest.modes[0];
  if (!mode) throw new Error('No game modes are configured.');
  return createSession({
    gameId: game.manifest.id, gameVersion: game.manifest.version, modeId: mode.id,
    selectedCategoryIds: game.manifest.categories.map(category => category.id),
    selectedIntensities: game.manifest.intensityEnabled ? game.manifest.allowedIntensities ?? [] : [],
  });
}

// Count the starting pool, not the shrinking unplayed pool. Saved filters recreate
// the same total after refresh without adding redundant persisted session fields.
export function getEligiblePoolTotal(session: GameSession, game: LoadedGame): number {
  session = { ...session, ...setupFilters(session, game) };
  if (game.manifest.categories.length && !session.selectedCategoryIds.length) return 0;
  if (game.manifest.intensityEnabled && game.manifest.allowedIntensities?.length && !session.selectedIntensities.length) return 0;
  return getEligibleCards(game.cards, {
    ...session, playedCardIds: [], allowRepeats: false,
  }).length;
}

export function getSessionCardTotal(session: GameSession, game: LoadedGame): number {
  return session.effectiveTarget ?? getEligiblePoolTotal(session, game);
}

export function setupError(session: GameSession, game: LoadedGame): string | null {
  session = { ...session, ...setupFilters(session, game) };
  if (!isSessionCompatible(session, game)) return 'Choose valid game settings.';
  if (game.manifest.categories.length && !session.selectedCategoryIds.length) return 'Choose at least one category.';
  if (game.manifest.intensityEnabled && game.manifest.allowedIntensities?.length && !session.selectedIntensities.length) {
    return 'Choose at least one intensity.';
  }
  if (game.manifest.maxPlayers !== undefined && session.players.length > game.manifest.maxPlayers) {
    return `Enter no more than ${game.manifest.maxPlayers} player names.`;
  }
  return getEligibleCards(game.cards, { ...session, allowRepeats: game.manifest.allowRepeats }).length
    ? null : 'No cards match these settings. Choose different categories or intensities.';
}

export function startGame(session: GameSession, game: LoadedGame, random = Math.random): GameSession {
  const error = setupError(session, game);
  if (error) throw new Error(error);
  const players = session.players.map(player => ({ ...player, name: player.name.trim() })).filter(player => player.name);
  const ready = { ...session, players, ...setupFilters(session, game) };
  if (usesFullMix(session, game) && session.status === 'setup') {
    ready.manualFilters = { selectedCategoryIds: [...session.selectedCategoryIds], selectedIntensities: [...session.selectedIntensities] };
  }
  delete ready.currentPlayerIndex;
  delete ready.effectiveTarget;
  if (players.length) {
    ready.currentPlayerIndex = 0;
    ready.sessionLengthMode = session.sessionLengthMode ?? 'standard';
    ready.effectiveTarget = getLengthTarget(ready.sessionLengthMode, players.length, getEligiblePoolTotal(ready, game)).effective;
    ready.playerStats = Object.fromEntries(players.map(player => [player.id,
      { spillCount: 0, sipCount: 0, skipCount: 0 }]));
  } else {
    delete ready.sessionLengthMode;
    delete ready.playerStats;
  }
  ready.consumedCardCount = 0;
  return selectSessionCard(ready, game, random);
}

export function advanceGame(session: GameSession, game: LoadedGame, random = Math.random): GameSession {
  if (session.status === 'ended') return session;
  // History already contains the revealed card. Finish on its action, not on
  // reveal, so every target card is playable and no extra card is drawn.
  if (session.effectiveTarget !== undefined && session.playedCardIds.length >= session.effectiveTarget) {
    return endSession(session);
  }
  const next = selectSessionCard(session, game, random);
  return next === session && game.manifest.endCondition === 'deck_complete'
    ? endSession(session) : next;
}

// Both responses and skips use the same selector/history path. Only an answered
// card advances the optional player turn; exhaustion never rotates without a draw.
export function consumeCard(session: GameSession, game: LoadedGame, kind: 'spill' | 'sip' | 'answer' | 'skip', random = Math.random): GameSession {
  if (session.status !== 'playing') return session;
  if (session.effectiveTarget === undefined && game.manifest.endCondition !== 'deck_complete' &&
      getEligibleCards(game.cards, { ...session, allowRepeats: game.manifest.allowRepeats }).length === 0) {
    return session;
  }
  const index = session.currentPlayerIndex ?? 0;
  const player = session.players[index];
  const recorded = structuredClone(session);
  recorded.consumedCardCount = (session.consumedCardCount ?? 0) + 1;
  if (player && kind !== 'answer') {
    const current = recorded.playerStats?.[player.id] ?? { spillCount: 0, sipCount: 0, skipCount: 0 };
    const field = kind === 'spill' ? 'spillCount' : kind === 'sip' ? 'sipCount' : 'skipCount';
    recorded.playerStats = { ...recorded.playerStats, [player.id]: {
      ...current,
      [field]: current[field] + 1,
    } };
  }
  const next = advanceGame(recorded, game, random);
  if (next.status !== 'playing' || !session.players.length) return next;
  return { ...next, currentPlayerIndex: kind === 'skip' ? index : (index + 1) % session.players.length };
}

export function playAgain(session: GameSession, game: LoadedGame, random = Math.random): GameSession {
  return startGame(restartSession(session), game, random);
}

export function getPlayView(session: GameSession, game: LoadedGame) {
  const card = game.cards.find(item => item.id === session.currentCardId);
  return {
    card,
    currentPlayer: session.players[session.currentPlayerIndex ?? 0],
    category: game.manifest.categories.find(item => item.id === card?.categoryId)?.label ?? '',
    actions: game.manifest.actions.filter(action => action.id !== 'skip' &&
      (card?.actionIds === undefined || card.actionIds.includes(action.id))),
    exhausted: session.effectiveTarget === undefined && getEligibleCards(game.cards, { ...session, allowRepeats: game.manifest.allowRepeats }).length === 0,
  };
}
