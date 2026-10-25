import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROUTES } from '../../utils/constants';
import { getHomeRouteForRole } from '../../utils/roleHelpers';

export default function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (user?.role !== ROLES.ADMIN) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return children;
}