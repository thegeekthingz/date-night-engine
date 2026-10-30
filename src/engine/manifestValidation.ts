import type { GameManifest } from '../types/game.ts';
import { ACTIVITIES, INTENSITIES, SESSION_DURATIONS, VIBES } from '../types/game.ts';
import { array, id, object, oneOf, string, unique } from './validation.ts';
const manifest = object<GameManifest>({
  id, name: string, version: id, themeId: id,
  vibes: array(oneOf(...VIBES)), durations: array(oneOf(...SESSION_DURATIONS)),
  allowedIntensities: array(oneOf(...INTENSITIES)),
  categories: array(object({ id: oneOf(...ACTIVITIES), label: string })),
  actions: array(object({ id, label: string })),
});
export function parseManifest(value: unknown, path = 'manifest'): GameManifest {
  const result = manifest(value, path);
  for (const key of ['vibes', 'durations', 'allowedIntensities'] as const) {
    const values: (string | number)[] = result[key];
    if (!values.length) throw new Error(`${path}.${key}: cannot be empty.`);
    unique(values, `${path}.${key}`);
  }
  const categories = unique(result.categories.map(x => x.id), `${path}.categories`);
  if (categories.length !== 4) throw new Error(`${path}.categories: all four activities required.`);
  unique(result.actions.map(x => x.id), `${path}.actions`);
  return result;
}
