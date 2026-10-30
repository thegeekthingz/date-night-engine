import type { IntensityLevel } from './game';

export type CardType =
  | 'confession'
  | 'question'
  | 'story'
  | 'challenge'
  | 'vote'
  | 'most-likely'
  | 'truth'
  | 'dare'
  | 'group-action'
  | 'custom';

export type TargetRule =
  | { type: 'none' }
  | { type: 'current-player' }
  | { type: 'random-player' }
  | { type: 'all-players' }
  | { type: 'named-player'; playerId: string };

export type MediaType = 'image' | 'gif' | 'video';

export type MediaAsset = {
  id: string;
  type: MediaType;
  src: string;
  alt?: string;
  poster?: string;
  aspectRatio?: string;
};

export type Card = {
  id: string;
  text: string;
  categoryId: string;
  intensity: IntensityLevel;
  type: CardType;
  target?: TargetRule;
  actionIds?: string[];
  points?: number;
  penalty?: string;
  timerSeconds?: number;
  media?: MediaAsset[];
  tags?: string[];
  active: boolean;
};
