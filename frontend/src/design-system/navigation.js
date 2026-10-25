import { ROUTES } from '../utils/constants';

export const NAV_SECTIONS = {
  fan: [
    { id: 'dashboard', label: 'Mes réservations', icon: '◉', path: ROUTES.DASHBOARD, auth: true },
    { id: 'matches', label: 'Match Center', icon: '⚽', path: ROUTES.MATCHES },
    { id: 'places', label: 'Lieux', icon: '📍', path: ROUTES.PLACES },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: ROUTES.NOTIFICATIONS, auth: true },
  ],
  owner: [
    { id: 'overview', label: 'Tableau de bord', icon: '◉', path: ROUTES.OWNER_DASHBOARD, section: 'Accueil' },
    { id: 'businesses', label: 'Établissements', icon: '☕', path: ROUTES.OWNER_TAB('businesses'), section: 'Établissement' },
    { id: 'verification', label: 'Vérification', icon: '✔', path: ROUTES.OWNER_TAB('verification'), section: 'Établissement' },
    { id: 'reservations', label: 'Réservations', icon: '📋', path: ROUTES.OWNER_TAB('reservations'), section: 'Jour J' },
    { id: 'checkin', label: 'Check-in QR', icon: '📷', path: ROUTES.OWNER_TAB('checkin'), section: 'Jour J' },
    { id: 'occupancy', label: 'Affluence', icon: '📡', path: ROUTES.OWNER_TAB('occupancy'), section: 'Jour J' },
    { id: 'analytics', label: 'Statistiques', icon: '📊', path: ROUTES.OWNER_TAB('analytics'), section: 'Performance' },
    { id: 'revenue', label: 'Revenus', icon: '💰', path: ROUTES.OWNER_TAB('revenue'), section: 'Performance' },
    { id: 'notifications', label: 'Notifications', icon: '🔔', path: ROUTES.NOTIFICATIONS, section: 'Compte' },
  ],
  admin: [
    { id: 'admin', label: 'Administration', icon: '⚙️', path: ROUTES.ADMIN },
    { id: 'approvals', label: 'Vérification', icon: '✔', path: `${ROUTES.ADMIN}?tab=verification` },
    { id: 'users', label: 'Utilisateurs', icon: '👥', path: `${ROUTES.ADMIN}?tab=users` },
    { id: 'payments', label: 'Revenus', icon: '💳', path: `${ROUTES.ADMIN}?tab=revenue` },
    { id: 'analytics', label: 'Statistiques', icon: '📈', path: `${ROUTES.ADMIN}?tab=statistics` },
  ],
  guest: [
    { id: 'home', label: 'Accueil', icon: '◉', path: '/' },
    { id: 'matches', label: 'Match Center', icon: '⚽', path: ROUTES.MATCHES },
    { id: 'places', label: 'Lieux', icon: '📍', path: ROUTES.PLACES },
  ],
};

export function getNavItems(role, isAuthenticated) {
  if (role === 'ADMIN') return NAV_SECTIONS.admin;
  if (role === 'BUSINESS_OWNER') return NAV_SECTIONS.owner;
  if (isAuthenticated) return NAV_SECTIONS.fan;
  return NAV_SECTIONS.guest;
}
