import type { IntensityLevel } from './game';

export type SessionLengthMode = 'quick' | 'standard' | 'long' | 'all';

export type Player = {
  id: string;
  name: string;
  score?: number;
};

export type PlayerSessionStats = {
  spillCount: number;
  sipCount: number;
  skipCount: number;
};

export type GameSession = {
  id: string;
  gameId: string;
  gameVersion: string;
  startedAt: string;
  endedAt?: string;
  modeId: string;
  manualFilters?: { selectedCategoryIds: string[]; selectedIntensities: IntensityLevel[] };
  selectedCategoryIds: string[];
  selectedIntensities: IntensityLevel[];
  players: Player[];
  currentPlayerIndex?: number;
  sessionLengthMode?: SessionLengthMode;
  effectiveTarget?: number;
  playerStats?: Record<string, PlayerSessionStats>;
  consumedCardCount?: number;
  playedCardIds: string[];
  scores?: Record<string, number>;
  currentCardId?: string;
  status: 'setup' | 'playing' | 'ended';
};
