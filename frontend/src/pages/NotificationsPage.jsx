import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../api/notificationApi';
import Alert from '../components/ui/Alert';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import Section from '../components/ui/Section';
import Spinner from '../components/ui/Spinner';
import { useAuth } from '../context/AuthContext';
import { getApiData, getApiError } from '../utils/apiHelpers';
import { formatDateTime } from '../utils/formatDate';
import { getNotificationCta, getNotificationLink } from '../utils/notificationLinks';

const TYPE_LABELS = {
  PAYMENT_COMPLETED: 'Paiement confirmé',
  OWNER_NEW_BOOKING: 'Nouvelle réservation',
  NEW_RESERVATION: 'Réservation',
  ADMIN_COMMISSION: 'Commission',
  TICKET_CHECKED_IN: 'Check-in billet',
  BUSINESS_PENDING: 'Établissement en attente',
  BUSINESS_APPROVED: 'Établissement approuvé',
  BUSINESS_REJECTED: 'Établissement refusé',
  BUSINESS_DISABLED: 'Établissement désactivé',
  RESERVATION_CONFIRMED: 'Réservation confirmée',
};

const FILTERS = [
  { id: 'all', label: 'Toutes' },
  { id: 'unread', label: 'Non lues' },
];

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationApi.list();
      setNotifications(getApiData(response) || []);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      await load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await notificationApi.markAllRead();
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationApi.delete(id);
      await load();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleDeleteRead = async () => {
    setActionLoading(true);
    try {
      await notificationApi.deleteAllRead();
      await load();
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="page-container">
      <PageHeader
        badge="Centre de notifications"
        title="Mes notifications"
        subtitle="Gérez vos alertes de réservation, paiement et activité sur FanConnect."
      />

      <Section
        title={`${filtered.length} notification${filtered.length !== 1 ? 's' : ''}`}
        action={
          <div className="flex flex-wrap gap-2">
            {unreadCount > 0 && (
              <Button size="sm" variant="secondary" onClick={handleMarkAllRead} disabled={actionLoading}>
                Tout marquer lu
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={handleDeleteRead} disabled={actionLoading}>
              Supprimer les lues
            </Button>
          </div>
        }
      >
        <div className="mb-4 flex gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                filter === item.id
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-slate-100 text-gray-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
              {item.id === 'unread' && unreadCount > 0 ? ` (${unreadCount})` : ''}
            </button>
          ))}
        </div>

        {error && <Alert variant="error">{error}</Alert>}
        {loading && <Spinner label="Chargement..." />}

        {!loading && filtered.length === 0 && (
          <Alert variant="info">Aucune notification pour ce filtre.</Alert>
        )}

        <div className="space-y-3">
          {filtered.map((n) => {
            const link = getNotificationLink(n, user?.role);
            return (
              <div
                key={n.id}
                className={`rounded-xl border p-4 ${
                  n.read ? 'border-gray-200 bg-white' : 'border-primary-200 bg-primary-50/40'
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-gray-900">{n.title}</p>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs text-gray-600">
                        {TYPE_LABELS[n.type] || n.type}
                      </span>
                      {!n.read && (
                        <span className="rounded-md bg-primary-600 px-2 py-0.5 text-xs font-medium text-white">
                          Nouveau
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">{n.message}</p>
                    <p className="mt-2 text-xs text-gray-400">{formatDateTime(n.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!n.read && (
                      <Button size="sm" variant="secondary" onClick={() => handleMarkRead(n.id)}>
                        Marquer lu
                      </Button>
                    )}
                    {link && (
                      <Link
                        to={link}
                        onClick={() => {
                          if (!n.read) handleMarkRead(n.id);
                        }}
                      >
                        <Button size="sm" variant="secondary">
                          {getNotificationCta(n, user?.role)}
                        </Button>
                      </Link>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(n.id)}>
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}