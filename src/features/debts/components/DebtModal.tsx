import { useId, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { FEATURE_COLORS } from '../../../shared/constants/featurePalette';
import { displayToCents } from '../../../shared/utils/currency';
import { DEFAULT_DEBT_ICON } from '../constants/debtIconKeys';
import { getDebtIconOption, DEBT_ICON_OPTIONS } from '../constants/debtIcons';
import { DEBT_TYPE_OPTIONS, PAYMENT_FREQUENCY_OPTIONS } from '../constants/debtOptions';
import { debtDraftSchema } from '../schemas/debts.schema';
import type { DebtDraft, DebtType, DebtWithProgress, PaymentFrequency } from '../types/debts.types';

type DebtModalProps = {
  debt: DebtWithProgress | null;
  isOpen: boolean;
  isSubmitting: boolean;
  serverError?: string;
  onClose: () => void;
  onSubmit: (draft: DebtDraft) => Promise<void>;
};

type DebtFormState = {
  color: string;
  currentBalance: string;
  debtType: DebtType;
  icon: string;
  interestRate: string;
  minimumPayment: string;
  name: string;
  paymentFrequency: PaymentFrequency;
  principal: string;
  startDate: string;
};

function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2);
}

function basisPointsToInputValue(basisPoints: number): string {
  return (basisPoints / 100).toFixed(2);
}

function percentToBasisPoints(value: string): number | null {
  const normalized = value.trim().replace(/,/g, '').replace(/[^0-9.-]/g, '');
  if (!normalized || normalized === '-' || normalized === '.' || normalized === '-.') {
    return null;
  }

  const numeric = Number(normalized);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100);
}

function zodMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Check the form fields.';
  if (error instanceof Error) return error.message;
  return 'Check the form fields.';
}

function getInitialState(debt: DebtWithProgress | null): DebtFormState {
  if (debt) {
    return {
      color: debt.color ?? FEATURE_COLORS[0],
      currentBalance: centsToInputValue(debt.current_balance_cents),
      debtType: debt.debt_type,
      icon: getDebtIconOption(debt.icon).key,
      interestRate: basisPointsToInputValue(debt.interest_rate_basis_points),
      minimumPayment: centsToInputValue(debt.minimum_payment_cents),
      name: debt.name,
      paymentFrequency: debt.payment_frequency,
      principal: centsToInputValue(debt.principal_cents),
      startDate: debt.start_date ?? '',
    };
  }

  return {
    color: FEATURE_COLORS[0],
    currentBalance: '',
    debtType: 'credit_card',
    icon: DEFAULT_DEBT_ICON,
    interestRate: '',
    minimumPayment: '',
    name: '',
    paymentFrequency: 'monthly',
    principal: '',
    startDate: '',
  };
}

export function DebtModal({ isOpen, ...props }: DebtModalProps) {
  if (!isOpen) return null;
  return <DebtModalContent isOpen={isOpen} {...props} />;
}

function DebtModalContent({
  debt,
  isOpen,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: DebtModalProps) {
  const formId = useId();
  const [form, setForm] = useState<DebtFormState>(() => getInitialState(debt));
  const [clientError, setClientError] = useState<string | null>(null);
  const title = debt ? 'Edit debt' : 'New debt';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const principalCents = displayToCents(form.principal);
    if (!principalCents) {
      setClientError('Enter an original balance greater than zero.');
      return;
    }

    const currentBalanceCents = displayToCents(form.currentBalance || form.principal);
    const minimumPaymentCents = displayToCents(form.minimumPayment || '0') ?? 0;
    const interestBasisPoints = percentToBasisPoints(form.interestRate || '0') ?? 0;

    try {
      const parsed = debtDraftSchema.parse({
        color: form.color,
        current_balance_cents: currentBalanceCents,
        debt_type: form.debtType,
        icon: form.icon,
        interest_rate_basis_points: interestBasisPoints,
        minimum_payment_cents: minimumPaymentCents,
        name: form.name,
        payment_frequency: form.paymentFrequency,
        principal_cents: principalCents,
        start_date: form.startDate || null,
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
            {debt ? 'Save debt' : 'Create debt'}
          </Button>
        </>
      }
    >
      <form id={formId} className="debt-form-grid" onSubmit={handleSubmit}>
        <label className="debt-form-field debt-form-field--wide">
          <span>Name</span>
          <input
            type="text"
            maxLength={100}
            value={form.name}
            placeholder="Credit card"
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
        </label>

        <label className="debt-form-field">
          <span>Debt type</span>
          <select
            value={form.debtType}
            onChange={(event) =>
              setForm((current) => ({ ...current, debtType: event.target.value as DebtType }))
            }
          >
            {DEBT_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="debt-form-field">
          <span>Payment frequency</span>
          <select
            value={form.paymentFrequency}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                paymentFrequency: event.target.value as PaymentFrequency,
              }))
            }
          >
            {PAYMENT_FREQUENCY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="debt-form-field">
          <span>Original balance</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.principal}
            placeholder="8000.00"
            onChange={(event) =>
              setForm((current) => ({ ...current, principal: event.target.value }))
            }
          />
        </label>

        <label className="debt-form-field">
          <span>Current balance</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.currentBalance}
            placeholder="Defaults to original balance"
            onChange={(event) =>
              setForm((current) => ({ ...current, currentBalance: event.target.value }))
            }
          />
        </label>

        <label className="debt-form-field">
          <span>Interest rate</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.interestRate}
            placeholder="19.99"
            onChange={(event) =>
              setForm((current) => ({ ...current, interestRate: event.target.value }))
            }
          />
        </label>

        <label className="debt-form-field">
          <span>Minimum payment</span>
          <input
            type="text"
            inputMode="decimal"
            value={form.minimumPayment}
            placeholder="150.00"
            onChange={(event) =>
              setForm((current) => ({ ...current, minimumPayment: event.target.value }))
            }
          />
        </label>

        <label className="debt-form-field">
          <span>Start date</span>
          <input
            type="date"
            value={form.startDate}
            onInput={(event) => {
              const { value } = event.currentTarget;
              setForm((current) => ({ ...current, startDate: value }));
            }}
            onChange={(event) => {
              const { value } = event.currentTarget;
              setForm((current) => ({ ...current, startDate: value }));
            }}
          />
        </label>

        <fieldset className="debt-color-field debt-form-field--wide">
          <legend>Color</legend>
          <div className="debt-color-options">
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

        <fieldset className="debt-icon-field debt-form-field--wide">
          <legend>Icon</legend>
          <div className="debt-icon-options">
            {DEBT_ICON_OPTIONS.map(({ Icon, key, label }) => (
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
          <p className="debt-form-error" role="alert">
            {clientError ?? serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
