import { useId } from 'react';
import { useRouteError } from 'react-router-dom';
import { Button } from '../shared/components/ui/Button';

function reloadPage() {
  if (typeof window !== 'undefined') window.location.reload();
}

export function RouteErrorPage({ onReload = reloadPage }: { onReload?: () => void }) {
  const error = useRouteError();
  const warningId = useId();
  const isPageDownloadError = error instanceof Error && (
    error.name === 'ChunkLoadError' ||
    /failed to fetch dynamically imported module|error loading dynamically imported module|importing a module script failed|loading (?:css )?chunk .+ failed|unable to preload css/i.test(error.message)
  );

  return (
    <main className="error-state" role="alert">
      <h1 className="error-state-title">
        {isPageDownloadError ? 'This page could not load' : 'Something went wrong'}
      </h1>
      <p className="error-state-message">
        {isPageDownloadError
          ? 'BudgBeacon could not download this page. A recent update or a connection problem may be the cause. Check your connection, then reload to try again.'
          : 'BudgBeacon could not open this page. Reload to try again. If the problem continues, try again later.'}
      </p>
      <p id={warningId} className="error-state-message">Reloading may discard unsaved changes.</p>
      <div className="error-state-action">
        <Button type="button" aria-describedby={warningId} onClick={onReload}>
          Reload page
        </Button>
      </div>
    </main>
  );
}
