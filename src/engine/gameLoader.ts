import type { Card } from '../types/card.ts';
import type { GameManifest } from '../types/game.ts';
import type { GameTheme } from '../types/theme.ts';
import { parseCards } from './cardValidation.ts';
import { parseManifest } from './manifestValidation.ts';
import { parseTheme } from './themeValidation.ts';

export type LoadedGame = {
  manifest: GameManifest;
  cards: Card[];
  theme: GameTheme;
};

export function loadManifest(data: unknown): GameManifest {
  return parseManifest(data, 'manifest');
}

export function loadCardPack(data: unknown): Card[] {
  return parseCards(data, 'cards');
}

export function loadTheme(data: unknown): GameTheme {
  return parseTheme(data, 'theme');
}

export function loadGame(manifestData: unknown, cardData: unknown, themeData: unknown): LoadedGame {
  const manifest = loadManifest(manifestData);
  const cards = loadCardPack(cardData);
  const theme = loadTheme(themeData);

  if (manifest.themeId !== theme.id) {
    throw new Error('manifest.themeId: does not match the loaded theme.');
  }
  for (const [index, card] of cards.entries()) {
    if (!manifest.categories.some(category => category.id === card.categoryId)) {
      throw new Error(`cards[${index}].categoryId: unknown manifest category.`);
    }
    for (const actionId of card.actionIds ?? []) {
      if (!manifest.actions.some(action => action.id === actionId)) {
        throw new Error(`cards[${index}].actionIds: unknown manifest action.`);
      }
    }
  }
  return { manifest, cards, theme };
}
