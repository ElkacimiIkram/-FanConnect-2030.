import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNavItems } from '../../design-system/navigation';
import { ROLES } from '../../utils/constants';

function isActivePath(pathname, search, itemPath) {
  const [itemPathname, itemSearch] = itemPath.split('?');
  if (pathname !== itemPathname) {
    if (itemPathname === '/matches' && pathname.startsWith('/matches')) {
      return !itemSearch && !search;
    }
    return false;
  }
  if (itemSearch) {
    const params = new URLSearchParams(itemSearch);
    const tab = params.get('tab');
    if (!tab) return !search || search === '' || !new URLSearchParams(search).get('tab');
    return new URLSearchParams(search).get('tab') === tab;
  }
  const currentTab = new URLSearchParams(search).get('tab');
  return !currentTab;
}

function groupNavItems(items) {
  const groups = [];
  items.forEach((item) => {
    const title = item.section || '';
    const last = groups[groups.length - 1];
    if (!last || last.title !== title) {
      groups.push({ title, items: [item] });
    } else {
      last.items.push(item);
    }
  });
  return groups;
}

export default function Sidebar({ collapsed = false, onClose }) {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const role = user?.role;
  const items = getNavItems(
    role === ROLES.ADMIN ? 'ADMIN' : role === ROLES.BUSINESS_OWNER ? 'BUSINESS_OWNER' : 'FAN',
    isAuthenticated
  );
  const groups = groupNavItems(items);

  const roleLabel = role === ROLES.ADMIN
    ? 'Administration'
    : role === ROLES.BUSINESS_OWNER
      ? 'Espace propriétaire'
      : isAuthenticated
        ? 'Espace fan'
        : 'Explorer';

  return (
    <aside
      className={`fc-sidebar flex ${collapsed ? 'fc-sidebar--collapsed' : ''}`}
    >
      <div className="fc-sidebar__brand">
        <div className="fc-sidebar__logo">
          <span className="fc-sidebar__logo-inner">FC</span>
        </div>
        {!collapsed && (
          <div>
            <p className="fc-sidebar__title">FanConnect</p>
            <p className="fc-sidebar__subtitle">World Cup 2030</p>
          </div>
        )}
      </div>

      {!collapsed && (
        <p className="fc-sidebar__section">{roleLabel}</p>
      )}

      <nav className="fc-sidebar__nav">
        {groups.map((group) => (
          <div key={group.title || 'main'} className="mb-4 last:mb-0">
            {!collapsed && group.title && (
              <p className="px-3 pb-1 text-[10px] font-bold uppercase tracking-widest text-ink-faint">
                {group.title}
              </p>
            )}
            {group.items.map((item) => (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={onClose}
                className={() => {
                  const active = isActivePath(
                    location.pathname,
                    location.search.replace(/^\?/, ''),
                    item.path
                  );
                  return `fc-sidebar__link ${active ? 'fc-sidebar__link--active' : ''}`;
                }}
              >
                <span className="fc-sidebar__icon">
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {!collapsed && (
        <div className="fc-sidebar__footer">
          <div className="fc-sidebar__wc-badge">
            <span>🏆</span>
            <span>FIFA WC 2030</span>
          </div>
        </div>
      )}
    </aside>
  );
}
