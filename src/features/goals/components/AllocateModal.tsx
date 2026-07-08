import { useId, useState, type FormEvent } from 'react';
import { z } from 'zod';
import { Button } from '../../../shared/components/ui/Button';
import { Modal } from '../../../shared/components/ui/Modal';
import { displayToCents } from '../../../shared/utils/currency';
import { today } from '../../../shared/utils/dates';
import { goalContributionDraftSchema } from '../schemas/goals.schema';
import type { GoalContributionDraft, GoalWithProgress } from '../types/goals.types';

type AllocateModalProps = {
  goal: GoalWithProgress | null;
  isSubmitting: boolean;
  serverError?: string;
  onClose: () => void;
  onSubmit: (draft: GoalContributionDraft) => Promise<void>;
};

function zodMessage(error: unknown): string {
  if (error instanceof z.ZodError) return error.issues[0]?.message ?? 'Check the form fields.';
  if (error instanceof Error) return error.message;
  return 'Check the form fields.';
}

export function AllocateModal({
  goal,
  isSubmitting,
  serverError,
  onClose,
  onSubmit,
}: AllocateModalProps) {
  const formId = useId();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(today());
  const [notes, setNotes] = useState('');
  const [clientError, setClientError] = useState<string | null>(null);

  if (!goal) return null;
  const currentGoal = goal;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setClientError(null);

    const amountCents = displayToCents(amount);
    if (!amountCents) {
      setClientError('Enter an amount greater than zero.');
      return;
    }

    try {
      const parsed = goalContributionDraftSchema.parse({
        goal_id: currentGoal.id,
        amount_cents: amountCents,
        transaction_date: date,
        description: `Goal contribution: ${currentGoal.name}`,
        notes,
      });

      await onSubmit(parsed);
    } catch (error) {
      setClientError(zodMessage(error));
    }
  }

  return (
    <Modal
      isOpen={Boolean(goal)}
      title={`Add funds to ${currentGoal.name}`}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} isLoading={isSubmitting}>
            Add funds
          </Button>
        </>
      }
    >
      <form id={formId} className="goal-form-grid" onSubmit={handleSubmit}>
        <label className="goal-form-field">
          <span>Amount</span>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            placeholder="100.00"
            onChange={(event) => setAmount(event.target.value)}
          />
        </label>

        <label className="goal-form-field">
          <span>Date</span>
          <input
            type="date"
            value={date}
            onInput={(event) => setDate(event.currentTarget.value)}
            onChange={(event) => setDate(event.currentTarget.value)}
          />
        </label>

        <label className="goal-form-field goal-form-field--wide">
          <span>Notes</span>
          <textarea
            maxLength={500}
            value={notes}
            placeholder="Optional context"
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>

        {clientError || serverError ? (
          <p className="goal-form-error" role="alert">
            {clientError ?? serverError}
          </p>
        ) : null}
      </form>
    </Modal>
  );
}
