import type { GameManifest, GameModeConfig } from '../types/game.ts';
import { array, boolean, intensity, number, object, oneOf, optional, string } from './validation.ts';

// Modes, categories, and actions share the same id/label shape.
const labeledConfig = object<Pick<GameModeConfig, 'id' | 'label'>>({ id: string, label: string });

export const parseManifest = object<GameManifest>({
  id: string,
  name: string,
  edition: optional(string),
  version: string,
  audience: array(string),
  occasion: array(string),
  minPlayers: number,
  maxPlayers: optional(number),
  turnMode: oneOf('none', 'sequential'),
  modes: array(object<GameModeConfig>({ id: string, label: string, description: optional(string), filterMode: optional(oneOf('all')) })),
  categories: array(labeledConfig),
  actions: array(labeledConfig),
  intensityEnabled: boolean,
  allowedIntensities: optional(array(intensity)),
  scoringEnabled: boolean,
  timerEnabled: boolean,
  allowRepeats: boolean,
  endCondition: oneOf('manual', 'deck_complete', 'round_limit'),
  themeId: string,
  adultContent: boolean,
  ageNotice: optional(string),
});
