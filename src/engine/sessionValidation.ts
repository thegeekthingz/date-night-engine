import type { Card } from '../types/card.ts';
import type { DateNightConfiguration } from '../types/game.ts';
import { INTENSITIES, SESSION_DURATIONS, VIBES } from '../types/game.ts';
import type { GameSession, QueueEntry, SessionQueue } from '../types/session.ts';
import { SESSION_SCHEMA_VERSION, SESSION_SLOTS } from '../types/session.ts';
import type { LoadedGame } from './gameLoader.ts';
import { parseCards } from './cardValidation.ts';
import { parseManifest } from './manifestValidation.ts';
import { array, id, number, object, oneOf, optional, string, unique } from './validation.ts';
import type { Parser } from './validation.ts';

export type SessionContext = Pick<LoadedGame, 'manifest' | 'cards'>;
export const parseConfiguration = object<DateNightConfiguration>({
  vibe: oneOf(...VIBES), durationMinutes: oneOf(...SESSION_DURATIONS), intensityCeiling: oneOf(...INTENSITIES),
});
const entry = object<QueueEntry>({ slot: oneOf(...SESSION_SLOTS), itemId: id });
// Validate caller-provided queues only. No composition or selection happens here.
export function parseQueue(value: unknown, content: readonly Card[]): SessionQueue {
  const queue = array(entry)(value, 'session.queue');
  if (queue.length !== 5) throw new Error('session.queue: exactly five entries required.');
  unique(queue.map(x => x.itemId), 'session.queue.itemId');
  const cards = parseCards(content);
  queue.forEach((item, index) => {
    if (item.slot !== SESSION_SLOTS[index]) throw new Error('session.queue: invalid slot order.');
    const card = cards.find(x => x.id === item.itemId);
    if (!card?.active) throw new Error('session.queue: missing or inactive item.');
    if (card.isCloser !== (index === 4)) throw new Error('session.queue: invalid closer placement.');
    if (index < 4 && card.categoryId !== item.slot) throw new Error('session.queue: incompatible category.');
  });
  // Length and each position's discriminant have been checked above.
  return queue as SessionQueue;
}
const timestamp: Parser<string> = (v, p) => {
  const value = string(v, p);
  if (!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value) || !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 19) !== value.slice(0, 19)) {
    throw new Error(`${p}: invalid UTC timestamp.`);
  }
  return value;
};
const fields = object<GameSession>({
  id, gameId: id, gameVersion: id, schemaVersion: oneOf(SESSION_SCHEMA_VERSION),
  startedAt: timestamp, endedAt: optional(timestamp), status: oneOf('setup', 'playing', 'ended'),
  configuration: parseConfiguration,
  queue: (v, p) => array(entry)(v, p) as SessionQueue,
  currentSlot: number, displayedItemIds: array(id), swappedItemIds: array(id),
  revealState: (v, p) => v === undefined ? 'hidden' : oneOf('hidden', 'revealed')(v, p),
  endedReason: optional(oneOf('completed', 'cancelled')),
});

export function parseSession(value: unknown, context: SessionContext): GameSession {
  const result = fields(value, 'session');
  const manifest = parseManifest(context.manifest);
  if (result.gameId !== manifest.id || result.gameVersion !== manifest.version) {
    throw new Error('session: incompatible game identity/version.');
  }
  const config = result.configuration;
  if (!manifest.vibes.includes(config.vibe) || !manifest.durations.includes(config.durationMinutes) ||
      !manifest.allowedIntensities.includes(config.intensityCeiling)) {
    throw new Error('session.configuration: unsupported manifest configuration.');
  }
  result.queue = parseQueue(result.queue, context.cards);
  if (!Number.isInteger(result.currentSlot) || result.currentSlot < 0 || result.currentSlot > 4) {
    throw new Error('session.currentSlot: expected integer 0–4.');
  }
  const displayed = unique(result.displayedItemIds, 'session.displayedItemIds');
  const swapped = unique(result.swappedItemIds, 'session.swappedItemIds');
  const queueIds = result.queue.map(x => x.itemId);
  if (displayed.some(itemId => !context.cards.some(x => x.id === itemId) ||
        (!queueIds.includes(itemId) && !swapped.includes(itemId))) ||
      swapped.some(itemId => !displayed.includes(itemId) || queueIds.includes(itemId))) {
    throw new Error('session: inconsistent displayed/swapped history.');
  }
  if (result.status === 'setup') {
    if (result.currentSlot !== 0 || displayed.length || swapped.length || result.revealState !== 'hidden') {
      throw new Error('session: setup cannot have progress.');
    }
  } else if (queueIds.slice(0, result.currentSlot + 1).some(itemId => !displayed.includes(itemId)) ||
             queueIds.slice(result.currentSlot + 1).some(itemId => displayed.includes(itemId))) {
    throw new Error('session: displayed history must match queue progress.');
  }
  if (result.status === 'ended') {
    if (!result.endedAt || !result.endedReason || Date.parse(result.endedAt) < Date.parse(result.startedAt) ||
        (result.endedReason === 'completed' && result.currentSlot !== 4)) {
      throw new Error('session: invalid ending metadata.');
    }
  } else if (result.endedAt !== undefined || result.endedReason !== undefined) {
    throw new Error('session: ending metadata requires ended status.');
  }
  return result;
}
