import type { LoadedGame } from './gameLoader.ts';
import type { GameSession } from '../types/session.ts';
import { createSession, recordPlayedCard } from './sessionManager.ts';
import { selectCard } from './cardSelector.ts';

export function isSessionCompatible(session: GameSession, game: LoadedGame): boolean {
  const { manifest, cards } = game;
  return session.gameId === manifest.id && session.gameVersion === manifest.version &&
    manifest.modes.some(mode => mode.id === session.modeId) &&
    session.selectedCategoryIds.every(id => manifest.categories.some(category => category.id === id)) &&
    session.selectedIntensities.every(level =>
      !manifest.allowedIntensities || manifest.allowedIntensities.includes(level)) &&
    session.playedCardIds.every(id => cards.some(card => card.id === id)) &&
    (session.currentCardId === undefined || cards.some(card => card.id === session.currentCardId));
}

export function selectSessionCard(
  session: GameSession,
  game: LoadedGame,
  random: () => number = Math.random,
): GameSession {
  if (session.status === 'ended') return session;
  const card = selectCard(game.cards, { ...session, allowRepeats: game.manifest.allowRepeats }, random);
  return card ? recordPlayedCard(session, card.id) : session;
}

// Used by the temporary preview; restored setup sessions stay empty after restart.
export function restoreOrCreateSession(game: LoadedGame, saved: GameSession | null): GameSession {
  if (saved && isSessionCompatible(saved, game)) return saved;
  const mode = game.manifest.modes[0];
  if (!mode) throw new Error('A session requires a configured game mode.');
  const session = createSession({
    gameId: game.manifest.id,
    gameVersion: game.manifest.version,
    modeId: mode.id,
    selectedCategoryIds: game.manifest.categories.map(category => category.id),
    selectedIntensities: game.manifest.allowedIntensities ?? [],
  });
  return selectSessionCard(session, game);
}
