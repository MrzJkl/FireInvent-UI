import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Dashboard from '../pages/DashboardPage';

export function PrivateRoutes() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Dashboard /> : <Navigate to="/" replace />;
}
