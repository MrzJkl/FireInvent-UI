import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import ProductTypesPage from '@/pages/ProductTypesPage';
import MaintenanceTypesPage from '@/pages/MaintenanceTypesPage';
import AppLayout from '@/layouts/AppLayout';

export function PrivateRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="productTypes" element={<ProductTypesPage />} />
        <Route path="maintenanceTypes" element={<MaintenanceTypesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}
