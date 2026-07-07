import type { ReactNode } from 'react';

type CalculatorEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function CalculatorEmptyState({
  title,
  description,
  action,
}: CalculatorEmptyStateProps) {
  return (
    <div className="calculator-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {action ? <div>{action}</div> : null}
    </div>
  );
}
