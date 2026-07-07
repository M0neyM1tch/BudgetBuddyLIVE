import { NavLink } from 'react-router-dom';
import type { ShellNavItem } from './navItems';

type MobileNavProps = {
  items: ShellNavItem[];
};

export function MobileNav({ items }: MobileNavProps) {
  return (
    <nav className="shell-mobile-nav" aria-label="Primary navigation">
      {items.map(({ Icon, ...item }) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.to === '/dashboard'}
          aria-label={item.label}
          className={({ isActive }) =>
            `shell-mobile-nav-item ${isActive ? 'shell-mobile-nav-item--active' : ''}`
          }
        >
          <Icon className="shell-mobile-nav-icon" />
          <span>{item.mobileLabel}</span>
        </NavLink>
      ))}
    </nav>
  );
}
