import { useState } from 'react';
import {
  buildCustomRange,
  buildPresetRange,
  validateCustomRange,
} from '../utils/analytics.utils';
import type { DateRange, PeriodPreset } from '../types/analytics.types';

const PRESETS = [
  { value: 'this_month', label: 'This month' },
  { value: 'last_month', label: 'Last month' },
  { value: 'last_3_months', label: '3 months' },
  { value: 'last_6_months', label: '6 months' },
  { value: 'this_year', label: 'This year' },
  { value: 'custom', label: 'Custom' },
] as const satisfies readonly { value: PeriodPreset; label: string }[];

type PeriodSelectorProps = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

export function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  const [draftFrom, setDraftFrom] = useState(value.from);
  const [draftTo, setDraftTo] = useState(value.to);
  const validation = validateCustomRange(draftFrom, draftTo);

  function handlePresetChange(preset: PeriodPreset) {
    if (preset === 'custom') {
      onChange(buildCustomRange(draftFrom, draftTo));
      return;
    }

    onChange(buildPresetRange(preset));
  }

  function applyCustomRange() {
    if (!validation.isValid) return;
    onChange(buildCustomRange(draftFrom, draftTo));
  }

  return (
    <div className="analytics-period-selector" aria-label="Analytics period">
      <div className="analytics-period-presets" role="group" aria-label="Period presets">
        {PRESETS.map((preset) => (
          <button
            className={value.preset === preset.value ? 'is-active' : ''}
            key={preset.value}
            type="button"
            onClick={() => handlePresetChange(preset.value)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {value.preset === 'custom' ? (
        <div className="analytics-custom-range">
          <label>
            <span>From</span>
            <input
              type="date"
              value={draftFrom}
              onInput={(event) => setDraftFrom(event.currentTarget.value)}
              onChange={(event) => setDraftFrom(event.currentTarget.value)}
            />
          </label>
          <label>
            <span>To</span>
            <input
              type="date"
              value={draftTo}
              onInput={(event) => setDraftTo(event.currentTarget.value)}
              onChange={(event) => setDraftTo(event.currentTarget.value)}
            />
          </label>
          <button type="button" onClick={applyCustomRange} disabled={!validation.isValid}>
            Apply
          </button>
          {validation.message ? (
            <p className="analytics-range-error" role="alert">
              {validation.message}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
