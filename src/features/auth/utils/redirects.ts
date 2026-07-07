const AUTH_REDIRECT_KEY = 'budgetbuddy-auth-redirect';

export type AuthRedirectTarget = {
  pathname: string;
  search: string;
  hash: string;
};

export function redirectTargetToPath(target: AuthRedirectTarget | null | undefined) {
  if (!target) return '/dashboard';
  return `${target.pathname || '/dashboard'}${target.search || ''}${target.hash || ''}`;
}

export function saveAuthRedirect(target: AuthRedirectTarget) {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(AUTH_REDIRECT_KEY, JSON.stringify(target));
}

export function consumeAuthRedirect() {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(AUTH_REDIRECT_KEY);
  if (!raw) return null;
  window.sessionStorage.removeItem(AUTH_REDIRECT_KEY);

  try {
    const parsed = JSON.parse(raw) as Partial<AuthRedirectTarget>;
    if (!parsed.pathname?.startsWith('/')) return null;
    return {
      pathname: parsed.pathname,
      search: parsed.search ?? '',
      hash: parsed.hash ?? '',
    };
  } catch {
    return null;
  }
}
