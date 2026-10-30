export const VIBES = ['cozy', 'funny', 'romantic', 'competitive'] as const;
export const INTENSITIES = ['sweet', 'flirty'] as const;
export const ACTIVITIES = ['connect', 'predict', 'play', 'challenge'] as const;
export const SESSION_DURATIONS = [15, 30] as const;
export type Vibe = typeof VIBES[number];
export type IntensityLevel = typeof INTENSITIES[number];
export type Activity = typeof ACTIVITIES[number];
export type SessionDuration = typeof SESSION_DURATIONS[number];

export type DateNightConfiguration = {
  vibe: Vibe;
  durationMinutes: SessionDuration;
  intensityCeiling: IntensityLevel;
};

export type GameManifest = {
  id: string;
  name: string;
  version: string;
  themeId: string;
  vibes: Vibe[];
  durations: SessionDuration[];
  allowedIntensities: IntensityLevel[];
  categories: { id: Activity; label: string }[];
  actions: { id: string; label: string }[];
};
