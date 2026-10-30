import type { Card } from '../types/card.ts';
import type { DateNightConfiguration, SessionDuration } from '../types/game.ts';
import { INTENSITIES, SESSION_DURATIONS, VIBES } from '../types/game.ts';
import type { GameSession, SessionQueue, SessionSlot } from '../types/session.ts';
import { SESSION_SLOTS } from '../types/session.ts';
import { parseCard } from './cardValidation.ts';
import { parseManifest } from './manifestValidation.ts';
import { parseConfiguration, parseQueue, parseSession } from './sessionValidation.ts';
import type { SessionContext } from './sessionValidation.ts';

export type Random = () => number;
export const INTENSITY_RANK = { sweet: 0, flirty: 1 } as const;
export const DURATION_BUDGETS: Readonly<Record<SessionDuration,
  Readonly<{ min: number; max: number; target: number }>>> = {
  15: { min: 10, max: 18, target: 15 },
  30: { min: 20, max: 35, target: 30 },
};
export type CompositionFailure = 'missing_connect' | 'missing_predict' | 'missing_play' |
  'missing_challenge' | 'missing_closer' | 'duration_unavailable' | 'no_valid_recipe';
export type CompositionResult = { ok: true; queue: SessionQueue; totalDurationMinutes: number } |
  { ok: false; reason: CompositionFailure };
export type SlotPools = Record<SessionSlot, Card[]>;
type PoolResult = { ok: true; pools: SlotPools; configuration: DateNightConfiguration } |
  { ok: false; reason: 'no_valid_recipe' };

function draw(random: Random): number {
  const value = random();
  if (!Number.isFinite(value) || value < 0 || value >= 1) {
    throw new Error('random: expected a finite value in [0, 1).');
  }
  return value;
}
function matchesSlot(card: Card, slot: SessionSlot): boolean {
  return slot === 'closer' ? card.isCloser : !card.isCloser && card.categoryId === slot;
}
function withinBudget(total: number, duration: SessionDuration): boolean {
  const budget = DURATION_BUDGETS[duration];
  return total >= budget.min && total <= budget.max;
}

// Canonical card/config/manifest parsing precedes eligibility. No fallback widens a pool.
export function buildSlotPools(context: SessionContext, input: DateNightConfiguration): PoolResult {
  const manifest = parseManifest(context.manifest);
  const configuration = parseConfiguration(input, 'configuration');
  if (!manifest.vibes.includes(configuration.vibe) || !manifest.durations.includes(configuration.durationMinutes) ||
      !manifest.allowedIntensities.includes(configuration.intensityCeiling)) {
    throw new Error('configuration: not supported by manifest.');
  }
  const cards = context.cards.map((card, index) => parseCard(card, `cards[${index}]`));
  // Duplicate content IDs cannot yield a canonically valid recipe; never silently deduplicate.
  if (new Set(cards.map(card => card.id)).size !== cards.length) return { ok: false, reason: 'no_valid_recipe' };
  for (const card of cards) {
    if (!manifest.allowedIntensities.includes(card.intensity) ||
        card.moods.some(mood => !manifest.vibes.includes(mood)) ||
        card.actionIds?.some(id => !manifest.actions.some(action => action.id === id))) {
      throw new Error(`cards.${card.id}: unsupported manifest metadata.`);
    }
  }
  const eligible = cards.filter(card => card.active && card.moods.includes(configuration.vibe) &&
    INTENSITY_RANK[card.intensity] <= INTENSITY_RANK[configuration.intensityCeiling]);
  const pools: SlotPools = { connect: [], predict: [], play: [], challenge: [], closer: [] };
  for (const slot of SESSION_SLOTS) pools[slot] = eligible.filter(card => matchesSlot(card, slot));
  return { ok: true, pools, configuration };
}

