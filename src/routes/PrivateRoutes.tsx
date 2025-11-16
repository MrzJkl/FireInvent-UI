import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import ProductTypesPage from '@/pages/ProductTypesPage';
import MaintenanceTypesPage from '@/pages/MaintenanceTypesPage';
import DepartmentsPage from '@/pages/DepartmentsPage';
import AppLayout from '@/layouts/AppLayout';
import StorageLocationsPage from '@/pages/StorageLocationsPage';

export function PrivateRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="productTypes" element={<ProductTypesPage />} />
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="storageLocations" element={<StorageLocationsPage />} />
        <Route path="maintenanceTypes" element={<MaintenanceTypesPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" />} />
    </Routes>
  );
}
