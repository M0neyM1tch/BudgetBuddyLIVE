import { NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';
import type { ShellNavItem } from './navItems';

type TopNavProps = {
  items: ShellNavItem[];
  userEmail?: string;
  onSignOut: () => void;
};

export function TopNav({ items, userEmail, onSignOut }: TopNavProps) {
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
        <span className="shell-account" title={userEmail}>
          {userEmail ?? 'Signed in'}
        </span>
        <Button type="button" variant="ghost" size="sm" onClick={onSignOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
