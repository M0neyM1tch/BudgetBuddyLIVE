import type { ReactNode } from 'react';

type ScenarioSliderProps = {
  label: string;
  hint?: ReactNode;
  min: number;
  max: number;
  step: number;
  value: number;
  displayValue: string;
  onChange: (value: number) => void;
};

export function ScenarioSlider({
  label,
  hint,
  min,
  max,
  step,
  value,
  displayValue,
  onChange,
}: ScenarioSliderProps) {
  return (
    <label className="scenario-slider">
      <span className="scenario-slider-label">
        <span className="scenario-slider-label-text">
          {label}
          {hint ? <span className="scenario-slider-hint">{hint}</span> : null}
        </span>
        <strong>{displayValue}</strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    </label>
  );
}
