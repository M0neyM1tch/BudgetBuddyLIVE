import { Button } from '../ui/Button';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="44" height="44" fill="none">
          <path
            d="M12 9v4M12 17h.01M10.3 4.4 2.9 17.2A2 2 0 0 0 4.6 20h14.8a2 2 0 0 0 1.7-2.8L13.7 4.4a2 2 0 0 0-3.4 0Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
      </div>
      <h2 className="error-state-title">{title}</h2>
      <p className="error-state-message">{message}</p>
      {onRetry ? (
        <div className="error-state-action">
          <Button type="button" variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : null}
    </div>
  );
}
