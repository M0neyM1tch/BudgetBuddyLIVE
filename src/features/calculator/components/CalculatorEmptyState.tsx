import type { ReactNode } from 'react';

type CalculatorEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  requirements?: string[];
};

export function CalculatorEmptyState({
  title,
  description,
  action,
  requirements = [],
}: CalculatorEmptyStateProps) {
  return (
    <div className="calculator-empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
      {requirements.length > 0 ? (
        <ul className="calculator-empty-state__requirements">
          {requirements.map((requirement) => (
            <li key={requirement}>{requirement}</li>
          ))}
        </ul>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
