import { useId, useMemo, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { centsToDisplay, displayToCents } from '../../../shared/utils/currency';
import { today } from '../../../shared/utils/dates';
import {
  RECURRING_FREQUENCY_OPTIONS,
  TRANSACTION_CATEGORIES,
  TRANSACTION_KIND_OPTIONS,
} from '../constants/categories';
import { transactionDraftSchema } from '../schemas/transactions.schema';
import type {
  RecurringFrequency,
  Transaction,
  TransactionDraft,
  SupportedTransactionKind,
} from '../types/transactions.types';
import type { DebtWithProgress } from '../../debts/types/debts.types';
import type { GoalWithProgress } from '../../goals/types/goals.types';

type TransactionModalProps = {
  activeDebts: DebtWithProgress[];
  activeGoals: GoalWithProgress[];
  isOpen: boolean;
  transaction: Transaction | null;
  initialDraft: Partial<TransactionDraft> | null;
  isSubmitting: boolean;
  serverError?: string;
  onClose: () => void;
  onSubmit: (draft: TransactionDraft) => Promise<void>;
};

type TransactionFormState = {
  amount: string;
  kind: SupportedTransactionKind;
  category: string;
  transaction_date: string;
  description: string;
  debtId: string | null;
  goalId: string | null;
  notes: string;
  isRecurring: boolean;
  recurring_frequency: RecurringFrequency;
  recurring_start_date: string;
  recurring_notes: string;
};

function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

function zodMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Check the form fields.';
  if (error instanceof Error) return error.message;
  return 'Check the form fields.';
}

function getInitialState(
  transaction: Transaction | null,
  initialDraft: Partial<TransactionDraft> | null,
): TransactionFormState {
  if (transaction) {
    return {
      amount: centsToInputValue(Math.abs(transaction.amount_cents)),
      kind: transaction.kind === 'income' ? 'income' : 'expense',
      category: transaction.category,
      transaction_date: transaction.transaction_date,
      description: transaction.description,
      debtId: transaction.debt_id,
      goalId: transaction.goal_id,
      notes: transaction.notes ?? '',
      isRecurring: transaction.source === 'recurring',
      recurring_frequency: 'monthly',
      recurring_start_date: transaction.transaction_date,
      recurring_notes: transaction.notes ?? '',
    };
  }

  const transactionDate = initialDraft?.transaction_date ?? today();

  return {
    amount: initialDraft?.amount_cents ? centsToInputValue(initialDraft.amount_cents) : '',
    kind: initialDraft?.kind === 'income' ? 'income' : 'expense',
    category: initialDraft?.category ?? 'food',
    transaction_date: transactionDate,
    description: initialDraft?.description ?? '',
    debtId: initialDraft?.debt_id ?? null,
    goalId: initialDraft?.goal_id ?? null,
    notes: initialDraft?.notes ?? '',
    isRecurring: initialDraft?.source === 'recurring',
    recurring_frequency: initialDraft?.recurring_frequency ?? 'monthly',
    recurring_start_date: initialDraft?.recurring_start_date ?? transactionDate,
    recurring_notes: initialDraft?.recurring_notes ?? initialDraft?.notes ?? '',
  };
}

export function TransactionModal({
  isOpen,
  ...props
}: TransactionModalProps) {
  if (!isOpen) return null;

  return <TransactionModalContent isOpen={isOpen} {...props} />;
}

