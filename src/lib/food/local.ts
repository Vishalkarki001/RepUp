/**
 * The food list that ships with the app (works offline, searched instantly):
 * RepUp's own hand-checked list (foods.ts) + Indian recipes from the
 * Indian Nutrient Databank (indb.json, built by scripts/build-indb.py).
 * Loaded on demand (dynamic import) so it isn't in the main bundle.
 */
import type { Searchable } from './core';
import { buildIndex, type CuratedMicro, type IndbRow } from './build-index';
import CURATED_MICRO from './curated-micro.json';
import { FOODS } from './foods';
import INDB from './indb.json';

let cache: Searchable[] | null = null;
/** All foods in the app's own list, ready to search. */
export function localIndex(): Searchable[] {
  return (cache ??= buildIndex(FOODS, INDB as IndbRow[], CURATED_MICRO as CuratedMicro));
}

/** Hand-checked foods rank a little above recipe-book ones with the same score. */
export const localBoost = (id: string) => (id.startsWith('local:') ? 0.3 : 0);
