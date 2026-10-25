import { useEffect, useMemo, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { bookingApi } from '../../api/bookingApi';
import { paymentApi } from '../../api/paymentApi';
import Alert from '../ui/Alert';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import StripeCheckoutForm from './StripeCheckoutForm';

export default function PaymentStep({
  reservationId,
  price,
  businessName,
  onPaid,
  onBack,
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentIntent, setPaymentIntent] = useState(null);
  const [paymentConfig, setPaymentConfig] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const platformFee = price * 0.25;
  const ownerPayout = price * 0.75;

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        const [configRes, intentRes] = await Promise.all([
          paymentApi.getConfig(),
          bookingApi.createPaymentIntent(reservationId),
        ]);
        setPaymentConfig(getApiData(configRes));
        setPaymentIntent(getApiData(intentRes));
      } catch (err) {
        setError(getApiError(err));
      } finally {
        setLoading(false);
      }
    };
    if (reservationId) init();
  }, [reservationId]);

  const publishableKey = useMemo(() => {
    return (
      paymentIntent?.publishableKey
      || paymentConfig?.publishableKey
      || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
      || ''
    );
  }, [paymentIntent, paymentConfig]);

  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  const handleStripeSuccess = async (paymentIntentId) => {
    setSubmitting(true);
    setError('');
    try {
      const response = await bookingApi.pay(reservationId, { paymentIntentId });
      onPaid(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimulatedPay = async () => {
    setSubmitting(true);
    setError('');
    try {
      const response = await bookingApi.pay(reservationId, {});
      onPaid(getApiData(response));
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Spinner label="Préparation du paiement sécurisé..." />;

  const stripeReady = paymentIntent?.stripeEnabled && paymentIntent?.clientSecret && stripePromise;

  return (
    <div className="animate-fade-in">
      <h2 className="font-display text-lg font-bold text-ink">7. Paiement</h2>
      <p className="mt-2 text-ink-muted">
        Saisissez les détails de votre carte pour finaliser la réservation.
      </p>

      <div className="mt-4 space-y-2 rounded-xl bg-surface-muted p-4">
        <p className="font-display text-2xl font-bold text-ink">{price.toFixed(0)} MAD</p>
        <p className="text-sm text-ink-faint">Table match-day · {businessName}</p>
        <div className="border-t border-surface-border pt-2 text-sm text-ink-muted">
          <p>Commission plateforme (25%) : {platformFee.toFixed(2)} MAD</p>
          <p>Revenu propriétaire (75%) : {ownerPayout.toFixed(2)} MAD</p>
        </div>
        <p className="text-xs font-semibold text-accent-700">Réservation #{reservationId} — paiement requis pour confirmer.</p>
      </div>

      {error && (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="mt-6">
        {stripeReady ? (
          <Elements stripe={stripePromise} options={{ clientSecret: paymentIntent.clientSecret }}>
            <StripeCheckoutForm
              clientSecret={paymentIntent.clientSecret}
              amount={price}
              onSuccess={handleStripeSuccess}
              onError={setError}
              disabled={submitting}
            />
          </Elements>
        ) : (
          <div className="space-y-4">
            <Alert variant="info">
              Paiement par carte indisponible — le backend n&apos;a pas chargé les clés Stripe standard
              (<code>pk_test</code> / <code>sk_test</code>). Vérifiez le fichier <code>.env</code> à la racine
              du projet, puis redémarrez le backend avec{' '}
              <code>bash scripts/start-backend.sh</code> (Git Bash) ou{' '}
              <code>scripts\start-backend.bat</code> (Windows).
            </Alert>
            <div className="rounded-xl border border-dashed border-surface-border bg-surface-card p-4 opacity-60">
              <p className="text-sm font-medium text-ink-faint">Formulaire carte Stripe (clés requises)</p>
              <div className="mt-2 h-10 rounded-xl border border-surface-border bg-surface-muted" />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div className="h-10 rounded-xl border border-surface-border bg-surface-muted" />
                <div className="h-10 rounded-xl border border-surface-border bg-surface-muted" />
              </div>
            </div>
            <Button onClick={handleSimulatedPay} disabled={submitting} variant="secondary">
              {submitting ? 'Traitement...' : 'Dev : paiement simulé'}
            </Button>
          </div>
        )}
      </div>

      <Button variant="ghost" className="mt-4" onClick={onBack}>
        Retour
      </Button>
    </div>
  );
}