import { useState, type ReactNode } from 'react';

type CalculatorFieldProps = {
  label: string;
  hint?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  prefix?: string;
  suffix?: string;
  onChange: (value: number) => void;
};

export function CalculatorField({
  label,
  hint,
  min,
  max,
  step = 1,
  value,
  prefix,
  suffix,
  onChange,
}: CalculatorFieldProps) {
  const [draft, setDraft] = useState({
    isEditing: false,
    text: String(value),
    value,
  });
  const displayValue = draft.isEditing || draft.value === value ? draft.text : String(value);

  return (
    <label className="calculator-field">
      <span className="calculator-field-label">
        {label}
        {hint ? <span className="calculator-field-hint">{hint}</span> : null}
      </span>
      <div className="calculator-number-input">
        {prefix ? <small>{prefix}</small> : null}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={displayValue}
          onFocus={() => {
            setDraft({
              isEditing: true,
              text: displayValue,
              value,
            });
          }}
          onChange={(event) => {
            const text = event.target.value;
            const next = parseFloat(text);

            setDraft({
              isEditing: true,
              text,
              value: text !== '' && Number.isFinite(next) ? next : value,
            });

            if (text !== '' && Number.isFinite(next)) {
              onChange(next);
            }
          }}
          onBlur={() => {
            const parsed = parseFloat(displayValue);

            if (displayValue === '' || !Number.isFinite(parsed)) {
              setDraft({
                isEditing: false,
                text: String(value),
                value,
              });
              return;
            }

            setDraft({
              isEditing: false,
              text: String(parsed),
              value: parsed,
            });
            onChange(parsed);
          }}
        />
        {suffix ? <small>{suffix}</small> : null}
      </div>
    </label>
  );
}
