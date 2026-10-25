import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import PageTransition from './PageTransition';
import FanAssistantWidget from '../assistant/FanAssistantWidget';

const PAGE_TITLES = {
  '/': 'Home',
  '/matches': 'Match Center',
  '/cafes': 'Places',
  '/dashboard': 'My Dashboard',
  '/book': 'Reservation',
  '/notifications': 'Notifications',
  '/owner/dashboard': 'My Business',
  '/admin': 'Administration',
};

const OWNER_TAB_TITLES = {
  overview: 'Tableau de bord',
  businesses: 'Établissements',
  verification: 'Vérification',
  reservations: 'Réservations',
  checkin: 'Check-in QR',
  occupancy: 'Affluence',
  analytics: 'Statistiques',
  revenue: 'Revenus',
};

function getPageTitle(pathname, search = '') {
  if (pathname.startsWith('/matches/')) return 'Match Details';
  if (pathname.startsWith('/cafes/')) return 'Venue Details';
  if (pathname === '/owner/dashboard') {
    const tab = new URLSearchParams(search).get('tab') || 'overview';
    return OWNER_TAB_TITLES[tab] || 'Espace propriétaire';
  }
  if (pathname.startsWith('/owner/')) return 'Établissement';
  return PAGE_TITLES[pathname] || 'FanConnect 2030';
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="fc-app">
      <div
        className={`fc-app__overlay ${sidebarOpen ? 'fc-app__overlay--visible' : ''}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />
      <Sidebar collapsed={false} onClose={() => setSidebarOpen(false)} />
      <div className={`fc-app__main ${isHome ? 'fc-app__main--home' : ''}`}>
        <TopBar
          onMenuToggle={() => setSidebarOpen((v) => !v)}
          title={getPageTitle(location.pathname, location.search)}
        />
        <main className="fc-app__content">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
      {sidebarOpen && (
        <div className="fc-app__mobile-sidebar lg:hidden">
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      )}
      <FanAssistantWidget />
    </div>
  );
}