export function composeSession(context: SessionContext, input: DateNightConfiguration,
  random: Random = Math.random): CompositionResult {
  const result = buildSlotPools(context, input);
  if (!result.ok) return result;
  const { pools, configuration } = result;
  // Every branch reserves its closer first. Explore all closer choices rather than pinning a
  // random closer that might make an otherwise valid duration impossible.
  const order = ['closer', 'connect', 'predict', 'play', 'challenge'] as const;
  for (const slot of order) {
    if (!pools[slot].length) return { ok: false, reason: `missing_${slot}` };
  }
  const budget = DURATION_BUDGETS[configuration.durationMinutes];
  const minimum: Partial<Record<SessionSlot, number>> = {};
  const maximum: Partial<Record<SessionSlot, number>> = {};
  for (const slot of order) {
    minimum[slot] = Math.min(...pools[slot].map(card => card.durationMinutes));
    maximum[slot] = Math.max(...pools[slot].map(card => card.durationMinutes));
  }
  const chosen: Partial<Record<SessionSlot, Card>> = {};
  const used = new Set<string>();
  let best: Card[] | undefined;
  let bestDistance = Infinity;
  let equalCount = 0;
  let bestTotal = 0;

  // Depth is exactly five. Each candidate is visited at most once per prefix; the finite
  // node bound is 1 + sum(product(pool sizes in each prefix)), with no retry loop/cap bias.
  function visit(depth: number): void {
    // Always add in canonical queue order, including bounds, so fractional durations use
    // the same arithmetic before Play, on restore and on replacement.
    const low = SESSION_SLOTS.reduce((sum, slot) => sum + (chosen[slot]?.durationMinutes ?? minimum[slot]!), 0);
    const high = SESSION_SLOTS.reduce((sum, slot) => sum + (chosen[slot]?.durationMinutes ?? maximum[slot]!), 0);
    if (low > budget.max || high < budget.min) return;
    const closestPossible = Math.max(low - budget.target, budget.target - high, 0);
    if (closestPossible > bestDistance) return;
    const slot = order[depth];
    if (slot === undefined) {
      const total = low;
      if (!withinBudget(total, configuration.durationMinutes)) return;
      const distance = Math.abs(total - budget.target);
      if (distance < bestDistance) {
        bestDistance = distance;
        equalCount = 1;
      } else if (distance === bestDistance) {
        equalCount++;
        // Reservoir sampling chooses uniformly among equally close complete recipes.
        if (draw(random) >= 1 / equalCount) return;
      } else return;
      best = SESSION_SLOTS.map(name => chosen[name]!);
      bestTotal = total;
      return;
    }
    for (const card of pools[slot]) {
      if (used.has(card.id)) continue;
      used.add(card.id);
      chosen[slot] = card;
      visit(depth + 1);
      delete chosen[slot];
      used.delete(card.id);
    }
  }
  visit(0);
  if (!best) return { ok: false, reason: 'duration_unavailable' };
  const selected = best;
  const queue = parseQueue(SESSION_SLOTS.map((slot, index) => ({ slot, itemId: selected[index]!.id })), context.cards);
  return { ok: true, queue, totalDurationMinutes: bestTotal };
}

export function getQueueDuration(queue: SessionQueue, context: SessionContext): number {
  return parseQueue(queue, context.cards).reduce((total, entry) =>
    total + context.cards.find(card => card.id === entry.itemId)!.durationMinutes, 0);
}

export type ReplacementResult = { ok: true; queue: SessionQueue; totalDurationMinutes: number;
  replacementItemId: string; retiredItemId: string } | { ok: false; reason: 'no_replacement' };

// Selection only: the caller applies history/reveal changes in Phase 4. This also permits
// explicit future-slot planning without falsely recording an unseen item as displayed.
export function selectReplacementForSlot(context: SessionContext, value: GameSession,
  slotIndex = value.currentSlot, random: Random = Math.random): ReplacementResult {
  const session = parseSession(value, context);
  if (session.status !== 'playing') throw new Error('swap: expected a playing session.');
  if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex > 4) throw new Error('swap: invalid slot index.');
  const prepared = buildSlotPools(context, session.configuration);
  if (!prepared.ok) return { ok: false, reason: 'no_replacement' };
  const old = session.queue[slotIndex]!;
  const excluded = new Set([...session.queue.map(item => item.itemId),
    ...session.displayedItemIds, ...session.swappedItemIds]);
  const durations = session.queue.map(entry => context.cards.find(card => card.id === entry.itemId)!.durationMinutes);
  let best: Card | undefined;
  let bestTotal = 0;
  let bestDistance = Infinity;
  let equalCount = 0;
  for (const card of prepared.pools[old.slot]) {
    if (excluded.has(card.id)) continue;
    const total = durations.reduce((sum, duration, index) => sum + (index === slotIndex ? card.durationMinutes : duration), 0);
    if (!withinBudget(total, session.configuration.durationMinutes)) continue;
    const distance = Math.abs(total - session.configuration.durationMinutes);
    if (distance < bestDistance) { bestDistance = distance; equalCount = 1; }
    else if (distance === bestDistance) {
      equalCount++;
      if (draw(random) >= 1 / equalCount) continue;
    } else continue;
    best = card;
    bestTotal = total;
  }
  if (!best) return { ok: false, reason: 'no_replacement' };
  const queue = parseQueue(session.queue.map((entry, index) =>
    index === slotIndex ? { ...entry, itemId: best.id } : entry), context.cards);
  return { ok: true, queue, totalDurationMinutes: bestTotal,
    replacementItemId: best.id, retiredItemId: old.itemId };
}

export function checkCompositionCoverage(context: SessionContext, random: Random = Math.random) {
  return VIBES.flatMap(vibe => SESSION_DURATIONS.flatMap(durationMinutes => INTENSITIES.map(intensityCeiling => {
    const configuration = { vibe, durationMinutes, intensityCeiling };
    return { configuration, result: composeSession(context, configuration, random) };
  })));
}
