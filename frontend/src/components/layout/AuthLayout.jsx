import { Link, Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="fc-auth">
      <div className="fc-auth__bg" aria-hidden>
        <div className="fc-auth__glow fc-auth__glow--green" />
        <div className="fc-auth__glow fc-auth__glow--gold" />
      </div>
      <div className="fc-auth__panel">
        <Link to="/" className="fc-auth__brand">
          <span className="fc-sidebar__logo fc-sidebar__logo--sm">
            <span className="fc-sidebar__logo-inner">FC</span>
          </span>
          <span className="font-display text-xl font-bold text-ink">FanConnect 2030</span>
        </Link>
        <Outlet />
      </div>
    </div>
  );
}