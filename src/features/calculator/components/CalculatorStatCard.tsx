import type { ReactNode } from 'react';

type CalculatorStatCardProps = {
  label: string;
  value: string;
  tone?: 'default' | 'good' | 'warn';
  icon?: ReactNode;
  detail?: string;
};

export function CalculatorStatCard({
  label,
  value,
  tone = 'default',
  icon,
  detail,
}: CalculatorStatCardProps) {
  return (
    <article className={`calculator-stat-card calculator-stat-card--${tone}`}>
      {icon ? (
        <span className="calculator-stat-icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        {detail ? <small>{detail}</small> : null}
      </div>
    </article>
  );
}