function TransactionModalContent({
  activeDebts,
  activeGoals,
  isOpen,
  transaction,
  initialDraft,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: TransactionModalProps) {
  const formId = useId();
  const [form, setForm] = useState<TransactionFormState>(() =>
    getInitialState(transaction, initialDraft),
  );
  const [clientError, setClientError] = useState<string | null>(null);
  const title = transaction ? 'Edit transaction' : 'Add transaction';
  const amountPreview = useMemo(() => {
    const cents = displayToCents(form.amount);
    return cents ? centsToDisplay(cents) : null;
  }, [form.amount]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const amountCents = displayToCents(form.amount);
    if (!amountCents) {
      setClientError('Enter an amount greater than zero.');
      return;
    }

    try {
      const parsed = transactionDraftSchema.parse({
        amount_cents: Math.abs(amountCents),
        kind: form.goalId || form.debtId ? 'transfer' : form.kind,
        category: form.goalId ? 'savings' : form.debtId ? 'debt_payment' : form.category,
        transaction_date: form.transaction_date,
        description: form.description,
        debt_id: form.debtId,
        goal_id: form.goalId,
        notes: form.notes,
        source: form.isRecurring && !form.goalId ? 'recurring' : 'manual',
        recurring_frequency: form.isRecurring && !form.goalId ? form.recurring_frequency : undefined,
        recurring_start_date: form.isRecurring && !form.goalId ? form.recurring_start_date : undefined,
        recurring_notes: form.isRecurring && !form.goalId ? form.recurring_notes : undefined,
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
            {transaction ? 'Save changes' : 'Add transaction'}
          </Button>
        </>
      }
    >
      <form id={formId} className="transaction-form-grid" onSubmit={handleSubmit}>
        {form.goalId || form.debtId ? (
          <p className="transaction-goal-note">
            {form.goalId
              ? 'This entry will be saved as a goal transfer and synced to goal progress.'
              : 'This entry will be saved as a debt payment transfer and synced to the debt balance.'}
          </p>
        ) : (
          <div className="transaction-kind-toggle" aria-label="Transaction kind">
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
        )}

        <label className="transaction-form-field">
          <span>Amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.amount}
            placeholder="0.00"
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
          />
          {amountPreview ? <small>{amountPreview}</small> : null}
        </label>

        <label className="transaction-form-field">
          <span>Date</span>
          <input
            type="date"
            value={form.transaction_date}
            onInput={(event) =>
              setForm((current) => ({ ...current, transaction_date: event.currentTarget.value }))
            }
            onChange={(event) =>
              setForm((current) => ({ ...current, transaction_date: event.currentTarget.value }))
            }
          />
        </label>

        <label className="transaction-form-field">
          <span>Category</span>
          <select
            disabled={Boolean(transaction?.goal_id || transaction?.debt_id)}
            value={
              form.goalId
                ? `goal:${form.goalId}`
                : form.debtId
                  ? `debt:${form.debtId}`
                  : form.category
            }
            onChange={(event) => {
              const value = event.target.value;
              setForm((current) =>
                value.startsWith('goal:')
                  ? {
                      ...current,
                      category: 'savings',
                      debtId: null,
                      goalId: value.replace('goal:', ''),
                      isRecurring: false,
                    }
                  : value.startsWith('debt:')
                    ? {
                        ...current,
                        category: 'debt_payment',
                        debtId: value.replace('debt:', ''),
                        goalId: null,
                      }
                  : { ...current, category: value, debtId: null, goalId: null },
              );
            }}
          >
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
            {activeGoals.length > 0 ? (
              <optgroup label="Goals">
                {activeGoals.map((goal) => (
                  <option key={goal.id} value={`goal:${goal.id}`}>
                    {goal.name}
                  </option>
                ))}
              </optgroup>
            ) : null}
            {activeDebts.length > 0 ? (
              <optgroup label="Debts">
                {activeDebts.map((debt) => (
                  <option key={debt.id} value={`debt:${debt.id}`}>
                    {debt.name} - {centsToDisplay(debt.current_balance_cents)} remaining
                  </option>
                ))}
              </optgroup>
            ) : null}
          </select>
          {form.goalId ? <small>Creates a goal contribution transfer.</small> : null}
          {form.debtId ? <small>Creates a debt payment transfer.</small> : null}
        </label>

        <label className="transaction-form-field transaction-form-field--wide">
          <span>Description</span>
          <input
            type="text"
            maxLength={120}
            value={form.description}
            placeholder="Optional label"
            onChange={(event) =>
              setForm((current) => ({ ...current, description: event.target.value }))
            }
          />
        </label>

        <label className="transaction-form-field transaction-form-field--wide">
          <span>Notes</span>
          <textarea
            maxLength={500}
            value={form.notes}
            placeholder="Optional context"
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>

        {!form.goalId ? (
          <label className="transaction-checkbox transaction-form-field--wide">
            <input
              type="checkbox"
              checked={form.isRecurring}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  isRecurring: event.target.checked,
                  recurring_start_date: current.recurring_start_date || current.transaction_date,
                }))
              }
            />
            <span>Create a recurring rule from this transaction</span>
          </label>
        ) : null}

        {form.isRecurring && !form.goalId ? (
          <div className="transaction-recurring-fields transaction-form-field--wide">
            <label className="transaction-form-field">
              <span>Frequency</span>
              <select
                value={form.recurring_frequency}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    recurring_frequency: event.target.value as RecurringFrequency,
                  }))
                }
              >
                {RECURRING_FREQUENCY_OPTIONS.map((frequency) => (
                  <option key={frequency.value} value={frequency.value}>
                    {frequency.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="transaction-form-field">
              <span>First occurrence</span>
              <input
                type="date"
                value={form.recurring_start_date}
                onInput={(event) =>
                  setForm((current) => ({
                    ...current,
                    recurring_start_date: event.currentTarget.value,
                  }))
                }
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    recurring_start_date: event.currentTarget.value,
                  }))
                }
              />
            </label>

            <label className="transaction-form-field transaction-form-field--wide">
              <span>Rule notes</span>
              <textarea
                maxLength={500}
                value={form.recurring_notes}
                placeholder="Optional recurring context"
                onChange={(event) =>
                  setForm((current) => ({ ...current, recurring_notes: event.target.value }))
                }
              />
            </label>
          </div>
        ) : null}

        {clientError || serverError ? (
          <p className="transaction-form-error" role="alert">
            {clientError ?? serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
