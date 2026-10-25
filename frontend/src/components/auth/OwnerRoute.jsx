import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES } from '../../utils/constants';
import { getHomeRouteForRole } from '../../utils/roleHelpers';

export default function OwnerRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== ROLES.BUSINESS_OWNER && user?.role !== ROLES.ADMIN) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return children;
}