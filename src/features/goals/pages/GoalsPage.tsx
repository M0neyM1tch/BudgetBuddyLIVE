import { Plus, Target, TrendingUp, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { normalizeError } from '../../../shared/api/errors';
import { EmptyState } from '../../../shared/components/feedback/EmptyState';
import { ErrorState } from '../../../shared/components/feedback/ErrorState';
import { LoadingState } from '../../../shared/components/feedback/LoadingState';
import { Button } from '../../../shared/components/ui/Button';
import { OnboardingTooltip } from '../../onboarding';
import { centsToDisplay } from '../../../shared/utils/currency';
import { AllocateModal } from '../components/AllocateModal';
import { ArchiveGoalModal } from '../components/ArchiveGoalModal';
import { DeleteGoalModal } from '../components/DeleteGoalModal';
import { GoalCard } from '../components/GoalCard';
import { GoalTimelineProjector } from '../components/GoalTimelineProjector';
import { GoalModal } from '../components/GoalModal';
import { useTransactions } from '../../transactions';
import {
  useAllocateToGoal,
  useArchiveGoal,
  useCreateGoal,
  useDeleteGoalPermanently,
  useGoals,
  useRestoreGoal,
  useUpdateGoal,
} from '../hooks/useGoals';
import type {
  GoalContributionDraft,
  GoalDraft,
  GoalSummary,
  GoalWithProgress,
} from '../types/goals.types';
import './GoalsPage.css';

function summarizeGoals(goals: GoalWithProgress[]): GoalSummary {
  return goals.reduce<GoalSummary>(
    (summary, goal) => {
      if (goal.is_archived) return summary;

      summary.activeCount += 1;
      summary.totalCurrentCents += goal.current_amount_cents;
      summary.totalTargetCents += goal.target_amount_cents;

      if (goal.status === 'completed') summary.completedCount += 1;
      if (goal.status === 'on_track' || goal.status === 'completed') summary.onTrackCount += 1;

      return summary;
    },
    {
      activeCount: 0,
      completedCount: 0,
      onTrackCount: 0,
      totalCurrentCents: 0,
      totalTargetCents: 0,
    },
  );
}

export function GoalsPage() {
  const [searchParams] = useSearchParams();
  const shouldOpenCreateFromUrl = searchParams.get('new') === '1';
  const goalsQuery = useGoals();
  const createGoalMutation = useCreateGoal();
  const updateGoalMutation = useUpdateGoal();
  const archiveGoalMutation = useArchiveGoal();
  const deleteGoalMutation = useDeleteGoalPermanently();
  const restoreGoalMutation = useRestoreGoal();
  const allocateToGoalMutation = useAllocateToGoal();
  const goalTransactionsQuery = useTransactions({});

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(() => shouldOpenCreateFromUrl);
  const [editingGoal, setEditingGoal] = useState<GoalWithProgress | null>(null);
  const [allocatingGoal, setAllocatingGoal] = useState<GoalWithProgress | null>(null);
  const [archivingGoal, setArchivingGoal] = useState<GoalWithProgress | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalWithProgress | null>(null);

  const goals = useMemo(() => goalsQuery.data ?? [], [goalsQuery.data]);
  const activeGoals = useMemo(() => goals.filter((goal) => !goal.is_archived), [goals]);
  const archivedGoals = useMemo(() => goals.filter((goal) => goal.is_archived), [goals]);
  const summary = useMemo(() => summarizeGoals(goals), [goals]);

  useEffect(() => {
    if (!shouldOpenCreateFromUrl || typeof window === 'undefined') return;

    const nextParams = new URLSearchParams(window.location.search);
    nextParams.delete('new');
    const query = nextParams.toString();
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${query ? `?${query}` : ''}${window.location.hash}`,
    );
  }, [shouldOpenCreateFromUrl]);

  function openCreateGoal() {
    createGoalMutation.reset();
    updateGoalMutation.reset();
    setEditingGoal(null);
    setIsGoalModalOpen(true);
  }

  function openEditGoal(goal: GoalWithProgress) {
    createGoalMutation.reset();
    updateGoalMutation.reset();
    setEditingGoal(goal);
    setIsGoalModalOpen(true);
  }

  function closeGoalModal() {
    setEditingGoal(null);
    setIsGoalModalOpen(false);
  }

  async function handleGoalSubmit(draft: GoalDraft) {
    if (editingGoal) {
      await updateGoalMutation.mutateAsync({
        id: editingGoal.id,
        updates: draft,
      });
    } else {
      await createGoalMutation.mutateAsync(draft);
    }

    closeGoalModal();
  }

  async function handleContributionSubmit(draft: GoalContributionDraft) {
    await allocateToGoalMutation.mutateAsync(draft);
    setAllocatingGoal(null);
  }

  async function handleConfirmArchiveGoal() {
    if (!archivingGoal) return;

    try {
      await archiveGoalMutation.mutateAsync(archivingGoal.id);
      setArchivingGoal(null);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  async function handleConfirmDeleteGoal() {
    if (!deletingGoal) return;

    try {
      await deleteGoalMutation.mutateAsync(deletingGoal.id);
      setDeletingGoal(null);
    } catch {
      // React Query exposes the error in the confirmation modal.
    }
  }

  if (goalsQuery.isLoading) {
    return <LoadingState label="Loading goals" />;
  }

  if (goalsQuery.error) {
    return (
      <ErrorState
        title="Goals could not load"
        message={normalizeError(goalsQuery.error).message}
        onRetry={() => {
          void goalsQuery.refetch();
        }}
      />
    );
  }

  return (
    <section className="page page--wide goals-page" aria-labelledby="goals-title">
      <div className="page-header goals-page-header">
        <div>
          <p className="page-kicker">Savings targets</p>
          <h2 id="goals-title" className="page-title">
            Goals
          </h2>
          <p className="page-description">
            Build targeted savings plans, add contributions, and keep every goal-linked
            transaction synced for the dashboard.
          </p>
        </div>
        <Button
          type="button"
          size="lg"
          leftIcon={<Plus size={18} aria-hidden="true" />}
          onClick={openCreateGoal}
        >
          New goal
        </Button>
      </div>

      <div className="goals-summary" aria-label="Goals summary">
        <article className="goals-summary-card">
          <span className="goals-summary-icon">
            <WalletCards size={20} aria-hidden="true" />
          </span>
          <div>
            <p>Total saved</p>
            <strong>{centsToDisplay(summary.totalCurrentCents)}</strong>
          </div>
        </article>
        <article className="goals-summary-card">
          <span className="goals-summary-icon">
            <Target size={20} aria-hidden="true" />
          </span>
          <div>
            <p>Total target</p>
            <strong>{centsToDisplay(summary.totalTargetCents)}</strong>
          </div>
        </article>
        <article className="goals-summary-card">
          <span className="goals-summary-icon">
            <TrendingUp size={20} aria-hidden="true" />
          </span>
          <div>
            <p>On track</p>
            <strong>
              {summary.onTrackCount}/{summary.activeCount}
            </strong>
          </div>
        </article>
      </div>

      <details className="planner-collapsible" open>
        <summary className="planner-collapsible-toggle">
          <span>Goal Timeline Projector</span>
        </summary>
        <GoalTimelineProjector
          goals={activeGoals}
          transactions={goalTransactionsQuery.data ?? []}
          isLoadingTransactions={goalTransactionsQuery.isLoading}
        />
      </details>

      {activeGoals.length === 0 ? (
        <EmptyState
          title="No active goals yet"
          description="Create your first target and start tracking progress against real transactions."
          action={
            <Button
              type="button"
              leftIcon={<Plus size={16} aria-hidden="true" />}
              onClick={openCreateGoal}
            >
              New Goal
            </Button>
          }
        />
      ) : (
        <div className="goals-grid" aria-label="Active goals">
          {activeGoals.map((goal, index) => {
            const card = (
              <GoalCard
                key={goal.id}
                goal={goal}
                isMutating={archiveGoalMutation.isPending || restoreGoalMutation.isPending}
                onAddFunds={setAllocatingGoal}
                onArchive={setArchivingGoal}
                onDelete={setDeletingGoal}
                onEdit={openEditGoal}
                onRestore={(restoringGoal) => {
                  restoreGoalMutation.mutate(restoringGoal.id);
                }}
              />
            );

            return index === 0 ? (
              <OnboardingTooltip
                id="goals-contribution-hint"
                content="Allocate funds to a goal to track your progress toward it."
                key={goal.id}
              >
                {card}
              </OnboardingTooltip>
            ) : (
              card
            );
          })}
        </div>
      )}

      {archivedGoals.length > 0 ? (
        <details className="archived-goals">
          <summary>Archived goals ({archivedGoals.length})</summary>
          <div className="goals-grid" aria-label="Archived goals">
            {archivedGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                isMutating={archiveGoalMutation.isPending || restoreGoalMutation.isPending}
                onAddFunds={setAllocatingGoal}
                onArchive={setArchivingGoal}
                onDelete={setDeletingGoal}
                onEdit={openEditGoal}
                onRestore={(restoringGoal) => {
                  restoreGoalMutation.mutate(restoringGoal.id);
                }}
              />
            ))}
          </div>
        </details>
      ) : null}

      <GoalModal
        isOpen={isGoalModalOpen}
        goal={editingGoal}
        isSubmitting={createGoalMutation.isPending || updateGoalMutation.isPending}
        serverError={
          createGoalMutation.error || updateGoalMutation.error
            ? normalizeError(createGoalMutation.error ?? updateGoalMutation.error).message
            : undefined
        }
        onClose={closeGoalModal}
        onSubmit={handleGoalSubmit}
      />

      <AllocateModal
        goal={allocatingGoal}
        isSubmitting={allocateToGoalMutation.isPending}
        serverError={
          allocateToGoalMutation.error
            ? normalizeError(allocateToGoalMutation.error).message
            : undefined
        }
        onClose={() => setAllocatingGoal(null)}
        onSubmit={handleContributionSubmit}
      />

      <ArchiveGoalModal
        goal={archivingGoal}
        isArchiving={archiveGoalMutation.isPending}
        error={
          archiveGoalMutation.error
            ? normalizeError(archiveGoalMutation.error).message
            : undefined
        }
        onCancel={() => setArchivingGoal(null)}
        onConfirm={() => {
          void handleConfirmArchiveGoal();
        }}
      />

      <DeleteGoalModal
        goal={deletingGoal}
        isDeleting={deleteGoalMutation.isPending}
        error={
          deleteGoalMutation.error
            ? normalizeError(deleteGoalMutation.error).message
            : undefined
        }
        onCancel={() => setDeletingGoal(null)}
        onConfirm={() => {
          void handleConfirmDeleteGoal();
        }}
      />
    </section>
  );
}
