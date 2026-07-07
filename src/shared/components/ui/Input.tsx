import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useId,
} from 'react';
import { clsx } from 'clsx';

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
  error?: string;
  leftSlot?: ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ id, label, hint, error, leftSlot, className, ...props }, ref) => {
    const fallbackId = useId();
    const inputId = id ?? fallbackId;
    const describedBy = [
      hint && !error ? `${inputId}-hint` : null,
      error ? `${inputId}-error` : null,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className="input-field">
        {label ? (
          <label className="input-label" htmlFor={inputId}>
            {label}
          </label>
        ) : null}
        <div className={clsx('input-shell', error && 'input-shell--error')}>
          {leftSlot ? <span className="input-slot">{leftSlot}</span> : null}
          <input
            ref={ref}
            id={inputId}
            className={clsx('input', leftSlot && 'input--with-slot', className)}
            aria-describedby={describedBy || undefined}
            aria-invalid={Boolean(error)}
            {...props}
          />
        </div>
        {hint && !error ? (
          <p id={`${inputId}-hint`} className="input-hint">
            {hint}
          </p>
        ) : null}
        {error ? (
          <p id={`${inputId}-error`} className="input-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);

Input.displayName = 'Input';
