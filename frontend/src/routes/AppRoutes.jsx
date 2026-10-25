import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import AppShell from '../components/layout/AppShell';
import AuthLayout from '../components/layout/AuthLayout';
import FanRoute from '../components/auth/FanRoute';
import OwnerRoute from '../components/auth/OwnerRoute';
import AdminRoute from '../components/auth/AdminRoute';
import GuestRoute from '../components/auth/GuestRoute';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CafesPage from '../pages/CafesPage';
import CafeDetailsPage from '../pages/CafeDetailsPage';
import DashboardPage from '../pages/DashboardPage';
import OwnerDashboardPage from '../pages/owner/OwnerDashboardPage';
import BusinessFormPage from '../pages/owner/BusinessFormPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import MatchCenterPage from '../pages/MatchCenterPage';
import MatchDetailPage from '../pages/MatchDetailPage';
import NotificationsPage from '../pages/NotificationsPage';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import BookingWizardPage from '../pages/BookingWizardPage';
import NotFoundPage from '../pages/NotFoundPage';
import { ROUTES } from '../utils/constants';

function LegacyReserveRedirect() {
  const { id } = useParams();
  return <Navigate to={ROUTES.BOOK({ businessId: id })} replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route
          path="login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
      </Route>

      <Route element={<AppShell />}>
        <Route index element={<HomePage />} />
        <Route path="matches" element={<MatchCenterPage />} />
        <Route path="matches/live/:externalId" element={<MatchDetailPage mode="live" />} />
        <Route path="matches/detail/:localId" element={<MatchDetailPage mode="local" />} />
        <Route
          path="notifications"
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          }
        />
        <Route path="cafes" element={<CafesPage />} />
        <Route path="cafes/:id" element={<CafeDetailsPage />} />
        <Route
          path="book"
          element={
            <FanRoute>
              <BookingWizardPage />
            </FanRoute>
          }
        />
        <Route path="cafes/:id/reserve" element={<LegacyReserveRedirect />} />
        <Route
          path="dashboard"
          element={
            <FanRoute>
              <DashboardPage />
            </FanRoute>
          }
        />
        <Route
          path="owner/dashboard"
          element={
            <OwnerRoute>
              <OwnerDashboardPage />
            </OwnerRoute>
          }
        />
        <Route
          path="owner/businesses/new"
          element={
            <OwnerRoute>
              <BusinessFormPage />
            </OwnerRoute>
          }
        />
        <Route
          path="owner/businesses/:id/edit"
          element={
            <OwnerRoute>
              <BusinessFormPage />
            </OwnerRoute>
          }
        />
        <Route
          path="admin"
          element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          }
        />
        <Route path="reservations" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}