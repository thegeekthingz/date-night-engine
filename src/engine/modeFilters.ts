import type { LoadedGame } from '../legacy/engine/gameLoader.ts';
import type { GameSession } from '../legacy/types/session.ts';

export function usesFullMix(session: GameSession, game: LoadedGame): boolean {
  return game.manifest.modes.find(mode => mode.id === session.modeId)?.filterMode === 'all';
}

// Setup preserves manual choices; only the effective selection uses the full mix.
export function setupFilters(session: GameSession, game: LoadedGame) {
  return session.status === 'setup' && usesFullMix(session, game) ? {
    selectedCategoryIds: game.manifest.categories.map(category => category.id),
    selectedIntensities: game.manifest.intensityEnabled ? game.manifest.allowedIntensities ?? [] : [],
  } : { selectedCategoryIds: session.selectedCategoryIds, selectedIntensities: session.selectedIntensities };
}
