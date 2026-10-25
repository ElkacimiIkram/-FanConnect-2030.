import { ROUTES } from './constants';

const RESERVATION_TYPES = new Set([
  'OWNER_NEW_BOOKING',
  'NEW_RESERVATION',
  'RESERVATION_CONFIRMED',
  'PAYMENT_COMPLETED',
  'TICKET_CHECKED_IN',
]);

const BUSINESS_TYPES = new Set([
  'BUSINESS_PENDING',
  'BUSINESS_APPROVED',
  'BUSINESS_REJECTED',
  'BUSINESS_DISABLED',
]);

export function getNotificationLink(notification, userRole) {
  if (!notification) return null;
  const { entityType, entityId, type } = notification;
  const isReservation =
    entityType === 'RESERVATION' || entityType === 'BOOKING' || RESERVATION_TYPES.has(type);
  const isBusiness = entityType === 'BUSINESS' || BUSINESS_TYPES.has(type);

  if (userRole === 'BUSINESS_OWNER') {
    if (isReservation) {
      return ROUTES.OWNER_RESERVATION(entityId);
    }
    if (type === 'BUSINESS_PENDING' || type === 'BUSINESS_REJECTED') {
      return ROUTES.OWNER_TAB('verification', { businessId: entityId });
    }
    if (isBusiness) {
      return ROUTES.OWNER_TAB('businesses', { businessId: entityId });
    }
    return ROUTES.OWNER_DASHBOARD;
  }

  if (userRole === 'ADMIN') {
    if (type === 'BUSINESS_PENDING' || isBusiness) {
      return ROUTES.ADMIN_VERIFICATION(entityId);
    }
    if (isReservation) {
      return `${ROUTES.ADMIN}?tab=reservations`;
    }
    if (type === 'ADMIN_COMMISSION') {
      return `${ROUTES.ADMIN}?tab=revenue`;
    }
    return ROUTES.ADMIN;
  }

  if (isReservation) {
    return ROUTES.DASHBOARD;
  }
  if (entityType === 'MATCH' && entityId) {
    return ROUTES.MATCH_DETAIL(entityId);
  }
  if (entityType === 'MATCH') {
    return ROUTES.MATCHES;
  }
  return null;
}

export function getNotificationCta(notification, userRole) {
  const { entityType, type } = notification || {};
  if (userRole === 'BUSINESS_OWNER') {
    if (entityType === 'RESERVATION' || entityType === 'BOOKING' || RESERVATION_TYPES.has(type)) {
      return 'Voir la réservation';
    }
    if (type === 'BUSINESS_PENDING' || type === 'BUSINESS_REJECTED') {
      return 'Voir la vérification';
    }
    if (entityType === 'BUSINESS' || BUSINESS_TYPES.has(type)) {
      return "Voir l'établissement";
    }
  }
  if (userRole === 'ADMIN' && type === 'BUSINESS_PENDING') {
    return 'Voir le dossier';
  }
  if (entityType === 'RESERVATION' || entityType === 'BOOKING' || RESERVATION_TYPES.has(type)) {
    return 'Voir la réservation';
  }
  return 'Voir';
}
