import { Outlet } from 'react-router-dom';
import { OnboardingRoot } from '../../../features/onboarding';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { MobileNav } from './MobileNav';
import { SHELL_NAV_ITEMS, SHELL_PREFERENCES_ITEM } from './navItems';
import { TopNav } from './TopNav';
import './AppShell.css';

export function AppShell() {
  const { signOut, user } = useAuth();

  return (
    <div className="app-shell">
      <TopNav
        items={SHELL_NAV_ITEMS}
        preferencesItem={SHELL_PREFERENCES_ITEM}
        userEmail={user?.email}
        onSignOut={() => {
          void signOut();
        }}
      />
      <MobileNav items={SHELL_NAV_ITEMS} />
      <div className="shell-workspace">
        <main className="shell-main" id="main-content">
          <Outlet />
        </main>
      </div>
      <OnboardingRoot />
    </div>
  );
}
