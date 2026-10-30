import manifest from './games/spill-or-sip.json' with { type: 'json' };
import cards from './cards/spill-or-sip-girls-night.json' with { type: 'json' };
import theme from './themes/girls-night-hybrid-premium.json' with { type: 'json' };
import { loadGame } from '../engine/gameLoader.ts';

// The default content selection belongs to the data layer, not the UI.
export function loadDefaultGame() {
  return loadGame(manifest, cards, theme);
}
