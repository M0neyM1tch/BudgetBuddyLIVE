import { useId, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { FEATURE_COLORS } from '../../../shared/constants/featurePalette';
import { displayToCents } from '../../../shared/utils/currency';
import { DEFAULT_GOAL_ICON } from '../constants/goalIconKeys';
import { getGoalIconOption, GOAL_ICON_OPTIONS } from '../constants/goalIcons';
import { goalDraftSchema } from '../schemas/goals.schema';
import type { GoalDraft, GoalWithProgress } from '../types/goals.types';

type GoalModalProps = {
  goal: GoalWithProgress | null;
  isOpen: boolean;
  isSubmitting: boolean;
  serverError?: string;
  onClose: () => void;
  onSubmit: (draft: GoalDraft) => Promise<void>;
};

type GoalFormState = {
  color: string;
  icon: string;
  name: string;
  startingBalance: string;
  targetAmount: string;
  targetDate: string;
};

function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

function zodMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Check the form fields.';
  if (error instanceof Error) return error.message;
  return 'Check the form fields.';
}

function getInitialState(goal: GoalWithProgress | null): GoalFormState {
  if (goal) {
    return {
      color: goal.color ?? FEATURE_COLORS[0],
      icon: getGoalIconOption(goal.icon).key,
      name: goal.name,
      startingBalance: centsToInputValue(goal.starting_balance_cents),
      targetAmount: centsToInputValue(goal.target_amount_cents),
      targetDate: goal.target_date ?? '',
    };
  }

  return {
    color: FEATURE_COLORS[0],
    icon: DEFAULT_GOAL_ICON,
    name: '',
    startingBalance: '',
    targetAmount: '',
    targetDate: '',
  };
}

export function GoalModal({ isOpen, ...props }: GoalModalProps) {
  if (!isOpen) return null;
  return <GoalModalContent isOpen={isOpen} {...props} />;
}

function GoalModalContent({
  goal,
  isOpen,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: GoalModalProps) {
  const formId = useId();
  const [form, setForm] = useState<GoalFormState>(() => getInitialState(goal));
  const [clientError, setClientError] = useState<string | null>(null);
  const title = goal ? 'Edit goal' : 'New goal';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const targetAmountCents = displayToCents(form.targetAmount);
    if (!targetAmountCents) {
      setClientError('Enter a target amount greater than zero.');
      return;
    }

    const startingBalanceCents = displayToCents(form.startingBalance || '0') ?? 0;

    try {
      const parsed = goalDraftSchema.parse({
        color: form.color,
        icon: form.icon,
        name: form.name,
        starting_balance_cents: startingBalanceCents,
        target_amount_cents: targetAmountCents,
        target_date: form.targetDate || null,
      });

      await onSubmit(parsed);
    } catch (error) {
      setClientError(zodMessage(error));
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            {goal ? 'Save goal' : 'Create goal'}
          </Button>
        </>
      }
    >
      <form id={formId} className="goal-form-grid" onSubmit={handleSubmit}>
        <label className="goal-form-field goal-form-field--wide">
          <span>Name</span>
          <input
            type="text"
            maxLength={100}
            value={form.name}
            placeholder="Emergency fund"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>

        <label className="goal-form-field">
          <span>Target amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.targetAmount}
            placeholder="5000.00"
            onChange={(event) =>
              setForm((current) => ({ ...current, targetAmount: event.target.value }))
            }
          />
        </label>

        {!goal ? (
          <label className="goal-form-field">
            <span>Starting balance</span>
            <input
              type="text"
              inputMode="decimal"
              value={form.startingBalance}
              placeholder="0.00"
              onChange={(event) =>
                setForm((current) => ({ ...current, startingBalance: event.target.value }))
              }
            />
          </label>
        ) : null}

        <label className="goal-form-field">
          <span>Target date</span>
          <input
            type="date"
            value={form.targetDate}
            onInput={(event) => {
              const { value } = event.currentTarget;
              setForm((current) => ({ ...current, targetDate: value }));
            }}
            onChange={(event) => {
              const { value } = event.currentTarget;
              setForm((current) => ({ ...current, targetDate: value }));
            }}
          />
        </label>

        <fieldset className="goal-color-field goal-form-field--wide">
          <legend>Color</legend>
          <div className="goal-color-options">
            {FEATURE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={form.color === color ? 'is-selected' : ''}
                style={{ background: color }}
                aria-label={`Use ${color}`}
                onClick={() => setForm((current) => ({ ...current, color }))}
              />
            ))}
          </div>
        </fieldset>

        <fieldset className="goal-icon-field goal-form-field--wide">
          <legend>Icon</legend>
          <div className="goal-icon-options">
            {GOAL_ICON_OPTIONS.map(({ Icon, key, label }) => (
              <button
                key={key}
                type="button"
                className={form.icon === key ? 'is-selected' : ''}
                style={
                  form.icon === key
                    ? {
                        background: form.color,
                        borderColor: form.color,
                        color: '#ffffff',
                      }
                    : undefined
                }
                aria-label={`Use ${label} icon`}
                aria-pressed={form.icon === key}
                title={label}
                onClick={() => setForm((current) => ({ ...current, icon: key }))}
              >
                <Icon size={18} aria-hidden="true" />
              </button>
            ))}
          </div>
        </fieldset>

        {clientError || serverError ? (
          <p className="goal-form-error" role="alert">
            {clientError ?? serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
