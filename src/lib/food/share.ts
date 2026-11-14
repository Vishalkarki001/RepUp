'use client';

import { supabase } from '../supabase/client';
import { isSupabaseConfigured } from '../supabase/env';
import type { Micro } from '../types';
import { cleanMicro, type Food, type Serving } from './core';

interface CatalogRow {
  id: string;
  source: 'usda' | 'off' | 'user';
  name: string;
  brand: string | null;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  servings: Serving[] | null;
  liquid: boolean;
  micro?: Micro | null;
}

export type ShareResult = { food: Food; status: 'shared' | 'known' } | { food: null; status: 'limit' | 'failed' };

/**
 * Adds a food to the shared list (everyone can find it, marked "User added"),
 * through the database's add_food(), which checks the numbers add up. A barcode
 * that's already in the list keeps its first values ("known").
 * Only fibre, sugar, saturated fat and sodium are kept from `micro` (what a label shows).
 */
export async function shareFood(f: {
  name: string;
  brand?: string;
  barcode?: string;
  per100: { kcal: number; protein: number; carbs: number; fat: number };
  servings: Serving[];
  liquid?: boolean;
  micro?: Micro;
}): Promise<ShareResult> {
  if (!isSupabaseConfigured) return { food: null, status: 'failed' };
  const label = f.micro ? cleanMicro({ fiber: f.micro.fiber, sugar: f.micro.sugar, satFat: f.micro.satFat, sodium: f.micro.sodium }) : undefined;
  const args: Record<string, unknown> = {
    p_name: f.name.trim().slice(0, 120),
    p_brand: (f.brand ?? '').trim().slice(0, 80),
    p_barcode: f.barcode && /^\d{6,14}$/.test(f.barcode) ? f.barcode : '',
    p_kcal: f.per100.kcal,
    p_protein: f.per100.protein,
    p_carbs: f.per100.carbs,
    p_fat: f.per100.fat,
    p_servings: f.servings.slice(0, 5),
    p_liquid: !!f.liquid,
  };
  let { data, error } = await supabase().rpc('add_food', label ? { ...args, p_micro: label } : args);
  // The nutrients update may not be in the database yet: save without them rather than not at all.
  if (error && label && /p_micro|could not find the function|PGRST202/i.test(`${error.code} ${error.message}`)) {
    ({ data, error } = await supabase().rpc('add_food', args));
  }
  if (error) return { food: null, status: /too many/i.test(error.message) ? 'limit' : 'failed' };
  const r = data as CatalogRow | null;
  if (!r) return { food: null, status: 'failed' };
  return {
    status: r.source === 'user' && r.name === args.p_name ? 'shared' : 'known',
    food: {
      id: r.id,
      name: r.name,
      brand: r.brand ?? undefined,
      kind: r.source,
      per100: { kcal: Math.round(Number(r.kcal)), protein: Number(r.protein), carbs: Number(r.carbs), fat: Number(r.fat) },
      servings: r.servings ?? [],
      liquid: r.liquid,
      micro: cleanMicro(r.micro),
    },
  };
}
