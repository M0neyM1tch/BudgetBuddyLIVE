import { Spinner } from '../ui/Spinner';

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = 'Loading' }: LoadingStateProps) {
  return (
    <div className="loading-state">
      <Spinner size="lg" label={label} />
    </div>
  );
}
