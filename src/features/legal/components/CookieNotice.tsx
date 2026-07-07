import { useState } from 'react';
import './CookieNotice.css';

const COOKIE_NOTICE_KEY = 'bb_essential_storage_notice_ack';

export function CookieNotice() {
  const [isVisible, setIsVisible] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.localStorage.getItem(COOKIE_NOTICE_KEY) !== 'true',
  );

  if (!isVisible) return null;

  return (
    <aside className="cookie-notice" aria-label="Cookie and storage notice">
      <div>
        <strong>Essential storage only</strong>
        <p>
          BudgetBuddy uses essential browser storage for authentication, security,
          preferences, and dismissed notices. No third-party analytics or marketing
          cookies are planned at launch.
        </p>
      </div>
      <div className="cookie-notice__actions">
        <a href="/privacy">Privacy</a>
        <button
          type="button"
          onClick={() => {
            window.localStorage.setItem(COOKIE_NOTICE_KEY, 'true');
            setIsVisible(false);
          }}
        >
          Got it
        </button>
      </div>
    </aside>
  );
}
