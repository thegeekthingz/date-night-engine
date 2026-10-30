import type { Card, MediaAsset } from '../types/card.ts';
import { ACTIVITIES, INTENSITIES, VIBES } from '../types/game.ts';
import { array, boolean, id, object, oneOf, optional, positive, string, unique } from './validation.ts';

const media = object<MediaAsset>({
  id, type: oneOf('image', 'gif', 'video'), src: string,
  alt: optional(string), poster: optional(string), aspectRatio: optional(string),
});
const card = object<Card>({
  id, text: string, categoryId: oneOf(...ACTIVITIES),
  type: oneOf('question', 'story', 'challenge', 'prediction', 'activity', 'custom'),
  intensity: oneOf(...INTENSITIES), moods: array(oneOf(...VIBES)),
  durationMinutes: positive, isCloser: boolean, revealText: optional(string),
  actionIds: optional(array(id)), media: optional(array(media)), tags: optional(array(string)), active: boolean,
});
export function parseCard(value: unknown, path = 'card'): Card {
  const parsed = card(value, path);
  unique(parsed.moods, `${path}.moods`);
  if (parsed.active && !parsed.moods.length) throw new Error(`${path}.moods: active items require a mood.`);
  return parsed;
}
export function parseCards(value: unknown, path = 'cards'): Card[] {
  const cards = array(parseCard)(value, path);
  unique(cards.map(x => x.id), `${path}.id`);
  return cards;
}
