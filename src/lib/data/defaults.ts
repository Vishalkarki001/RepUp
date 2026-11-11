import type { DayPlan, Equipment, Exercise, Muscle, PlanItem } from '../types';

const ex = (id: string, name: string, muscle: Muscle, equipment: Equipment): Exercise => ({
  id,
  name,
  muscle,
  equipment,
});

export const DEFAULT_EXERCISES: Exercise[] = [
  // Chest
  ex('bench-press', 'Bench Press', 'Chest', 'Barbell'),
  ex('incline-bench-press', 'Incline Bench Press', 'Chest', 'Barbell'),
  ex('db-bench-press', 'Dumbbell Bench Press', 'Chest', 'Dumbbell'),
  ex('incline-db-press', 'Incline Dumbbell Press', 'Chest', 'Dumbbell'),
  ex('db-fly', 'Dumbbell Fly', 'Chest', 'Dumbbell'),
  ex('cable-crossover', 'Cable Crossover', 'Chest', 'Cable'),
  ex('chest-press-machine', 'Chest Press Machine', 'Chest', 'Machine'),
  ex('pec-deck', 'Pec Deck', 'Chest', 'Machine'),
  ex('push-up', 'Push Up', 'Chest', 'Bodyweight'),
  ex('chest-dip', 'Chest Dip', 'Chest', 'Bodyweight'),
  // Back
  ex('deadlift', 'Deadlift', 'Back', 'Barbell'),
  ex('barbell-row', 'Barbell Row', 'Back', 'Barbell'),
  ex('db-row', 'One-Arm Dumbbell Row', 'Back', 'Dumbbell'),
  ex('lat-pulldown', 'Lat Pulldown', 'Back', 'Cable'),
  ex('seated-cable-row', 'Seated Cable Row', 'Back', 'Cable'),
  ex('pull-up', 'Pull Up', 'Back', 'Bodyweight'),
  ex('chin-up', 'Chin Up', 'Back', 'Bodyweight'),
  ex('t-bar-row', 'T-Bar Row', 'Back', 'Machine'),
  ex('straight-arm-pulldown', 'Straight-Arm Pulldown', 'Back', 'Cable'),
  ex('back-extension', 'Back Extension', 'Back', 'Bodyweight'),
  // Shoulders
  ex('overhead-press', 'Overhead Press', 'Shoulders', 'Barbell'),
  ex('db-shoulder-press', 'Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell'),
  ex('lateral-raise', 'Lateral Raise', 'Shoulders', 'Dumbbell'),
  ex('cable-lateral-raise', 'Cable Lateral Raise', 'Shoulders', 'Cable'),
  ex('front-raise', 'Front Raise', 'Shoulders', 'Dumbbell'),
  ex('rear-delt-fly', 'Rear Delt Fly', 'Shoulders', 'Dumbbell'),
  ex('face-pull', 'Face Pull', 'Shoulders', 'Cable'),
  ex('shrug', 'Shrug', 'Shoulders', 'Dumbbell'),
  // Biceps
  ex('barbell-curl', 'Barbell Curl', 'Biceps', 'Barbell'),
  ex('db-curl', 'Dumbbell Curl', 'Biceps', 'Dumbbell'),
  ex('hammer-curl', 'Hammer Curl', 'Biceps', 'Dumbbell'),
  ex('preacher-curl', 'Preacher Curl', 'Biceps', 'Machine'),
  ex('cable-curl', 'Cable Curl', 'Biceps', 'Cable'),
  ex('incline-db-curl', 'Incline Dumbbell Curl', 'Biceps', 'Dumbbell'),
  // Triceps
  ex('tricep-pushdown', 'Tricep Pushdown', 'Triceps', 'Cable'),
  ex('overhead-tricep-ext', 'Overhead Tricep Extension', 'Triceps', 'Cable'),
  ex('skull-crusher', 'Skull Crusher', 'Triceps', 'Barbell'),
  ex('close-grip-bench', 'Close-Grip Bench Press', 'Triceps', 'Barbell'),
  ex('tricep-dip', 'Tricep Dip', 'Triceps', 'Bodyweight'),
  // Legs
  ex('squat', 'Squat', 'Legs', 'Barbell'),
  ex('front-squat', 'Front Squat', 'Legs', 'Barbell'),
  ex('leg-press', 'Leg Press', 'Legs', 'Machine'),
  ex('romanian-deadlift', 'Romanian Deadlift', 'Legs', 'Barbell'),
  ex('leg-extension', 'Leg Extension', 'Legs', 'Machine'),
  ex('leg-curl', 'Leg Curl', 'Legs', 'Machine'),
  ex('walking-lunge', 'Walking Lunge', 'Legs', 'Dumbbell'),
  ex('bulgarian-split-squat', 'Bulgarian Split Squat', 'Legs', 'Dumbbell'),
  ex('goblet-squat', 'Goblet Squat', 'Legs', 'Dumbbell'),
  ex('calf-raise', 'Calf Raise', 'Legs', 'Machine'),
  // Glutes
  ex('hip-thrust', 'Hip Thrust', 'Glutes', 'Barbell'),
  ex('glute-kickback', 'Cable Glute Kickback', 'Glutes', 'Cable'),
  ex('hip-abduction', 'Hip Abduction Machine', 'Glutes', 'Machine'),
  // Core
  ex('plank', 'Plank (reps = seconds)', 'Core', 'Bodyweight'),
  ex('crunch', 'Crunch', 'Core', 'Bodyweight'),
  ex('hanging-leg-raise', 'Hanging Leg Raise', 'Core', 'Bodyweight'),
  ex('cable-crunch', 'Cable Crunch', 'Core', 'Cable'),
  ex('russian-twist', 'Russian Twist', 'Core', 'Bodyweight'),
  ex('ab-wheel', 'Ab Wheel Rollout', 'Core', 'Other'),
  // Full body
  ex('kb-swing', 'Kettlebell Swing', 'Full Body', 'Kettlebell'),
  ex('clean-and-press', 'Clean and Press', 'Full Body', 'Barbell'),
  ex('burpee', 'Burpee', 'Full Body', 'Bodyweight'),
  ex('farmers-walk', "Farmer's Walk (reps = metres)", 'Full Body', 'Dumbbell'),
];

