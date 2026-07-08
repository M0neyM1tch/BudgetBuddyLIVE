import { useId, useState, type FormEvent } from 'react';
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
import { recurringRuleDraftSchema } from '../schemas/transactions.schema';
import type {
  RecurringRule,
  RecurringRuleDraft,
  RecurringFrequency,
  SupportedTransactionKind,
  TransactionKind,
} from '../types/transactions.types';
import type { DebtWithProgress } from '../../debts/types/debts.types';

type RecurringRuleModalProps = {
  activeDebts: DebtWithProgress[];
  isOpen: boolean;
  rule: RecurringRule | null;
  isSubmitting: boolean;
  isDeleting: boolean;
  serverError?: string;
  onClose: () => void;
  onDelete: (rule: RecurringRule) => void;
  onSubmit: (draft: RecurringRuleDraft) => Promise<void>;
};

type RecurringRuleFormState = {
  amount: string;
  kind: SupportedTransactionKind;
  category: string;
  debtId: string | null;
  description: string;
  frequency: RecurringFrequency;
  start_date: string;
  next_run_date: string;
  is_active: boolean;
  notes: string;
  skip_backdate: boolean;
};

function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

function zodMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Check the form fields.';
  if (error instanceof Error) return error.message;
  return 'Check the form fields.';
}

function dayOfMonth(isoDate: string): number | null {
  const day = Number(isoDate.split('-')[2]);
  return Number.isInteger(day) && day >= 1 && day <= 31 ? day : null;
}

function getInitialState(rule: RecurringRule | null): RecurringRuleFormState {
  if (rule) {
    return {
      amount: centsToInputValue(Math.abs(rule.amount_cents)),
      kind: rule.kind === 'income' ? 'income' : 'expense',
      category: rule.category,
      debtId: rule.debt_id,
      description: rule.description,
      frequency: rule.frequency,
      start_date: rule.start_date,
      next_run_date: rule.next_run_date,
      is_active: rule.is_active,
      notes: rule.notes ?? '',
      skip_backdate: false,
    };
  }

  const currentDate = today();
  return {
    amount: '',
    kind: 'expense',
    category: 'subscriptions',
    debtId: null,
    description: '',
    frequency: 'monthly',
    start_date: currentDate,
    next_run_date: currentDate,
    is_active: true,
    notes: '',
    skip_backdate: false,
  };
}

export function RecurringRuleModal({
  isOpen,
  ...props
}: RecurringRuleModalProps) {
  if (!isOpen) return null;

  return <RecurringRuleModalContent isOpen={isOpen} {...props} />;
}

function RecurringRuleModalContent({
  activeDebts,
  isOpen,
  rule,
  isSubmitting,
  isDeleting,
  serverError,
  onClose,
  onDelete,
  onSubmit,
}: RecurringRuleModalProps) {
  const formId = useId();
  const [form, setForm] = useState<RecurringRuleFormState>(() => getInitialState(rule));
  const [clientError, setClientError] = useState<string | null>(null);
  const title = rule ? 'Edit recurring rule' : 'Add recurring rule';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const amountCents = displayToCents(form.amount);
    if (!amountCents) {
      setClientError('Enter an amount greater than zero.');
      return;
    }

    try {
      const parsed = recurringRuleDraftSchema.parse({
        amount_cents: Math.abs(amountCents),
        kind: (form.debtId ? 'transfer' : form.kind) as TransactionKind,
        category: form.debtId ? 'debt_payment' : form.category,
        debt_id: form.debtId,
        description: form.description,
        frequency: form.frequency,
        start_date: form.start_date,
        next_run_date: form.next_run_date,
        day_of_month: form.frequency === 'monthly' ? dayOfMonth(form.start_date) : null,
        is_active: form.is_active,
        notes: form.notes,
        skip_backdate: form.skip_backdate,
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
          {rule ? (
            <Button
              type="button"
              variant="danger"
              isLoading={isDeleting}
              onClick={() => onDelete(rule)}
            >
              Delete
            </Button>
          ) : null}
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            {rule ? 'Save rule' : 'Add rule'}
          </Button>
        </>
      }
    >
      <form id={formId} className="transaction-form-grid" onSubmit={handleSubmit}>
        <div className="transaction-kind-toggle" aria-label="Recurring rule kind">
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
          <span>Frequency</span>
          <select
            value={form.frequency}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                frequency: event.target.value as RecurringFrequency,
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
            value={form.start_date}
            onInput={(event) => {
              const { value } = event.currentTarget;
              setForm((current) => ({
                ...current,
                start_date: value,
                next_run_date: rule ? current.next_run_date : value,
              }));
            }}
            onChange={(event) => {
              const { value } = event.currentTarget;
              setForm((current) => ({
                ...current,
                start_date: value,
                next_run_date: rule ? current.next_run_date : value,
              }));
            }}
          />
        </label>

        {!rule && form.start_date && form.start_date < today() ? (
          <label className="transaction-checkbox transaction-form-field--wide">
            <input
              type="checkbox"
              checked={!form.skip_backdate}
              onChange={(event) =>
                setForm((current) => ({ ...current, skip_backdate: !event.target.checked }))
              }
            />
            <span>Generate all past occurrences since {form.start_date}</span>
          </label>
        ) : null}

        {rule ? (
          <label className="transaction-form-field">
            <span>Next due</span>
            <input
              type="date"
              value={form.next_run_date}
              onInput={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, next_run_date: value }));
              }}
              onChange={(event) => {
                const { value } = event.currentTarget;
                setForm((current) => ({ ...current, next_run_date: value }));
              }}
            />
          </label>
        ) : null}

        <label className="transaction-form-field">
          <span>Category</span>
          <select
            disabled={Boolean(rule?.debt_id)}
            value={form.debtId ? `debt:${form.debtId}` : form.category}
            onChange={(event) => {
              const value = event.target.value;
              setForm((current) =>
                value.startsWith('debt:')
                  ? {
                      ...current,
                      category: 'debt_payment',
                      debtId: value.replace('debt:', ''),
                    }
                  : { ...current, category: value, debtId: null },
              );
            }}
          >
            {TRANSACTION_CATEGORIES.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
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
          {form.debtId ? <small>Each occurrence pays this debt balance down.</small> : null}
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
            placeholder="Optional recurring context"
            onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
          />
        </label>

        <label className="transaction-checkbox transaction-form-field--wide">
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(event) =>
              setForm((current) => ({ ...current, is_active: event.target.checked }))
            }
          />
          <span>Rule is active</span>
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
