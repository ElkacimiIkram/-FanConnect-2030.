import { Link } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';

export default function TopBar({ onMenuToggle, title = 'FanConnect 2030' }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="fc-topbar">
      <div className="fc-topbar__left">
        <button
          type="button"
          className="fc-topbar__menu-btn lg:hidden"
          onClick={onMenuToggle}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className="fc-topbar__title">{title}</h1>
      </div>

      <div className="fc-topbar__right">
        {isAuthenticated ? (
          <>
            <NotificationBell />
            <div className="fc-topbar__user hidden sm:flex">
              <span className="fc-topbar__avatar">
                {user?.firstName?.[0]?.toUpperCase() || 'F'}
              </span>
              <span className="fc-topbar__name">{user?.firstName}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to={ROUTES.LOGIN} className="fc-topbar__link">
              Login
            </Link>
            <Link to={ROUTES.REGISTER_FAN}>
              <Button variant="gold" size="sm">Sign up</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}