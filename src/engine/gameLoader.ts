import type { Card } from '../types/card.ts';
import type { GameManifest } from '../types/game.ts';
import type { GameTheme } from '../types/theme.ts';
import { parseCards } from './cardValidation.ts';
import { parseManifest } from './manifestValidation.ts';
import { parseTheme } from './themeValidation.ts';
export type LoadedGame = { manifest: GameManifest; cards: Card[]; theme: GameTheme };
export const loadManifest = parseManifest;
export const loadCardPack = parseCards;
export function loadTheme(data: unknown) { return parseTheme(data, 'theme'); }
export function loadGame(manifestData: unknown, cardData: unknown, themeData: unknown): LoadedGame {
  const manifest = parseManifest(manifestData);
  const cards = parseCards(cardData);
  const theme = loadTheme(themeData);
  if (manifest.themeId !== theme.id) throw new Error('manifest.themeId: theme mismatch.');
  for (const card of cards) {
    if (!manifest.allowedIntensities.includes(card.intensity) ||
        card.moods.some(mood => !manifest.vibes.includes(mood)) ||
        !manifest.categories.some(category => category.id === card.categoryId) ||
        card.actionIds?.some(action => !manifest.actions.some(x => x.id === action))) {
      throw new Error(`cards.${card.id}: unsupported manifest metadata.`);
    }
  }
  return { manifest, cards, theme };
}
