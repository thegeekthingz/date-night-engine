import type { DateNightConfiguration } from './game.ts';

export const SESSION_SCHEMA_VERSION = 1 as const;
export const SESSION_SLOTS = ['connect', 'predict', 'play', 'challenge', 'closer'] as const;
export type SessionSlot = typeof SESSION_SLOTS[number];
export type QueueEntry<S extends SessionSlot = SessionSlot> = { slot: S; itemId: string };
export type SessionQueue = [QueueEntry<'connect'>, QueueEntry<'predict'>, QueueEntry<'play'>,
  QueueEntry<'challenge'>, QueueEntry<'closer'>];
export type GameSession = {
  id: string;
  gameId: string;
  gameVersion: string;
  schemaVersion: typeof SESSION_SCHEMA_VERSION;
  startedAt: string;
  endedAt?: string;
  status: 'setup' | 'playing' | 'ended';
  configuration: DateNightConfiguration;
  queue: SessionQueue;
  currentSlot: number;
  displayedItemIds: string[];
  swappedItemIds: string[];
  revealState: 'hidden' | 'revealed';
  endedReason?: 'completed' | 'cancelled';
};
