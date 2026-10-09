import { useId, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { displayToCents } from '../../../shared/utils/currency';
import {
  TRANSACTION_CATEGORIES,
  TRANSACTION_KIND_OPTIONS,
} from '../constants/categories';
import { quickAddChipSchema } from '../schemas/transactions.schema';
import type { QuickAddChip, QuickAddTarget, SupportedTransactionKind } from '../types/transactions.types';

type QuickAddGoalOption = { id: string; name: string };
type QuickAddDebtOption = { id: string; name: string };

type QuickAddChipModalProps = {
  isOpen: boolean;
  chip: QuickAddChip | null;
  isSubmitting: boolean;
  activeGoals: QuickAddGoalOption[];
  activeDebts: QuickAddDebtOption[];
  activePriorityName?: string | null;
  serverError?: string;
  onClose: () => void;
  onDelete: (chip: QuickAddChip) => void;
  onSubmit: (chip: QuickAddChip) => Promise<void>;
};

type QuickAddChipFormState = {
  label: string;
  description: string;
  amount: string;
  kind: SupportedTransactionKind;
  category: string;
  target: QuickAddTarget | null;
};

function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

function zodMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Check the form fields.';
  if (error instanceof Error) return error.message;
  return 'Check the form fields.';
}

function createChipId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `chip-${Date.now()}`;
}

function getInitialState(chip: QuickAddChip | null): QuickAddChipFormState {
  if (chip) {
    return {
      label: chip.label,
      description: chip.description,
      amount: centsToInputValue(chip.amount_cents),
      kind: chip.kind,
      category: chip.category,
      target: chip.target ?? null,
    };
  }

  return {
    label: '',
    description: '',
    amount: '',
    kind: 'expense',
    category: 'food',
    target: null,
  };
}

export function QuickAddChipModal({
  isOpen,
  ...props
}: QuickAddChipModalProps) {
  if (!isOpen) return null;
  return <QuickAddChipModalContent isOpen={isOpen} {...props} />;
}

function QuickAddChipModalContent({
  isOpen,
  chip,
  isSubmitting,
  activeGoals,
  activeDebts,
  activePriorityName,
  serverError,
  onClose,
  onDelete,
  onSubmit,
}: QuickAddChipModalProps) {
  const formId = useId();
  const [form, setForm] = useState<QuickAddChipFormState>(() => getInitialState(chip));
  const [clientError, setClientError] = useState<string | null>(null);
  const title = chip ? 'Edit quick add' : 'Add quick add';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const amountCents = displayToCents(form.amount);
    if (!amountCents) {
      setClientError('Enter an amount greater than zero.');
      return;
    }

    try {
      const parsed = quickAddChipSchema.parse({
        id: chip?.id ?? createChipId(),
        label: form.label,
        description: form.description,
        amount_cents: Math.abs(amountCents),
        kind: form.kind,
        category: form.category,
        target: form.target ?? undefined,
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
          {chip ? (
            <Button type="button" variant="danger" onClick={() => onDelete(chip)}>
              Delete
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            Save
          </Button>
        </>
      }
    >
      <form id={formId} className="transaction-form-grid" onSubmit={handleSubmit}>
        <div className="transaction-kind-toggle" aria-label="Quick add kind">
          {TRANSACTION_KIND_OPTIONS.map((kind) => (
            <button
              key={kind.value}
              type="button"
              className={form.kind === kind.value ? 'is-active' : ''}
              onClick={() => setForm((current) => ({ ...current, kind: kind.value }))}
            >
              {kind.label}
            </button>
          ))}
        </div>

        <label className="transaction-form-field">
          <span>Label</span>
          <input
            type="text"
            maxLength={24}
            value={form.label}
            placeholder="Coffee"
            onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
          />
        </label>

        <label className="transaction-form-field">
          <span>Amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.amount}
            placeholder="0.00"
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          />
        </label>

        <label className="transaction-form-field">
          <span>Category or target</span>
          <select
            value={
              form.target?.kind === 'active_priority'
                ? 'target:active_priority'
                : form.target?.kind === 'goal'
                  ? `target:goal:${form.target.id}`
                  : form.target?.kind === 'debt'
                    ? `target:debt:${form.target.id}`
                    : `category:${form.category}`
            }
            onChange={(event) => {
              const value = event.target.value;
              setForm((current) => {
                if (value === 'target:active_priority') {
                  return { ...current, category: 'savings', target: { kind: 'active_priority' } };
                }
                if (value.startsWith('target:goal:')) {
                  return { ...current, category: 'savings', target: { kind: 'goal', id: value.slice(12) } };
                }
                if (value.startsWith('target:debt:')) {
                  return { ...current, category: 'debt_payment', target: { kind: 'debt', id: value.slice(12) } };
                }
                return { ...current, category: value.slice(9), target: null };
              });
            }}
          >
            <optgroup label="Categories">
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category.value} value={`category:${category.value}`}>
                {category.label}
              </option>
            ))}
            </optgroup>
            <optgroup label="Targets">
              <option value="target:active_priority">
                Active priority{activePriorityName ? ` — ${activePriorityName}` : ''}
              </option>
              {activeGoals.map((goal) => (
                <option key={goal.id} value={`target:goal:${goal.id}`}>{goal.name}</option>
              ))}
              {activeDebts.map((debt) => (
                <option key={debt.id} value={`target:debt:${debt.id}`}>{debt.name}</option>
              ))}
            </optgroup>
          </select>
        </label>

        <label className="transaction-form-field transaction-form-field--wide">
          <span>Description</span>
          <input
            type="text"
            maxLength={80}
            value={form.description}
            placeholder="Optional default description"
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </label>

        {clientError || serverError ? (
          <p className="transaction-form-error" role="alert">
            {clientError ?? serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
