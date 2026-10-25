import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../api/authApi';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { ROLES, ROUTES } from '../utils/constants';
import { getHomeRouteForRole } from '../utils/roleHelpers';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const initialRole =
    searchParams.get('role') === 'owner' ? ROLES.BUSINESS_OWNER : ROLES.FAN_USER;

  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    role: initialRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isFan = form.role === ROLES.FAN_USER;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        ...form,
        city: isFan ? form.city : form.city || undefined,
      };
      const response = await authApi.register(payload);
      const authData = getApiData(response);
      login(authData);
      navigate(getHomeRouteForRole(authData.user?.role), { replace: true });
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell max-w-lg">
      <div className="auth-card">
        <div className="mb-6 text-center">
          <span className="badge-arena mb-3">Rejoindre FanConnect</span>
          <h1 className="font-display text-2xl font-extrabold text-ink">Créer un compte</h1>
          <p className="mt-2 text-sm text-ink-muted">
            Fan ou propriétaire de café — réservez pour la Coupe du Monde.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}

          <fieldset className="space-y-2">
            <legend className="text-sm font-semibold text-ink">Je m&apos;inscris en tant que</legend>
            <div className="grid grid-cols-2 gap-3">
              {[
                { role: ROLES.FAN_USER, label: 'Fan', icon: '⚽' },
                { role: ROLES.BUSINESS_OWNER, label: 'Propriétaire', icon: '☕' },
              ].map((opt) => (
                <label
                  key={opt.role}
                  className={`cursor-pointer rounded-xl border-2 px-4 py-3 text-center text-sm font-bold transition-all ${
                    form.role === opt.role
                      ? 'border-primary-500 bg-primary-50 text-primary-800 shadow-soft'
                      : 'border-surface-border text-ink-muted hover:border-primary-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    className="sr-only"
                    checked={form.role === opt.role}
                    onChange={() => setForm({ ...form, role: opt.role })}
                  />
                  <span className="mr-1">{opt.icon}</span>
                  {opt.label}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="grid grid-cols-2 gap-3">
            <Input
              placeholder="Prénom"
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <Input
              placeholder="Nom"
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>
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
            placeholder="8 caractères minimum"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Input
            type="tel"
            label="Téléphone"
            placeholder="+212 6..."
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          {isFan && (
            <Input
              label="Ville"
              placeholder="Casablanca, Rabat..."
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
            />
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? 'Création...' : isFan ? 'S\'inscrire comme fan' : 'S\'inscrire comme propriétaire'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-ink-muted">
          Déjà inscrit ?{' '}
          <Link to={ROUTES.LOGIN} className="font-bold text-primary-700">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}