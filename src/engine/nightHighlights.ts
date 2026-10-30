import type { Player, PlayerSessionStats } from '../types/session.ts';

export type NightHighlight = { metric: 'sip' | 'spill' | 'skip'; text: string };

function joinNames(names: string[]): string {
  if (names.length === 1) return names[0]!;
  if (names.length === 2) return `${names[0]} & ${names[1]}`;
  return `${names.slice(0, -1).join(', ')} & ${names.at(-1)!}`;
}

function leaders(
  players: Player[],
  stats: Record<string, PlayerSessionStats>,
  field: keyof PlayerSessionStats,
): string[] {
  const maximum = Math.max(0, ...players.map(player => stats[player.id]?.[field] ?? 0));
  return maximum === 0 ? [] : players
    .filter(player => (stats[player.id]?.[field] ?? 0) === maximum)
    .map(player => player.name);
}

export function getNightHighlights(
  players: Player[],
  stats: Record<string, PlayerSessionStats> = {},
): NightHighlight[] {
  const sip = leaders(players, stats, 'sipCount');
  const spill = leaders(players, stats, 'spillCount');
  const skip = leaders(players, stats, 'skipCount');
  return [
    ...(sip.length ? [{ metric: 'sip' as const, text: sip.length === 1
      ? `👑 ${sip[0]} was the Queen of Sips`
      : `👑 ${joinNames(sip)} shared the Sip crown` }] : []),
    ...(spill.length ? [{ metric: 'spill' as const,
      text: `💋 ${joinNames(spill)} spilled the most tea` }] : []),
    ...(skip.length ? [{ metric: 'skip' as const,
      text: `😏 ${joinNames(skip)} hit Skip the most` }] : []),
  ];
}
