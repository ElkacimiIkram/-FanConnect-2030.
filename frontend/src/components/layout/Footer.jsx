import { Link } from 'react-router-dom';
import { ROUTES } from '../../utils/constants';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-surface-border bg-surface-card">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-lg font-bold text-ink">FanConnect 2030</p>
            <p className="mt-1 max-w-sm text-sm text-ink-muted">
              Réservez votre table pour la Coupe du Monde, dans les meilleurs cafés du Maroc.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-semibold text-ink-muted">
            <Link to={ROUTES.MATCHES} className="transition-colors hover:text-primary-700">
              Matchs
            </Link>
            <Link to={ROUTES.CAFES} className="transition-colors hover:text-primary-700">
              Lieux
            </Link>
            <Link to={ROUTES.BOOK()} className="transition-colors hover:text-primary-700">
              Réserver
            </Link>
          </div>
        </div>
        <div className="mt-8 flex items-center justify-center gap-2 border-t border-surface-border pt-6 text-xs text-ink-faint">
          <span className="h-2 w-2 rounded-full bg-primary-500" />
          <span>&copy; {new Date().getFullYear()} FanConnect — Tous droits réservés</span>
        </div>
      </div>
    </footer>
  );
}