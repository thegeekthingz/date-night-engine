export type IntensityLevel = 'mild' | 'spicy' | 'wild';

export type GameModeConfig = {
  id: string;
  label: string;
  description?: string;
  filterMode?: 'all';
};

export type CategoryConfig = {
  id: string;
  label: string;
};

export type ActionConfig = {
  id: string;
  label: string;
};

export type GameManifest = {
  id: string;
  name: string;
  edition?: string;
  version: string;
  audience: string[];
  occasion: string[];
  minPlayers: number;
  maxPlayers?: number;
  turnMode: 'none' | 'sequential';
  modes: GameModeConfig[];
  categories: CategoryConfig[];
  actions: ActionConfig[];
  intensityEnabled: boolean;
  allowedIntensities?: IntensityLevel[];
  scoringEnabled: boolean;
  timerEnabled: boolean;
  allowRepeats: boolean;
  endCondition: 'manual' | 'deck_complete' | 'round_limit';
  themeId: string;
  adultContent: boolean;
  ageNotice?: string;
};
