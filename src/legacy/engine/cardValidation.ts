import type { Card, MediaAsset, TargetRule } from '../types/card.ts';
import { array, boolean, intensity, number, object, oneOf, optional, string } from './validation.ts';
import type { Parser } from './validation.ts';

const media = object<MediaAsset>({
  id: string,
  type: oneOf('image', 'gif', 'video'),
  src: string,
  alt: optional(string),
  poster: optional(string),
  aspectRatio: optional(string),
});

const targetType = object<{ type: TargetRule['type'] }>({
  type: oneOf('none', 'current-player', 'random-player', 'all-players', 'named-player'),
});
const namedTarget = object<Extract<TargetRule, { type: 'named-player' }>>({
  type: oneOf('named-player'),
  playerId: string,
});
const target: Parser<TargetRule> = (value, path) => {
  const { type } = targetType(value, path);
  return type === 'named-player' ? namedTarget(value, path) : { type };
};

const card = object<Card>({
  id: string,
  text: string,
  categoryId: string,
  intensity,
  type: oneOf(
    'confession', 'question', 'story', 'challenge', 'vote',
    'most-likely', 'truth', 'dare', 'group-action', 'custom',
  ),
  target: optional(target),
  actionIds: optional(array(string)),
  points: optional(number),
  penalty: optional(string),
  timerSeconds: optional(number),
  media: optional(array(media)),
  tags: optional(array(string)),
  active: boolean,
});

export const parseCards = array(card);
