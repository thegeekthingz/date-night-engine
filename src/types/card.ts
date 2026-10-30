import type { Activity, IntensityLevel, Vibe } from './game.ts';

export type MediaAsset = {
  id: string;
  type: 'image' | 'gif' | 'video';
  src: string;
  alt?: string;
  poster?: string;
  aspectRatio?: string;
};
export type CardType = 'question' | 'story' | 'challenge' | 'prediction' | 'activity' | 'custom';
export type Card = {
  id: string;
  text: string;
  categoryId: Activity;
  type: CardType;
  intensity: IntensityLevel;
  moods: Vibe[];
  durationMinutes: number;
  isCloser: boolean;
  revealText?: string;
  actionIds?: string[];
  media?: MediaAsset[];
  tags?: string[];
  active: boolean;
};
