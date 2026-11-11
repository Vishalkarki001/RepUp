import { useState } from 'react';
import { PLAN_TEMPLATES } from '@/lib/data/defaults';
import { actions } from '@/lib/store';
import { WEEKDAYS } from '@/lib/types';
import { CheckIcon } from '../Icons';
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
        <div className="onboard-foot">
          <button className="btn primary block lg" onClick={() => actions.finishOnboarding(template ? template.plans : [])}>
            {template ? `Start with ${template.name}` : 'Start with an empty week'}
          </button>
          <button className="btn danger-text block muted-text" onClick={() => actions.finishOnboarding([])}>
            I’ll make my own plan
          </button>
        </div>
      }
    >
      <p className="muted">How many days a week do you want to go to the gym? We’ll set up your week. You can change any day later.</p>

      <div className="template-list" role="radiogroup" aria-label="Plan">
        {PLAN_TEMPLATES.map((t) => {
          const days = new Set(t.plans.map((p) => p.day));
          const on = picked === t.id;
          return (
            <button key={t.id} role="radio" aria-checked={on} className={`template ${on ? 'on' : ''}`} onClick={() => setPicked(t.id)}>
              <span className="template-days">
                <strong>{t.perWeek}</strong>
                <small>days</small>
              </span>
              <span className="grow">
                <strong>{t.name}</strong>
                <small>{t.description}</small>
                <span className="mini-week" aria-label={`Days: ${DAY_ORDER.filter((d) => days.has(d)).map((d) => WEEKDAYS[d]).join(', ')}`}>
                  {DAY_ORDER.map((d) => (
                    <i key={d} className={days.has(d) ? 'on' : ''}>
                      {WEEKDAYS[d][0]}
                    </i>
                  ))}
                </span>
              </span>
              <span className="pick-badge">{on ? <CheckIcon size={14} /> : null}</span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
