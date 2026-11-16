'use client';

import { supabase } from '../supabase/client';
import { isSupabaseConfigured } from '../supabase/env';
import { EQUIPMENT, MUSCLES, type Equipment, type Exercise, type Muscle } from '../types';

/**
 * Exercises shared by everyone (exercise_catalog). When someone creates an
 * exercise it's shared (name, muscle, equipment: never their notes), so the
 * next person who searches for it finds it instead of typing it again.
 */
export interface SharedExercise {
  id: string;
  name: string;
  muscle: Muscle;
  equipment: Equipment;
}

const valid = (r: Record<string, unknown>): r is Record<string, string> =>
  typeof r.id === 'string' &&
  typeof r.name === 'string' &&
  MUSCLES.includes(r.muscle as Muscle) &&
  EQUIPMENT.includes(r.equipment as Equipment);

/** Share an exercise someone just created (best effort, in the background). */
export async function shareExercise(e: Pick<Exercise, 'name' | 'muscle' | 'equipment'>): Promise<void> {
  if (!isSupabaseConfigured || typeof navigator !== 'undefined' && !navigator.onLine) return;
  try {
    await supabase().rpc('share_exercise', { p_name: e.name, p_muscle: e.muscle, p_equipment: e.equipment });
  } catch {
    /* offline / not shared: it's still saved for this person */
  }
}

/** Shared exercises matching a search (part of the name, or with a typo). */
export async function searchSharedExercises(q: string, signal?: AbortSignal): Promise<SharedExercise[]> {
  if (!isSupabaseConfigured || q.trim().length < 2) return [];
  let call = supabase().rpc('search_shared_exercises', { p_q: q.trim(), p_limit: 20 });
  if (signal) call = call.abortSignal(signal);
  const { data, error } = await call;
  if (error || !Array.isArray(data)) return [];
  return (data as Record<string, unknown>[]).filter(valid).map((r) => ({ id: r.id, name: r.name, muscle: r.muscle as Muscle, equipment: r.equipment as Equipment }));
}
