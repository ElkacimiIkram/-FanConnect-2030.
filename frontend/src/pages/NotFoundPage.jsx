import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ROUTES } from '../utils/constants';

export default function NotFoundPage() {
  return (
    <div className="page-container flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="text-6xl font-extrabold text-primary-200">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-ink">Page introuvable</h1>
      <p className="mt-2 max-w-md text-ink-muted">
        Cette page n&apos;existe pas. Retournez à l&apos;accueil pour réserver votre place.
      </p>
      <Link to={ROUTES.HOME} className="mt-8">
        <Button size="lg">Retour à l&apos;accueil</Button>
      </Link>
    </div>
  );
}