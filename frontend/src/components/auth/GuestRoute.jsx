import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHomeRouteForRole } from '../../utils/roleHelpers';

export default function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getHomeRouteForRole(user?.role)} replace />;
  }

  return children;
}