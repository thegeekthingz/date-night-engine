import type { Player, SessionLengthMode } from '../legacy/types/session.ts';

export const SESSION_LENGTHS = [
  { id: 'quick', label: 'Quick', turns: 2 },
  { id: 'standard', label: 'Standard', turns: 4 },
  { id: 'long', label: 'Long', turns: 6 },
  { id: 'all', label: 'All Cards', turns: null },
] as const;

export function validPlayerCount(players: Player[]): number {
  return players.filter(player => player.name.trim()).length;
}

export function getLengthTarget(mode: SessionLengthMode, playerCount: number, eligibleCount: number) {
  const preset = SESSION_LENGTHS.find(item => item.id === mode)!;
  const raw = playerCount && preset.turns !== null ? playerCount * preset.turns : eligibleCount;
  return { raw, effective: Math.min(raw, eligibleCount), capped: raw > eligibleCount };
}
