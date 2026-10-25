export { OCCUPANCY_COLORS, OCCUPANCY_LABELS } from './occupancy';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  REGISTER_FAN: '/register?role=fan',
  REGISTER_OWNER: '/register?role=owner',
  CAFES: '/cafes',
  PLACES: '/cafes',
  CAFE_DETAILS: (id) => `/cafes/${id}`,
  PLACE_DETAILS: (id) => `/cafes/${id}`,
  /** @deprecated Use ROUTES.BOOK({ businessId }) */
  RESERVATION: (id) => `/book?businessId=${id}`,
  MATCHES: '/matches',
  MATCH_LIVE_DETAIL: (externalId) => `/matches/live/${externalId}`,
  MATCH_DETAIL: (localId) => `/matches/detail/${localId}`,
  BOOK: ({ matchId, businessId, bookingId } = {}) => {
    const params = new URLSearchParams();
    if (matchId) params.set('matchId', matchId);
    if (businessId) params.set('businessId', businessId);
    if (bookingId) params.set('bookingId', bookingId);
    const query = params.toString();
    return query ? `/book?${query}` : '/book';
  },
  DASHBOARD: '/dashboard',
  OWNER_DASHBOARD: '/owner/dashboard',
  OWNER_TAB: (tab, extra = {}) => {
    const params = new URLSearchParams();
    if (tab && tab !== 'overview') params.set('tab', tab);
    Object.entries(extra).forEach(([key, value]) => {
      if (value != null && value !== '') params.set(key, String(value));
    });
    const query = params.toString();
    return query ? `/owner/dashboard?${query}` : '/owner/dashboard';
  },
  OWNER_RESERVATION: (reservationId) =>
    `/owner/dashboard?tab=reservations${reservationId ? `&reservationId=${reservationId}` : ''}`,
  OWNER_CHECKIN: (ticket) =>
    ticket
      ? `/owner/dashboard?tab=checkin&ticket=${encodeURIComponent(ticket)}`
      : '/owner/dashboard?tab=checkin',
  OWNER_BUSINESS_NEW: '/owner/businesses/new',
  OWNER_BUSINESS_EDIT: (id) => `/owner/businesses/${id}/edit`,
  ADMIN: '/admin',
  ADMIN_VERIFICATION: (businessId) => {
    const params = new URLSearchParams({ tab: 'verification' });
    if (businessId != null) params.set('businessId', String(businessId));
    return `/admin?${params.toString()}`;
  },
  NOTIFICATIONS: '/notifications',
};

export const BUSINESS_TYPES = {
  CAFE: 'CAFE',
  RESTAURANT: 'RESTAURANT',
};

export const BUSINESS_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DISABLED: 'DISABLED',
};

export const ROLES = {
  FAN_USER: 'FAN_USER',
  BUSINESS_OWNER: 'BUSINESS_OWNER',
  ADMIN: 'ADMIN',
};

/** @deprecated Use ROLES.FAN_USER — legacy alias */
export const LEGACY_ROLES = {
  SUPPORTER: 'SUPPORTER',
  CAFE_OWNER: 'CAFE_OWNER',
};