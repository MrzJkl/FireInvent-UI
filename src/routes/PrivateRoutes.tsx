import { useKeycloak } from '@react-keycloak/web';
import Dashboard from '../pages/DashboardPage';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import ProductTypesPage from '@/pages/ProductTypesPage';

export function PrivateRoutes() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <div>Loading...</div>; // optional: Spinner
  }

  if (!keycloak?.authenticated) {
    keycloak.login({ redirectUri: window.location.origin + '/app' });
    return null;
  }

  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="productTypes" element={<ProductTypesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}