const item = (exerciseId: string, sets: number, reps: number): PlanItem => ({ exerciseId, sets, reps });

const PUSH = [
  item('bench-press', 4, 8),
  item('incline-db-press', 3, 10),
  item('db-shoulder-press', 3, 10),
  item('lateral-raise', 3, 15),
  item('tricep-pushdown', 3, 12),
];
const PULL = [
  item('deadlift', 3, 6),
  item('lat-pulldown', 3, 10),
  item('seated-cable-row', 3, 10),
  item('face-pull', 3, 15),
  item('db-curl', 3, 12),
];
const LEGS = [
  item('squat', 4, 8),
  item('romanian-deadlift', 3, 10),
  item('leg-press', 3, 12),
  item('leg-curl', 3, 12),
  item('calf-raise', 4, 15),
];

/** Starter week: Mon/Thu Push, Tue/Fri Pull, Wed/Sat Legs, Sunday rest. Fully editable. */
export const DEFAULT_PLANS: DayPlan[] = [
  { day: 1, name: 'Push', items: PUSH },
  { day: 2, name: 'Pull', items: PULL },
  { day: 3, name: 'Legs', items: LEGS },
  { day: 4, name: 'Push', items: PUSH },
  { day: 5, name: 'Pull', items: PULL },
  { day: 6, name: 'Legs', items: LEGS },
];

/* ---------- first-run templates ---------- */

const UPPER = [
  item('bench-press', 4, 8),
  item('barbell-row', 4, 8),
  item('db-shoulder-press', 3, 10),
  item('lat-pulldown', 3, 10),
  item('db-curl', 2, 12),
  item('tricep-pushdown', 2, 12),
];
const LOWER = [
  item('squat', 4, 8),
  item('romanian-deadlift', 3, 10),
  item('leg-press', 3, 12),
  item('leg-curl', 3, 12),
  item('calf-raise', 3, 15),
  item('crunch', 3, 15),
];
const FULL = [
  item('squat', 3, 8),
  item('bench-press', 3, 8),
  item('barbell-row', 3, 8),
  item('db-shoulder-press', 2, 10),
  item('romanian-deadlift', 2, 10),
  item('plank', 3, 30),
];
const CHEST = [
  item('bench-press', 4, 8),
  item('incline-db-press', 3, 10),
  item('chest-press-machine', 3, 12),
  item('cable-crossover', 3, 15),
];
const BACK = [
  item('deadlift', 3, 6),
  item('lat-pulldown', 3, 10),
  item('seated-cable-row', 3, 10),
  item('db-row', 3, 10),
];
const SHOULDERS = [
  item('overhead-press', 4, 8),
  item('lateral-raise', 4, 15),
  item('rear-delt-fly', 3, 15),
  item('shrug', 3, 12),
];
const ARMS = [
  item('barbell-curl', 3, 10),
  item('tricep-pushdown', 3, 12),
  item('hammer-curl', 3, 12),
  item('overhead-tricep-ext', 3, 12),
];

export interface PlanTemplate {
  id: string;
  name: string;
  perWeek: number;
  description: string;
  plans: DayPlan[];
}

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'full',
    name: 'Full Body',
    perWeek: 3,
    description: 'Whole body each session. Best if you are new or busy.',
    plans: [
      { day: 1, name: 'Full Body', items: FULL },
      { day: 3, name: 'Full Body', items: FULL },
      { day: 5, name: 'Full Body', items: FULL },
    ],
  },
  {
    id: 'upper-lower',
    name: 'Upper / Lower',
    perWeek: 4,
    description: 'Upper body one day, legs the next. Balanced and simple.',
    plans: [
      { day: 1, name: 'Upper', items: UPPER },
      { day: 2, name: 'Lower', items: LOWER },
      { day: 4, name: 'Upper', items: UPPER },
      { day: 5, name: 'Lower', items: LOWER },
    ],
  },
  {
    id: 'bro',
    name: 'Bro Split',
    perWeek: 5,
    description: 'One muscle group per day: chest, back, shoulders, arms, legs.',
    plans: [
      { day: 1, name: 'Chest', items: CHEST },
      { day: 2, name: 'Back', items: BACK },
      { day: 3, name: 'Shoulders', items: SHOULDERS },
      { day: 4, name: 'Arms', items: ARMS },
      { day: 5, name: 'Legs', items: LEGS },
    ],
  },
  {
    id: 'ppl',
    name: 'Push / Pull / Legs',
    perWeek: 6,
    description: 'Push muscles, pull muscles, legs — twice a week. For regular gym-goers.',
    plans: DEFAULT_PLANS,
  },
];
