import type { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none">
          <path
            d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M8 10h8M8 14h5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.75"
          />
        </svg>
      </div>
      <h2 className="empty-state-title">{title}</h2>
      {description ? (
        <p className="empty-state-description">{description}</p>
      ) : null}
      {action ? <div className="empty-state-action">{action}</div> : null}
    </div>
  );
}
