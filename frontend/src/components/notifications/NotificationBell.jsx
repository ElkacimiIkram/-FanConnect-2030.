import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { notificationApi } from '../../api/notificationApi';
import { useAuth } from '../../context/AuthContext';
import { ROUTES } from '../../utils/constants';
import { getApiData, getApiError } from '../../utils/apiHelpers';
import { formatDateTime } from '../../utils/formatDate';
import { getNotificationCta, getNotificationLink } from '../../utils/notificationLinks';

const TYPE_LABELS = {
  PAYMENT_COMPLETED: 'Paiement',
  OWNER_NEW_BOOKING: 'Réservation',
  NEW_RESERVATION: 'Réservation',
  ADMIN_COMMISSION: 'Commission',
  TICKET_CHECKED_IN: 'Check-in',
  BUSINESS_PENDING: 'Vérification',
  BUSINESS_APPROVED: 'Business',
  BUSINESS_REJECTED: 'Business',
  BUSINESS_DISABLED: 'Business',
  RESERVATION_CONFIRMED: 'Réservation',
};

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const panelRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [listRes, countRes] = await Promise.all([
        notificationApi.list(),
        notificationApi.unreadCount(),
      ]);
      setNotifications(getApiData(listRes) || []);
      setUnreadCount(getApiData(countRes) ?? 0);
    } catch (err) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleToggle = () => {
    setOpen((prev) => !prev);
    if (!open) loadNotifications();
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      await loadNotifications();
    } catch (err) {
      setError(getApiError(err));
    }
  };

  const handleOpenNotification = async (notification) => {
    if (!notification.read) {
      await handleMarkRead(notification.id);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={handleToggle}
        className="relative rounded-md p-2 text-gray-600 hover:bg-gray-100"
        aria-label="Notifications"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg sm:w-96">
          <div className="border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>

          {error && (
            <p className="px-4 py-2 text-xs text-red-600">{error}</p>
          )}

          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">Chargement...</p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">Aucune notification</p>
            ) : (
              notifications.map((n) => {
                const link = getNotificationLink(n, user?.role);
                const isVerificationAlert = n.type === 'BUSINESS_PENDING';
                const content = (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">{n.title}</p>
                        <p className={`mt-0.5 text-xs ${isVerificationAlert ? 'font-semibold text-amber-700' : 'text-primary-700'}`}>
                          {TYPE_LABELS[n.type] || n.type}
                        </p>
                        <p className="mt-1 text-gray-600 break-words">{n.message}</p>
                        <p className="mt-1 text-xs text-gray-400">
                          {formatDateTime(n.createdAt)}
                        </p>
                        {link && (
                          <p className="mt-2 text-xs font-semibold text-primary-600">
                            {getNotificationCta(n, user?.role)} →
                          </p>
                        )}
                      </div>
                      {!n.read && !link && (
                        <button
                          type="button"
                          onClick={() => handleMarkRead(n.id)}
                          className="shrink-0 text-xs text-primary-600 hover:underline"
                        >
                          Lu
                        </button>
                      )}
                    </div>
                  </>
                );

                return link ? (
                  <Link
                    key={n.id}
                    to={link}
                    onClick={() => handleOpenNotification(n)}
                    className={`block border-b px-4 py-3 text-sm transition hover:bg-primary-100/60 ${
                      n.read
                        ? 'bg-white'
                        : isVerificationAlert
                          ? 'bg-amber-50'
                          : 'bg-primary-50'
                    }`}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={n.id}
                    className={`border-b px-4 py-3 text-sm ${
                      n.read ? 'bg-white' : 'bg-primary-50'
                    }`}
                  >
                    {content}
                  </div>
                );
              })
            )}
          </div>

          <div className="border-t px-4 py-3 text-center">
            <Link
              to={ROUTES.NOTIFICATIONS}
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Gérer toutes les notifications →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}