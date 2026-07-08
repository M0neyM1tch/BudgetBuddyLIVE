import { NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';
import type { ShellNavItem } from './navItems';

type TopNavProps = {
  items: ShellNavItem[];
  preferencesItem: ShellNavItem;
  userEmail?: string;
  onSignOut: () => void;
};

export function TopNav({ items, preferencesItem, userEmail, onSignOut }: TopNavProps) {
  const PreferencesIcon = preferencesItem.Icon;

  return (
    <header className="shell-topnav">
      <NavLink to="/dashboard" className="shell-brand" aria-label="BudgetBuddy dashboard">
        <img src="/BBLogo.jpg" alt="" height="36" width="36" className="shell-brand-image" />
        <span className="shell-brand-copy">
          <span className="shell-brand-name">BudgetBuddy</span>
          <span className="shell-brand-meta">Secure workspace</span>
        </span>
      </NavLink>

      <nav className="shell-desktop-nav" aria-label="Primary navigation">
        {items.map(({ Icon, ...item }) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `shell-nav-item ${isActive ? 'shell-nav-item--active' : ''}`
            }
          >
            <Icon className="shell-nav-icon" />
            <span className="shell-nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="shell-topnav-actions">
        <NavLink
          to={preferencesItem.to}
          aria-label={preferencesItem.label}
          title={preferencesItem.label}
          className={({ isActive }) =>
            `shell-preferences-action ${isActive ? 'shell-preferences-action--active' : ''}`
          }
        >
          <PreferencesIcon className="shell-preferences-icon" />
        </NavLink>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onSignOut}
          className="shell-signout-button"
          title={userEmail ? `Sign out ${userEmail}` : 'Sign out'}
        >
          Sign out
        </Button>
      </div>
    </header>
  );
}
