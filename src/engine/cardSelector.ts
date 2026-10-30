import type { Card } from '../types/card.ts';
import type { IntensityLevel } from '../types/game.ts';

export type CardSelectionOptions = {
  selectedCategoryIds: readonly string[];
  selectedIntensities: readonly IntensityLevel[];
  playedCardIds: readonly string[];
  allowRepeats: boolean;
};

// Empty filter lists mean no restriction. History is supplied by the caller.
export function getEligibleCards(
  cards: readonly Card[],
  options: CardSelectionOptions,
): Card[] {
  const categories = new Set(options.selectedCategoryIds);
  const intensities = new Set(options.selectedIntensities);
  const played = new Set(options.playedCardIds);

  return cards.filter(card =>
    card.active &&
    (categories.size === 0 || categories.has(card.categoryId)) &&
    (intensities.size === 0 || intensities.has(card.intensity)) &&
    (options.allowRepeats || !played.has(card.id)),
  );
}

// Returns an existing card reference without modifying the pack or history.
// A random source must return a finite number in [0, 1), like Math.random.
export function selectCard(
  cards: readonly Card[],
  options: CardSelectionOptions,
  random: () => number = Math.random,
): Card | null {
  const eligible = getEligibleCards(cards, options);
  if (eligible.length === 0) return null;

  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new RangeError('Random source must return a finite number in [0, 1).');
  }

  return eligible[Math.floor(value * eligible.length)] ?? null;
}
