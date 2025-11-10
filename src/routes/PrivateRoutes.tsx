import { useKeycloak } from '@react-keycloak/web';
import { Navigate, Route, Routes } from 'react-router-dom';
import ProductTypesPage from '@/pages/ProductTypesPage';
import AppLayout from '@/layouts/AppLayout';
import DashboardPage from '../pages/DashboardPage';

export function PrivateRoutes() {
  const { keycloak, initialized } = useKeycloak();

  if (!initialized) {
    return <p>Loading</p>;
  }

  if (!keycloak?.authenticated) {
    keycloak.login({ redirectUri: window.location.origin + '/app' });
    return null;
  }

  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="productTypes" element={<ProductTypesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}
