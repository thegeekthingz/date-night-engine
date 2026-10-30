import theme from './themes/date-night-warm.json' with { type: 'json' };
import manifest from './manifests/date-night-v1.json' with { type: 'json' };
import cards from './cards/date-night-v1.json' with { type: 'json' };
import { loadGame } from '../engine/gameLoader.ts';

// Production content version 2.0.0 invalidates preview saves; session schema stays v1.
export function loadDefaultGame() {
  return loadGame(manifest, cards, theme);
}
