import { useState } from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item';
import { PLAN_TEMPLATES } from '@/lib/data/defaults';
import { actions } from '@/lib/store';
import { WEEKDAYS } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Modal } from '../Modal';

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

/** First run: pick how many days a week you train and get a ready-made week plan. */
export function Onboarding() {
  const [picked, setPicked] = useState<string>('upper-lower');
  const template = PLAN_TEMPLATES.find((t) => t.id === picked);

  return (
    <Modal
      title="Welcome to RepUp 👋"
      onClose={() => actions.finishOnboarding(template ? template.plans : [])}
      footer={
        <div className="flex flex-col gap-1.5">
          <Button size="lg" className="h-11 w-full text-base" onClick={() => actions.finishOnboarding(template ? template.plans : [])}>
            {template ? `Start with ${template.name}` : 'Start with an empty week'}
          </Button>
          <Button variant="ghost" className="h-10 w-full text-muted-foreground" onClick={() => actions.finishOnboarding([])}>
            I’ll make my own plan
          </Button>
        </div>
      }
    >
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
    </Modal>
  );
}
