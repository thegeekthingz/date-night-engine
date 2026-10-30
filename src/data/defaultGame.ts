import theme from './themes/girls-night-hybrid-premium.json' with { type: 'json' };
import { loadGame } from '../engine/gameLoader.ts';

// Infrastructure fixture only: these five items are not the final product pack.
export function loadDefaultGame() {
  return loadGame({
    id: 'date-night', name: 'Date Night', version: '1.0.0', themeId: theme.id,
    vibes: ['cozy', 'funny', 'romantic', 'competitive'], durations: [15, 30],
    allowedIntensities: ['sweet', 'flirty'],
    categories: ['connect', 'predict', 'play', 'challenge'].map(id => ({ id, label: id })),
    actions: [],
  }, ['connect', 'predict', 'play', 'challenge', 'connect'].map((categoryId, index) => ({
    id: `fixture-${index + 1}`, text: `Infrastructure fixture ${index + 1}`,
    categoryId, type: 'activity', intensity: 'sweet', moods: ['cozy'],
    durationMinutes: 1, isCloser: index === 4, active: true,
  })), theme);
}
