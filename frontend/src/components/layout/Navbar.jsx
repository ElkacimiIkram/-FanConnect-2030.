import { Link, NavLink } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROUTES } from '../../utils/constants';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  const linkClass = ({ isActive }) =>
    `nav-pill ${isActive ? 'nav-pill-active' : ''}`;

  const isFan = user?.role === ROLES.FAN_USER;
  const isOwner = user?.role === ROLES.BUSINESS_OWNER;
  const isAdmin = user?.role === ROLES.ADMIN;

  return (
    <header className="sticky top-0 z-50 border-b border-surface-border/80 bg-surface-card/90 shadow-nav backdrop-blur-lg">
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-hero-pitch text-sm font-extrabold text-white shadow-soft transition-transform duration-300 group-hover:scale-105">
            <span className="relative z-10">FC</span>
            <span className="absolute inset-0 bg-mesh-hero opacity-60" />
          </span>
          <div className="leading-tight">
            <span className="font-display text-lg font-extrabold text-ink">FanConnect</span>
            <span className="block text-[10px] font-bold uppercase tracking-widest text-primary-600">
              2030
            </span>
          </div>
        </Link>

        <div className="flex flex-wrap items-center gap-1 rounded-2xl bg-surface p-1">
          <NavLink to="/" className={linkClass} end>
            Accueil
          </NavLink>
          <NavLink to="/matches" className={linkClass}>
            Coupe du Monde
          </NavLink>
          <NavLink to="/cafes" className={linkClass}>
            Lieux
          </NavLink>
          {isAuthenticated && isFan && (
            <NavLink to={ROUTES.DASHBOARD} className={linkClass}>
              Réservations
            </NavLink>
          )}
          {isAuthenticated && isOwner && (
            <NavLink to={ROUTES.OWNER_DASHBOARD} className={linkClass}>
              Mon café
            </NavLink>
          )}
          {isAuthenticated && isAdmin && (
            <NavLink to={ROUTES.ADMIN} className={linkClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              <NavLink to={ROUTES.NOTIFICATIONS} className={linkClass}>
                Alertes
              </NavLink>
              <NotificationBell />
              <span className="hidden rounded-xl bg-surface px-3 py-1.5 text-sm font-semibold text-ink-muted sm:inline">
                {user.firstName}
              </span>
              <Button variant="secondary" size="sm" onClick={logout}>
                Déconnexion
              </Button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="nav-pill">
                Connexion
              </Link>
              <Link to={ROUTES.REGISTER_FAN}>
                <Button size="sm">S&apos;inscrire</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}