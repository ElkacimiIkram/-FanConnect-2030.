import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { ROUTES } from '../utils/constants';
import { getHomeRouteForRole } from '../utils/roleHelpers';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const defaultRedirect = ROUTES.DASHBOARD;
  const redirectTo = location.state?.from?.pathname || defaultRedirect;
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authApi.login(form);
      const authData = getApiData(response);
      login(authData);
      const roleHome = getHomeRouteForRole(authData.user?.role);
      const destination = redirectTo === ROUTES.DASHBOARD ? roleHome : redirectTo;
      navigate(destination, { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="mb-6 text-center">
          <span className="badge-gold mb-3">Bienvenue</span>
          <h1 className="font-display text-2xl font-extrabold text-ink">Connexion</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Accédez à vos réservations et à la Coupe du Monde.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          <Input
            type="email"
            label="Email"
            placeholder="vous@exemple.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Input
            type="password"
            label="Mot de passe"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Pas encore de compte ?{' '}
          <Link to={ROUTES.REGISTER_FAN} className="font-bold text-primary-700 hover:text-primary-800">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}