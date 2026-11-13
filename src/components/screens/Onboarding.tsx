import { useState } from 'react';
import { Check, Dumbbell, Footprints, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { PLAN_TEMPLATES } from '@/lib/data/defaults';
import { actions } from '@/lib/store';
import { WEEKDAYS, type AppMode } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Modal } from '../Modal';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

const GOALS: { id: AppMode; label: string; icon: typeof Dumbbell; text: string }[] = [
  { id: 'workout', label: 'Gym', icon: Dumbbell, text: '' },
  {
    id: 'running',
    label: 'Running',
    icon: Footprints,
    text: 'Track runs and walks with GPS: distance, pace, every km and your route on a map.',
  },
  {
    id: 'food',
    label: 'Food',
    icon: Utensils,
    text: 'Count calories and protein. Set your daily target first, then add what you eat: Indian food, packets by barcode and more.',
  },
];

/** First run: what do you want to track? Gym also picks a ready-made week plan. */
export function Onboarding() {
  const [goal, setGoal] = useState<AppMode>('workout');
  const [picked, setPicked] = useState<string>('upper-lower');
  const template = PLAN_TEMPLATES.find((t) => t.id === picked);
  const other = GOALS.find((g) => g.id === goal && g.id !== 'workout');
  const finish = () => {
    if (other) {
      actions.updateSettings({ mode: other.id });
      actions.finishOnboarding(null); // keeps the default gym week for later
    } else actions.finishOnboarding(template ? template.plans : []);
  };

  return (
    <Modal
      title="Welcome to RepUp 👋"
      description="What do you want to track? You can switch any time from the account menu."
      onClose={finish}
      footer={
        other ? (
          <Button size="lg" className="h-11 w-full text-base" onClick={finish}>
            Start with {other.label.toLowerCase()}
          </Button>
        ) : (
          <div className="flex flex-col gap-1.5">
            <Button size="lg" className="h-11 w-full text-base" onClick={() => actions.finishOnboarding(template ? template.plans : [])}>
              {template ? `Start with ${template.name}` : 'Start with an empty week'}
            </Button>
            <Button variant="ghost" className="h-10 w-full text-muted-foreground" onClick={() => actions.finishOnboarding([])}>
              I’ll make my own plan
            </Button>
          </div>
        )
      }
    >
      <ToggleGroup
        type="single"
        variant="outline"
        spacing={1.5}
        value={goal}
        onValueChange={(v) => v && setGoal(v as AppMode)}
        aria-label="What to track"
        className="grid w-full grid-cols-3"
      >
        {GOALS.map(({ id, label, icon: Icon }) => (
          <ToggleGroupItem
            key={id}
            value={id}
            className="h-auto flex-col gap-1 rounded-lg py-3 data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
          >
            <Icon className="size-5" />
            <span className="text-sm font-medium">{label}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      {other ? (
        <p className="text-sm text-muted-foreground">{other.text}</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            How many days a week do you want to go to the gym? We’ll set up your week. You can change any day later.
          </p>

          <div className="flex flex-col gap-2" role="radiogroup" aria-label="Plan">
            {PLAN_TEMPLATES.map((t) => {
              const days = new Set(t.plans.map((p) => p.day));
              const on = picked === t.id;
              return (
                <Item
                  key={t.id}
                  asChild
                  variant="outline"
                  className={cn(
                    'flex-nowrap cursor-pointer rounded-xl bg-card p-3 text-left hover:bg-muted/60',
                    on && 'border-primary bg-accent/60 ring-1 ring-primary hover:bg-accent/60',
                  )}
                >
                  <button type="button" role="radio" aria-checked={on} onClick={() => setPicked(t.id)}>
                    <ItemMedia className="size-12 flex-col gap-0 rounded-lg bg-primary text-primary-foreground group-has-data-[slot=item-description]/item:translate-y-0">
                      <span className="text-lg leading-none font-semibold tabular">{t.perWeek}</span>
                      <span className="mt-0.5 text-[10px] leading-none opacity-80">days</span>
                    </ItemMedia>
                    <ItemContent className="min-w-0 gap-0.5">
                      <ItemTitle className="w-full truncate font-semibold">{t.name}</ItemTitle>
                      <ItemDescription className="text-xs">{t.description}</ItemDescription>
                      <span
                        className="mt-1.5 flex gap-1"
                        aria-label={`Days: ${DAY_ORDER.filter((d) => days.has(d))
                          .map((d) => WEEKDAYS[d])
                          .join(', ')}`}
                      >
                        {DAY_ORDER.map((d) => (
                          <span
                            key={d}
                            aria-hidden
                            className={cn(
                              'grid size-5 place-items-center rounded text-[10px] font-medium',
                              days.has(d) ? 'bg-primary/15 text-brand' : 'bg-muted text-muted-foreground',
                            )}
                          >
                            {WEEKDAYS[d][0]}
                          </span>
                        ))}
                      </span>
                    </ItemContent>
                    <ItemActions>
                      <span
                        aria-hidden
                        className={cn(
                          'grid size-5 shrink-0 place-items-center rounded-full border',
                          on && 'border-primary bg-primary text-primary-foreground',
                        )}
                      >
                        {on ? <Check className="size-3" /> : null}
                      </span>
                    </ItemActions>
                  </button>
                </Item>
              );
            })}
          </div>
        </>
      )}
    </Modal>
  );
}
