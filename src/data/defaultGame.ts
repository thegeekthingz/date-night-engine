import theme from './themes/girls-night-hybrid-premium.json' with { type: 'json' };
import { loadGame } from '../engine/gameLoader.ts';
import { INTENSITIES, VIBES } from '../types/game.ts';
import { SESSION_SLOTS } from '../types/session.ts';
import type { Card } from '../types/card.ts';

function infrastructureCards(): Card[] {
  // Keep the first five Phase 2 IDs/order stable. Universal moods are deliberate fixture
  // coverage, not a claim about the suitability of any future customer-facing content.
  const base = SESSION_SLOTS.map((slot, index): Card => ({
    id: `fixture-${index + 1}`, text: `Infrastructure fixture ${index + 1}`,
    categoryId: slot === 'closer' ? 'connect' : slot, type: 'activity',
    intensity: 'sweet', moods: [...VIBES], durationMinutes: 3,
    isCloser: slot === 'closer', active: true,
  }));
  const alternatives = SESSION_SLOTS.flatMap(slot => [3, 6].flatMap(durationMinutes =>
    INTENSITIES.flatMap(intensity => [1, 2].flatMap(variant => {
      // The base already supplies variant one for the short/sweet case.
      if (durationMinutes === 3 && intensity === 'sweet' && variant === 1) return [];
      return [{ id: `fixture-${slot}-${durationMinutes}-${intensity}-${variant}`,
        text: `Infrastructure fixture: ${slot}, ${durationMinutes} minutes, ${intensity}, ${variant}`,
        categoryId: slot === 'closer' ? 'connect' : slot, type: 'activity' as const,
        intensity, moods: [...VIBES], durationMinutes, isCloser: slot === 'closer', active: true }];
    }))));
  return [...base, ...alternatives];
}

// Infrastructure fixture only: these 40 items are not the final product pack.
export function loadDefaultGame() {
  return loadGame({
    id: 'date-night', name: 'Date Night', version: '1.0.1', themeId: theme.id,
    vibes: ['cozy', 'funny', 'romantic', 'competitive'], durations: [15, 30],
    allowedIntensities: ['sweet', 'flirty'],
    categories: ['connect', 'predict', 'play', 'challenge'].map(id => ({ id, label: id })),
    actions: [],
  }, infrastructureCards(), theme);
}
