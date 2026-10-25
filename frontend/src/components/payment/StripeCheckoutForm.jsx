import { useState } from 'react';
import { CardElement, useElements, useStripe } from '@stripe/react-stripe-js';
import Alert from '../ui/Alert';
import Button from '../ui/Button';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: '16px',
      color: '#1f2937',
      fontFamily: 'system-ui, sans-serif',
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: { color: '#dc2626' },
  },
  hidePostalCode: true,
};

export default function StripeCheckoutForm({
  clientSecret,
  amount,
  onSuccess,
  onError,
  disabled,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [cardError, setCardError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || !clientSecret) return;

    setProcessing(true);
    setCardError('');

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setCardError('Card form not ready');
      setProcessing(false);
      return;
    }

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card: cardElement },
      });

      if (error) {
        setCardError(error.message || 'Payment failed');
        onError?.(error.message);
        return;
      }

      if (paymentIntent?.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      } else {
        setCardError(`Payment status: ${paymentIntent?.status}`);
      }
    } catch (err) {
      setCardError(err.message || 'Payment failed');
      onError?.(err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">
          Numéro de carte, expiration et CVC
        </label>
        <div className="rounded-lg border border-gray-300 bg-white px-4 py-3 shadow-sm">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Visa, Mastercard, Amex — paiement sécurisé par Stripe
        </p>
      </div>

      {cardError && <Alert variant="error">{cardError}</Alert>}

      <Button type="submit" disabled={!stripe || processing || disabled} className="w-full">
        {processing ? 'Paiement en cours...' : `Payer ${Number(amount).toFixed(0)} MAD`}
      </Button>
    </form>
  );
}