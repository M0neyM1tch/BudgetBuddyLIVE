import { centsToDisplay } from '../../../shared/utils/currency';

type ActivePriorityContextProps = {
  name: string | null;
  currentCents: number | null;
  targetCents: number | null;
  remainingCents: number | null;
  isDebt: boolean;
  isLoading: boolean;
};

export function ActivePriorityContext({
  name,
  currentCents,
  targetCents,
  remainingCents,
  isDebt,
  isLoading,
}: ActivePriorityContextProps) {
  if (isLoading) {
    return <section className="active-priority-context" aria-label="Active priority" aria-busy="true" />;
  }

  if (!name) return null;

  const progress =
    currentCents != null && targetCents != null && targetCents > 0
      ? Math.min(100, Math.max(0, (currentCents / targetCents) * 100))
      : null;

  return (
    <section className="active-priority-context" aria-labelledby="active-priority-context-title">
      <p className="section-kicker">Active priority</p>
      <h3 id="active-priority-context-title">{name}</h3>
      {remainingCents != null ? (
        <p>
          {isDebt ? `${centsToDisplay(remainingCents)} remaining` : `${centsToDisplay(remainingCents)} to go`}
          {progress != null ? ` · ${Math.round(progress)}% complete` : ''}
        </p>
      ) : null}
      <small>
        Contributions recorded here update this {isDebt ? 'debt payment' : 'goal contribution'}.
      </small>
    </section>
  );
}
